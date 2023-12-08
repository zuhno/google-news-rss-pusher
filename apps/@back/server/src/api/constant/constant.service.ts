import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";

import { ConstantsResponseDto } from "./dto/constants_response";
import type { SupabaseService } from "@/common/supabase/supabase.service";

@Injectable()
export class ConstantService {
  private readonly logger = new Logger(ConstantService.name);
  private lastFeed: Record<number, number> = {};

  constructor(private readonly supabaseService: SupabaseService) {}

  async getConstant(): Promise<ConstantsResponseDto> {
    const categories = await this.supabaseService.getClient().anon.from("Category").select("*");

    if (categories.error)
      throw new HttpException(categories.error.message, HttpStatus.INTERNAL_SERVER_ERROR);

    const feedsByCategory = await Promise.allSettled(
      categories.data.map((category) =>
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

    return { categories: categories.data };
  }

  getLastFeed() {
    return this.lastFeed;
  }
}
