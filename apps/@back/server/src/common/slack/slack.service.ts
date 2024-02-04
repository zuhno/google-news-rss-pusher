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
    UPDATE_DEACTIVE_Y: "update_deactive_y",
    UPDATE_DEACTIVE_N: "update_deactive_n",
    UPDATE_REACTIVE_Y: "update_reactive_y",
    UPDATE_REACTIVE_N: "update_reactive_n",
  };

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    // 기록:
    // 모달로 앱선택 -> 수정할 데이터 -> 확인 플로우를 진행하지 못하는 이유는
    // 모달의 경우 요청할때마다 각 앱의 인증토큰을 헤더에 심어야합니다.
    // 뉴스 피드마다 앱이 생성되는 방식이라 앱이 하나일 경우엔 용이하나 현재 구조와는
    // 맞지 않는 상태입니다. 왜 이러한 구조를 채택했냐면 슬랙 rate limit 과 여러 카테고리를
    // 유저에게 제공할 때 슬랙 채널안에서 카테고리가 다르다는걸 식별할 수 없을 것 같기 때문입니다.
    // 커맨드 수는 n^2 으로 증가됩니다.
  }

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

  postUpdateInterval(responseUrl: string, appName: string): Observable<AxiosResponse<any, any>> {
    return this.httpService.post(
      responseUrl,
      {
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: `${appName} - 뉴스 피드 받는 시간 수정`,
              emoji: true,
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "선택시 시간이 변경되며 해당 블록은 사라집니다.",
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

  postUpdateActiveToDeactive(
    responseUrl: string,
    appName: string
  ): Observable<AxiosResponse<any, any>> {
    return this.httpService.post(
      responseUrl,
      {
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: `${appName} - 뉴스 피드 구독 취소`,
              emoji: true,
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "정말 구독을 취소하시겠습니까?",
            },
          },
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "예",
                  emoji: true,
                },
                style: "primary",
                value: false,
                action_id: this.ACTION_IDS.UPDATE_DEACTIVE_Y,
              },
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "아니오",
                  emoji: true,
                },
                style: "danger",
                value: true,
                action_id: this.ACTION_IDS.UPDATE_DEACTIVE_N,
              },
            ],
          },
        ],
      },
      { headers: { "Content-Type": "application/json" } }
    );
  }

  postUpdateDeactiveToActive(
    responseUrl: string,
    appName: string
  ): Observable<AxiosResponse<any, any>> {
    return this.httpService.post(
      responseUrl,
      {
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: `${appName} - 뉴스 피드 다시 구독`,
              emoji: true,
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "정말 구독을 다시 시작하시겠습니까?",
            },
          },
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "예",
                  emoji: true,
                },
                style: "primary",
                value: true,
                action_id: this.ACTION_IDS.UPDATE_REACTIVE_Y,
              },
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "아니오",
                  emoji: true,
                },
                style: "danger",
                value: false,
                action_id: this.ACTION_IDS.UPDATE_REACTIVE_N,
              },
            ],
          },
        ],
      },
      { headers: { "Content-Type": "application/json" } }
    );
  }
}
