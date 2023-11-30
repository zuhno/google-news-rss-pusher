import { HttpException, HttpStatus, Injectable } from "@nestjs/common";

import { SupabaseService } from "@/common/supabase/supabase.service";
import { RealEstateResponseDto } from "./dto/real-estate_response.dto";
import { BlockchainResponseDto } from "./dto/blockchain_response.dto";

@Injectable()
export class FeedService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async realEstateList(lastKey?: number): Promise<RealEstateResponseDto> {
    const { data: categoryData, error: categoryErr } = await this.supabaseService
      .getClient()
      .from("Category")
      .select("*")
      .eq("title", "부동산")
      .single();

    if (categoryErr) throw new HttpException(categoryErr.message, HttpStatus.INTERNAL_SERVER_ERROR);

    const query = this.supabaseService
      .getClient()
      .from("Feed")
      .select("*")
      .eq("category_id", categoryData.id)
      .order("id", { ascending: false })
      .limit(10);

    if (lastKey) {
      query.lt("id", lastKey);
    }

    const { data: feedData, error: feedErr } = await query;

    if (feedErr) throw new HttpException(feedErr.message, HttpStatus.INTERNAL_SERVER_ERROR);

    return { list: feedData, lastKey: feedData.at(-1)?.id };
  }

  async blockchainList(lastKey?: number): Promise<BlockchainResponseDto> {
    console.log("lastKey: ", lastKey);
    const { data: categoryData, error: categoryErr } = await this.supabaseService
      .getClient()
      .from("Category")
      .select("*")
      .eq("title", "블록체인")
      .single();

    if (categoryErr) throw new HttpException(categoryErr.message, HttpStatus.INTERNAL_SERVER_ERROR);

    const query = this.supabaseService
      .getClient()
      .from("Feed")
      .select("*")
      .eq("category_id", categoryData.id)
      .order("id", { ascending: false })
      .limit(10);

    if (lastKey) {
      query.lt("id", lastKey);
    }

    const { data: feedData, error: feedErr } = await query;
    console.log("feedData : ", feedData);
    if (feedErr) throw new HttpException(feedErr.message, HttpStatus.INTERNAL_SERVER_ERROR);

    return { list: feedData, lastKey: feedData.at(-1)?.id };
  }
}
