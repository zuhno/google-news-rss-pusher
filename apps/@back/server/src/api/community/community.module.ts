import { Module } from "@nestjs/common";

import { SupabaseModule } from "@/common/supabase/supabase.module";
import { SlackModule } from "@/common/slack/slack.module";
import { CommunityController } from "./community.controller";
import { CommunityService } from "./community.service";

@Module({
  imports: [SupabaseModule, SlackModule],
  controllers: [CommunityController],
  providers: [CommunityService],
})
export class CommunityModule {}
