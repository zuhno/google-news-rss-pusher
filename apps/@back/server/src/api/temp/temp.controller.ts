import { Controller, Get, Query, Res } from "@nestjs/common";
import { TempService } from "./temp.service";
import { TempNewsQueryDto } from "./dto/temp_request.dto";
import { Response } from "express";

@Controller()
export class TempController {
  constructor(private readonly tempService: TempService) {}

  @Get("/news")
  getTempNews(@Query() query: TempNewsQueryDto, @Res() res: Response) {
    return this.tempService.getTempNews(res, query);
  }
}
