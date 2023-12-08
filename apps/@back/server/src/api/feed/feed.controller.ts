import { Controller, Get, Query } from "@nestjs/common";

import { FeedService } from "./feed.service";

@Controller()
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get()
  async getFeeds(
    @Query("lastKey") lastKey: number,
    @Query("limit") limit: number,
    @Query("categoryId") categoryId: number
  ) {
    console.log("lastKey : ", lastKey, " limit : ", limit, " categoryId : ", categoryId);
    return this.feedService.getFeeds({ lastKey, limit, categoryId });
  }
}
