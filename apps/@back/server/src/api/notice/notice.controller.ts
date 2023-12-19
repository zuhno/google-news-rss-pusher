import { Controller, Get, Post, Query } from "@nestjs/common";
import { NoticeService } from "./notice.service";

@Controller()
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @Get()
  getNotice(@Query() query: any) {
    return this.noticeService.getNotice(query);
  }

  @Post()
  postNotice() {
    return this.noticeService.postNotice();
  }
}
