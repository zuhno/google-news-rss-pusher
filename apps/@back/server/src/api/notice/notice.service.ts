import { SupabaseService } from "@/common/supabase/supabase.service";
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class NoticeService {
  private readonly logger = new Logger(NoticeService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async getNotice(query: any) {
    console.log(query);
  }

  async postNotice(body: any) {
    console.log(body);
  }
}
