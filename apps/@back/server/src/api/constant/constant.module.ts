import { Module } from "@nestjs/common";

import { SupabaseModule } from "@/common/supabase/supabase.module";
import { StoreModule } from "@/common/store/store.module";
import { ConstantController } from "./constant.controller";
import { ConstantService } from "./constant.service";

@Module({
  imports: [SupabaseModule, StoreModule],
  controllers: [ConstantController],
  providers: [ConstantService],
})
export class ConstantModule {}
