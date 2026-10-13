import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export function fetchPublishedNews(client: SupabaseClient<Database>, limit: number) {
  return client.from("posts")
    .select("id, slug, title, excerpt, cover_image_url, author_name, published_at, created_at")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .order("id", { ascending: true })
    .limit(limit);
}