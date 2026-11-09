import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { CalendarEventRow } from "@/lib/fixtures";

/** Public read of the club calendar for the first render of the homepage. */
export const getCalendarEvents = createServerFn({ method: "GET" }).handler(async (): Promise<CalendarEventRow[]> => {
  const url = process.env["SUPABASE_URL"] || import.meta.env.VITE_SUPABASE_URL;
  const key = process.env["SUPABASE_ANON_KEY"] || process.env["SUPABASE_PUBLISHABLE_KEY"] || import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return [];
  try {
    const client = createClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      } },
    });
    const { data, error } = await client.from("calendar_events")
      .select("id, name, location, tag, start_date, end_date, url").order("start_date");
    if (error) {
      console.error("[Calendar] read failed:", error.code, error.message);
      return [];
    }
    return data ?? [];
  } catch {
    console.error("[Calendar] request could not be completed.");
    return [];
  }
});
