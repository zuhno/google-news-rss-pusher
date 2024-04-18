import { HttpService } from "@nestjs/axios";
import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
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
import { StoreService } from "@/common/store/store.service";

@Injectable()
export class OAuth2Service {
  private readonly logger = new Logger(OAuth2Service.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly supabaseService: SupabaseService,
    private readonly slackService: SlackService,
    private readonly jwtService: JwtService,
    private readonly storeService: StoreService
  ) {}

  async _decoded(token: string) {
    return this.jwtService.decode(token, { json: true });
  }

  private async _setUserToken(
    user: Pick<Database["public"]["Tables"]["User"]["Row"], "id" | "email">
  ) {
    const { expiresIn } = this.storeService.getCookieConfig();

    const accessPayload = { id: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(accessPayload, {
      secret: this.configService.get("GOOGLE_OAUTH_JWT_SECRET"),
      expiresIn: expiresIn.accessToken / 1000,
    });

    const refreshPayload = { ...accessPayload, accessToken: accessToken };
    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      secret: this.configService.get("GOOGLE_OAUTH_JWT_SECRET"),
      expiresIn: expiresIn.refreshToken / 1000,
    });

    return { accessToken, refreshToken };
  }

  async postSlackAccess(
    code: string,
    categoryId: string,
    accessToken?: string
  ): Promise<OAuth2SlackAccessResponseDto> {
    const [app, category] = await Promise.all([
      this.supabaseService
        .getClient()
        .anon.from("App")
        .select("client_id, client_secret")
        .eq("from", "SLACK")
        .single(),
      this.supabaseService
        .getClient()
        .anon.from("Category")
        .select("id, title")
        .eq("id", parseInt(categoryId))
        .single(),
    ]);

    if (app.error || category.error)
      throw new HttpException(app.error.message || category.error.message, HttpStatus.NOT_FOUND);

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

    let userId = null;
    if (accessToken) {
      ({ id: userId } = await this._decoded(accessToken));
    }

    const existSubscriber = await this.supabaseService
      .getClient()
      .anon.from("Subscriber")
      .select("interval_time ,categories")
      .eq("ch_id", result.data.incoming_webhook?.channel_id)
      .eq("app_id", result.data.app_id)
      .single();

    const categories = Array.from(
      new Set([...(existSubscriber.data?.categories ?? []), category.data.id])
    ).sort();

    if (JSON.stringify(existSubscriber.data?.categories) === JSON.stringify(categories))
      throw new HttpException("already exist category.", HttpStatus.CONFLICT);

    let payload: Database["public"]["Tables"]["Subscriber"]["Update"] = {
      ch_id: result.data.incoming_webhook?.channel_id,
      app_id: result.data.app_id,
      interval_time: existSubscriber.data?.interval_time,
      categories,
      ...(userId && { user_id: userId }),
    };

    if (existSubscriber.error) {
      if (existSubscriber.error.code !== "PGRST116")
        throw new HttpException(existSubscriber.error.message, HttpStatus.INTERNAL_SERVER_ERROR);

      // PGRST116 : the result contains 0 rows
      payload = {
        ...payload,
        ch_name: result.data.incoming_webhook?.channel,
        ch_url: result.data.incoming_webhook?.url,
        active: true,
        interval_time: 3,
        team_id: result.data.team?.id,
      };
    }

    const newSubscriber = await this.supabaseService
      .getClient()
      .serviceRole.from("Subscriber")
      .upsert(payload as Database["public"]["Tables"]["Subscriber"]["Insert"])
      .select()
      .single();

    if (newSubscriber.error)
      throw new HttpException(newSubscriber.error.message, HttpStatus.BAD_REQUEST);

    const categoryTitle = categories.length > 1 ? category.data.title : "";
    await firstValueFrom(
      this.slackService.postInitMessage(result.data.incoming_webhook?.url, categoryTitle)
    );

    return {
      active: newSubscriber.data.active,
      channelId: newSubscriber.data.ch_id,
      channelName: newSubscriber.data.ch_name,
      channelUrl: newSubscriber.data.ch_url,
      notificationInterval: newSubscriber.data.interval_time,
      categories: newSubscriber.data.categories,
    };
  }

  getGoogleClientInfo(): OAuth2GoogleClientInfoResponseDto {
    return {
      clientId: this.configService.get("GOOGLE_OAUTH_CLIENT_ID"),
      redirectUri: this.configService.get("GOOGLE_OAUTH_REDIRECT_URI"),
    };
  }

  async postGoogleAccess(code: string, requestConfig: string) {
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
        user_id: user.data.id,
        access_token: accessToken,
        refresh_token: refreshToken,
        request_config: requestConfig,
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
