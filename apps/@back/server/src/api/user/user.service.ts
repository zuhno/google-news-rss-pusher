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

  async getUser(accessToken?: string) {
    const decoded = await this._decoded(accessToken);

    const user = await this.supabaseService
      .getClient()
      .anon.from("User")
      .select("*")
      .eq("id", decoded.id)
      .single();

    if (user.error) throw new HttpException(user.error.message, HttpStatus.NOT_FOUND);

    return { userInfo: user.data };
  }

  async postLogout(accessToken?: string) {
    const decoded = await this._decoded(accessToken);

    const exist = await this.supabaseService
      .getClient()
      .serviceRole.from("UserAuth")
      .select("userId")
      .eq("userId", decoded.id)
      .limit(1)
      .single();

    if (exist.error) throw new HttpException(exist.error.message, HttpStatus.BAD_REQUEST);

    const user = await this.supabaseService
      .getClient()
      .serviceRole.from("UserAuth")
      .delete({ count: "exact" })
      .eq("userId", exist.data.userId);

    if (user.error) throw new HttpException(user.error.message, HttpStatus.BAD_REQUEST);

    return { count: user.count };
  }
}
