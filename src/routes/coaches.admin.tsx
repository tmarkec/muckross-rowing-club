import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import {
  adminCreateCoach,
  adminDeleteCoach,
  adminListCoaches,
  adminResetCoachPassword,
} from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RiggingEditor } from "@/components/RiggingEditor";
import { InventoryManager } from "@/components/InventoryManager";

export const Route = createFileRoute("/coaches/admin")({
  head: () => ({ meta: [{ title: "Admin — Coaches Corner" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

type Coach = {
  user_id: string;
  email: string | null;
  full_name: string | null;
  roles: string[];
  last_sign_in_at: string | null;
  created_at: string | null;
};
type Group = { id: string; name: string; description: string | null };
type Assignment = { group_id: string; coach_user_id: string };

function AdminPage() {
  const { loading, session, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) void navigate({ to: "/coaches/login" });
    if (!loading && session && !isAdmin) void navigate({ to: "/coaches" });
  }, [loading, session, isAdmin, navigate]);

  if (loading || !session || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="font-serif text-3xl">Admin panel</h1>
            <p className="text-sm text-muted-foreground">Manage coaches, groups and assignments.</p>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link to="/coaches">← Coaches Corner</Link>
          </Button>
        </div>

        <Tabs defaultValue="coaches">
          <TabsList>
            <TabsTrigger value="coaches">Coaches</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="rigging">Rigging</TabsTrigger>
            <TabsTrigger value="boats">Boats & oars</TabsTrigger>
          </TabsList>
          <TabsContent value="coaches"><CoachesTab /></TabsContent>
          <TabsContent value="groups"><GroupsTab /></TabsContent>
          <TabsContent value="posts"><PostsTab /></TabsContent>
          <TabsContent value="rigging"><RiggingEditor /></TabsContent>
          <TabsContent value="boats">
            <div className="mt-6">
              <InventoryManager coachGroupNames={[]} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/* ---------------- Posts ---------------- */

type PostRow = {
  id: string; slug: string; title: string; published: boolean;
  published_at: string; author_name: string | null;
};

function PostsTab() {
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("posts")
      .select("id, slug, title, published, published_at, author_name")
      .order("published_at", { ascending: false });
    if (error) toast.error(error.message);
    setPosts((data ?? []) as PostRow[]);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <div className="mt-6 rounded-lg border bg-background p-6">
      <div className="flex justify-between items-center mb-4 gap-3 flex-wrap">
        <div>
          <h2 className="font-serif text-xl">News posts</h2>
          <p className="text-xs text-muted-foreground mt-1">Write, edit and publish posts shown on the club website.</p>
        </div>
        <Button asChild size="sm">
          <Link to="/coaches/posts">New post / open editor →</Link>
        </Button>
      </div>

      {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : posts.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">No posts yet. Click "New post" to write one.</p>
      ) : (
        <div className="divide-y">
          {posts.map((p) => (
            <div key={p.id} className="py-3 flex items-center justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <div className="font-medium truncate">{p.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5 flex flex-wrap items-center gap-2">
                  <span>{new Date(p.published_at).toLocaleDateString()}</span>
                  {p.author_name && <span>· {p.author_name}</span>}
                  <Badge variant={p.published ? "default" : "secondary"}>{p.published ? "Published" : "Draft"}</Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button asChild size="sm" variant="ghost">
                  <Link to="/news/$slug" params={{ slug: p.slug }} target="_blank">View</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link to="/coaches/posts" search={{ id: p.id }}>Edit</Link>
                </Button>
                <Button size="sm" variant="destructive" onClick={async () => {
                  if (!confirm(`Delete post "${p.title}"?`)) return;
                  const { error } = await supabase.from("posts").delete().eq("id", p.id);
                  if (error) return toast.error(error.message);
                  toast.success("Deleted");
                  void load();
                }}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Coaches ---------------- */

function CoachesTab() {
  const list = useServerFn(adminListCoaches);
  const create = useServerFn(adminCreateCoach);
  const remove = useServerFn(adminDeleteCoach);
  const reset = useServerFn(adminResetCoachPassword);

  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", fullName: "", role: "coach" as "coach" | "admin" });
  const [resetting, setResetting] = useState<string | null>(null);
  const [newPw, setNewPw] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [data, { data: g }, { data: a }] = await Promise.all([
        list(),
        supabase.from("groups").select("id, name, description").order("name"),
        supabase.from("group_coaches").select("group_id, coach_user_id"),
      ]);
      setCoaches(data);
      setGroups(g ?? []);
      setAssignments(a ?? []);
    } catch (e) { toast.error((e as Error).message); }
    setLoading(false);
  }, [list]);

  useEffect(() => { void load(); }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await create({ data: form });
      toast.success("Coach created");
      setForm({ email: "", password: "", fullName: "", role: "coach" });
      setOpen(false);
      void load();
    } catch (e) { toast.error((e as Error).message); }
  };

  const submitReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetting) return;
    try {
      await reset({ data: { userId: resetting, password: newPw } });
      toast.success("Password reset");
      setResetting(null);
      setNewPw("");
    } catch (e) { toast.error((e as Error).message); }
  };

  const toggleAssign = async (groupId: string, userId: string, checked: boolean) => {
    if (checked) {
      const { error } = await supabase.from("group_coaches").insert({ group_id: groupId, coach_user_id: userId });
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("group_coaches").delete().eq("group_id", groupId).eq("coach_user_id", userId);
      if (error) return toast.error(error.message);
    }
    void load();
  };

  return (
    <div className="mt-6 rounded-lg border bg-background p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="font-serif text-xl">Coaches & admins</h2>
          <p className="text-xs text-muted-foreground mt-1">Assign each coach to one or more groups using the “Groups” button.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm">Add coach</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create coach account</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="space-y-3">
              <div><Label>Full name</Label><Input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div>
              <div><Label>Email</Label><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label>Temporary password</Label><Input type="text" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
              <div>
                <Label>Role</Label>
                <select className="w-full border rounded-md h-10 px-3 bg-background" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as "coach" | "admin" })}>
                  <option value="coach">Coach</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <DialogFooter><Button type="submit">Create</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : (
        <div className="divide-y">
          {coaches.length === 0 && <p className="text-sm text-muted-foreground py-4">No accounts yet.</p>}
          {coaches.map((c) => (
            <div key={c.user_id} className="py-3 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="font-medium">{c.full_name || "—"}</div>
                <div className="text-sm text-muted-foreground">{c.email}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Last sign-in:{" "}
                  {c.last_sign_in_at
                    ? new Date(c.last_sign_in_at).toLocaleString()
                    : "never"}
                </div>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {c.roles.map((r) => <Badge key={r} variant="secondary">{r}</Badge>)}
                  {assignments
                    .filter((a) => a.coach_user_id === c.user_id)
                    .map((a) => {
                      const g = groups.find((gg) => gg.id === a.group_id);
                      return g ? <Badge key={a.group_id} variant="outline">{g.name}</Badge> : null;
                    })}
                </div>
              </div>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button size="sm" variant="outline">Groups</Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64">
                    <div className="font-medium text-sm mb-2">Assign to groups</div>
                    {groups.length === 0 ? (
                      <p className="text-xs text-muted-foreground">Create groups first.</p>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-auto">
                        {groups.map((g) => {
                          const assigned = assignments.some((a) => a.group_id === g.id && a.coach_user_id === c.user_id);
                          return (
                            <label key={g.id} className="flex items-center gap-2 text-sm cursor-pointer">
                              <Checkbox checked={assigned} onCheckedChange={(v) => toggleAssign(g.id, c.user_id, !!v)} />
                              <span>{g.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
                <Button size="sm" variant="outline" onClick={() => { setResetting(c.user_id); setNewPw(""); }}>Reset password</Button>
                <Button size="sm" variant="destructive" onClick={async () => {
                  if (!confirm(`Delete ${c.email}?`)) return;
                  try { await remove({ data: { userId: c.user_id } }); toast.success("Deleted"); void load(); }
                  catch (e) { toast.error((e as Error).message); }
                }}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!resetting} onOpenChange={(v) => !v && setResetting(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reset password</DialogTitle></DialogHeader>
          <form onSubmit={submitReset} className="space-y-3">
            <div><Label>New password</Label><Input type="text" required minLength={8} value={newPw} onChange={(e) => setNewPw(e.target.value)} /></div>
            <DialogFooter><Button type="submit">Update</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------------- Groups ---------------- */

function GroupsTab() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Group | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });

  const load = useCallback(async () => {
    const { data } = await supabase.from("groups").select("id, name, description").order("name");
    setGroups(data ?? []);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const startCreate = () => { setEditing(null); setForm({ name: "", description: "" }); setOpen(true); };
  const startEdit = (g: Group) => { setEditing(g); setForm({ name: g.name, description: g.description ?? "" }); setOpen(true); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      const { error } = await supabase.from("groups").update({ name: form.name, description: form.description || null }).eq("id", editing.id);
      if (error) return toast.error(error.message);
      toast.success("Group updated");
    } else {
      const { error } = await supabase.from("groups").insert({ name: form.name, description: form.description || null });
      if (error) return toast.error(error.message);
      toast.success("Group created");
    }
    setOpen(false);
    void load();
  };

  return (
    <div className="mt-6 rounded-lg border bg-background p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-serif text-xl">Groups</h2>
        <Button size="sm" onClick={startCreate}>Add group</Button>
      </div>

      <div className="divide-y">
        {groups.length === 0 && <p className="text-sm text-muted-foreground py-4">No groups yet.</p>}
        {groups.map((g) => (
          <div key={g.id} className="py-3 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="font-medium">{g.name}</div>
              {g.description && <div className="text-sm text-muted-foreground">{g.description}</div>}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => startEdit(g)}>Edit</Button>
              <Button size="sm" variant="destructive" onClick={async () => {
                if (!confirm(`Delete group "${g.name}"? Athletes & attendance will be deleted too.`)) return;
                const { error } = await supabase.from("groups").delete().eq("id", g.id);
                if (error) return toast.error(error.message);
                toast.success("Deleted");
                void load();
              }}>Delete</Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit group" : "New group"}</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <div><Label>Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Description (optional)</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <DialogFooter><Button type="submit">{editing ? "Save" : "Create"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* Assignments are managed inline within CoachesTab. */