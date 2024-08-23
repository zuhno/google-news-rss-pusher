import { SupabaseService } from "@/common/supabase/supabase.service";
import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { Request, Response } from "express";
import { TempNewsParamDto, TempNewsQueryDto } from "./dto/temp_request.dto";

@Injectable()
export class TempService {
  private readonly logger = new Logger(TempService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async getTempNews(
    req: Request,
    res: Response,
    params: TempNewsParamDto,
    query: TempNewsQueryDto
  ) {
    const {
      ip: user_ip,
      headers: { ["user-agent"]: user_agent },
    } = req;

    console.log(JSON.stringify(req.headers));

    const rpcIncrementField = await this.supabaseService
      .getClient()
      .serviceRole.rpc("increment_field", {
        table_name: "FeedView",
        row_id: params.id,
        field_name: "view",
        inc_val: 1,
      });

    if (rpcIncrementField?.error)
      throw new HttpException(rpcIncrementField?.error?.message, HttpStatus.INTERNAL_SERVER_ERROR);

    // save log
    const viewLog = await this.supabaseService.getClient().serviceRole.from("FeedViewLog").insert({
      user_ip,
      user_agent,
      feed_id: params.id,
    });

    if (viewLog?.error) {
      this.logger.error(
        `The log with feed_id: ${params.id} / user_ip: ${user_ip} / user_agent: ${user_agent} could not be saved.\nerror msg: ${viewLog?.error?.message}`
      );
    }

    this.logger.log(`increase feed views. (id: ${params.id})`);

    const realLink = decodeURI(atob(query.redirect));
    res.redirect(realLink);
  }
}
