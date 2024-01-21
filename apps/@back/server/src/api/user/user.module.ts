import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { SupabaseModule } from "@/common/supabase/supabase.module";
import { JwtModule } from "@nestjs/jwt";
import { StoreService } from "@/common/store/store.service";
import { userAuthMiddleware } from "@/middleware/userAuth.middleware";

@Module({
  imports: [SupabaseModule, JwtModule],
  controllers: [UserController],
  providers: [UserService, StoreService],
})
export class UserModule {
  configure(consumer: MiddlewareConsumer) {
    // for authorized user account
    consumer.apply(userAuthMiddleware).forRoutes({ path: "users", method: RequestMethod.GET });
  }
}
