import { Body, Controller, Post } from "@nestjs/common";
import { OAuth2Service } from "./oauth2.service";

@Controller()
export class OAuth2Controller {
  constructor(private readonly service: OAuth2Service) {}

  @Post()
  async postCode(@Body() body: { code: string }) {
    return this.service.postCode(body.code);
  }
}
