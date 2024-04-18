import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import type { AxiosResponse } from "axios";
import type { Observable } from "rxjs";
import type { CommunitySlackCommandBodyDto } from "@/api/community/dto/community_request.dto";
import { SupabaseService } from "../supabase/supabase.service";
import { StoreService } from "../store/store.service";

@Injectable()
export class SlackService {
  private readonly logger = new Logger(SlackService.name);
  private accessToken: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly storeService: StoreService,
    private readonly supabaseService: SupabaseService
  ) {
    // initial fetch
    (async () => {
      const app = await this.supabaseService
        .getClient()
        .anon.from("App")
        .select("access_token")
        .eq("from", "SLACK")
        .limit(1)
        .single();

      if (app.error) this.logger.warn("#app error : " + app.error.message);
      this.accessToken = app.data?.access_token;
    })();
  }

  postInitMessage(webhookUrl: string, categoryTitle: string): Observable<AxiosResponse<any, any>> {
    this.logger.log(`send initial message to ${webhookUrl}`);

    let text = "";

    if (categoryTitle) {
      text = `${categoryTitle} 뉴스 피드가 추가로 전송됩니다.`;
    } else {
      text = `<${this.configService.get(
        "CLIENT_DOMAIN"
      )}|*Google News Rss Pusher*> 을 설치해주셔서 감사합니다.\n피드는 9시, 12시, 15시, 18시, 21시에 전송됩니다.`;
    }

    return this.httpService.post(
      webhookUrl,
      { text },
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

  postSetting(
    commandRequestBody: CommunitySlackCommandBodyDto
  ): Observable<AxiosResponse<any, any>> {
    return this.httpService.post(
      "https://slack.com/api/views.open",
      {
        trigger_id: commandRequestBody.trigger_id,
        view: {
          type: "modal",
          private_metadata: JSON.stringify(commandRequestBody),
          submit: {
            type: "plain_text",
            text: "확인",
            emoji: true,
          },
          close: {
            type: "plain_text",
            text: "취소",
            emoji: true,
          },
          title: {
            type: "plain_text",
            text: "Google News (rss-pusher)",
            emoji: true,
          },
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `안녕하세요 *${commandRequestBody.user_name}* 님 설정을 변경하려면 아래 항목을 변경후 적용하세요.`,
              },
            },
            {
              type: "divider",
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "*키워드별 설정*",
              },
            },
            {
              type: "section",
              block_id: "select_feed",
              text: {
                type: "mrkdwn",
                text: ">:iphone: *변경할 키워드*\n>수집하고 있는 키워드 중에서 선택할 수 있습니다.",
              },
              accessory: {
                type: "static_select",
                action_id: "action",
                placeholder: {
                  type: "plain_text",
                  text: "Choose list",
                  emoji: true,
                },
                options: this.storeService.getCategories()?.map((category) => ({
                  text: {
                    type: "plain_text",
                    text: category.title,
                    emoji: true,
                  },
                  value: String(category.id),
                })),
              },
            },
            {
              type: "section",
              block_id: "select_active",
              text: {
                type: "mrkdwn",
                text: ">:gear: *활성화 여부*\n>피드를 활성화/비활성화 할 수 있습니다.",
              },
              accessory: {
                type: "static_select",
                action_id: "action",
                placeholder: {
                  type: "plain_text",
                  text: "Choose list",
                  emoji: true,
                },
                options: [
                  {
                    text: {
                      type: "plain_text",
                      text: "활성화",
                      emoji: true,
                    },
                    value: "1",
                  },
                  {
                    text: {
                      type: "plain_text",
                      text: "비활성화",
                      emoji: true,
                    },
                    value: "0",
                  },
                ],
              },
            },
            {
              type: "divider",
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "*채널별 설정*",
              },
            },
            {
              type: "section",
              block_id: "select_interval",
              text: {
                type: "mrkdwn",
                text: ">:alarm_clock: *피드 받는 시간*\n>3시간/6시간/12시간 간격으로 받을 수 있습니다.",
              },
              accessory: {
                type: "static_select",
                action_id: "action",
                placeholder: {
                  type: "plain_text",
                  text: "Choose list",
                  emoji: true,
                },
                options: [
                  {
                    text: {
                      type: "plain_text",
                      text: "9시, 12시, 15시, 18시, 21시",
                      emoji: true,
                    },
                    value: "3",
                  },
                  {
                    text: {
                      type: "plain_text",
                      text: "9시, 15시, 21시",
                      emoji: true,
                    },
                    value: "6",
                  },
                  {
                    text: {
                      type: "plain_text",
                      text: "9시, 21시",
                      emoji: true,
                    },
                    value: "12",
                  },
                ],
              },
            },
          ],
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );
  }
}
