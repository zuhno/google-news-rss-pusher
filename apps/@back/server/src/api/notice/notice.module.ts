import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";

import { adminRoleMiddleware } from "@/middleware/adminRole.middleware";
import { SupabaseModule } from "@/common/supabase/supabase.module";
import { NoticeController } from "./notice.controller";
import { NoticeService } from "./notice.service";
import { userAuthMiddleware } from "@/middleware/userAuth.middleware";
import { StoreModule } from "@/common/store/store.module";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [SupabaseModule, StoreModule, ConfigModule, JwtModule.register({})],
  controllers: [NoticeController],
  providers: [NoticeService],
})
export class NoticeModule {
  configure(consumer: MiddlewareConsumer) {
    // for authorized admin account
    consumer
      .apply(userAuthMiddleware)
      .forRoutes({ path: "notices", method: RequestMethod.POST })
      .apply(adminRoleMiddleware)
      .forRoutes({ path: "notices", method: RequestMethod.POST });
  }
}
