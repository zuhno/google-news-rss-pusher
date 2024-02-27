import { SupabaseService } from "@/common/supabase/supabase.service";
import { Injectable, Logger } from "@nestjs/common";
import { Response } from "express";

@Injectable()
export class TempService {
  private readonly logger = new Logger(TempService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async getTempNews(res: Response, { id, redirect }: { id: string; redirect: string }) {
    await this.supabaseService
      .getClient()
      .serviceRole.from("FeedView")
      .update({ view: 1 })
      .eq("id", id);

    this.logger.log(`increase feed views. (id: ${id})`);

    const realLink = decodeURI(atob(redirect));
    res.redirect(realLink);
  }
}
