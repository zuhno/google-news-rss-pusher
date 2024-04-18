import { SupabaseService } from "@/common/supabase/supabase.service";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class UserService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly jwtService: JwtService
  ) {}

  async _decoded(token: string) {
    return this.jwtService.decode(token, { json: true });
  }

  async postLogout(accessToken?: string) {
    const decoded = await this._decoded(accessToken);

    const user = await this.supabaseService
      .getClient()
      .serviceRole.from("UserAuth")
      .delete({ count: "exact" })
      .eq("user_id", decoded.id);

    if (user.error) throw new HttpException(user.error.message, HttpStatus.BAD_REQUEST);

    return { count: user.count };
  }
}
