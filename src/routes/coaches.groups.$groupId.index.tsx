import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/coaches/groups/$groupId/")({
  head: () => ({ meta: [{ title: "Group — Coaches Corner" }, { name: "robots", content: "noindex" }] }),
  component: GroupDetail,
});

type Group = { id: string; name: string; description: string | null };
type Athlete = { id: string; group_id: string; first_name: string; last_name: string; dob: string | null; erg_2k_seconds: number | null; notes: string | null };
type SessionPart = "single" | "am" | "pm";
type Status = "present" | "absent";
type Attendance = { id: string; athlete_id: string; session_date: string; session_part: SessionPart; status: Status; notes: string | null };

function fmt2k(seconds: number | null): string {
  if (seconds == null) return "—";
  const m = Math.floor(seconds / 60);
  const s = (seconds % 60).toFixed(1).padStart(4, "0");
  return `${m}:${s}`;
}
function parse2k(input: string): number | null {
  const t = input.trim();
  if (!t) return null;
  const m = t.match(/^(\d+):(\d+(?:\.\d+)?)$/);
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseFloat(m[2]);
}
function todayISO() { return new Date().toISOString().slice(0, 10); }

function GroupDetail() {
  const { groupId } = Route.useParams();
  const { loading, session, isCoach, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!loading && !session) void navigate({ to: "/coaches/login" });
  }, [loading, session, navigate]);

  useEffect(() => {
    if (!session) return;
    void supabase.from("groups").select("id, name, description").eq("id", groupId).maybeSingle()
      .then(({ data }) => { if (data) setGroup(data); else setNotFound(true); });
  }, [groupId, session]);

  if (loading || !session) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  if (!isCoach && !isAdmin) return <div className="min-h-screen flex items-center justify-center">Not authorised.</div>;
  if (notFound) return <div className="min-h-screen flex items-center justify-center">Group not found or not assigned to you.</div>;
  if (!group) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="font-serif text-3xl">{group.name}</h1>
            {group.description && <p className="text-sm text-muted-foreground mt-1">{group.description}</p>}
          </div>
          <Button asChild size="sm" variant="outline"><Link to="/coaches">← Dashboard</Link></Button>
        </div>

        <Tabs defaultValue="athletes">
          <TabsList>
            <TabsTrigger value="athletes">Athletes</TabsTrigger>
            <TabsTrigger value="today">Today's session</TabsTrigger>
            <TabsTrigger value="monthly">Monthly attendance</TabsTrigger>
          </TabsList>
          <TabsContent value="athletes"><AthletesTab groupId={groupId} /></TabsContent>
          <TabsContent value="today"><TodayTab groupId={groupId} /></TabsContent>
          <TabsContent value="monthly"><MonthlyTab groupId={groupId} /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/* ---------------- Athletes ---------------- */

function AthletesTab({ groupId }: { groupId: string }) {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Athlete | null>(null);
  const empty = { first_name: "", last_name: "", dob: "", erg_2k: "", notes: "" };
  const [form, setForm] = useState(empty);

  const load = useCallback(async () => {
    const { data } = await supabase.from("athletes").select("*").eq("group_id", groupId).order("last_name");
    setAthletes(data ?? []);
    const ids = (data ?? []).map((a) => a.id);
    if (ids.length === 0) { setAttendance([]); return; }
    const { data: att } = await supabase.from("attendance").select("*").in("athlete_id", ids);
    setAttendance((att ?? []) as Attendance[]);
  }, [groupId]);

  useEffect(() => { void load(); }, [load]);

  const attendanceFor = (athleteId: string): { pct: number | null; total: number } => {
    // Average attendance for the CURRENT calendar month only.
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const rs = attendance.filter((r) => r.athlete_id === athleteId && r.session_date.startsWith(ym));
    if (rs.length === 0) return { pct: null, total: 0 };
    const present = rs.filter((r) => r.status === "present").length;
    return { pct: Math.round((present / rs.length) * 100), total: rs.length };
  };

  const startCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const startEdit = (a: Athlete) => {
    setEditing(a);
    setForm({
      first_name: a.first_name, last_name: a.last_name,
      dob: a.dob ?? "", erg_2k: a.erg_2k_seconds != null ? fmt2k(a.erg_2k_seconds) : "",
      notes: a.notes ?? "",
    });
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const erg = form.erg_2k.trim() ? parse2k(form.erg_2k) : null;
    if (form.erg_2k.trim() && erg == null) return toast.error("2k time must be like 7:25.4");
    const payload = {
      group_id: groupId,
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      dob: form.dob || null,
      erg_2k_seconds: erg,
      notes: form.notes.trim() || null,
    };
    if (editing) {
      const { error } = await supabase.from("athletes").update(payload).eq("id", editing.id);
      if (error) return toast.error(error.message);
      toast.success("Updated");
    } else {
      const { error } = await supabase.from("athletes").insert(payload);
      if (error) return toast.error(error.message);
      toast.success("Added");
    }
    setOpen(false);
    void load();
  };

  return (
    <div className="mt-6 rounded-lg border bg-background p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-serif text-xl">Athletes ({athletes.length})</h2>
        <Button size="sm" onClick={startCreate}>Add athlete</Button>
      </div>

      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="p-2">Name</th>
              <th className="p-2">Attendance (this month)</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {athletes.length === 0 && <tr><td colSpan={3} className="text-center text-muted-foreground py-6">No athletes yet.</td></tr>}
            {athletes.map((a) => (
              <tr key={a.id} className="border-b">
                <td className="p-2 font-medium">
                  <Link
                    to="/coaches/groups/$groupId/athletes/$athleteId"
                    params={{ groupId, athleteId: a.id }}
                    className="text-primary hover:underline"
                  >
                    {a.last_name}, {a.first_name}
                  </Link>
                </td>
                <td className="p-2 tabular-nums">
                  {(() => {
                    const { pct, total } = attendanceFor(a.id);
                    if (pct == null) return <span className="text-muted-foreground">—</span>;
                    const color = pct >= 80 ? "text-green-600" : pct >= 50 ? "text-yellow-600" : "text-red-600";
                    return <span className={color}>{pct}% <span className="text-xs text-muted-foreground">({total})</span></span>;
                  })()}
                </td>
                <td className="p-2 text-right">
                  <Button size="sm" variant="outline" onClick={() => startEdit(a)}>Edit</Button>{" "}
                  <Button size="sm" variant="destructive" onClick={async () => {
                    if (!confirm(`Delete ${a.first_name} ${a.last_name}? This permanently removes the athlete and all attendance records.`)) return;
                    const { error: attErr } = await supabase.from("attendance").delete().eq("athlete_id", a.id);
                    if (attErr) return toast.error(attErr.message);
                    const { error } = await supabase.from("athletes").delete().eq("id", a.id);
                    if (error) return toast.error(error.message);
                    toast.success("Deleted"); void load();
                  }}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit athlete" : "Add athlete"}</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>First name</Label><Input required value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} /></div>
              <div><Label>Last name</Label><Input required value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Date of birth</Label><Input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} /></div>
              <div><Label>2k PB (m:ss.s)</Label><Input placeholder="7:25.4" value={form.erg_2k} onChange={(e) => setForm({ ...form, erg_2k: e.target.value })} /></div>
            </div>
            <div><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            <DialogFooter><Button type="submit">{editing ? "Save" : "Add"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------------- Today's session ---------------- */

function TodayTab({ groupId }: { groupId: string }) {
  const [date, setDate] = useState(todayISO());
  const [isDouble, setIsDouble] = useState(false);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  // saved records (in DB), keyed by `${athleteId}|${part}`
  const [saved, setSaved] = useState<Record<string, Status>>({});
  // local draft, keyed by `${athleteId}|${part}` -> "present" | "absent" | undefined
  const [draft, setDraft] = useState<Record<string, Status | undefined>>({});
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    const { data: ath } = await supabase.from("athletes").select("*").eq("group_id", groupId).order("last_name");
    setAthletes(ath ?? []);
    const ids = (ath ?? []).map((a) => a.id);
    if (ids.length === 0) { setSaved({}); setDraft({}); return; }
    const { data: att } = await supabase.from("attendance").select("*").in("athlete_id", ids).eq("session_date", date);
    const map: Record<string, Status> = {};
    (att ?? []).forEach((r) => { const rec = r as Attendance; map[`${rec.athlete_id}|${rec.session_part}`] = rec.status; });
    setSaved(map);
    setDraft(map); // seed draft from saved
    // auto-detect double if any am/pm rows exist
    if ((att ?? []).some((r: any) => r.session_part === "am" || r.session_part === "pm")) setIsDouble(true);
  }, [groupId, date]);

  useEffect(() => { void load(); }, [load]);

  const setDraftStatus = (athleteId: string, part: SessionPart, status: Status | undefined) => {
    setDraft((prev) => ({ ...prev, [`${athleteId}|${part}`]: status }));
  };

  const markAllPresent = (part: SessionPart) => {
    setDraft((prev) => {
      const next = { ...prev };
      athletes.forEach((a) => { next[`${a.id}|${part}`] = "present"; });
      return next;
    });
  };

  const submit = async () => {
    const parts: SessionPart[] = isDouble ? ["am", "pm"] : ["single"];
    const rows: { athlete_id: string; session_date: string; session_part: SessionPart; status: Status }[] = [];
    athletes.forEach((a) => {
      parts.forEach((p) => {
        const s = draft[`${a.id}|${p}`];
        if (s) rows.push({ athlete_id: a.id, session_date: date, session_part: p, status: s });
      });
    });
    if (rows.length === 0) return toast.error("Mark at least one athlete first");
    setSubmitting(true);
    const { error } = await supabase
      .from("attendance")
      .upsert(rows, { onConflict: "athlete_id,session_date,session_part" });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success(`Saved ${rows.length} record${rows.length === 1 ? "" : "s"}`);
    void load();
  };

  const isDirty = useMemo(() => {
    const keys = new Set([...Object.keys(saved), ...Object.keys(draft)]);
    for (const k of keys) if ((saved[k] ?? undefined) !== (draft[k] ?? undefined)) return true;
    return false;
  }, [saved, draft]);

  const parts: SessionPart[] = isDouble ? ["am", "pm"] : ["single"];
  const partLabel = (p: SessionPart) => (p === "am" ? "AM" : p === "pm" ? "PM" : "Session");

  return (
    <div className="mt-6 rounded-lg border bg-background p-4 sm:p-6">
      <div className="flex items-end justify-between gap-3 mb-4 flex-wrap">
        <div>
          <Label className="text-xs">Session date</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-auto" />
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={isDouble ? "outline" : "default"}
            onClick={() => setIsDouble(false)}
          >Single</Button>
          <Button
            type="button"
            size="sm"
            variant={isDouble ? "default" : "outline"}
            onClick={() => setIsDouble(true)}
          >Double (AM/PM)</Button>
        </div>
      </div>

      {athletes.length === 0 ? (
        <p className="text-sm text-muted-foreground">No athletes in this group yet.</p>
      ) : (
        <>
          {/* summary header */}
          <div className="mb-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
            {parts.map((p) => {
              const present = athletes.filter((a) => draft[`${a.id}|${p}`] === "present").length;
              const absent = athletes.filter((a) => draft[`${a.id}|${p}`] === "absent").length;
              return (
                <div key={p} className="rounded-md border px-3 py-1.5 flex items-center gap-3">
                  <span className="font-semibold text-foreground">{partLabel(p)}</span>
                  <span><span className="text-green-600 font-medium">{present}</span> present</span>
                  <span><span className="text-red-600 font-medium">{absent}</span> absent</span>
                  <span>{athletes.length - present - absent} unmarked</span>
                  <button
                    type="button"
                    onClick={() => markAllPresent(p)}
                    className="ml-1 text-primary hover:underline"
                  >mark all</button>
                </div>
              );
            })}
          </div>

          <ul className="divide-y">
            {athletes.map((a) => (
              <li key={a.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{a.last_name}, {a.first_name}</div>
                  <div className="text-xs text-muted-foreground">2k {fmt2k(a.erg_2k_seconds)}</div>
                </div>
                <div className="flex flex-col gap-2">
                  {parts.map((p) => {
                    const status = draft[`${a.id}|${p}`];
                    const key = `${a.id}|${p}`;
                    return (
                      <div key={p} className="flex items-center gap-3">
                        {isDouble && <span className="w-7 text-[10px] font-semibold text-muted-foreground text-right">{partLabel(p)}</span>}
                        <label htmlFor={`${key}-present`} className="flex items-center gap-1.5 text-sm cursor-pointer select-none">
                          <Checkbox
                            id={`${key}-present`}
                            checked={status === "present"}
                            onCheckedChange={(c) => setDraftStatus(a.id, p, c ? "present" : undefined)}
                          />
                          <span className={cn(status === "present" && "text-green-600 font-medium")}>Present</span>
                        </label>
                        <label htmlFor={`${key}-absent`} className="flex items-center gap-1.5 text-sm cursor-pointer select-none">
                          <Checkbox
                            id={`${key}-absent`}
                            checked={status === "absent"}
                            onCheckedChange={(c) => setDraftStatus(a.id, p, c ? "absent" : undefined)}
                          />
                          <span className={cn(status === "absent" && "text-red-600 font-medium")}>Absent</span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-center justify-end gap-3 border-t pt-4">
            {isDirty && <span className="text-xs text-muted-foreground">Unsaved changes</span>}
            <Button type="button" variant="outline" size="sm" onClick={() => setDraft(saved)} disabled={!isDirty || submitting}>Reset</Button>
            <Button type="button" onClick={submit} disabled={submitting || !isDirty}>
              {submitting ? "Saving…" : "Submit attendance"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

/* ---------------- Monthly attendance ---------------- */

function MonthlyTab({ groupId }: { groupId: string }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-indexed
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [records, setRecords] = useState<Attendance[]>([]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);

  const monthStart = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const monthEnd = `${year}-${String(month + 1).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;

  const load = useCallback(async () => {
    const { data: ath } = await supabase.from("athletes").select("*").eq("group_id", groupId).order("last_name");
    setAthletes(ath ?? []);
    const ids = (ath ?? []).map((a) => a.id);
    if (ids.length === 0) { setRecords([]); return; }
    const { data: att } = await supabase.from("attendance").select("*").in("athlete_id", ids).gte("session_date", monthStart).lte("session_date", monthEnd);
    setRecords((att ?? []) as Attendance[]);
  }, [groupId, monthStart, monthEnd]);

  useEffect(() => { void load(); }, [load]);

  const dayKey = (day: number) => `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  // For a given athlete and day, return present-count / total-sessions that day
  const cellInfo = (athleteId: string, day: number) => {
    const d = dayKey(day);
    const rs = records.filter((r) => r.athlete_id === athleteId && r.session_date === d);
    if (rs.length === 0) return null;
    const present = rs.filter((r) => r.status === "present").length;
    return { present, total: rs.length };
  };

  const summary = (athleteId: string) => {
    const rs = records.filter((r) => r.athlete_id === athleteId);
    if (rs.length === 0) return { pct: null as number | null, p: 0, total: 0 };
    const present = rs.filter((r) => r.status === "present").length;
    return { pct: Math.round((present / rs.length) * 100), p: present, total: rs.length };
  };

  // group-wide attendance for this month
  const groupPct = (() => {
    if (records.length === 0) return null;
    const present = records.filter((r) => r.status === "present").length;
    return Math.round((present / records.length) * 100);
  })();

  const monthName = new Date(year, month, 1).toLocaleString("default", { month: "long" });

  const setPrev = () => {
    if (month === 0) { setYear(year - 1); setMonth(11); } else setMonth(month - 1);
  };
  const setNext = () => {
    if (month === 11) { setYear(year + 1); setMonth(0); } else setMonth(month + 1);
  };

  const cellColour = (info: { present: number; total: number } | null) => {
    if (!info) return "";
    if (info.present === 0) return "bg-red-500/80 text-white";
    if (info.present < info.total) return "bg-yellow-500/80 text-white"; // partial (e.g. AM only)
    return "bg-green-500/80 text-white"; // all sessions present
  };

  return (
    <div className="mt-6 rounded-lg border bg-background p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div>
          <h2 className="font-serif text-xl">{monthName} {year}</h2>
          {groupPct != null && (
            <p className="text-xs text-muted-foreground mt-1">
              Group attendance: <span className="font-semibold text-foreground">{groupPct}%</span> ({records.filter(r => r.status === "present").length}/{records.length} sessions)
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={setPrev}>← Prev</Button>
          <Button size="sm" variant="outline" onClick={setNext}>Next →</Button>
        </div>
      </div>

      {athletes.length === 0 ? <p className="text-sm text-muted-foreground">No athletes.</p> : (
        <div className="overflow-auto">
          <table className="text-xs border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 bg-background p-2 text-left border-b">Athlete</th>
                {days.map((d) => <th key={d} className="p-1 border-b text-center w-7">{d}</th>)}
                <th className="p-2 border-b text-center">%</th>
              </tr>
            </thead>
            <tbody>
              {athletes.map((a) => {
                const sum = summary(a.id);
                return (
                  <tr key={a.id} className="border-b">
                    <td className="sticky left-0 bg-background p-2 whitespace-nowrap font-medium">{a.last_name}, {a.first_name}</td>
                    {days.map((d) => {
                      const info = cellInfo(a.id, d);
                      const label = info ? (info.total > 1 ? `${info.present}/${info.total}` : info.present === info.total ? "✓" : "✗") : "";
                      return (
                        <td key={d} className="p-0 text-center border-l">
                          <div className={`w-7 h-7 mx-auto flex items-center justify-center text-[10px] font-semibold ${cellColour(info)}`}>{label}</div>
                        </td>
                      );
                    })}
                    <td className="p-2 text-center font-semibold tabular-nums">
                      <span className={sum.pct == null ? "" : sum.pct >= 80 ? "text-green-600" : sum.pct >= 50 ? "text-yellow-600" : "text-red-600"}>
                        {sum.pct == null ? "—" : `${sum.pct}%`}
                      </span>
                      <div className="text-[10px] text-muted-foreground font-normal">{sum.p}/{sum.total}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="mt-4 flex gap-4 text-xs text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1"><span className="inline-block w-3 h-3 bg-green-500/80 rounded-sm" /> All sessions present</div>
            <div className="flex items-center gap-1"><span className="inline-block w-3 h-3 bg-yellow-500/80 rounded-sm" /> Partial (e.g. AM only)</div>
            <div className="flex items-center gap-1"><span className="inline-block w-3 h-3 bg-red-500/80 rounded-sm" /> Absent</div>
          </div>
        </div>
      )}
    </div>
  );
}