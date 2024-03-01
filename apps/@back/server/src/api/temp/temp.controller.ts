import { Controller, Get, Param, Query, Res } from "@nestjs/common";
import { TempService } from "./temp.service";
import { Response } from "express";
import { TempNewsParamDto, TempNewsQueryDto } from "./dto/temp_request.dto";

@Controller()
export class TempController {
  constructor(private readonly tempService: TempService) {}

  @Get("/news/:id")
  getTempNews(
    @Param() params: TempNewsParamDto,
    @Query() query: TempNewsQueryDto,
    @Res() res: Response
  ) {
    return this.tempService.getTempNews(res, params, query);
  }
}
