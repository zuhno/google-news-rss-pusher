import { Module } from "@nestjs/common";

import { SupabaseModule } from "@/common/supabase/supabase.module";
import { FeedService } from "./feed.service";
import { FeedController } from "./feed.controller";
import { ConstantModule } from "../constant/constant.module";

@Module({
  imports: [SupabaseModule, ConstantModule],
  controllers: [FeedController],
  providers: [FeedService],
})
export class FeedModule {}
