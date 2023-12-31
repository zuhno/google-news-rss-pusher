import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";

import { SupabaseModule } from "@/common/supabase/supabase.module";
import { SlackModule } from "@/common/slack/slack.module";
import { OAuth2Controller } from "./oauth2.controller";
import { OAuth2Service } from "./oauth2.service";

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    SupabaseModule,
    SlackModule,
    JwtModule.register({
      global: true,
      secret: process.env.GOOGLE_OAUTH_JWT_SECRET,
    }),
  ],
  controllers: [OAuth2Controller],
  providers: [OAuth2Service],
})
export class OAuth2Module {}
