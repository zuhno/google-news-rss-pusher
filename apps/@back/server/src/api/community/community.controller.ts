import { Body, Controller, Post } from "@nestjs/common";
import { CommunityService } from "./community.service";
import {
  CommunitySlackCommandBodyDto,
  CommunitySlackCommandHandlerBodyDto,
} from "./dto/community_request.dto";

@Controller()
export class CommunityController {
  constructor(private communityService: CommunityService) {}

  @Post("/slack/command")
  postSlackCommand(@Body() body: CommunitySlackCommandBodyDto) {
    return this.communityService.postSlackCommand(body);
  }

  @Post("/slack/command/handler")
  postSlackCommandHandler(@Body() body: CommunitySlackCommandHandlerBodyDto) {
    return this.communityService.postSlackCommandHandler(body);
  }
}
