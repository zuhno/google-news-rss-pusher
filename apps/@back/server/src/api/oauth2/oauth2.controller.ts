import { Body, Controller, Get, Post, Query } from "@nestjs/common";

import { OAuth2Service } from "./oauth2.service";
import { OAuth2GoogleAccessBodyDto, OAuth2SlackAccessBodyDto } from "./dto/oauth2_request.dto";

@Controller()
export class OAuth2Controller {
  constructor(private readonly oauth2Service: OAuth2Service) {}

  @Post("/slack")
  async postSlackAccess(@Body() body: OAuth2SlackAccessBodyDto) {
    return this.oauth2Service.postSlackAccess(body.code);
  }

  @Post("/google")
  async postGoogleAccess(@Body() body: OAuth2GoogleAccessBodyDto) {
    return this.oauth2Service.postGoogleAccess(body.code);
  }
}
