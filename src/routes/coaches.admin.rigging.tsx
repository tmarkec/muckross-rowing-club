import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/coaches/admin/rigging")({
  head: () => ({ meta: [{ title: "Rigging editor — Admin" }, { name: "robots", content: "noindex" }] }),
  component: RiggingAdminPage,
});

type Row = {
  id: string;
  category_key: string;
  category_label: string;
  section: "sculling" | "sweep";
  boat: string;
  oar_range: string;
  inboard_range: string;
  span_or_spread_range: string;
  sort_order: number;
};

const emptyForm = {
  category_key: "",
  category_label: "",
  section: "sculling" as "sculling" | "sweep",
  boat: "",
  oar_range: "",
  inboard_range: "",
  span_or_spread_range: "",
  sort_order: 0,
};

function RiggingAdminPage() {
  const { loading, session, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (!loading && !session) void navigate({ to: "/coaches/login" });
    if (!loading && session && !isAdmin) void navigate({ to: "/coaches" });
  }, [loading, session, isAdmin, navigate]);

  const load = useCallback(async () => {
    setBusy(true);
    const { data, error } = await supabase
      .from("rigging_measurements")
      .select("*")
      .order("category_label").order("section").order("sort_order");
    if (error) toast.error(error.message);
    setRows((data ?? []) as Row[]);
    setBusy(false);
  }, []);

  useEffect(() => { if (session && isAdmin) void load(); }, [load, session, isAdmin]);

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    rows.forEach((r) => map.set(r.category_key, r.category_label));
    return Array.from(map.entries()).map(([key, label]) => ({ key, label }));
  }, [rows]);

  const visible = filter === "all" ? rows : rows.filter((r) => r.category_key === filter);

  const startCreate = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const startEdit = (r: Row) => {
    setEditing(r);
    setForm({
      category_key: r.category_key,
      category_label: r.category_label,
      section: r.section,
      boat: r.boat,
      oar_range: r.oar_range,
      inboard_range: r.inboard_range,
      span_or_spread_range: r.span_or_spread_range,
      sort_order: r.sort_order,
    });
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form };
    if (editing) {
      const { error } = await supabase.from("rigging_measurements").update(payload).eq("id", editing.id);
      if (error) return toast.error(error.message);
      toast.success("Updated");
    } else {
      const { error } = await supabase.from("rigging_measurements").insert(payload);
      if (error) return toast.error(error.message);
      toast.success("Added");
    }
    setOpen(false);
    void load();
  };

  const remove = async (r: Row) => {
    if (!confirm(`Delete ${r.boat} (${r.category_label})?`)) return;
    const { error } = await supabase.from("rigging_measurements").delete().eq("id", r.id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    void load();
  };

  if (loading || !session || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="font-serif text-3xl">Rigging editor</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Edit the club rigging ranges shown to coaches. Changes are live immediately.
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline">
              <Link to="/coaches/rigging">View as coach →</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/coaches/admin">← Admin</Link>
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-background p-6">
          <div className="flex items-end justify-between gap-3 flex-wrap mb-4">
            <div className="min-w-[260px]">
              <Label className="text-xs">Filter by category</Label>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button size="sm" onClick={startCreate}>Add row</Button>
          </div>

          {busy ? <p className="text-sm text-muted-foreground">Loading…</p> : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="p-2">Category</th>
                    <th className="p-2">Section</th>
                    <th className="p-2">Boat</th>
                    <th className="p-2">Oar (cm)</th>
                    <th className="p-2">Inboard (cm)</th>
                    <th className="p-2">Span/Spread (cm)</th>
                    <th className="p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {visible.length === 0 && <tr><td colSpan={7} className="text-center text-muted-foreground py-6">No rows.</td></tr>}
                  {visible.map((r) => (
                    <tr key={r.id} className="border-b">
                      <td className="p-2 text-xs text-muted-foreground">{r.category_label}</td>
                      <td className="p-2 capitalize">{r.section}</td>
                      <td className="p-2 font-medium">{r.boat}</td>
                      <td className="p-2 tabular-nums">{r.oar_range}</td>
                      <td className="p-2 tabular-nums">{r.inboard_range}</td>
                      <td className="p-2 tabular-nums">{r.span_or_spread_range}</td>
                      <td className="p-2 text-right whitespace-nowrap">
                        <Button size="sm" variant="outline" onClick={() => startEdit(r)}>Edit</Button>{" "}
                        <Button size="sm" variant="destructive" onClick={() => remove(r)}>Delete</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editing ? "Edit rigging row" : "Add rigging row"}</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Category key</Label>
                  <Input required placeholder="j17_18_m" value={form.category_key} onChange={(e) => setForm({ ...form, category_key: e.target.value })} />
                </div>
                <div>
                  <Label>Section</Label>
                  <select className="w-full border rounded-md h-10 px-3 bg-background" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value as "sculling" | "sweep" })}>
                    <option value="sculling">Sculling</option>
                    <option value="sweep">Sweep</option>
                  </select>
                </div>
              </div>
              <div>
                <Label>Category label (shown to coaches)</Label>
                <Input required placeholder="J17 & J18 Male" value={form.category_label} onChange={(e) => setForm({ ...form, category_label: e.target.value })} />
              </div>
              <div>
                <Label>Boat</Label>
                <Input required placeholder="Single Scull (1x)" value={form.boat} onChange={(e) => setForm({ ...form, boat: e.target.value })} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Oar range</Label><Input required placeholder="286 – 288" value={form.oar_range} onChange={(e) => setForm({ ...form, oar_range: e.target.value })} /></div>
                <div><Label>Inboard</Label><Input required placeholder="87 – 89" value={form.inboard_range} onChange={(e) => setForm({ ...form, inboard_range: e.target.value })} /></div>
                <div><Label>Span/Spread</Label><Input required placeholder="158 – 160" value={form.span_or_spread_range} onChange={(e) => setForm({ ...form, span_or_spread_range: e.target.value })} /></div>
              </div>
              <div>
                <Label>Sort order</Label>
                <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value, 10) || 0 })} />
              </div>
              <DialogFooter><Button type="submit">{editing ? "Save" : "Add"}</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}