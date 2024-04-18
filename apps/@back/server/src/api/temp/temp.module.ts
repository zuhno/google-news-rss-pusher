import { Module } from "@nestjs/common";

import { SupabaseModule } from "@/common/supabase/supabase.module";
import { TempService } from "./temp.service";
import { TempController } from "./temp.controller";

@Module({
  imports: [SupabaseModule],
  controllers: [TempController],
  providers: [TempService],
})
export class TempModule {}
