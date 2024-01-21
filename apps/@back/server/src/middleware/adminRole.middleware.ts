import { StoreService } from "@/common/store/store.service";
import { SupabaseService } from "@/common/supabase/supabase.service";
import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NestMiddleware,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class adminRoleMiddleware implements NestMiddleware {
  private readonly logger = new Logger(adminRoleMiddleware.name);

  constructor(
    private readonly storeService: StoreService,
    private readonly jwtService: JwtService,
    private readonly supabaseService: SupabaseService
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const { keys } = this.storeService.getCookieConfig();
    const accessToken = req.cookies[keys.accessToken];

    let payload: { id: number; email: string };
    try {
      payload = await this.jwtService.verifyAsync(accessToken);
    } catch (error) {
      this.logger.error(error.message);
      throw new UnauthorizedException();
    }

    const userRole = await this.supabaseService
      .getClient()
      .anon.from("UserRole")
      .select("role")
      .eq("user_id", payload.id)
      .single();

    if (userRole.error) throw new HttpException(userRole.error.message, HttpStatus.NOT_FOUND);

    if (userRole.data.role !== "ADMIN") throw new UnauthorizedException();

    next();
  }
}
