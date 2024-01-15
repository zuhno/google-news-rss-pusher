import { HttpService } from "@nestjs/axios";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { firstValueFrom } from "rxjs";
import { google } from "googleapis";
import { Database } from "supabase-type";

import { SlackService } from "@/common/slack/slack.service";
import { SupabaseService } from "@/common/supabase/supabase.service";
import {
  OAuth2GoogleClientInfoResponseDto,
  OAuth2SlackAccessResponseDto,
} from "./dto/oauth2_response.dto";

@Injectable()
export class OAuth2Service {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly supabaseService: SupabaseService,
    private readonly slackService: SlackService,
    private readonly jwtService: JwtService
  ) {}

  private async _setUserToken(
    user: Pick<Database["public"]["Tables"]["User"]["Row"], "id" | "email">
  ) {
    const accessPayload = { id: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(accessPayload, {
      secret: process.env.GOOGLE_OAUTH_JWT_SECRET,
      expiresIn: "10m",
    });

    const refreshPayload = { ...accessPayload, accessToken: accessToken };
    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      secret: process.env.GOOGLE_OAUTH_JWT_SECRET,
      expiresIn: "1h",
    });

    return { accessToken, refreshToken };
  }

  async postSlackAccess(code: string, category: string): Promise<OAuth2SlackAccessResponseDto> {
    const app = await this.supabaseService
      .getClient()
      .anon.from("App")
      .select("client_id, client_secret")
      .eq("category_id", parseInt(category))
      .eq("from", "SLACK")
      .single();

    if (app.error) throw new HttpException(app.error.message, HttpStatus.NOT_FOUND);

    const formData = new FormData();
    formData.append("code", code);
    formData.append("client_id", app.data.client_id);
    formData.append("client_secret", app.data.client_secret);

    const result = await firstValueFrom(
      this.httpService.post("https://slack.com/api/oauth.v2.access", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    );

    if (!result.data) throw new HttpException("UNAUTHORIZED", HttpStatus.UNAUTHORIZED);

    const { data, error } = await this.supabaseService
      .getClient()
      .serviceRole.from("Subscriber")
      .insert({
        ch_id: result.data.incoming_webhook?.channel_id,
        ch_name: result.data.incoming_webhook?.channel,
        ch_url: result.data.incoming_webhook?.url,
        active: true,
        interval_time: 3,
        app_id: result.data.app_id,
        team_id: result.data.team?.id,
      })
      .select()
      .single();

    if (error?.message) throw new HttpException(error.message, HttpStatus.BAD_REQUEST);

    await firstValueFrom(this.slackService.postInitMessage(result.data.incoming_webhook?.url));

    return {
      active: data.active,
      channelId: data.ch_id,
      channelName: data.ch_name,
      channelUrl: data.ch_url,
      notificationInterval: data.interval_time,
    };
  }

  getGoogleClientInfo(): OAuth2GoogleClientInfoResponseDto {
    return {
      clientId: this.configService.get("GOOGLE_OAUTH_CLIENT_ID"),
      redirectUri: this.configService.get("GOOGLE_OAUTH_REDIRECT_URI"),
    };
  }

  async postGoogleAccess(code: string) {
    const oauth2Client = new google.auth.OAuth2(
      this.configService.get("GOOGLE_OAUTH_CLIENT_ID"),
      this.configService.get("GOOGLE_OAUTH_CLIENT_SECRET"),
      this.configService.get("GOOGLE_OAUTH_REDIRECT_URI")
    );

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ auth: oauth2Client, version: "v2" });
    const userInfo = await oauth2.userinfo.get();

    if (!userInfo.data.email)
      throw new HttpException("Google OAuth2 Processing Error", HttpStatus.INTERNAL_SERVER_ERROR);

    let user = await this.supabaseService
      .getClient()
      .anon.from("User")
      .select("*")
      .eq("email", userInfo.data.email)
      .single();

    if (user.error) {
      if (user.error.code !== "PGRST116")
        throw new HttpException(user.error.message, HttpStatus.INTERNAL_SERVER_ERROR);

      // PGRST116 : the result contains 0 rows
      const { email, name, picture } = userInfo.data;

      user = await this.supabaseService
        .getClient()
        .serviceRole.from("User")
        .insert({
          email,
          nick_name: name,
          platform: "GOOGLE",
          avatar_url: picture,
          active: true,
        })
        .select("*")
        .single();

      await this.supabaseService.getClient().serviceRole.from("UserRole").insert({
        user_id: user.data.id,
        role: "USER_BASIC",
      });
    }

    const { accessToken, refreshToken } = await this._setUserToken(user.data);
    const newAuth = await this.supabaseService
      .getClient()
      .serviceRole.from("UserAuth")
      .upsert({
        access_token: accessToken,
        refresh_token: refreshToken,
        userId: user.data.id,
        request_config: "", // TODO: ip, user-agent, etc... whatever you want.
      })
      .select("access_token, refresh_token")
      .single();

    if (newAuth.error)
      throw new HttpException(user.error.message, HttpStatus.INTERNAL_SERVER_ERROR);

    return {
      accessToken: newAuth.data.access_token,
      refreshToken: newAuth.data.refresh_token,
      userInfo: user.data,
    };
  }
}
