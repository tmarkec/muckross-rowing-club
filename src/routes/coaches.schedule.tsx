import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Check, Plus, Trash2, X, Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

type Location = "Boathouse" | "Gym";
type Row = {
  id: string;
  day_of_week: number;
  group_name: string;
  time_text: string;
  location: Location;
  details: string | null;
  sort_order: number;
};

type Draft = Omit<Row, "id"> & { id?: string; tempId?: string };

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export const Route = createFileRoute("/coaches/schedule")({
  head: () => ({
    meta: [
      { title: "Group Training Schedule | Coaches Corner" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SchedulePage,
});

function todayIndex() {
  const d = new Date().getDay();
  return d === 0 ? 7 : d;
}

function SchedulePage() {
  const { loading, session, isAdmin, isCoach } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [newRows, setNewRows] = useState<Draft[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingRows, setLoadingRows] = useState(true);

  useEffect(() => {
    if (!loading && !session) void navigate({ to: "/coaches/login" });
  }, [loading, session, navigate]);

  const load = async () => {
    setLoadingRows(true);
    const { data, error } = await supabase
      .from("training_schedules")
      .select("id, day_of_week, group_name, time_text, location, details, sort_order")
      .order("day_of_week")
      .order("sort_order");
    if (error) toast.error(error.message);
    setRows((data ?? []) as Row[]);
    setLoadingRows(false);
  };

  useEffect(() => {
    if (session) void load();
  }, [session]);

  const grouped = useMemo(() => {
    const map = new Map<number, Row[]>();
    for (let d = 1; d <= 7; d++) map.set(d, []);
    for (const r of rows) map.get(r.day_of_week)?.push(r);
    return map;
  }, [rows]);

  const canEdit = isAdmin;

  const startEdit = () => {
    if (!canEdit) return;
    setEditMode(true);
    const d: Record<string, Draft> = {};
    for (const r of rows) d[r.id] = { ...r };
    setDrafts(d);
  };

  const cancelEdit = () => {
    setEditMode(false);
    setDrafts({});
    setNewRows([]);
  };

  const updateDraft = (id: string, patch: Partial<Draft>) =>
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const updateNew = (tempId: string, patch: Partial<Draft>) =>
    setNewRows((prev) => prev.map((n) => (n.tempId === tempId ? { ...n, ...patch } : n)));

  const addNew = (day: number) =>
    setNewRows((prev) => [
      ...prev,
      {
        tempId: crypto.randomUUID(),
        day_of_week: day,
        group_name: "",
        time_text: "",
        location: "Boathouse",
        details: "",
        sort_order: 0,
      },
    ]);

  const removeRow = async (id: string) => {
    if (!confirm("Delete this session?")) return;
    const { error } = await supabase.from("training_schedules").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setRows((r) => r.filter((x) => x.id !== id));
    setDrafts((d) => {
      const n = { ...d };
      delete n[id];
      return n;
    });
    toast.success("Removed");
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      for (const r of rows) {
        const d = drafts[r.id];
        if (!d) continue;
        if (
          d.day_of_week !== r.day_of_week ||
          d.group_name !== r.group_name ||
          d.time_text !== r.time_text ||
          d.location !== r.location ||
          (d.details ?? "") !== (r.details ?? "")
        ) {
          const { error } = await supabase
            .from("training_schedules")
            .update({
              day_of_week: d.day_of_week,
              group_name: d.group_name.trim(),
              time_text: d.time_text.trim(),
              location: d.location,
              details: d.details?.trim() || null,
            })
            .eq("id", r.id);
          if (error) throw error;
        }
      }
      const toInsert = newRows.filter((n) => n.group_name.trim() || n.time_text.trim());
      for (const n of toInsert) {
        if (!n.group_name.trim() || !n.time_text.trim()) {
          throw new Error(`${DAYS[n.day_of_week - 1]}: each new session needs a group and a time`);
        }
      }
      if (toInsert.length) {
        const counts: Record<number, number> = {};
        const payload = toInsert.map((n) => {
          const base = rows.filter((r) => r.day_of_week === n.day_of_week).length;
          counts[n.day_of_week] = (counts[n.day_of_week] ?? 0) + 1;
          return {
            day_of_week: n.day_of_week,
            group_name: n.group_name.trim(),
            time_text: n.time_text.trim(),
            location: n.location,
            details: n.details?.trim() || null,
            sort_order: base + counts[n.day_of_week],
          };
        });
        const { error } = await supabase.from("training_schedules").insert(payload);
        if (error) throw error;
      }
      toast.success("Schedule saved");
      setEditMode(false);
      setNewRows([]);
      setDrafts({});
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  const editing = canEdit && editMode;

  const renderDay = (day: number) => {
    const items = grouped.get(day) ?? [];
    const pending = newRows.filter((n) => n.day_of_week === day);
    return (
      <div className="space-y-2">
        {items.length === 0 && pending.length === 0 && (
          <p className="text-xs italic text-muted-foreground px-1 py-2">No sessions</p>
        )}
        {items.map((r) =>
          editing ? (
            <EditCard
              key={r.id}
              d={drafts[r.id] ?? r}
              onChange={(p) => updateDraft(r.id, p)}
              onRemove={() => void removeRow(r.id)}
            />
          ) : (
            <ViewCard key={r.id} r={r} />
          ),
        )}
        {editing &&
          pending.map((n) => (
            <EditCard
              key={n.tempId}
              d={n}
              isNew
              onChange={(p) => updateNew(n.tempId!, p)}
              onRemove={() => setNewRows((prev) => prev.filter((x) => x.tempId !== n.tempId))}
            />
          ))}
        {editing && (
          <Button variant="outline" size="sm" className="w-full border-dashed" onClick={() => addNew(day)}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add timeslot
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl">Group Training Schedule</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Weekly sessions for all squads.{!canEdit && " View only."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {canEdit && !editMode && (
              <Button onClick={startEdit} size="sm">
                <Pencil className="h-4 w-4 mr-2" /> Edit schedule
              </Button>
            )}
            {editing && (
              <>
                <Button variant="outline" size="sm" onClick={cancelEdit} disabled={saving}>
                  <X className="h-4 w-4 mr-1" /> Cancel
                </Button>
                <Button size="sm" onClick={saveAll} disabled={saving}>
                  <Check className="h-4 w-4 mr-1" /> {saving ? "Saving…" : "Save"}
                </Button>
              </>
            )}
            <Button asChild size="sm" variant="outline">
              <Link to="/coaches">← Coaches Corner</Link>
            </Button>
          </div>
        </div>

        {!isAdmin && !isCoach && (
          <p className="text-sm text-muted-foreground">You don&apos;t have access to coach tools.</p>
        )}

        {loadingRows ? (
          <p className="py-6 text-center text-muted-foreground">Loading…</p>
        ) : (
          <>
            {/* Desktop: 7-column matrix */}
            <div className="hidden lg:grid grid-cols-7 gap-3">
              {DAYS.map((label, i) => (
                <div
                  key={label}
                  className={cn(
                    "rounded-xl border bg-background p-2 shadow-sm",
                    todayIndex() === i + 1 && "ring-2 ring-primary/40",
                  )}
                >
                  <div className="mb-2 flex items-center justify-between px-1">
                    <span className="text-sm font-semibold">{label}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {(grouped.get(i + 1) ?? []).length}
                    </span>
                  </div>
                  {renderDay(i + 1)}
                </div>
              ))}
            </div>

            {/* Mobile / tablet: full week, stacked by day */}
            <div className="lg:hidden space-y-3">
              {DAYS.map((label, i) => {
                const count = (grouped.get(i + 1) ?? []).length;
                const isToday = todayIndex() === i + 1;
                return (
                  <div
                    key={label}
                    className={cn(
                      "rounded-xl border bg-background p-3 shadow-sm",
                      isToday && "ring-2 ring-primary/40",
                    )}
                  >
                    <div className="mb-2 flex items-center justify-between px-0.5">
                      <h2 className="text-sm font-semibold">
                        {label}
                        {isToday && <span className="ml-2 text-[10px] font-medium uppercase tracking-wide text-primary">Today</span>}
                      </h2>
                      <span className="text-[10px] text-muted-foreground">{count}</span>
                    </div>
                    {renderDay(i + 1)}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ViewCard({ r }: { r: Row }) {
  return (
    <div className="rounded-lg border bg-muted/20 p-2.5">
      <div className="font-medium text-sm leading-tight break-words">{r.group_name}</div>
      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
        <Clock className="h-3 w-3 shrink-0" /> {r.time_text}
      </div>
      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
        <MapPin className="h-3 w-3 shrink-0" /> {r.location}
      </div>
      {r.details && <p className="mt-1.5 text-xs whitespace-pre-wrap break-words">{r.details}</p>}
    </div>
  );
}

function EditCard({
  d,
  onChange,
  onRemove,
  isNew,
}: {
  d: Draft;
  onChange: (p: Partial<Draft>) => void;
  onRemove: () => void;
  isNew?: boolean;
}) {
  return (
    <div className={cn("space-y-1.5 rounded-lg border p-2", isNew ? "bg-primary/5 border-dashed" : "bg-muted/20")}>
      <Input className="h-8 text-xs" placeholder="Squad / group" value={d.group_name} onChange={(e) => onChange({ group_name: e.target.value })} />
      <Input className="h-8 text-xs" placeholder="e.g. 06:30 – 08:00" value={d.time_text} onChange={(e) => onChange({ time_text: e.target.value })} />
      <div className="flex gap-1">
        <Select value={String(d.day_of_week)} onValueChange={(v) => onChange({ day_of_week: Number(v) })}>
          <SelectTrigger className="h-8 text-xs flex-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            {DAYS.map((x, i) => <SelectItem key={x} value={String(i + 1)}>{x}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={d.location} onValueChange={(v) => onChange({ location: v as Location })}>
          <SelectTrigger className="h-8 text-xs flex-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Boathouse">Boathouse</SelectItem>
            <SelectItem value="Gym">Gym</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Textarea rows={2} className="min-h-0 text-xs" placeholder="Session details (optional)" value={d.details ?? ""} onChange={(e) => onChange({ details: e.target.value })} />
      <Button variant="ghost" size="sm" className="h-7 w-full text-destructive" onClick={onRemove}>
        <Trash2 className="h-3.5 w-3.5 mr-1" /> {isNew ? "Discard" : "Delete"}
      </Button>
    </div>
  );
}
