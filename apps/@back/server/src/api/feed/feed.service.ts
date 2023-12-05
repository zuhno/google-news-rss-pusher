import { HttpException, HttpStatus, Injectable } from "@nestjs/common";

import { SupabaseService } from "@/common/supabase/supabase.service";
import { RealEstateResponseDto } from "./dto/real-estate_response.dto";
import { BlockchainResponseDto } from "./dto/blockchain_response.dto";

@Injectable()
export class FeedService {
  private lastData: Record<"real_estate_id" | "blockchain_id", number> = {
    real_estate_id: null,
    blockchain_id: null,
  };

  constructor(private readonly supabaseService: SupabaseService) {}

  async realEstateList(lastKey?: number): Promise<RealEstateResponseDto> {
    const { data: categoryData, error: categoryErr } = await this.supabaseService
      .getClient()
      .anon.from("Category")
      .select("*")
      .eq("title", "부동산")
      .single();

    if (categoryErr) throw new HttpException(categoryErr.message, HttpStatus.INTERNAL_SERVER_ERROR);

    if (!this.lastData.real_estate_id) {
      const { data: lastData } = await this.supabaseService
        .getClient()
        .anon.from("Feed")
        .select("id", { count: "exact" })
        .eq("category_id", categoryData.id)
        .limit(1);

      this.lastData.real_estate_id = lastData[0].id;
    }

    const query = this.supabaseService
      .getClient()
      .anon.from("Feed")
      .select("*", { count: "exact" })
      .eq("category_id", categoryData.id)
      .order("id", { ascending: false })
      .limit(10);

    if (lastKey) {
      query.lt("id", lastKey);
    }

    const { data: feedData, error: feedErr } = await query;

    const _lastKey = feedData.at(-1)?.id;
    const hasNext = this.lastData.real_estate_id < _lastKey;

    if (feedErr) throw new HttpException(feedErr.message, HttpStatus.INTERNAL_SERVER_ERROR);

    return { list: feedData, hasNext, lastKey: _lastKey };
  }

  async blockchainList(lastKey?: number): Promise<BlockchainResponseDto> {
    console.log("lastKey: ", lastKey);
    const { data: categoryData, error: categoryErr } = await this.supabaseService
      .getClient()
      .anon.from("Category")
      .select("*")
      .eq("title", "블록체인")
      .single();

    if (categoryErr) throw new HttpException(categoryErr.message, HttpStatus.INTERNAL_SERVER_ERROR);

    if (!this.lastData.blockchain_id) {
      const { data: lastData } = await this.supabaseService
        .getClient()
        .anon.from("Feed")
        .select("id", { count: "exact" })
        .eq("category_id", categoryData.id)
        .limit(1);

      this.lastData.blockchain_id = lastData[0].id;
    }

    const query = this.supabaseService
      .getClient()
      .anon.from("Feed")
      .select("*")
      .eq("category_id", categoryData.id)
      .order("id", { ascending: false })
      .limit(10);

    if (lastKey) {
      query.lt("id", lastKey);
    }

    const { data: feedData, error: feedErr } = await query;

    const _lastKey = feedData.at(-1)?.id;
    const hasNext = this.lastData.real_estate_id < _lastKey;

    if (feedErr) throw new HttpException(feedErr.message, HttpStatus.INTERNAL_SERVER_ERROR);

    return { list: feedData, hasNext, lastKey: _lastKey };
  }
}
