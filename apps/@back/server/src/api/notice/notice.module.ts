import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";

import { adminRoleMiddleware } from "@/middleware/adminRole.middleware";
import { SupabaseModule } from "@/common/supabase/supabase.module";
import { NoticeController } from "./notice.controller";
import { NoticeService } from "./notice.service";
import { userAuthMiddleware } from "@/middleware/userAuth.middleware";
import { StoreModule } from "@/common/store/store.module";

@Module({
  imports: [SupabaseModule, StoreModule],
  controllers: [NoticeController],
  providers: [NoticeService],
})
export class NoticeModule {
  configure(consumer: MiddlewareConsumer) {
    // for authorized admin account
    consumer
      .apply(userAuthMiddleware)
      .forRoutes({ path: "notices", method: RequestMethod.GET })
      .apply(adminRoleMiddleware)
      .forRoutes({ path: "notices", method: RequestMethod.GET });
  }
}
