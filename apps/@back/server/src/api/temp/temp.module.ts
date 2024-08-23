import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";

import { SupabaseModule } from "@/common/supabase/supabase.module";
import { BotFilterMiddleware } from "@/middleware/botFilter.middleware";
import { TempService } from "./temp.service";
import { TempController } from "./temp.controller";

@Module({
  imports: [SupabaseModule],
  controllers: [TempController],
  providers: [TempService],
})
export class TempModule {
  configure(consumer: MiddlewareConsumer) {
    // for filtered bot client
    consumer
      .apply(BotFilterMiddleware)
      .forRoutes({ path: "temp/news/:id", method: RequestMethod.GET });
  }
}
