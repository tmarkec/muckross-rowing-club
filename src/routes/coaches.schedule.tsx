import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Pencil, Check, Plus, Trash2, X } from "lucide-react";

type Location = "Boathouse" | "Gym";
type Row = {
  id: string;
  day_of_week: number;
  group_name: string;
  time_text: string;
  location: Location;
  sort_order: number;
};

type Draft = Omit<Row, "id"> & { id?: string };

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const Route = createFileRoute("/coaches/schedule")({
  head: () => ({
    meta: [
      { title: "Group Training Schedule — Coaches Corner" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SchedulePage,
});

function SchedulePage() {
  const { loading, session, isAdmin, isCoach } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [newRow, setNewRow] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingRows, setLoadingRows] = useState(true);

  useEffect(() => {
    if (!loading && !session) void navigate({ to: "/coaches/login" });
  }, [loading, session, navigate]);

  const load = async () => {
    setLoadingRows(true);
    const { data, error } = await supabase
      .from("training_schedules")
      .select("id, day_of_week, group_name, time_text, location, sort_order")
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

  const startEdit = () => {
    setEditMode(true);
    const d: Record<string, Draft> = {};
    for (const r of rows) d[r.id] = { ...r };
    setDrafts(d);
  };

  const cancelEdit = () => {
    setEditMode(false);
    setDrafts({});
    setNewRow(null);
  };

  const updateDraft = (id: string, patch: Partial<Draft>) =>
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

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
      // Update changed rows
      for (const r of rows) {
        const d = drafts[r.id];
        if (!d) continue;
        if (
          d.day_of_week !== r.day_of_week ||
          d.group_name !== r.group_name ||
          d.time_text !== r.time_text ||
          d.location !== r.location
        ) {
          const { error } = await supabase
            .from("training_schedules")
            .update({
              day_of_week: d.day_of_week,
              group_name: d.group_name.trim(),
              time_text: d.time_text.trim(),
              location: d.location,
            })
            .eq("id", r.id);
          if (error) throw error;
        }
      }
      // Insert new row if present
      if (newRow) {
        if (!newRow.group_name.trim() || !newRow.time_text.trim()) {
          throw new Error("New row needs a group name and time");
        }
        const { error } = await supabase.from("training_schedules").insert({
          day_of_week: newRow.day_of_week,
          group_name: newRow.group_name.trim(),
          time_text: newRow.time_text.trim(),
          location: newRow.location,
          sort_order: rows.filter((r) => r.day_of_week === newRow.day_of_week).length,
        });
        if (error) throw error;
      }
      toast.success("Schedule saved");
      setEditMode(false);
      setNewRow(null);
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

  const canEdit = isAdmin;

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <Link
              to="/coaches"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Coaches Corner
            </Link>
            <h1 className="mt-2 font-serif text-2xl sm:text-3xl">
              Group Training Schedule
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Weekly sessions for all squads.
            </p>
          </div>
          {canEdit && !editMode && (
            <Button onClick={startEdit} size="sm">
              <Pencil className="h-4 w-4 mr-2" /> Edit schedule
            </Button>
          )}
          {canEdit && editMode && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={cancelEdit} disabled={saving}>
                <X className="h-4 w-4 mr-1" /> Cancel
              </Button>
              <Button size="sm" onClick={saveAll} disabled={saving}>
                <Check className="h-4 w-4 mr-1" /> {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          )}
        </div>

        {!isAdmin && !isCoach && (
          <p className="text-sm text-muted-foreground">
            You don&apos;t have access to coach tools.
          </p>
        )}

        <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 w-32">Day</th>
                <th className="px-4 py-3">Squad / Group</th>
                <th className="px-4 py-3 w-40">Time</th>
                <th className="px-4 py-3 w-40">Location</th>
                {editMode && <th className="px-4 py-3 w-12" />}
              </tr>
            </thead>
            <tbody>
              {loadingRows && (
                <tr>
                  <td colSpan={editMode ? 5 : 4} className="px-4 py-6 text-center text-muted-foreground">
                    Loading…
                  </td>
                </tr>
              )}
              {!loadingRows &&
                DAYS.map((dayLabel, idx) => {
                  const day = idx + 1;
                  const items = grouped.get(day) ?? [];
                  if (items.length === 0) {
                    return (
                      <tr key={day} className="border-t">
                        <td className="px-4 py-3 font-medium align-top">{dayLabel}</td>
                        <td className="px-4 py-3 text-muted-foreground italic" colSpan={editMode ? 4 : 3}>
                          No sessions
                        </td>
                      </tr>
                    );
                  }
                  return items.map((r, i) => {
                    const d = drafts[r.id] ?? r;
                    return (
                      <tr key={r.id} className="border-t">
                        <td className="px-4 py-3 font-medium align-top">
                          {i === 0 ? dayLabel : ""}
                        </td>
                        <td className="px-4 py-3">
                          {editMode ? (
                            <Input
                              value={d.group_name}
                              onChange={(e) => updateDraft(r.id, { group_name: e.target.value })}
                            />
                          ) : (
                            r.group_name
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {editMode ? (
                            <Input
                              value={d.time_text}
                              placeholder="e.g. 06:30 – 08:00"
                              onChange={(e) => updateDraft(r.id, { time_text: e.target.value })}
                            />
                          ) : (
                            r.time_text
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {editMode ? (
                            <Select
                              value={d.location}
                              onValueChange={(v) => updateDraft(r.id, { location: v as Location })}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Boathouse">Boathouse</SelectItem>
                                <SelectItem value="Gym">Gym</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-secondary/30 px-2.5 py-0.5 text-xs font-medium">
                              {r.location}
                            </span>
                          )}
                        </td>
                        {editMode && (
                          <td className="px-4 py-3 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeRow(r.id)}
                              aria-label="Delete row"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </td>
                        )}
                      </tr>
                    );
                  });
                })}
              {editMode && newRow && (
                <tr className="border-t bg-muted/30">
                  <td className="px-4 py-3">
                    <Select
                      value={String(newRow.day_of_week)}
                      onValueChange={(v) => setNewRow({ ...newRow, day_of_week: Number(v) })}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS.map((d, i) => (
                          <SelectItem key={d} value={String(i + 1)}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      value={newRow.group_name}
                      placeholder="Squad / group"
                      onChange={(e) => setNewRow({ ...newRow, group_name: e.target.value })}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      value={newRow.time_text}
                      placeholder="e.g. 06:30 – 08:00"
                      onChange={(e) => setNewRow({ ...newRow, time_text: e.target.value })}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      value={newRow.location}
                      onValueChange={(v) => setNewRow({ ...newRow, location: v as Location })}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Boathouse">Boathouse</SelectItem>
                        <SelectItem value="Gym">Gym</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="icon" onClick={() => setNewRow(null)} aria-label="Cancel new row">
                      <X className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {editMode && !newRow && (
            <div className="border-t bg-muted/20 px-4 py-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setNewRow({
                    day_of_week: 1,
                    group_name: "",
                    time_text: "",
                    location: "Boathouse",
                    sort_order: 0,
                  })
                }
              >
                <Plus className="h-4 w-4 mr-2" /> Add session
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}