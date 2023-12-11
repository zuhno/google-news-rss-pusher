import { Controller, Get, Query } from "@nestjs/common";

import { FeedService } from "./feed.service";
import { FeedsLimitedAllQueryDto, FeedsQueryDto } from "./dto/feeds_request.dto";

@Controller()
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get()
  async getFeeds(@Query() query: FeedsQueryDto) {
    return this.feedService.getFeeds({ ...query });
  }

  @Get("/all")
  async getFeedsLimitedAll(@Query() query: FeedsLimitedAllQueryDto) {
    return this.feedService.getFeedsLimitedAll({ ...query });
  }
}
