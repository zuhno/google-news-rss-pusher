import { Controller, Get } from "@nestjs/common";

import { ConstantService } from "./constant.service";

@Controller()
export class ConstantController {
  constructor(private readonly constantService: ConstantService) {}

  @Get()
  async getConstant() {
    return this.constantService.getConstant();
  }
}
