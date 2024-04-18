import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ConfigModule } from "@nestjs/config";
import { SlackService } from "./slack.service";
import { SupabaseModule } from "../supabase/supabase.module";
import { StoreModule } from "../store/store.module";

@Module({
  imports: [ConfigModule, HttpModule, StoreModule, SupabaseModule],
  providers: [SlackService],
  exports: [SlackService],
})
export class SlackModule {}
