import { ForbiddenException, Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class BotFilterMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const userAgent = req.headers["user-agent"] || "";

    const botKeywords = [
      "bot",
      "crawl",
      "spider",
      "slurp",
      "googlebot",
      "bingbot",
      "yahoo",
      "baiduspider",
      "duckduckbot",
      "yandexbot",
      "sogou",
      "exabot",
      "facebot",
      "ia_archiver",
      "pinterest",
      "linkedinbot",
      "telegrambot",
      "slackbot",
      "whatsapp",
      "twitterbot",
      "discordbot",
      "applebot",
      "semrushbot",
      "mj12bot",
      "ahrefsbot",
      "dotbot",
      "seznambot",
      "uptimerobot",
      "petalbot",
      "yeti",
      "heritrix",
      "archive.org_bot",
      "axios",
      "googleother",
    ];

    const isBot = botKeywords.some((keyword) => userAgent.toLowerCase().includes(keyword));

    if (isBot) throw new ForbiddenException();

    next();
  }
}
