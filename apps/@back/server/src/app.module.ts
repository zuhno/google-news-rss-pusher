import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { RouterModule } from "@nestjs/core";
import { OAuth2Module } from "./api/oauth2/oauth2.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env",
    }),
    OAuth2Module,
    RouterModule.register([
      {
        path: "oauth2",
        module: OAuth2Module,
      },
    ]),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
