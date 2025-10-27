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
  private jwtConfig: {
    expiresIn: {
      accessToken: number;
      refreshToken: number;
    };
  };
  private cookieConfig: {
    keys: {
      loggedInUser: string;
      accessToken: string;
    };
    policies: {
      token: CookieOptions;
      loggedInUser: CookieOptions;
    };
    expiresIn: {
      accessToken: number;
      loggedInUser: number;
    };
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly supabaseService: SupabaseService
  ) {
    this.jwtConfig = {
      expiresIn: {
        accessToken: 60 * 10, // 10m
        refreshToken: 60 * 60 * 24, // 24h
      },
    };
    this.cookieConfig = {
      keys: {
        accessToken: "gnrp_access_token",
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
              domain: ".zuhno.org",
            }) as CookieOptions,
        loggedInUser: {
          httpOnly: false,
          sameSite: "none",
          path: "/",
          secure: true,
          domain: this.configService.get("NODE_ENV") === "development" ? "localhost" : ".zuhno.org",
        } as CookieOptions,
      },
      expiresIn: {
        accessToken: 1000 * 60 * 10, // 10m
        loggedInUser: 1000 * 60 * 60 * 24, // 24h
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
    // Update every 5 minutes.
    if (now - this.lastUpdateTimestamp < 1000 * 60 * 5) return;
    this.logger.log("#invalidate call🫡");
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

  getJwtConfig() {
    return this.jwtConfig;
  }
}
