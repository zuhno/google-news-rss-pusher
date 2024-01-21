import { SupabaseService } from "@/common/supabase/supabase.service";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class UserService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly jwtService: JwtService
  ) {}

  async getUser(accessToken?: string) {
    const decoded = await this.jwtService.decode(accessToken, { json: true });

    const user = await this.supabaseService
      .getClient()
      .anon.from("User")
      .select("*")
      .eq("id", decoded.id)
      .single();

    if (user.error) throw new HttpException(user.error.message, HttpStatus.NOT_FOUND);

    return { userInfo: user.data };
  }
}
