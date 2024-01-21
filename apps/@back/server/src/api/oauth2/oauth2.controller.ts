import { Body, Controller, Get, Post, Res } from "@nestjs/common";

import { OAuth2Service } from "./oauth2.service";
import { OAuth2GoogleAccessBodyDto, OAuth2SlackAccessBodyDto } from "./dto/oauth2_request.dto";
import { Response } from "express";
import { StoreService } from "@/common/store/store.service";
import { response } from "http-api-type";

@Controller()
export class OAuth2Controller {
  constructor(
    private readonly oauth2Service: OAuth2Service,
    private readonly storeService: StoreService
  ) {}

  @Post("/slack")
  async postSlackAccess(@Body() body: OAuth2SlackAccessBodyDto) {
    return this.oauth2Service.postSlackAccess(body.code, body.category);
  }

  @Get("/google")
  getGoogleClientInfo() {
    return this.oauth2Service.getGoogleClientInfo();
  }

  @Post("/google")
  async postGoogleAccess(
    @Body() body: OAuth2GoogleAccessBodyDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<response.PostOAuth2GoogleAccessResponse> {
    const { accessToken, refreshToken, userInfo } = await this.oauth2Service.postGoogleAccess(
      body.code
    );
    const { keys, policies } = this.storeService.getCookieConfig();

    res.cookie(keys.accessToken, accessToken, { ...policies });
    res.cookie(keys.refreshToken, refreshToken, { ...policies });

    return {
      email: userInfo.email,
      nickName: userInfo.nick_name,
      avatarUrl: userInfo.avatar_url,
    };
  }
}
