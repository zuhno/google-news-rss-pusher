import { Controller, Get, Post, Req, Res } from "@nestjs/common";
import { UserService } from "./user.service";
import { Request, Response } from "express";
import { StoreService } from "@/common/store/store.service";
import { response } from "http-api-type";

@Controller()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly storeService: StoreService
  ) {}

  @Get()
  async getUser(@Req() req: Request): Promise<response.GetUserResponse> {
    const { keys } = this.storeService.getCookieConfig();
    const accessToken = req.cookies[keys.accessToken];

    const { userInfo } = await this.userService.getUser(accessToken);

    return {
      email: userInfo.email,
      nickName: userInfo.nick_name,
      avatarUrl: userInfo.avatar_url,
    };
  }

  @Post("/logout")
  async PostLogout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<response.PostUserLogoutResponse> {
    const { keys, policies } = this.storeService.getCookieConfig();
    const accessToken = req.cookies[keys.accessToken];

    const { count } = await this.userService.postLogout(accessToken);

    if (count === 1) {
      res.clearCookie(keys.accessToken, policies);
      res.clearCookie(keys.refreshToken, policies);
    }

    return { count };
  }
}
