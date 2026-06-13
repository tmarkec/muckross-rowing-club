import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const serverEnv = typeof process !== "undefined" ? process.env : undefined;

const supabaseUrl = serverEnv?.SUPABASE_URL ?? import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey =
  serverEnv?.SUPABASE_ANON_KEY ??
  serverEnv?.SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing backend configuration. Set SUPABASE_URL and SUPABASE_ANON_KEY (or their VITE_ equivalents).",
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: typeof window !== "undefined" ? localStorage : undefined,
    persistSession: typeof window !== "undefined",
    autoRefreshToken: typeof window !== "undefined",
  },
});
