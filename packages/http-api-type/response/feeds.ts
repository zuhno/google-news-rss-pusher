import type { Database } from "supabase-type";

export class GetFeedsResponse {
  readonly list: ({ view: number } & Database["public"]["Tables"]["Feed"]["Row"])[];
  readonly hasNext: boolean;
  readonly lastKey?: string;
}

export class GetFeedsLimitedAllResponse {
  readonly [categoryId: number]: ({ view: number } & Database["public"]["Tables"]["Feed"]["Row"])[];
}
