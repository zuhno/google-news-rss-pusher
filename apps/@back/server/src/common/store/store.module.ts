import { Module } from "@nestjs/common";

import { StoreService } from "./store.service";
import { SupabaseModule } from "../supabase/supabase.module";

@Module({
  imports: [SupabaseModule],
  providers: [StoreService],
  exports: [StoreService],
})
export class StoreModule {}
