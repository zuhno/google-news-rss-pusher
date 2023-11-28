import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";
import { Supabase } from "src/common/supabase";

@Injectable()
export class OAuth2Service {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly supabase: Supabase
  ) {}

  async postCode(code: string): Promise<boolean> {
    const formData = new FormData();
    formData.append("code", code);
    formData.append("client_id", this.configService.get("SLACK_CLIENT_ID"));
    formData.append("client_secret", this.configService.get("SLACK_CLIENT_SECRET"));

    const result = await firstValueFrom(
      this.httpService.post("https://slack.com/api/oauth.v2.access", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    );

    if (!result.data) return false;
    console.log(result.data);
    const webhook = result.data.incoming_webhook;
    // TODO : webhook info save to db
    // webhook.channel_id - pk
    // webhook.channel - ch_name
    // webhook.url - ch_url

    // TODO : Fail Response implement
    if (!webhook?.channel) return false;

    return true;
  }
}
