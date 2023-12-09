import { Injectable, Logger } from "@nestjs/common";

import { SupabaseService } from "../supabase/supabase.service";
import { Database } from "supabase-type";

@Injectable()
export class StoreService {
  private readonly logger = new Logger(StoreService.name);
  private lastFeed: Record<number, number> = {};

  constructor(private readonly supabaseService: SupabaseService) {}

  async setLastFeed(categories: Database["public"]["Tables"]["Category"]["Row"][]) {
    const feedsByCategory = await Promise.allSettled(
      categories.map((category) =>
        this.supabaseService
          .getClient()
          .anon.from("Feed")
          .select("id, category_id")
          .eq("category_id", category.id)
          .limit(1)
      )
    );

    for (const feed of feedsByCategory) {
      if (feed.status === "rejected") {
        this.logger.error(feed.reason);
        continue;
      }
      if (feed.value.error) {
        this.logger.error(feed.value.error.message);
        continue;
      }

      this.lastFeed[feed.value.data[0].category_id] = feed.value.data[0].id;
    }
  }

  getLastFeed() {
    return this.lastFeed;
  }
}
