import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as cookieParser from "cookie-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: JSON.parse(decodeURIComponent(process.env.ALLOW_ACCESS_ORIGIN)),
    credentials: true,
  });
  app.use(cookieParser());

  await app.listen(8080);
}

bootstrap();
