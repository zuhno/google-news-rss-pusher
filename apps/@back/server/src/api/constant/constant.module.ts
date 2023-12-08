import { Module } from "@nestjs/common";

import { SupabaseModule } from "@/common/supabase/supabase.module";
import { ConstantService } from "./constant.service";
import { ConstantController } from "./constant.controller";

@Module({
  imports: [SupabaseModule],
  controllers: [ConstantController],
  providers: [ConstantService],
  exports: [ConstantService],
})
export class ConstantModule {}
