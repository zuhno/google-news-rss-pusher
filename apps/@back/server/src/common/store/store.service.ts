import { Injectable, Logger } from "@nestjs/common";

import { SupabaseService } from "../supabase/supabase.service";
import { Database } from "supabase-type";
import { CookieOptions } from "express";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class StoreService {
  private readonly logger = new Logger(StoreService.name);
  private lastUpdateTimestamp = new Date().getTime();
  private lastFeed: Record<number, { id: string; createdAt: string }> = {};
  private categoryIds: number[] = [];
  private categories: Database["public"]["Tables"]["Category"]["Row"][];
  private cookieConfig: {
    keys: {
      accessToken: string;
      refreshToken: string;
      loggedInUser: string;
    };
    policies: {
      token: CookieOptions;
      loggedIn: CookieOptions;
    };
    expiresIn: {
      accessToken: number;
      refreshToken: number;
    };
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly supabaseService: SupabaseService
  ) {
    this.cookieConfig = {
      keys: {
        accessToken: "gnrp_access_token",
        refreshToken: "gnrp_refresh_token",
        loggedInUser: "gnrp_logged_in_user",
      },
      policies: {
        token: (this.configService.get("NODE_ENV") === "development"
          ? {
              httpOnly: false,
              sameSite: "none",
              path: "/",
              secure: true,
              domain: "localhost",
            }
          : {
              httpOnly: true,
              sameSite: "strict",
              path: "/",
              domain: ".zuhno.io",
            }) as CookieOptions,
        loggedIn: {
          httpOnly: false,
          sameSite: "none",
          path: "/",
          secure: true,
          domain: this.configService.get("NODE_ENV") === "development" ? "localhost" : ".zuhno.io",
        } as CookieOptions,
      },
      expiresIn: {
        accessToken: 1000 * 60 * 30, // 30m
        refreshToken: 1000 * 60 * 60 * 24, // 24h
      },
    };

    this.initialize();
  }

  private async initialize() {
    const categories = await this.supabaseService
      .getClient()
      .anon.from("Category")
      .select("*")
      .eq("active", true);
    if (categories.error) this.logger.warn("#category error : " + categories.error.message);

    this.setFirstFeed(categories.data ?? []);
    this.setCategories(categories.data ?? []);
  }

  private async invalidate() {
    const now = new Date().getTime();
    if (now - this.lastUpdateTimestamp < 1000 * 60 * 60) return;
    console.log("#invalidate call🫡");
    this.lastUpdateTimestamp = now;
    await this.initialize();
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
        this.logger.warn("#http error : " + feed.reason);
        continue;
      }
      if (feed.value.error) {
        this.logger.warn("#feed error : " + feed.value.error.message);
        continue;
      }

      if (!feed.value.data.id) continue;

      this.lastFeed[feed.value.data.category_id] = {
        id: feed.value.data.id,
        createdAt: feed.value.data.created_at,
      };
    }
  }

  private setCategories(categories: Database["public"]["Tables"]["Category"]["Row"][]) {
    this.categoryIds = categories.map((category) => category.id);
    this.categories = categories;
  }

  getFirstFeed() {
    this.invalidate();
    return this.lastFeed;
  }

  getCategoryIds() {
    this.invalidate();
    return this.categoryIds;
  }

  getCategories() {
    this.invalidate();
    return this.categories;
  }

  getCookieConfig() {
    return this.cookieConfig;
  }
}
