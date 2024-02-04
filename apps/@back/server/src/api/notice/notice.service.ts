import { SupabaseService } from "@/common/supabase/supabase.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class NoticeService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getNotice(query: any) {
    console.log(query);
  }

  async postNotice(body: any) {
    console.log(body);
  }
}
