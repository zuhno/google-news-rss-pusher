import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";

import { SupabaseService } from "../supabase/supabase.service";
import { Database } from "supabase-type";
import { CookieOptions } from "express";

@Injectable()
export class StoreService {
  private readonly logger = new Logger(StoreService.name);
  private lastFeed: Record<number, { id: string; createdAt: string }> = {};
  private categoryIds: number[] = [];
  private cookieConfig = {
    keys: {
      accessToken: "gnrp_access_token",
      refreshToken: "gnrp_refresh_token",
      loggedInUser: "gnrp_logged_in_user",
    },
    policies: {
      token: (process.env.NODE_ENV === "development"
        ? {
            httpOnly: false,
            sameSite: "none",
            path: "/",
            secure: true,
            domain: "localhost",
          }
        : { httpOnly: true, sameSite: "strict", path: "/", domain: "" }) as CookieOptions,
      loggedIn: {
        httpOnly: false,
        sameSite: "none",
        path: "/",
        secure: true,
        domain: process.env.NODE_ENV === "development" ? "localhost" : "",
      } as CookieOptions,
    },
    expiresIn: {
      accessToken: 1000 * 60 * 30, // 30m
      refreshToken: 1000 * 60 * 60 * 24, // 24h
    },
  };

  constructor(private readonly supabaseService: SupabaseService) {
    // initial fetch
    (async () => {
      const categories = await this.supabaseService.getClient().anon.from("Category").select("*");

      if (categories.error)
        throw new HttpException(categories.error.message, HttpStatus.INTERNAL_SERVER_ERROR);

      await this.setFirstFeed(categories.data);
      this.setCategoryIds(categories.data);
    })();
  }

  private async setFirstFeed(categories: Database["public"]["Tables"]["Category"]["Row"][]) {
    const feedsByCategory = await Promise.allSettled(
      categories.map((category) =>
        this.supabaseService
          .getClient()
          .anon.from("Feed")
          .select("id, category_id, created_at")
          .eq("category_id", category.id)
          .order("created_at", { ascending: true })
          .limit(1)
          .single()
      )
    );

    for (const feed of feedsByCategory) {
      if (feed.status === "rejected") {
        this.logger.warn(feed.reason);
        continue;
      }
      if (feed.value.error) {
        this.logger.warn(feed.value.error.message);
        continue;
      }

      if (!feed.value.data.id) continue;

      this.lastFeed[feed.value.data.category_id] = {
        id: feed.value.data.id,
        createdAt: feed.value.data.created_at,
      };
    }
  }

  private setCategoryIds(categories: Database["public"]["Tables"]["Category"]["Row"][]) {
    this.categoryIds = categories.map((category) => category.id) || [];
  }

  getFirstFeed() {
    return this.lastFeed;
  }

  getCategoryIds() {
    return this.categoryIds;
  }

  getCookieConfig() {
    return this.cookieConfig;
  }
}
