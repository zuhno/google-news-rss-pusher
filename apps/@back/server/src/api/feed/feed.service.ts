import { HttpException, HttpStatus, Injectable } from "@nestjs/common";

import { SupabaseService } from "@/common/supabase/supabase.service";
import { RealEstateResponseDto } from "./dto/real-estate_response.dto";
import { BlockchainResponseDto } from "./dto/blockchain_response.dto";

@Injectable()
export class FeedService {
  private lastData: Record<number, number> = {};

  constructor(private readonly supabaseService: SupabaseService) {}

  async realEstateList({
    lastKey,
    limit = 10,
  }: {
    lastKey?: number;
    limit: number;
  }): Promise<RealEstateResponseDto> {
    const category = await this.supabaseService
      .getClient()
      .anon.from("Category")
      .select("*")
      .eq("title", "부동산")
      .single();

    if (category.error)
      throw new HttpException(category.error.message, HttpStatus.INTERNAL_SERVER_ERROR);

    if (!this.lastData[category.data.id]) {
      const { data: lastData } = await this.supabaseService
        .getClient()
        .anon.from("Feed")
        .select("id")
        .eq("category_id", category.data.id)
        .limit(1);

      this.lastData[category.data.id] = lastData[0].id;
    }

    const query = this.supabaseService
      .getClient()
      .anon.from("Feed")
      .select("*")
      .eq("category_id", category.data.id)
      .order("id", { ascending: false })
      .limit(limit);

    if (lastKey) {
      query.lt("id", lastKey);
    }

    const feeds = await query;

    if (feeds.error) throw new HttpException(feeds.error.message, HttpStatus.INTERNAL_SERVER_ERROR);

    const _lastKey = feeds.data.at(-1)?.id;
    const hasNext = this.lastData[category.data.id] < _lastKey;

    return { list: feeds.data, hasNext, lastKey: _lastKey };
  }

  async blockchainList({
    lastKey,
    limit = 10,
  }: {
    lastKey?: number;
    limit: number;
  }): Promise<BlockchainResponseDto> {
    const category = await this.supabaseService
      .getClient()
      .anon.from("Category")
      .select("*")
      .eq("title", "블록체인")
      .single();

    if (category.error)
      throw new HttpException(category.error.message, HttpStatus.INTERNAL_SERVER_ERROR);

    if (!this.lastData[category.data.id]) {
      const { data: lastData } = await this.supabaseService
        .getClient()
        .anon.from("Feed")
        .select("id")
        .eq("category_id", category.data.id)
        .limit(1);

      this.lastData[category.data.id] = lastData[0].id;
    }

    const query = this.supabaseService
      .getClient()
      .anon.from("Feed")
      .select("*")
      .eq("category_id", category.data.id)
      .order("id", { ascending: false })
      .limit(limit);

    if (lastKey) {
      query.lt("id", lastKey);
    }

    const feeds = await query;

    if (feeds.error) throw new HttpException(feeds.error.message, HttpStatus.INTERNAL_SERVER_ERROR);

    const _lastKey = feeds.data.at(-1)?.id;
    const hasNext = this.lastData[category.data.id] < _lastKey;

    return { list: feeds.data, hasNext, lastKey: _lastKey };
  }
}
