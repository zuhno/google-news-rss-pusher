import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { RouterModule } from "@nestjs/core";

import { OAuth2Module } from "./api/oauth2/oauth2.module";
import { FeedModule } from "./api/feed/feed.module";
import { ConstantModule } from "./api/constant/constant.module";
import { CommunityModule } from "./api/community/community.module";
import { NoticeModule } from "./api/notice/notice.module";
import { UserModule } from "./api/user/user.module";

@Module({
  imports: [
    // Config ENV
    ConfigModule.forRoot({
      envFilePath: ".env",
    }),
    // Api Module
    OAuth2Module,
    FeedModule,
    ConstantModule,
    CommunityModule,
    NoticeModule,
    UserModule,
    // Router
    RouterModule.register([
      {
        path: "oauth2",
        module: OAuth2Module,
      },
      {
        path: "feeds",
        module: FeedModule,
      },
      {
        path: "constants",
        module: ConstantModule,
      },
      {
        path: "community",
        module: CommunityModule,
      },
      { path: "notices", module: NoticeModule },
      { path: "users", module: UserModule },
    ]),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
