import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Calendar as CalendarIcon, User, X, ChevronLeft, ChevronRight } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { supabase } from "@/integrations/supabase/client";

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content_html: string;
  cover_image_url: string | null;
  author_name: string | null;
  published_at: string;
};
type PostImage = { id: string; url: string; caption: string | null };

async function fetchPost(slug: string) {
  const { data, error } = await supabase
    .from("posts")
    .select("id, slug, title, excerpt, content_html, cover_image_url, author_name, published_at")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw notFound();
  const { data: images } = await supabase
    .from("post_images")
    .select("id, url, caption")
    .eq("post_id", data.id)
    .order("sort_order");
  return { post: data as Post, images: (images ?? []) as PostImage[] };
}

export const Route = createFileRoute("/news/$slug")({
  loader: ({ params }) => fetchPost(params.slug),
  head: ({ loaderData }) => {
    const p = loaderData?.post;
    if (!p) return { meta: [{ title: "Post — Muckross Rowing Club" }] };
    return {
      meta: [
        { title: `${p.title} — Muckross Rowing Club` },
        { name: "description", content: p.excerpt ?? p.title },
        { property: "og:title", content: p.title },
        { property: "og:description", content: p.excerpt ?? p.title },
        ...(p.cover_image_url ? [{ property: "og:image", content: p.cover_image_url }] : []),
      ],
    };
  },
  errorComponent: ({ error }) => (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-sm text-destructive">{error.message}</p>
        <Link to="/news" className="mt-4 inline-block text-sm text-primary hover:underline">← Back to news</Link>
      </div>
    </SiteLayout>
  ),
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="font-serif text-3xl">Post not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">This post doesn't exist or has been unpublished.</p>
        <Link to="/news" className="mt-4 inline-block text-sm text-primary hover:underline">← Back to news</Link>
      </div>
    </SiteLayout>
  ),
  component: PostPage,
});

function PostPage() {
  const { post, images } = Route.useLoaderData();
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    if (lightbox === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") setLightbox((i) => (i === null ? null : (i + 1) % images.length));
      if (e.key === "ArrowLeft") setLightbox((i) => (i === null ? null : (i - 1 + images.length) % images.length));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, images.length]);

  const date = new Date(post.published_at).toLocaleDateString("en-IE", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <SiteLayout>
      <article className="bg-background">
        {post.cover_image_url && (
          <div className="w-full bg-muted">
            <img src={post.cover_image_url} alt="" className="mx-auto max-h-[460px] w-full max-w-5xl object-cover" />
          </div>
        )}

        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          <Link to="/news" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to news
          </Link>

          <h1 className="mt-6 font-serif text-3xl font-bold text-foreground sm:text-4xl">{post.title}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><CalendarIcon className="h-3.5 w-3.5" />{date}</span>
            {post.author_name && <span className="inline-flex items-center gap-1.5"><User className="h-3.5 w-3.5" />{post.author_name}</span>}
          </div>

          {post.excerpt && (
            <p className="mt-6 border-l-4 border-secondary pl-4 text-lg italic text-muted-foreground">{post.excerpt}</p>
          )}

          <div
            className="prose prose-sm sm:prose-base mt-8 max-w-none prose-headings:font-serif prose-a:text-primary"
            dangerouslySetInnerHTML={{ __html: post.content_html }}
          />

          {images.length > 0 && (
            <div className="mt-12">
              <h2 className="font-serif text-2xl font-bold">Gallery</h2>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setLightbox(i)}
                    className="group block overflow-hidden rounded-md border bg-muted"
                  >
                    <img
                      src={img.url}
                      alt={img.caption ?? ""}
                      loading="lazy"
                      className="h-32 w-full object-cover transition-transform group-hover:scale-105 sm:h-40"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      {lightbox !== null && images[lightbox] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            onClick={(e) => { e.stopPropagation(); setLightbox(null); }}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          {images.length > 1 && (
            <>
              <button
                type="button"
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                onClick={(e) => { e.stopPropagation(); setLightbox((lightbox - 1 + images.length) % images.length); }}
                aria-label="Previous"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % images.length); }}
                aria-label="Next"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
          <img
            src={images[lightbox].url}
            alt={images[lightbox].caption ?? ""}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </SiteLayout>
  );
}