import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { firstValueFrom } from "rxjs";

import { SupabaseService } from "@/common/supabase/supabase.service";
import { SlackService } from "@/common/slack/slack.service";
import {
  CommunitySlackCommandBodyDto,
  CommunitySlackCommandHandlerBodyDto,
} from "./dto/community_request.dto";

@Injectable()
export class CommunityService {
  private readonly logger = new Logger(CommunityService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly slackService: SlackService
  ) {}

  async postSlackCommand(body: CommunitySlackCommandBodyDto) {
    switch (body.command) {
      // update current channel gnrp config
      case "/setting":
        await firstValueFrom(this.slackService.postSetting(body));
        break;
      default:
        break;
    }
  }

  async postSlackCommandHandler(body: CommunitySlackCommandHandlerBodyDto) {
    const payload = JSON.parse(body.payload);

    // handler for from slack modal
    if (payload.type === "view_submission") {
      const metadata = JSON.parse(payload.view.private_metadata) as CommunitySlackCommandBodyDto;

      switch (metadata.command) {
        case "/setting":
          const selectedFeedOption =
            payload.view.state.values["select_feed"]["action"]["selected_option"];
          const selectedActiveOption =
            payload.view.state.values["select_active"]["action"]["selected_option"];
          const selectedIntervalOption =
            payload.view.state.values["select_interval"]["action"]["selected_option"];

          // current subscriber data
          const subscriber = await this.supabaseService
            .getClient()
            .anon.from("Subscriber")
            .select("categories, deactive_reason")
            .eq("ch_id", metadata.channel_id)
            .eq("app_id", metadata.api_app_id)
            .limit(1)
            .single();

          if (subscriber.error)
            throw new HttpException(subscriber.error.message, HttpStatus.BAD_REQUEST);

          // if BAN subscriber(channel), reject to actions
          if (subscriber.data.deactive_reason === "BAN") {
            await firstValueFrom(
              this.slackService.postCustomMessage(
                metadata.response_url,
                `☠️ 차단 목록에 등록된 채널입니다. 관리자에게 문의해주세요. ☠️`
              )
            );

            break;
          }

          const query = {};

          // if select 'feed' & 'active', change which categories, active, deactive_reason fields
          if (selectedFeedOption && selectedActiveOption) {
            const category = parseInt(selectedFeedOption.value);
            const isActive = parseInt(selectedActiveOption.value);

            query["categories"] = isActive
              ? Array.from(new Set([...subscriber.data.categories, category])).sort()
              : subscriber.data.categories.filter((_category) => _category !== category);
            query["active"] = !!query["categories"].length;
            query["deactive_reason"] = query["active"] ? null : "USER_REQUEST";
          }

          // if select 'interval', change interval_time field
          if (selectedIntervalOption) {
            const interval = parseInt(selectedIntervalOption.value);
            query["interval_time"] = interval;
          }

          // no changes
          if (!Object.keys(query).length) break;

          this.logger.log("modify setting:", JSON.stringify(query));

          const update = await this.supabaseService
            .getClient()
            .serviceRole.from("Subscriber")
            .update(query)
            .eq("ch_id", metadata.channel_id)
            .eq("app_id", metadata.api_app_id)
            .select("*");

          if (update.error) throw new HttpException(update.error.message, HttpStatus.BAD_REQUEST);

          // all tasks successfully cleared
          await firstValueFrom(
            this.slackService.postCustomMessage(metadata.response_url, `변경사항이 적용되었습니다.`)
          );

          break;
        default:
          break;
      }
    }
  }
}
