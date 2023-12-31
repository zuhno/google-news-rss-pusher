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
  OAuth2GoogleAccessResponseDto,
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

  private async setUserToken(
    user: Pick<Database["public"]["Tables"]["User"]["Row"], "id" | "email">
  ) {
    const accessPayload = { id: user.id, email: user.email };
    const accessToken = this.jwtService.signAsync(accessPayload, { expiresIn: "1h" });
    const refreshPayload = { ...accessPayload, accessToken: accessToken };
    const refreshToken = this.jwtService.signAsync(refreshPayload, { expiresIn: "1h" });

    return { accessToken, refreshToken };
  }

  async postSlackAccess(code: string): Promise<OAuth2SlackAccessResponseDto> {
    const formData = new FormData();
    formData.append("code", code);
    formData.append("client_id", this.configService.get("SLACK_CLIENT_ID"));
    formData.append("client_secret", this.configService.get("SLACK_CLIENT_SECRET"));

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

  async postGoogleAccess(code: string): Promise<OAuth2GoogleAccessResponseDto> {
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
    }

    const { accessToken, refreshToken } = await this.setUserToken(user.data);

    console.log("accessToken : ", accessToken, "\naccessToken : ", refreshToken);

    return {
      id: user.data.id,
      email: user.data.email,
      nickName: user.data.nick_name,
      avatarUrl: user.data.avatar_url,
    };
  }
}
