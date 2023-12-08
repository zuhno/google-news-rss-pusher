import { Controller, Get, Query } from "@nestjs/common";

import { FeedService } from "./feed.service";

@Controller()
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get("/real-estate")
  async realEstateList(@Query("lastKey") lastKey?: number, @Query("limit") limit?: number) {
    return this.feedService.realEstateList({ lastKey, limit });
  }

  @Get("/blockchain")
  async blockchainList(@Query("lastKey") lastKey?: number, @Query("limit") limit?: number) {
    return this.feedService.blockchainList({ lastKey, limit });
  }
}
