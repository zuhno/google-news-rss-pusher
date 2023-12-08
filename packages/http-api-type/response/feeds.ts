import type { Database } from "supabase-type";

export class FeedsResponse {
  readonly list: Database["public"]["Tables"]["Feed"]["Row"][];
  readonly hasNext: boolean;
  readonly lastKey?: number;
}
