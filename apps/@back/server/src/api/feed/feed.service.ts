import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";

import { FeedsLimitedAllResponseDto, FeedsResponseDto } from "./dto/feeds_response.dto";
import { SupabaseService } from "@/common/supabase/supabase.service";
import { StoreService } from "@/common/store/store.service";
import { Database } from "supabase-type";

@Injectable()
export class FeedService {
  private readonly logger = new Logger(FeedService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly storeService: StoreService
  ) {}

  async getFeeds({
    lastKey,
    limit = 10,
    categoryId,
  }: {
    lastKey?: number;
    limit: number;
    categoryId: number;
  }): Promise<FeedsResponseDto> {
    const query = this.supabaseService
      .getClient()
      .anon.from("Feed")
      .select("*")
      .eq("category_id", categoryId)
      .order("id", { ascending: false })
      .limit(limit);

    if (lastKey) {
      query.lt("id", lastKey);
    }

    const feeds = await query;

    if (feeds.error) throw new HttpException(feeds.error.message, HttpStatus.INTERNAL_SERVER_ERROR);

    const lastData = this.storeService.getLastFeed();

    const _lastKey = feeds.data.at(-1)?.id;
    const hasNext = lastData[categoryId] < _lastKey;

    return { list: feeds.data, hasNext, lastKey: _lastKey };
  }

  async getFeedsLimitedAll({ limit = 4 }: { limit: number }): Promise<FeedsLimitedAllResponseDto> {
    const ids = this.storeService.getCategoryIds();
    const feedsByCategoryId: {
      [categoryId: number]: Database["public"]["Tables"]["Feed"]["Row"][];
    } = {};

    for (const id of ids) {
      const query = this.supabaseService
        .getClient()
        .anon.from("Feed")
        .select("*")
        .eq("category_id", id)
        .order("id", { ascending: false })
        .limit(limit);

      const feeds = await query;
      if (feeds.error)
        throw new HttpException(feeds.error.message, HttpStatus.INTERNAL_SERVER_ERROR);

      feedsByCategoryId[id] = feeds.data;
    }

    return feedsByCategoryId;
  }
}
