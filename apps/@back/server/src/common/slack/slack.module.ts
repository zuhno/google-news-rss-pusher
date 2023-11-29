import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ConfigModule } from "@nestjs/config";
import { SlackService } from "./slack.service";

@Module({
  imports: [ConfigModule, HttpModule],
  providers: [SlackService],
  exports: [SlackService],
})
export class SlackModule {}
