import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";

import { SupabaseModule } from "@/common/supabase/supabase.module";
import { SlackModule } from "@/common/slack/slack.module";
import { StoreService } from "@/common/store/store.service";
import { OAuth2Controller } from "./oauth2.controller";
import { OAuth2Service } from "./oauth2.service";
import { StoreModule } from "@/common/store/store.module";

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    SupabaseModule,
    SlackModule,
    StoreModule,
    JwtModule.register({}),
  ],
  controllers: [OAuth2Controller],
  providers: [OAuth2Service, StoreService],
})
export class OAuth2Module {}
