import { Get, Req } from "@nestjs/common";
import { UserService } from "./user.service";
import { Request } from "express";
import { StoreService } from "@/common/store/store.service";
import { response } from "http-api-type";

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
}
