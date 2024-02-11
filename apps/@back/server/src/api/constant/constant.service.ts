import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";

import { ConstantsResponseDto } from "./dto/constants_response";
import { SupabaseService } from "@/common/supabase/supabase.service";
import { Database } from "supabase-type";

@Injectable()
export class ConstantService {
  private readonly logger = new Logger(ConstantService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async getConstant(): Promise<ConstantsResponseDto> {
    const [categories, apps] = await Promise.all([
      this.supabaseService.getClient().anon.from("Category").select("*"),
      this.supabaseService.getClient().anon.from("App").select("authorize_link, from"),
    ]);

    if (categories.error || apps.error)
      throw new HttpException(
        categories.error.message || apps.error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );

    const remapApps = categories.data.reduce((acc, cnt: any) => {
      return {
        ...acc,
        [cnt.id]: apps.data.map((app) => ({ from: app.from, authorizeLink: app.authorize_link })),
      };
    }, {});

    return {
      categories: categories.data as Database["public"]["Tables"]["Category"]["Row"][],
      apps: remapApps,
    };
  }
}
