import { Database } from "supabase-type";

export class GetUserResponse {
  readonly email: Database["public"]["Tables"]["User"]["Row"]["email"];
  readonly nickName: Database["public"]["Tables"]["User"]["Row"]["nick_name"];
  readonly avatarUrl: Database["public"]["Tables"]["User"]["Row"]["avatar_url"];
}
