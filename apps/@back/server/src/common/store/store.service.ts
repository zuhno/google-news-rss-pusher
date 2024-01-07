import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";

import { SupabaseService } from "../supabase/supabase.service";
import { Database } from "supabase-type";
import { CookieOptions } from "express";

@Injectable()
export class StoreService {
  private readonly logger = new Logger(StoreService.name);
  private lastFeed: Record<number, number> = {};
  private categoryIds: number[] = [];
  private cookieConfig = {
    keys: {
      accessToken: "gnrp_access_token",
      refreshToken: "gnrp_access_token",
    },
    policies: {
      httpOnly: true,
      sameSite: "strict",
      path: "/",
    } as CookieOptions,
  };

  constructor(private readonly supabaseService: SupabaseService) {
    // initial fetch
    (async () => {
      const categories = await this.supabaseService.getClient().anon.from("Category").select("*");

      if (categories.error)
        throw new HttpException(categories.error.message, HttpStatus.INTERNAL_SERVER_ERROR);

      await this.setLastFeed(categories.data);
      this.setCategoryIds(categories.data);
    })();
  }

  private async setLastFeed(categories: Database["public"]["Tables"]["Category"]["Row"][]) {
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

      if (!feed.value.data[0]) continue;

      this.lastFeed[feed.value.data[0].category_id] = feed.value.data[0].id;
    }
  }

  private setCategoryIds(categories: Database["public"]["Tables"]["Category"]["Row"][]) {
    this.categoryIds = categories.map((category) => category.id) || [];
  }

  getLastFeed() {
    return this.lastFeed;
  }

  getCategoryIds() {
    return this.categoryIds;
  }

  getCookieConfig() {
    return this.cookieConfig;
  }
}
