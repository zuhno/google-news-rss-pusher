import type { Database } from "supabase-type";

export class ConstantResponse {
  readonly categories: Database["public"]["Tables"]["Category"]["Row"][];
  readonly apps: Record<number, { from: string; authorizeLink: string }[]>;
}
