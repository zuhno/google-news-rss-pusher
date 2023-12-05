import type { Database } from "supabase-type";

export class BlockchainResponse {
  readonly list: Database["public"]["Tables"]["Feed"]["Row"][];
  readonly hasNext: boolean;
  readonly lastKey?: number;
}
