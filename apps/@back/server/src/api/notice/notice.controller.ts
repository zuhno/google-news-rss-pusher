import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { NoticeService } from "./notice.service";

@Controller()
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @Get()
  getNotice(@Query() query: any) {
    return this.noticeService.getNotice(query);
  }

  @Post()
  postNotice(@Body() body: any) {
    return this.noticeService.postNotice(body);
  }
}
