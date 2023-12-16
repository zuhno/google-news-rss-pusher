import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { AxiosResponse } from "axios";
import { Observable } from "rxjs";

@Injectable()
export class SlackService {
  private readonly logger = new Logger(SlackService.name);
  public readonly ACTION_IDS = {
    UPDATE_INTERVAL_TIME: "update_interval_time",
  };

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

  postCustomMessage(responseUrl: string, message: string): Observable<AxiosResponse<any, any>> {
    return this.httpService.post(
      responseUrl,
      {
        text: message,
      },
      { headers: { "Content-Type": "application/json" } }
    );
  }

  postDeleteOriginalMessage(responseUrl: string): Observable<AxiosResponse<any, any>> {
    return this.httpService.post(
      responseUrl,
      {
        delete_original: "true",
      },
      { headers: { "Content-Type": "application/json" } }
    );
  }

  postUpdateInterval(responseUrl: string): Observable<AxiosResponse<any, any>> {
    return this.httpService.post(
      responseUrl,
      {
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "뉴스피드 받는 시간 수정",
              emoji: true,
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "드롭다운 목록에서 항목 선택\n선택시 시간이 변경되며 해당 블록은 사라집니다.",
            },
            accessory: {
              type: "static_select",
              placeholder: {
                type: "plain_text",
                text: "시간을 선택해주세요",
                emoji: true,
              },
              options: [
                {
                  text: {
                    type: "plain_text",
                    text: "9h, 12h, 15h, 18h, 21h",
                    emoji: true,
                  },
                  value: "3",
                },
                {
                  text: {
                    type: "plain_text",
                    text: "9h, 15h, 21h",
                    emoji: true,
                  },
                  value: "6",
                },
                {
                  text: {
                    type: "plain_text",
                    text: "9h, 21h",
                    emoji: true,
                  },
                  value: "12",
                },
              ],
              action_id: this.ACTION_IDS.UPDATE_INTERVAL_TIME,
            },
          },
        ],
      },
      { headers: { "Content-Type": "application/json" } }
    );
  }
}
