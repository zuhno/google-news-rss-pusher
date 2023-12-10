import type { Database } from "supabase-type";

export class GetFeedsResponse {
  readonly list: Database["public"]["Tables"]["Feed"]["Row"][];
  readonly hasNext: boolean;
  readonly lastKey?: number;
}
