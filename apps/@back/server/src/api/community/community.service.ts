import { Injectable } from "@nestjs/common";
import { firstValueFrom } from "rxjs";

import { SupabaseService } from "@/common/supabase/supabase.service";
import { SlackService } from "@/common/slack/slack.service";
import {
  CommunitySlackCommandBodyDto,
  CommunitySlackCommandHandlerBodyDto,
} from "./dto/community_request.dto";

@Injectable()
export class CommunityService {
  private readonly ACTION_IDS: SlackService["ACTION_IDS"];

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly slackService: SlackService
  ) {
    this.ACTION_IDS = slackService.ACTION_IDS;
  }

  async postSlackCommand(body: CommunitySlackCommandBodyDto) {
    // TODO: Error handling, Exception handling
    switch (body.command) {
      // update interval time
      case "/update-real_estate":
      case "/update-blockchain":
        await firstValueFrom(this.slackService.postUpdateInterval(body.response_url));
        break;

      // update active to N
      case "/deactive-real_estate":
      case "/deactive-blockchain":
        await firstValueFrom(this.slackService.postUpdateActiveToDeactive(body.response_url));
        break;

      // update active to Y
      case "/reactive-real_estate":
      case "/reactive-blockchain":
        await firstValueFrom(this.slackService.postUpdateDeactiveToActive(body.response_url));
        break;

      default:
        break;
    }
  }

  async postSlackCommandHandler(body: CommunitySlackCommandHandlerBodyDto) {
    // TODO: Error handling, Exception handling
    const { actions, channel, api_app_id, response_url } = JSON.parse(body.payload);
    let message = "";

    switch (actions[0].action_id) {
      // * update interval time handler
      case this.ACTION_IDS.UPDATE_INTERVAL_TIME:
        // update user state
        await this.supabaseService
          .getClient()
          .serviceRole.from("Subscriber")
          .update({ interval_time: parseInt(actions[0].selected_option.value) })
          .eq("app_id", api_app_id)
          .eq("ch_id", channel.id);

        // delete interactive message
        await firstValueFrom(this.slackService.postDeleteOriginalMessage(response_url));

        message = `뉴스 피드를 받는 시간이 ${actions[0].selected_option.text.text} 으로 변경되었습니다.`;

        // send a result message to the user
        await firstValueFrom(this.slackService.postCustomMessage(response_url, message));
        break;

      // * update active to N handler
      case this.ACTION_IDS.UPDATE_DEACTIVE_Y:
      case this.ACTION_IDS.UPDATE_DEACTIVE_N:
        const { data: deactiveSubscriber } = await this.supabaseService
          .getClient()
          .anon.from("Subscriber")
          .select("active")
          .eq("app_id", api_app_id)
          .eq("ch_id", channel.id)
          .single();

        if (deactiveSubscriber.active) {
          if (this.ACTION_IDS.UPDATE_DEACTIVE_Y) {
            // update user state
            await this.supabaseService
              .getClient()
              .serviceRole.from("Subscriber")
              .update({ active: actions[0].value })
              .eq("app_id", api_app_id)
              .eq("ch_id", channel.id);
          }

          // delete interactive message
          await firstValueFrom(this.slackService.postDeleteOriginalMessage(response_url));

          if (actions[0].action_id === this.ACTION_IDS.UPDATE_DEACTIVE_Y)
            message = "피드 구독이 취소되었습니다.";
          if (actions[0].action_id === this.ACTION_IDS.UPDATE_DEACTIVE_N)
            message = "피드를 계속 구독합니다.";

          // send a result message to the user
          await firstValueFrom(this.slackService.postCustomMessage(response_url, message));
        } else {
          // delete interactive message
          await firstValueFrom(this.slackService.postDeleteOriginalMessage(response_url));

          message =
            "피드 구독중이 아닙니다. 해당 명령어를 사용하려면 `/reactive` 명령어를 먼저 사용해주세요.";

          // send a result message to the user
          await firstValueFrom(this.slackService.postCustomMessage(response_url, message));
        }
        break;

      // * update active to Y handler
      case this.ACTION_IDS.UPDATE_REACTIVE_Y:
      case this.ACTION_IDS.UPDATE_REACTIVE_N:
        const { data: reactiveSubscriber } = await this.supabaseService
          .getClient()
          .anon.from("Subscriber")
          .select("active")
          .eq("app_id", api_app_id)
          .eq("ch_id", channel.id)
          .single();

        if (!reactiveSubscriber.active) {
          // update user state
          if (this.ACTION_IDS.UPDATE_REACTIVE_Y) {
            await this.supabaseService
              .getClient()
              .serviceRole.from("Subscriber")
              .update({ active: actions[0].value })
              .eq("app_id", api_app_id)
              .eq("ch_id", channel.id);
          }

          // delete interactive message
          await firstValueFrom(this.slackService.postDeleteOriginalMessage(response_url));

          if (actions[0].action_id === this.ACTION_IDS.UPDATE_REACTIVE_Y)
            message = "피드 구독이 다시 시작되었습니다.";
          if (actions[0].action_id === this.ACTION_IDS.UPDATE_REACTIVE_N)
            message = "피드를 계속 구독하지 않습니다.";

          // send a result message to the user
          await firstValueFrom(this.slackService.postCustomMessage(response_url, message));
        } else {
          // delete interactive message
          await firstValueFrom(this.slackService.postDeleteOriginalMessage(response_url));

          message =
            "피드를 이미 구독중입니다. 해당 명령어를 사용하려면 `/deactive` 명령어를 먼저 사용해주세요.";

          // send a result message to the user
          await firstValueFrom(this.slackService.postCustomMessage(response_url, message));
        }

        break;

      default:
        throw new Error("The type of action that is not registered.");
    }
  }
}
