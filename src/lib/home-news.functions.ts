import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { fetchPublishedNews } from "@/lib/published-news";

export const getHomeNews = createServerFn({ method: "GET" }).handler(async () => {
  const url = process.env["SUPABASE_URL"] || import.meta.env.VITE_SUPABASE_URL;
  const key = process.env["SUPABASE_ANON_KEY"] || process.env["SUPABASE_PUBLISHABLE_KEY"] || import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    console.error("[Home news] Public news connection is not configured.");
    return { posts: [], unavailable: true };
  }
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
    const { data, error } = await fetchPublishedNews(client, 2);
    if (error) {
      console.error("[Home news] Published article read failed:", error.code, error.message);
      return { posts: [], unavailable: true };
    }
    const posts = data ?? [];
    const ids = posts.filter((post) => !post.cover_image_url).map((post) => post.id);
    const thumbnails = new Map<string, string>();
    if (ids.length) {
      const { data: images, error: imageError } = await client.from("post_images")
        .select("post_id, url").in("post_id", ids).order("sort_order", { ascending: true });
      if (imageError) console.error("[Home news] Thumbnail read failed:", imageError.code, imageError.message);
      for (const image of images ?? []) {
        if (!thumbnails.has(image.post_id)) thumbnails.set(image.post_id, image.url);
      }
    }
    return { posts: posts.map((post) => ({ ...post, thumbnail: post.cover_image_url || thumbnails.get(post.id) || "/muckross-logo.png" })), unavailable: false };
  } catch {
    console.error("[Home news] Public news request could not be completed.");
    return { posts: [], unavailable: true };
  }
});