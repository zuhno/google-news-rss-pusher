import { SupabaseService } from "@/common/supabase/supabase.service";
import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { Response } from "express";
import { TempNewsParamDto, TempNewsQueryDto } from "./dto/temp_request.dto";

@Injectable()
export class TempService {
  private readonly logger = new Logger(TempService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async getTempNews(res: Response, params: TempNewsParamDto, query: TempNewsQueryDto) {
    const rpcIncrementField = await this.supabaseService
      .getClient()
      .serviceRole.rpc("increment_field", {
        table_name: "FeedView",
        row_id: params.id,
        field_name: "view",
        x: 1,
      });

    if (rpcIncrementField?.error)
      new HttpException(rpcIncrementField?.error?.message, HttpStatus.INTERNAL_SERVER_ERROR);

    this.logger.log(`increase feed views. (id: ${params.id})`);

    const realLink = decodeURI(atob(query.redirect));
    res.redirect(realLink);
  }
}
