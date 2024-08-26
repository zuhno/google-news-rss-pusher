import { Body, Controller, Get, Post, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { OAuth2Service } from "./oauth2.service";
import { OAuth2GoogleAccessBodyDto, OAuth2SlackAccessBodyDto } from "./dto/oauth2_request.dto";
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
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const {
      headers: { ["user-agent"]: userAgent, ["fly-client-ip"]: ip, ["fly-forwarded-port"]: port },
    } = req;

    const requestConfig = JSON.stringify({
      ip: `${ip}:${port}`,
      userAgent,
    });
    const { accessToken, userInfo } = await this.oauth2Service.postGoogleAccess(
      body.code,
      requestConfig
    );
    const { keys, policies, expiresIn } = this.storeService.getCookieConfig();

    res.cookie(keys.accessToken, accessToken, { ...policies.token, maxAge: expiresIn.accessToken });
    res.cookie(
      keys.loggedInUser,
      JSON.stringify({
        email: userInfo.email,
        nickName: userInfo.nick_name,
        avatarUrl: userInfo.avatar_url,
      }),
      { ...policies.loggedInUser, maxAge: expiresIn.loggedInUser }
    );

    return;
  }
}
