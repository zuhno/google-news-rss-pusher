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
    private supabaseService: SupabaseService,
    private slackService: SlackService
  ) {
    this.ACTION_IDS = slackService.ACTION_IDS;
  }

  async postSlackCommand(body: CommunitySlackCommandBodyDto) {
    // TODO: Error handling, Exception handling
    switch (body.command) {
      case "/update":
        await firstValueFrom(this.slackService.postUpdateInterval(body.response_url));
        break;

      default:
        break;
    }
  }

  async postSlackCommandHandler(body: CommunitySlackCommandHandlerBodyDto) {
    // TODO: Error handling, Exception handling
    const { actions, channel, api_app_id, response_url } = JSON.parse(body.payload);

    switch (actions[0].action_id) {
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

        // send a result message to the user
        await firstValueFrom(
          this.slackService.postCustomMessage(
            response_url,
            `뉴스 피드를 받는 시간이 ${actions[0].selected_option.text.text} 으로 변경되었습니다.`
          )
        );
        break;

      default:
        throw new Error("The type of action that is not registered.");
    }
  }
}
