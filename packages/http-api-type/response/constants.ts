import type { Database } from "supabase-type";

export class ConstantResponse {
  readonly categories: Database["public"]["Tables"]["Category"]["Row"][];
}
