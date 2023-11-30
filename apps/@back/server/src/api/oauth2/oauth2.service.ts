import { HttpService } from "@nestjs/axios";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";

import { SlackService } from "@/common/slack/slack.service";
import { SupabaseService } from "@/common/supabase/supabase.service";

@Injectable()
export class OAuth2Service {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly supabaseService: SupabaseService,
    private readonly slackService: SlackService
  ) {}

  async access(code: string): Promise<any[]> {
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
      .from("Subscriber")
      .insert({
        ch_id: result.data.incoming_webhook?.channel_id,
        ch_name: result.data.incoming_webhook?.channel,
        ch_url: result.data.incoming_webhook?.url,
        active: "Y",
        interval_time: 3,
        app_id: result.data.app_id,
        team_id: result.data.team?.id,
      })
      .select();

    if (error?.message) throw new HttpException(error.message, HttpStatus.BAD_REQUEST);

    await firstValueFrom(this.slackService.postInitMessage(result.data.incoming_webhook?.url));

    return data;
  }
}
