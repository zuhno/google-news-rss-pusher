import { Body, Controller, Post } from "@nestjs/common";

import { OAuth2Service } from "./oauth2.service";
import { AccessOAuth2Dto } from "./dto/access-oauth2.dto";

@Controller()
export class OAuth2Controller {
  constructor(private readonly oauth2Service: OAuth2Service) {}

  @Post()
  async access(@Body() accessOAuth2Dto: AccessOAuth2Dto) {
    return this.oauth2Service.access(accessOAuth2Dto.code);
  }
}
