import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { firstValueFrom } from "rxjs";

@Injectable()
export class OAuth2Service {
  constructor(private readonly httpService: HttpService) {}

  async postCode(code: string): Promise<boolean> {
    const formData = new FormData();
    formData.append("code", code);
    formData.append("client_id", process.env.SLACK_CLIENT_ID);
    formData.append("client_secret", process.env.SLACK_CLIENT_SECRET);

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
