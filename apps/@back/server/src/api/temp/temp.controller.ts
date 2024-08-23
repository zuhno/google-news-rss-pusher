import { Controller, Get, Param, Query, Req, Res } from "@nestjs/common";
import { TempService } from "./temp.service";
import { Request, Response } from "express";
import { TempNewsParamDto, TempNewsQueryDto } from "./dto/temp_request.dto";

@Controller()
export class TempController {
  constructor(private readonly tempService: TempService) {}

  @Get("/news/:id")
  getTempNews(
    @Param() params: TempNewsParamDto,
    @Query() query: TempNewsQueryDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    return this.tempService.getTempNews(req, res, params, query);
  }
}
