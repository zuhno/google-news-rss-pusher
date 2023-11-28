import { Module } from "@nestjs/common";

import { Supabase } from "./supabase";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [ConfigModule],
  providers: [Supabase],
  exports: [Supabase],
})
export class SupabaseModule {}
