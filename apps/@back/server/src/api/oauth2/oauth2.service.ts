import { HttpService } from "@nestjs/axios";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";

import { SlackService } from "@/common/slack/slack.service";
import { SupabaseService } from "@/common/supabase/supabase.service";
import { OAuth2SlackAccessResponseDto } from "./dto/oauth2_response.dto";

@Injectable()
export class OAuth2Service {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly supabaseService: SupabaseService,
    private readonly slackService: SlackService
  ) {}

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

  async postGoogleAccess(code: string) {
    const params = new URLSearchParams();
    params.append("code", code);
    params.append("client_id", this.configService.get("GOOGLE_OAUTH_CLIENT_ID"));
    params.append("client_secret", this.configService.get("GOOGLE_OAUTH_CLIENT_SECRET"));
    params.append("redirect_uri", this.configService.get("GOOGLE_OAUTH_REDIRECT_URI"));
    params.append("grant_type", "authorization_code");

    try {
      const result = await firstValueFrom(
        this.httpService.post("https://oauth2.googleapis.com/token", params.toString(), {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        })
      );

      console.log("postGoogleAccess result : ", result.data);
    } catch (error) {
      console.log("error : ", error);
    }

    return {};
  }
}
