import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { AxiosResponse } from "axios";
import { Observable } from "rxjs";

@Injectable()
export class SlackService {
  private readonly logger = new Logger(SlackService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {}

  postInitMessage(webhookUrl: string): Observable<AxiosResponse<any, any>> {
    this.logger.log(`send initial message to ${webhookUrl}`);
    return this.httpService.post(
      webhookUrl,
      {
        text: `<${this.configService.get(
          "CLIENT_DOMAIN"
        )}|*Google News Rss Pusher*> 을 설치해주셔서 감사합니다. 피드는 기본적으로 3배수 시간으로 전송됩니다.`,
      },
      { headers: { "Content-Type": "application/json" } }
    );
  }
}
