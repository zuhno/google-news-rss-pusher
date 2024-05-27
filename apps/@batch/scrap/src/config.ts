import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "supabase-type";

export const xml2json = new XMLParser();

export const supabaseAnonClient = createClient<Database>(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
export const supabaseServiceRoleClient = createClient<Database>(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const axiosInstance = axios.create({
  headers: {
    "Content-Type": "text/html",
  },
});
