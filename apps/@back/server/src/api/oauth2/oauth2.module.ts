import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ConfigModule } from "@nestjs/config";

import { SupabaseModule } from "@/common/supabase/supabase.module";
import { SlackModule } from "@/common/slack/slack.module";
import { OAuth2Controller } from "./oauth2.controller";
import { OAuth2Service } from "./oauth2.service";

@Module({
  imports: [ConfigModule, HttpModule, SupabaseModule, SlackModule],
  controllers: [OAuth2Controller],
  providers: [OAuth2Service],
})
export class OAuth2Module {}
