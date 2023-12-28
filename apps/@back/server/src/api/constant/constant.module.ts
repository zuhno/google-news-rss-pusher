import { Module } from "@nestjs/common";

import { SupabaseModule } from "@/common/supabase/supabase.module";
import { ConstantController } from "./constant.controller";
import { ConstantService } from "./constant.service";

@Module({
  imports: [SupabaseModule],
  controllers: [ConstantController],
  providers: [ConstantService],
})
export class ConstantModule {}
