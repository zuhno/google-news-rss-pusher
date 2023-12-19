import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";

import { adminRoleMiddleware } from "@/middleware/adminRole.middleware";
import { SupabaseModule } from "@/common/supabase/supabase.module";
import { NoticeController } from "./notice.controller";
import { NoticeService } from "./notice.service";

@Module({
  imports: [SupabaseModule],
  controllers: [NoticeController],
  providers: [NoticeService],
})
export class NoticeModule {
  configure(consumer: MiddlewareConsumer) {
    // for authorized admin account
    consumer.apply(adminRoleMiddleware).forRoutes({ path: "notices", method: RequestMethod.GET });
  }
}
