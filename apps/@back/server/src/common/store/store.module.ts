import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { StoreService } from "./store.service";
import { SupabaseModule } from "../supabase/supabase.module";

@Module({
  imports: [ConfigModule, SupabaseModule],
  providers: [StoreService],
  exports: [StoreService],
})
export class StoreModule {}
