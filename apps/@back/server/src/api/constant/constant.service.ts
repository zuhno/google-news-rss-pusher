import { HttpException, HttpStatus, Injectable } from "@nestjs/common";

import { ConstantsResponseDto } from "./dto/constants_response";
import { SupabaseService } from "@/common/supabase/supabase.service";
import { StoreService } from "@/common/store/store.service";
import { Database } from "supabase-type";

@Injectable()
export class ConstantService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly storeService: StoreService
  ) {}

  async getConstant(): Promise<ConstantsResponseDto> {
    const queries = [
      this.supabaseService.getClient().anon.from("Category").select("*"),
      this.supabaseService.getClient().anon.from("App").select("authorize_link, from, category_id"),
    ];

    const [categories, apps] = await Promise.all(queries);

    if (categories.error)
      throw new HttpException(categories.error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    if (apps.error) throw new HttpException(apps.error.message, HttpStatus.INTERNAL_SERVER_ERROR);

    await this.storeService.setLastFeed(
      categories.data as Database["public"]["Tables"]["Category"]["Row"][]
    );
    this.storeService.setCategoryIds(
      (categories.data as Database["public"]["Tables"]["Category"]["Row"][]).map(
        (category) => category.id
      )
    );

    const remapApps = apps.data.reduce((acc, cnt: any) => {
      return {
        ...acc,
        [cnt.category_id]: [
          ...(acc[cnt.category_id] || []),
          {
            from: cnt.from,
            authorizeLink: cnt.authorize_link,
          },
        ],
      };
    }, {});

    return {
      categories: categories.data as Database["public"]["Tables"]["Category"]["Row"][],
      apps: remapApps,
    };
  }
}
