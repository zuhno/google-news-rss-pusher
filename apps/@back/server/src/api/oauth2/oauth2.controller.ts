import { Body, Controller, Get, Post, Req, Res } from "@nestjs/common";
import { Request } from "express";
import { OAuth2Service } from "./oauth2.service";
import { OAuth2GoogleAccessBodyDto, OAuth2SlackAccessBodyDto } from "./dto/oauth2_request.dto";
import { Response } from "express";
import { StoreService } from "@/common/store/store.service";

@Controller()
export class OAuth2Controller {
  constructor(
    private readonly oauth2Service: OAuth2Service,
    private readonly storeService: StoreService
  ) {}

  @Post("/slack")
  async postSlackAccess(@Body() body: OAuth2SlackAccessBodyDto, @Req() req: Request) {
    const { keys } = this.storeService.getCookieConfig();
    const accessToken = req.cookies[keys.accessToken];

    // The reason for not checking the validity of the accessToken is that
    // although adding an app to Slack does not enforce login,
    // user information is stored wherever possible for tracking purposes.
    return this.oauth2Service.postSlackAccess(body.code, body.category, accessToken);
  }

  @Get("/google")
  getGoogleClientInfo() {
    return this.oauth2Service.getGoogleClientInfo();
  }

  @Post("/google")
  async postGoogleAccess(
    @Body() body: OAuth2GoogleAccessBodyDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const { accessToken, refreshToken, userInfo } = await this.oauth2Service.postGoogleAccess(
      body.code
    );
    const { keys, policies, expiresIn } = this.storeService.getCookieConfig();

    res.cookie(keys.accessToken, accessToken, { ...policies.token, maxAge: expiresIn.accessToken });
    res.cookie(keys.refreshToken, refreshToken, {
      ...policies.token,
      maxAge: expiresIn.refreshToken,
    });
    res.cookie(
      keys.loggedInUser,
      JSON.stringify({
        email: userInfo.email,
        nickName: userInfo.nick_name,
        avatarUrl: userInfo.avatar_url,
      }),
      { ...policies.loggedIn, maxAge: expiresIn.refreshToken }
    );

    return;
  }
}
