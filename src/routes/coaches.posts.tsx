import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/RichTextEditor";
import { X, Upload, Loader2 } from "lucide-react";

export const Route = createFileRoute("/coaches/posts")({
  head: () => ({ meta: [{ title: "Posts — Admin" }, { name: "robots", content: "noindex" }] }),
  validateSearch: (search: Record<string, unknown>) => ({
    id: typeof search.id === "string" ? search.id : undefined,
  }),
  component: PostsAdminPage,
});

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content_html: string;
  cover_image_url: string | null;
  author_name: string | null;
  published: boolean;
  published_at: string;
};

type PostImage = { id: string; url: string; caption: string | null; sort_order: number };

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function PostsAdminPage() {
  const { loading, session, isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const { id } = Route.useSearch();

  useEffect(() => {
    if (!loading && !session) void navigate({ to: "/coaches/login" });
    if (!loading && session && !isAdmin) void navigate({ to: "/coaches" });
  }, [loading, session, isAdmin, navigate]);

  const [editing, setEditing] = useState<Post | null>(null);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    if (!id) { setEditing(null); return; }
    setFetching(true);
    void supabase
      .from("posts")
      .select("id, slug, title, excerpt, content_html, cover_image_url, author_name, published, published_at")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (error) toast.error(error.message);
        setEditing((data ?? null) as Post | null);
        setFetching(false);
      });
  }, [isAdmin, id]);

  if (loading || !session || !isAdmin || fetching) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  }

  return (
    <PostEditor
      key={editing?.id ?? "new"}
      post={editing}
      defaultAuthor={user?.user_metadata?.full_name || user?.email || ""}
      onClose={() => navigate({ to: "/coaches/admin" })}
    />
  );
}

/* ---------------- Editor ---------------- */

function PostEditor({
  post,
  defaultAuthor,
  onClose,
}: {
  post: Post | null;
  defaultAuthor: string;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content_html ?? "");
  const [authorName, setAuthorName] = useState(post?.author_name ?? defaultAuthor);
  const [published, setPublished] = useState(post?.published ?? true);
  const [publishedAt, setPublishedAt] = useState<string>(
    (post?.published_at ?? new Date().toISOString()).slice(0, 10),
  );
  const originalPublishedAt = (post?.published_at ?? "").slice(0, 10);
  const [coverUrl, setCoverUrl] = useState<string | null>(post?.cover_image_url ?? null);
  const [images, setImages] = useState<PostImage[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Auto-derive slug from title when creating a new post and slug is empty
  useEffect(() => {
    if (!post && !slug && title) setSlug(slugify(title));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  useEffect(() => {
    if (!post) return;
    void supabase
      .from("post_images")
      .select("id, url, caption, sort_order")
      .eq("post_id", post.id)
      .order("sort_order")
      .then(({ data }) => setImages((data ?? []) as PostImage[]));
  }, [post]);

  const uploadFile = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("post-images").upload(path, file, {
      cacheControl: "31536000",
      upsert: false,
    });
    if (error) { toast.error(error.message); return null; }
    const { data: pub } = supabase.storage.from("post-images").getPublicUrl(path);
    return pub.publicUrl;
  };

  const handleCoverUpload = async (file: File) => {
    setUploading(true);
    const url = await uploadFile(file);
    setUploading(false);
    if (url) setCoverUrl(url);
  };

  const handleGalleryUpload = async (files: FileList) => {
    setUploading(true);
    const uploaded: PostImage[] = [];
    let order = images.length;
    for (const f of Array.from(files)) {
      const url = await uploadFile(f);
      if (url) uploaded.push({ id: `tmp-${crypto.randomUUID()}`, url, caption: null, sort_order: order++ });
    }
    setImages([...images, ...uploaded]);
    setUploading(false);
  };

  const removeImage = (id: string) => setImages(images.filter((i) => i.id !== id));

  const save = async () => {
    if (!title.trim()) return toast.error("Title is required");
    if (!slug.trim()) return toast.error("Slug is required");
    setSaving(true);
    try {
      const payload: {
        title: string;
        slug: string;
        excerpt: string | null;
        content_html: string;
        cover_image_url: string | null;
        author_name: string | null;
        published: boolean;
        published_at?: string;
      } = {
        title: title.trim(),
        slug: slugify(slug),
        excerpt: excerpt.trim() || null,
        content_html: content,
        cover_image_url: coverUrl,
        author_name: authorName.trim() || null,
        published,
      };
      // Only write published_at on create, or on edit when the user actually changed it
      if (!post || publishedAt !== originalPublishedAt) {
        payload.published_at = new Date(publishedAt).toISOString();
      }

      let postId = post?.id;
      if (post) {
        const { error } = await supabase.from("posts").update(payload).eq("id", post.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("posts").insert(payload).select("id").single();
        if (error) throw error;
        postId = data.id;
      }

      if (postId) {
        // Replace gallery images: simplest approach — delete all then re-insert
        await supabase.from("post_images").delete().eq("post_id", postId);
        if (images.length > 0) {
          const rows = images.map((img, idx) => ({
            post_id: postId!,
            url: img.url,
            caption: img.caption,
            sort_order: idx,
          }));
          const { error } = await supabase.from("post_images").insert(rows);
          if (error) throw error;
        }
      }

      toast.success(post ? "Post updated" : "Post created");
      onClose();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h1 className="font-serif text-3xl">{post ? "Edit post" : "New post"}</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button size="sm" onClick={save} disabled={saving}>
              {saving && <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />}
              {post ? "Save changes" : "Create post"}
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-background p-6 space-y-4">
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} placeholder="Crew wins at Cork Regatta" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>URL slug</Label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} maxLength={80} placeholder="crew-wins-cork-regatta" />
              <p className="text-xs text-muted-foreground mt-1">/news/{slug || "your-slug"}</p>
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Author</Label>
              <Input value={authorName} onChange={(e) => setAuthorName(e.target.value)} maxLength={120} />
            </div>
            <div className="flex items-end gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
                Published (visible on /news)
              </label>
            </div>
          </div>
          <div>
            <Label>Short excerpt (optional)</Label>
            <Textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} maxLength={300} rows={2} placeholder="One-sentence summary shown on the news listing." />
          </div>
        </div>

        <div className="rounded-lg border bg-background p-6 space-y-3">
          <Label>Cover image</Label>
          {coverUrl ? (
            <div className="relative inline-block">
              <img src={coverUrl} alt="Cover" className="max-h-48 rounded-md border" />
              <button
                type="button"
                onClick={() => setCoverUrl(null)}
                className="absolute -top-2 -right-2 rounded-full bg-destructive text-destructive-foreground p-1"
                aria-label="Remove cover image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <label className="inline-flex items-center gap-2 cursor-pointer rounded-md border border-dashed border-input px-4 py-3 text-sm text-muted-foreground hover:bg-muted">
              <Upload className="h-4 w-4" />
              {uploading ? "Uploading…" : "Choose cover image"}
              <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => {
                const f = e.target.files?.[0]; if (f) void handleCoverUpload(f); e.target.value = "";
              }} />
            </label>
          )}
        </div>

        <div className="rounded-lg border bg-background p-6 space-y-3">
          <Label>Content</Label>
          <RichTextEditor value={content} onChange={setContent} placeholder="Write the post…" />
        </div>

        <div className="rounded-lg border bg-background p-6 space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <Label className="m-0">Gallery ({images.length})</Label>
            <label className="inline-flex items-center gap-2 cursor-pointer rounded-md border border-input px-3 py-1.5 text-sm hover:bg-muted">
              <Upload className="h-4 w-4" />
              {uploading ? "Uploading…" : "Add images"}
              <input type="file" accept="image/*" multiple className="hidden" disabled={uploading} onChange={(e) => {
                if (e.target.files) void handleGalleryUpload(e.target.files); e.target.value = "";
              }} />
            </label>
          </div>
          {images.length === 0 ? (
            <p className="text-sm text-muted-foreground">No gallery images. Add up to 15 per post.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {images.map((img) => (
                <div key={img.id} className="relative group">
                  <img src={img.url} alt={img.caption ?? ""} className="w-full h-32 object-cover rounded-md border" />
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    className="absolute top-1 right-1 rounded-full bg-destructive text-destructive-foreground p-1 opacity-80 hover:opacity-100"
                    aria-label="Remove image"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}