import { Module } from "@nestjs/common";

import { SupabaseModule } from "@/common/supabase/supabase.module";
import { StoreModule } from "@/common/store/store.module";
import { FeedService } from "./feed.service";
import { FeedController } from "./feed.controller";

@Module({
  imports: [SupabaseModule, StoreModule],
  controllers: [FeedController],
  providers: [FeedService],
})
export class FeedModule {}
