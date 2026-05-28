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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/coaches/groups/$groupId")({
  head: () => ({ meta: [{ title: "Group — Coaches Corner" }, { name: "robots", content: "noindex" }] }),
  component: GroupDetail,
});

type Group = { id: string; name: string; description: string | null };
type Athlete = { id: string; group_id: string; first_name: string; last_name: string; dob: string | null; erg_2k_seconds: number | null; notes: string | null };
type Attendance = { id: string; athlete_id: string; session_date: string; status: "present" | "absent" | "late" | "excused"; notes: string | null };

const STATUSES: Attendance["status"][] = ["present", "absent", "late", "excused"];

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
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Athlete | null>(null);
  const empty = { first_name: "", last_name: "", dob: "", erg_2k: "", notes: "" };
  const [form, setForm] = useState(empty);

  const load = useCallback(async () => {
    const { data } = await supabase.from("athletes").select("*").eq("group_id", groupId).order("last_name");
    setAthletes(data ?? []);
  }, [groupId]);

  useEffect(() => { void load(); }, [load]);

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
              <th className="p-2">DOB</th>
              <th className="p-2">2k PB</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {athletes.length === 0 && <tr><td colSpan={4} className="text-center text-muted-foreground py-6">No athletes yet.</td></tr>}
            {athletes.map((a) => (
              <tr key={a.id} className="border-b">
                <td className="p-2 font-medium">{a.last_name}, {a.first_name}</td>
                <td className="p-2 text-muted-foreground">{a.dob ?? "—"}</td>
                <td className="p-2 tabular-nums">{fmt2k(a.erg_2k_seconds)}</td>
                <td className="p-2 text-right">
                  <Button size="sm" variant="outline" onClick={() => startEdit(a)}>Edit</Button>{" "}
                  <Button size="sm" variant="destructive" onClick={async () => {
                    if (!confirm(`Delete ${a.first_name} ${a.last_name}?`)) return;
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
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [records, setRecords] = useState<Record<string, Attendance>>({});

  const load = useCallback(async () => {
    const { data: ath } = await supabase.from("athletes").select("*").eq("group_id", groupId).order("last_name");
    setAthletes(ath ?? []);
    const ids = (ath ?? []).map((a) => a.id);
    if (ids.length === 0) { setRecords({}); return; }
    const { data: att } = await supabase.from("attendance").select("*").in("athlete_id", ids).eq("session_date", date);
    const map: Record<string, Attendance> = {};
    (att ?? []).forEach((r) => { map[r.athlete_id] = r as Attendance; });
    setRecords(map);
  }, [groupId, date]);

  useEffect(() => { void load(); }, [load]);

  const set = async (athleteId: string, status: Attendance["status"]) => {
    const existing = records[athleteId];
    if (existing) {
      const { error } = await supabase.from("attendance").update({ status }).eq("id", existing.id);
      if (error) return toast.error(error.message);
    } else {
      const { data, error } = await supabase.from("attendance").insert({ athlete_id: athleteId, session_date: date, status }).select().single();
      if (error) return toast.error(error.message);
      setRecords({ ...records, [athleteId]: data as Attendance });
      return;
    }
    setRecords({ ...records, [athleteId]: { ...existing, status } });
  };

  const markAllPresent = async () => {
    await Promise.all(athletes.map((a) => set(a.id, "present")));
    toast.success("All marked present");
  };

  return (
    <div className="mt-6 rounded-lg border bg-background p-6">
      <div className="flex items-end justify-between gap-3 mb-4 flex-wrap">
        <div>
          <Label>Session date</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-auto" />
        </div>
        <Button size="sm" variant="outline" onClick={markAllPresent} disabled={athletes.length === 0}>Mark all present</Button>
      </div>

      {athletes.length === 0 ? <p className="text-sm text-muted-foreground">No athletes in this group yet.</p> : (
        <div className="divide-y">
          {athletes.map((a) => {
            const status = records[a.id]?.status;
            return (
              <div key={a.id} className="py-2 flex items-center justify-between gap-3">
                <div className="font-medium">{a.last_name}, {a.first_name}</div>
                <Select value={status ?? ""} onValueChange={(v) => set(a.id, v as Attendance["status"])}>
                  <SelectTrigger className="w-36"><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            );
          })}
        </div>
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

  const cell = (athleteId: string, day: number) => {
    const d = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return records.find((r) => r.athlete_id === athleteId && r.session_date === d);
  };

  const summary = (athleteId: string) => {
    const rs = records.filter((r) => r.athlete_id === athleteId);
    if (rs.length === 0) return { pct: null as number | null, p: 0, total: 0 };
    const present = rs.filter((r) => r.status === "present" || r.status === "late").length;
    return { pct: Math.round((present / rs.length) * 100), p: present, total: rs.length };
  };

  const monthName = new Date(year, month, 1).toLocaleString("default", { month: "long" });

  const setPrev = () => {
    if (month === 0) { setYear(year - 1); setMonth(11); } else setMonth(month - 1);
  };
  const setNext = () => {
    if (month === 11) { setYear(year + 1); setMonth(0); } else setMonth(month + 1);
  };

  const colour = (s?: string) => {
    switch (s) {
      case "present": return "bg-green-500/80 text-white";
      case "late": return "bg-yellow-500/80 text-white";
      case "absent": return "bg-red-500/80 text-white";
      case "excused": return "bg-blue-500/80 text-white";
      default: return "";
    }
  };

  return (
    <div className="mt-6 rounded-lg border bg-background p-6">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <h2 className="font-serif text-xl">{monthName} {year}</h2>
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
                    <td className="sticky left-0 bg-background p-2 whitespace-nowrap">{a.last_name}, {a.first_name}</td>
                    {days.map((d) => {
                      const r = cell(a.id, d);
                      return <td key={d} className="p-0 text-center border-l"><div className={`w-7 h-7 mx-auto flex items-center justify-center text-[10px] uppercase ${colour(r?.status)}`}>{r ? r.status[0] : ""}</div></td>;
                    })}
                    <td className="p-2 text-center font-medium tabular-nums">{sum.pct == null ? "—" : `${sum.pct}%`}<div className="text-[10px] text-muted-foreground">{sum.p}/{sum.total}</div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="mt-4 flex gap-4 text-xs text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1"><span className="inline-block w-3 h-3 bg-green-500/80 rounded-sm" /> Present</div>
            <div className="flex items-center gap-1"><span className="inline-block w-3 h-3 bg-yellow-500/80 rounded-sm" /> Late</div>
            <div className="flex items-center gap-1"><span className="inline-block w-3 h-3 bg-red-500/80 rounded-sm" /> Absent</div>
            <div className="flex items-center gap-1"><span className="inline-block w-3 h-3 bg-blue-500/80 rounded-sm" /> Excused</div>
          </div>
        </div>
      )}
    </div>
  );
}