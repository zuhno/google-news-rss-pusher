import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { RouterModule } from "@nestjs/core";

import { OAuth2Module } from "./api/oauth2/oauth2.module";
import { FeedModule } from "./api/feed/feed.module";

@Module({
  imports: [
    // Config ENV
    ConfigModule.forRoot({
      envFilePath: ".env",
    }),
    // Api Module
    OAuth2Module,
    FeedModule,
    // Router
    RouterModule.register([
      {
        path: "oauth2",
        module: OAuth2Module,
      },
      {
        path: "feed",
        module: FeedModule,
      },
    ]),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
