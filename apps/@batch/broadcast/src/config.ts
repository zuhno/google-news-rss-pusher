import { createClient } from "@supabase/supabase-js";
import { Database } from "supabase-type";

export const supabaseAnonClient = createClient<Database>(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export const supabaseServiceRoleClient = createClient<Database>(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
