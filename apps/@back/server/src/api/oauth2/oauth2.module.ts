import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";

import { OAuth2Controller } from "./oauth2.controller";
import { OAuth2Service } from "./oauth2.service";
import { SupabaseModule } from "src/common/supabase";
import { ConfigModule } from "@nestjs/config";
import { SlackModule } from "src/common/slack";

@Module({
  imports: [ConfigModule, HttpModule, SupabaseModule, SlackModule],
  controllers: [OAuth2Controller],
  providers: [OAuth2Service],
})
export class OAuth2Module {}
