import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";

import { FeedsLimitedAllResponseDto, FeedsResponseDto } from "./dto/feeds_response.dto";
import { SupabaseService } from "@/common/supabase/supabase.service";
import { StoreService } from "@/common/store/store.service";
import { FeedsLimitedAllQueryDto, FeedsQueryDto } from "./dto/feeds_request.dto";
import { Database } from "supabase-type";

@Injectable()
export class FeedService {
  private readonly logger = new Logger(FeedService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly storeService: StoreService
  ) {}

  private async _makeFeedListByView(feeds: Database["public"]["Tables"]["Feed"]["Row"][]) {
    const feedIds = feeds.map((feed) => feed.id);
    const views = await this.supabaseService
      .getClient()
      .anon.from("FeedView")
      .select("id, view")
      .in("id", feedIds);

    if (views.error) this.logger.warn("#feedView error : " + views.error.message);

    const list = feeds.map((feed) => {
      const view = views.data.find((view) => view.id === feed.id)?.view ?? 0;
      return {
        ...feed,
        view,
      };
    });

    return list;
  }

  async getFeeds({ lastKey, limit = 10, categoryId }: FeedsQueryDto): Promise<FeedsResponseDto> {
    const query = this.supabaseService
      .getClient()
      .anon.from("Feed")
      .select("*")
      .eq("category_id", categoryId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (lastKey) {
      query.lt("created_at", lastKey);
    }

    const feeds = await query;

    if (feeds.error) throw new HttpException(feeds.error.message, HttpStatus.INTERNAL_SERVER_ERROR);

    const firstData = this.storeService.getFirstFeed();
    const lastCreatedAt = feeds.data.at(-1)?.created_at;
    const hasNext = firstData[categoryId]?.createdAt < lastCreatedAt;

    const list = await this._makeFeedListByView(feeds.data);

    return { list, hasNext, lastKey: lastCreatedAt };
  }

  async getFeedsLimitedAll({
    limit = 4,
  }: FeedsLimitedAllQueryDto): Promise<FeedsLimitedAllResponseDto> {
    const ids = this.storeService.getCategoryIds();
    const feedsByCategoryId: {
      [categoryId: number]: FeedsLimitedAllResponseDto[number];
    } = {};

    for (const id of ids) {
      const query = this.supabaseService
        .getClient()
        .anon.from("Feed")
        .select("*")
        .eq("category_id", id)
        .order("created_at", { ascending: false })
        .limit(limit);

      const feeds = await query;
      if (feeds.error)
        throw new HttpException(feeds.error.message, HttpStatus.INTERNAL_SERVER_ERROR);

      const list = await this._makeFeedListByView(feeds.data);

      feedsByCategoryId[id] = list;
    }

    return feedsByCategoryId;
  }
}
