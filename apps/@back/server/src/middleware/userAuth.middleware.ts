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
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class userAuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(userAuthMiddleware.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly storeService: StoreService
  ) {}

  // delete stored user auth on supabaseDB
  private async _deleteAuth(id: number) {
    const userAuth = await this.supabaseService
      .getClient()
      .serviceRole.from("UserAuth")
      .delete()
      .eq("user_id", id);

    if (userAuth.error) throw new HttpException(userAuth.error.message, HttpStatus.BAD_REQUEST);
  }

  // reissue access token
  private async _reIssue(payload: { id: number; email: string }) {
    const { expiresIn } = this.storeService.getJwtConfig();

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get("GOOGLE_OAUTH_JWT_SECRET"),
      expiresIn: expiresIn.accessToken,
    });

    const refreshPayload = { ...payload, accessToken };
    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      secret: this.configService.get("GOOGLE_OAUTH_JWT_SECRET"),
      expiresIn: expiresIn.refreshToken,
    });

    const userAuth = await this.supabaseService
      .getClient()
      .serviceRole.from("UserAuth")
      .update({ access_token: accessToken, refresh_token: refreshToken })
      .eq("user_id", payload.id);

    if (userAuth.error) throw new HttpException(userAuth.error.message, HttpStatus.BAD_REQUEST);

    this.logger.log(`user_id: ${payload.id}, reissue access token.`);

    return accessToken;
  }

  // check verify access token | refresh token
  private async _verify(token?: string) {
    if (!token) false;

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get("GOOGLE_OAUTH_JWT_SECRET"),
      });

      return payload;
    } catch (error) {
      this.logger.warn(error.message);
      return false;
    }
  }

  private async _decode(token: string) {
    try {
      return this.jwtService.decode(token, { json: true });
    } catch {
      return null;
    }
  }

  async use(req: Request, res: Response, next: NextFunction) {
    const { keys, policies, expiresIn } = this.storeService.getCookieConfig();

    const { [keys.accessToken]: accessToken } = req.cookies;

    // check verify access token
    const accessPayload = await this._verify(accessToken);

    // pass if access token is verified
    if (accessPayload) {
      next();
      return;
    }

    // if access token is unverified, read refreshToken by accessToken and then check verify refresh token
    const userAuth = await this.supabaseService
      .getClient()
      .anon.from("UserAuth")
      .select("refresh_token")
      .eq("access_token", accessToken)
      .single();

    if (userAuth.error) {
      this.logger.log("#userAuth error : " + userAuth.error.message);
      res.clearCookie(keys.accessToken, policies.token);
      res.clearCookie(keys.loggedInUser, policies.loggedInUser);

      throw new UnauthorizedException();
    }

    const refreshToken = userAuth.data.refresh_token;
    const refreshPayload = await this._verify(refreshToken);
    const decoded = await this._decode(refreshToken);
    const notSameAccessToken = decoded?.accessToken !== accessToken;

    // if refresh token is verify failed, delete user auth and return unauthorized code
    if (!refreshPayload || notSameAccessToken) {
      await this._deleteAuth(decoded?.id);

      res.clearCookie(keys.accessToken, policies.token);
      res.clearCookie(keys.loggedInUser, policies.loggedInUser);

      throw new UnauthorizedException();
    }

    // reissue access token if refresh token is verified
    const newAccessToken = await this._reIssue({
      id: refreshPayload.id,
      email: refreshPayload.email,
    });

    // set new access token to cookie
    res.cookie(keys.accessToken, newAccessToken, {
      ...policies.token,
      maxAge: expiresIn.accessToken,
    });

    // pass if all conditions clear
    req.cookies[keys.accessToken] = newAccessToken;
    next();
  }
}
