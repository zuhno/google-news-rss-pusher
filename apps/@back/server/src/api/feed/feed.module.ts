import { Module } from "@nestjs/common";

import { SupabaseModule } from "@/common/supabase/supabase.module";
import { FeedService } from "./feed.service";
import { FeedController } from "./feed.controller";

@Module({
  imports: [SupabaseModule],
  controllers: [FeedController],
  providers: [FeedService],
})
export class FeedModule {}
