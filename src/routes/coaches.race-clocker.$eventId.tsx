import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Download, Pencil, Trash2, Undo2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import {
  BOAT_TYPES, CATEGORY_SUGGESTIONS, buildResults, elapsedMs, formatRaceTime, type RaceCrew,
} from "@/lib/race-clocker";

export const Route = createFileRoute("/coaches/race-clocker/$eventId")({
  head: () => ({ meta: [{ title: "Race event — Race Clocker" }, { name: "robots", content: "noindex" }] }),
  component: EventPage,
});

type RaceEvent = {
  id: string; name: string; distance: string | null; start_date: string | null; end_date: string | null;
  status: "draft" | "running" | "finished"; checkpoints_count: number; checkpoint_names: string[];
  finished_at: string | null; created_by: string;
};
type Coach = { id: string; full_name: string | null };
type Confirm = { title: string; body: string; action: () => Promise<void> | void } | null;

function EventPage() {
  const { eventId } = Route.useParams();
  const { loading, session, isCoach, isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState<RaceEvent | null>(null);
  const [crews, setCrews] = useState<RaceCrew[]>([]);
  const [controllers, setControllers] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [confirm, setConfirm] = useState<Confirm>(null);

  useEffect(() => { if (!loading && !session) void navigate({ to: "/coaches/login" }); }, [loading, session, navigate]);

  const load = useCallback(async () => {
    const [e, c, k] = await Promise.all([
      supabase.from("race_events").select("*").eq("id", eventId).maybeSingle(),
      supabase.from("race_crews").select("*").eq("event_id", eventId).order("created_at"),
      supabase.from("race_event_controllers").select("coach_id").eq("event_id", eventId),
    ]);
    if (e.error) toast.error(e.error.message);
    setEvent((e.data as RaceEvent) ?? null);
    setCrews((c.data as RaceCrew[]) ?? []);
    setControllers((k.data ?? []).map((r) => r.coach_id));
    setLoaded(true);
  }, [eventId]);

  useEffect(() => {
    if (!session || (!isCoach && !isAdmin)) return;
    void load();
    const ch = supabase.channel(`race-${eventId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "race_crews", filter: `event_id=eq.${eventId}` }, () => void load())
      .on("postgres_changes", { event: "*", schema: "public", table: "race_events", filter: `id=eq.${eventId}` }, () => void load())
      .subscribe();
    return () => { void supabase.removeChannel(ch); };
  }, [session, isCoach, isAdmin, eventId, load]);

  if (loading || !session || (!loaded && (isCoach || isAdmin))) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  if (!isCoach && !isAdmin) return <div className="min-h-screen flex items-center justify-center">Not authorised.</div>;
  if (!event) return <div className="min-h-screen flex flex-col items-center justify-center gap-3"><p>Event not found.</p><Link to="/coaches/race-clocker" className="underline">Back to events</Link></div>;

  const canControl = isAdmin || event.created_by === user?.id || controllers.includes(user?.id ?? "");

  return (
    <div className="min-h-screen bg-muted/30 px-3 sm:px-4 py-6 pb-28">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-serif text-2xl sm:text-3xl truncate">{event.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge variant={event.status === "running" ? "default" : event.status === "finished" ? "secondary" : "outline"}>
                {event.status === "draft" ? "Draft" : event.status === "running" ? "Live" : "Finished"}
              </Badge>
              {!canControl && <span>View only</span>}
            </div>
          </div>
          <Button asChild size="sm" variant="outline" className="shrink-0"><Link to="/coaches/race-clocker">← Events</Link></Button>
        </div>

        {event.status === "draft" && (canControl
          ? <SetupView event={event} crews={crews} controllers={controllers} reload={load} setConfirm={setConfirm} />
          : <div className="rounded-lg border bg-background p-6 text-sm text-muted-foreground">This event hasn't started yet. {crews.length} crews entered.</div>)}
        {event.status === "running" && <RunView event={event} crews={crews} canControl={canControl} reload={load} setConfirm={setConfirm} />}
        {event.status === "finished" && <ResultsView event={event} crews={crews} />}
      </div>

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirm?.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirm?.body}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-12">Cancel</AlertDialogCancel>
            <AlertDialogAction className="h-12" onClick={async () => { const a = confirm?.action; setConfirm(null); await a?.(); }}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ---------------- Setup ---------------- */

function SetupView({ event, crews, controllers, reload, setConfirm }: {
  event: RaceEvent; crews: RaceCrew[]; controllers: string[]; reload: () => Promise<void>; setConfirm: (c: Confirm) => void;
}) {
  const [form, setForm] = useState({
    name: event.name, distance: event.distance ?? "", start_date: event.start_date ?? "", end_date: event.end_date ?? "",
    checkpoints_count: event.checkpoints_count, cp1: event.checkpoint_names[0] ?? "", cp2: event.checkpoint_names[1] ?? "",
  });
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [picked, setPicked] = useState<string[]>(controllers);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void supabase.rpc("list_coaches").then(({ data, error }) => {
      if (error) toast.error(error.message);
      setCoaches((data as Coach[]) ?? []);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    const names = [form.cp1, form.cp2].slice(0, form.checkpoints_count).map((s) => s.trim());
    const { error } = await supabase.from("race_events").update({
      name: form.name.trim() || "Untitled event", distance: form.distance || null,
      start_date: form.start_date || null, end_date: form.end_date || form.start_date || null,
      checkpoints_count: form.checkpoints_count, checkpoint_names: names,
    }).eq("id", event.id);
    if (!error) {
      const keep = new Set([...picked, event.created_by]);
      const toRemove = controllers.filter((c) => !keep.has(c));
      const toAdd = [...keep].filter((c) => !controllers.includes(c));
      if (toRemove.length) await supabase.from("race_event_controllers").delete().eq("event_id", event.id).in("coach_id", toRemove);
      if (toAdd.length) await supabase.from("race_event_controllers").insert(toAdd.map((coach_id) => ({ event_id: event.id, coach_id })));
    }
    setSaving(false);
    if (error) { toast.error(error.message); return false; }
    toast.success("Event saved");
    await reload();
    return true;
  };

  const start = () => setConfirm({
    title: "Start event?", body: "The event moves to the run screen. Crew timers only start when you tap Start on a crew.",
    action: async () => {
      if (!(await save())) return;
      const { error } = await supabase.from("race_events").update({ status: "running" }).eq("id", event.id);
      if (error) toast.error(error.message); else await reload();
    },
  });

  const remove = () => setConfirm({
    title: "Delete event?", body: "This removes the event and all its crews.",
    action: async () => {
      const { error } = await supabase.from("race_events").delete().eq("id", event.id);
      if (error) toast.error(error.message); else window.location.assign("/coaches/race-clocker");
    },
  });

  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-background p-4 space-y-4">
        <h2 className="font-serif text-xl">Event details</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2"><Label>Event name</Label><Input className="h-12" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Start date</Label><Input className="h-12" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
          <div><Label>End date</Label><Input className="h-12" type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div>
          <div><Label>Distance</Label><Input className="h-12" placeholder="e.g. 2000m" value={form.distance} onChange={(e) => setForm({ ...form, distance: e.target.value })} /></div>
          <div>
            <Label>Checkpoints / splits</Label>
            <div className="mt-1 grid grid-cols-3 gap-2">
              {[0, 1, 2].map((n) => (
                <Button key={n} type="button" className="h-12" variant={form.checkpoints_count === n ? "default" : "outline"}
                  onClick={() => setForm({ ...form, checkpoints_count: n })}>{n === 0 ? "None" : n}</Button>
              ))}
            </div>
          </div>
          {form.checkpoints_count >= 1 && <div><Label>Split 1 name (optional)</Label><Input className="h-12" placeholder="e.g. 500m" value={form.cp1} onChange={(e) => setForm({ ...form, cp1: e.target.value })} /></div>}
          {form.checkpoints_count >= 2 && <div><Label>Split 2 name (optional)</Label><Input className="h-12" placeholder="e.g. 1000m" value={form.cp2} onChange={(e) => setForm({ ...form, cp2: e.target.value })} /></div>}
        </div>
        <div>
          <Label>Designated coaches (can control this event)</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {coaches.length === 0 && <span className="text-sm text-muted-foreground">Loading coaches…</span>}
            {coaches.map((c) => {
              const isCreator = c.id === event.created_by;
              const on = isCreator || picked.includes(c.id);
              return (
                <button key={c.id} type="button" disabled={isCreator}
                  onClick={() => setPicked(on ? picked.filter((p) => p !== c.id) : [...picked, c.id])}
                  className={cn("min-h-12 rounded-full border px-4 text-sm transition", on ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:border-primary")}>
                  {c.full_name ?? "Coach"}{isCreator ? " (creator)" : ""}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button className="h-12" variant="outline" onClick={() => void save()} disabled={saving}>{saving ? "Saving…" : "Save details"}</Button>
          {(isAdmin || (event.status === "draft" && event.created_by === user?.id)) && <Button className="h-12" variant="ghost" onClick={remove}><Trash2 className="h-4 w-4 mr-2" />Delete event</Button>}
        </div>
      </section>

      <CrewEditor eventId={event.id} crews={crews} reload={reload} setConfirm={setConfirm} />

      <Button className="h-14 w-full text-lg" onClick={start} disabled={crews.length === 0}>Start event</Button>
    </div>
  );
}

const emptyCrew = { boat_type: "1x", crew_name: "", bow_number: "", category: "" };

function CrewEditor({ eventId, crews, reload, setConfirm }: {
  eventId: string; crews: RaceCrew[]; reload: () => Promise<void>; setConfirm: (c: Confirm) => void;
}) {
  const [draft, setDraft] = useState(emptyCrew);
  const [editId, setEditId] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.crew_name.trim()) return toast.error("Crew name is required");
    const row = { boat_type: draft.boat_type, crew_name: draft.crew_name.trim(), bow_number: draft.bow_number.trim() || null, category: draft.category.trim() || null };
    const { error } = editId
      ? await supabase.from("race_crews").update(row).eq("id", editId)
      : await supabase.from("race_crews").insert({ ...row, event_id: eventId });
    if (error) return toast.error(error.message);
    setDraft({ ...emptyCrew, boat_type: draft.boat_type, category: draft.category });
    setEditId(null);
    await reload();
    document.getElementById("crew-name")?.focus();
  };

  return (
    <section className="rounded-lg border bg-background p-4 space-y-4">
      <h2 className="font-serif text-xl">Crews ({crews.length})</h2>
      <form onSubmit={submit} className="grid gap-3 sm:grid-cols-4">
        <div>
          <Label>Boat type</Label>
          <select className="mt-1 h-12 w-full rounded-md border bg-background px-3" value={draft.boat_type} onChange={(e) => setDraft({ ...draft, boat_type: e.target.value })}>
            {BOAT_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2"><Label>Crew name</Label><Input id="crew-name" className="h-12" value={draft.crew_name} onChange={(e) => setDraft({ ...draft, crew_name: e.target.value })} /></div>
        <div><Label>Bow number</Label><Input className="h-12" inputMode="numeric" value={draft.bow_number} onChange={(e) => setDraft({ ...draft, bow_number: e.target.value })} /></div>
        <div className="sm:col-span-2">
          <Label>Category</Label>
          <Input className="h-12" list="race-categories" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
          <datalist id="race-categories">{CATEGORY_SUGGESTIONS.map((c) => <option key={c} value={c} />)}</datalist>
        </div>
        <div className="sm:col-span-2 flex items-end gap-2">
          <Button type="submit" className="h-12 flex-1">{editId ? "Save crew" : "Add crew"}</Button>
          {editId && <Button type="button" variant="outline" className="h-12" onClick={() => { setEditId(null); setDraft(emptyCrew); }}>Cancel</Button>}
        </div>
      </form>
      {crews.length === 0 ? <p className="text-sm text-muted-foreground">No crews yet. Add the first one above.</p> : (
        <ul className="divide-y rounded-md border">
          {crews.map((c) => (
            <li key={c.id} className="flex items-center gap-2 p-2">
              <span className="w-10 text-center font-mono font-semibold">{c.bow_number ?? "–"}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{c.crew_name}</div>
                <div className="text-xs text-muted-foreground">{c.boat_type}{c.category ? ` · ${c.category}` : ""}</div>
              </div>
              <Button size="icon" variant="ghost" className="h-12 w-12" aria-label="Edit crew"
                onClick={() => { setEditId(c.id); setDraft({ boat_type: c.boat_type, crew_name: c.crew_name, bow_number: c.bow_number ?? "", category: c.category ?? "" }); }}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-12 w-12" aria-label="Delete crew"
                onClick={() => setConfirm({ title: "Delete crew?", body: c.crew_name, action: async () => {
                  const { error } = await supabase.from("race_crews").delete().eq("id", c.id);
                  if (error) toast.error(error.message); else await reload();
                } })}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ---------------- Run ---------------- */

function useNow(active: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(t);
  }, [active]);
  return now;
}

function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || typeof navigator === "undefined" || !("wakeLock" in navigator)) return;
    let lock: { release: () => Promise<void> } | null = null;
    const req = async () => {
      try { lock = await (navigator as unknown as { wakeLock: { request: (t: string) => Promise<typeof lock> } }).wakeLock.request("screen"); } catch { /* unsupported */ }
    };
    void req();
    const onVis = () => { if (document.visibilityState === "visible") void req(); };
    document.addEventListener("visibilitychange", onVis);
    return () => { document.removeEventListener("visibilitychange", onVis); void lock?.release(); };
  }, [active]);
}

const STATE_STYLE: Record<RaceCrew["status"], string> = {
  waiting: "border-border bg-background",
  running: "border-primary bg-primary/5 ring-2 ring-primary",
  finished: "border-secondary bg-secondary/15",
  dnf: "border-destructive/50 bg-destructive/5",
};
const STATE_LABEL: Record<RaceCrew["status"], string> = { waiting: "Waiting", running: "Running", finished: "Finished", dnf: "DNF" };

function RunView({ event, crews, canControl, reload, setConfirm }: {
  event: RaceEvent; crews: RaceCrew[]; canControl: boolean; reload: () => Promise<void>; setConfirm: (c: Confirm) => void;
}) {
  const [filter, setFilter] = useState<"all" | "waiting" | "running" | "finished">("all");
  const [selected, setSelected] = useState<string[]>([]);
  const anyRunning = crews.some((c) => c.status === "running");
  const now = useNow(anyRunning);
  useWakeLock(canControl);

  const shown = crews.filter((c) => filter === "all" || (filter === "finished" ? c.status === "finished" || c.status === "dnf" : c.status === filter));
  const waitingIds = crews.filter((c) => c.status === "waiting").map((c) => c.id);
  const sel = selected.filter((id) => waitingIds.includes(id));

  const patch = async (ids: string[], values: Partial<RaceCrew>) => {
    const { error } = await supabase.from("race_crews").update(values).in("id", ids);
    if (error) toast.error(error.message); else await reload();
  };

  const startCrews = (ids: string[]) => {
    const ts = new Date().toISOString();
    setSelected([]);
    void patch(ids, { start_time: ts, status: "running" });
  };

  const tap = (c: RaceCrew, checkpoint: "split1_time" | "split2_time" | "finish_time") => {
    if (c.status !== "running" || c[checkpoint]) return;
    const ts = new Date().toISOString();
    void patch([c.id], checkpoint === "finish_time"
      ? { finish_time: ts, status: "finished" }
      : { [checkpoint]: ts });
  };

  const undo = (c: RaceCrew) => {
    let values: Partial<RaceCrew>; let what: string;
    if (c.status === "finished" || c.status === "dnf") { values = { finish_time: null, status: c.start_time ? "running" : "waiting" }; what = c.status === "dnf" ? "DNF" : "finish time"; }
    else if (c.split2_time) { values = { split2_time: null }; what = "split 2"; }
    else if (c.split1_time) { values = { split1_time: null }; what = "split 1"; }
    else { values = { start_time: null, status: "waiting" }; what = "start"; }
    setConfirm({ title: `Undo ${what}?`, body: `${c.crew_name}: the recorded ${what} will be cleared.`, action: () => patch([c.id], values) });
  };

  const finishEvent = () => setConfirm({
    title: "Finish event?", body: "Any crew that hasn't finished will be marked DNF. Results become available to all coaches.",
    action: async () => {
      const open = crews.filter((c) => c.status === "waiting" || c.status === "running").map((c) => c.id);
      if (open.length) {
        const { error } = await supabase.from("race_crews").update({ status: "dnf" }).in("id", open);
        if (error) { toast.error(error.message); return; }
      }
      const { error } = await supabase.from("race_events").update({ status: "finished", finished_at: new Date().toISOString() }).eq("id", event.id);
      if (error) { toast.error(error.message); return; }
      await reload();
    },
  });

  return (
    <div className="space-y-3">
      <div className="sticky top-0 z-10 -mx-3 sm:mx-0 bg-muted/95 px-3 sm:px-0 py-2 backdrop-blur">
        <div className="grid grid-cols-4 gap-1 rounded-lg border bg-background p-1">
          {(["all", "waiting", "running", "finished"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn("h-12 rounded-md text-sm font-medium capitalize", filter === f ? "bg-primary text-primary-foreground" : "text-foreground")}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {canControl && waitingIds.length > 0 && (
        <Button variant="outline" className="h-12 w-full" onClick={() => setSelected(sel.length === waitingIds.length ? [] : waitingIds)}>
          {sel.length === waitingIds.length ? "Clear selection" : `Select all waiting (${waitingIds.length})`}
        </Button>
      )}

      {shown.length === 0 && <div className="rounded-lg border bg-background p-6 text-sm text-muted-foreground">No crews in this view.</div>}

      {shown.map((c) => {
        const live = c.status === "running" && c.start_time ? now - new Date(c.start_time).getTime() : null;
        const final = elapsedMs(c.start_time, c.finish_time);
        return (
          <div key={c.id} className={cn("rounded-lg border-2 p-2 sm:rounded-xl sm:p-4", STATE_STYLE[c.status])}>
            <div className="flex items-start gap-2 sm:gap-3">
              {canControl && c.status === "waiting" && (
                <Checkbox className="mt-1 h-6 w-6 sm:h-7 sm:w-7" aria-label={`Select ${c.crew_name}`} checked={sel.includes(c.id)}
                  onCheckedChange={(v) => setSelected(v ? [...sel, c.id] : sel.filter((x) => x !== c.id))} />
              )}
              <div className="flex h-9 min-w-9 sm:h-12 sm:min-w-12 items-center justify-center rounded-md bg-primary px-2 font-mono text-base sm:text-xl font-bold text-primary-foreground">
                {c.bow_number ?? "–"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-base sm:text-lg font-semibold">{c.crew_name}</div>
                <div className="text-sm text-muted-foreground">{c.boat_type}{c.category ? ` · ${c.category}` : ""}</div>
              </div>
              <Badge variant={c.status === "dnf" ? "destructive" : c.status === "running" ? "default" : c.status === "finished" ? "secondary" : "outline"}>{STATE_LABEL[c.status]}</Badge>
            </div>
            <div className="mt-1 sm:mt-3 font-mono text-2xl sm:text-5xl font-bold tabular-nums tracking-tight">
              {c.status === "running" ? formatRaceTime(live) : c.status === "finished" ? formatRaceTime(final) : c.status === "dnf" ? "DNF" : formatRaceTime(0)}
            </div>
            {(c.split1_time || c.split2_time) && (
              <div className="mt-1 flex flex-wrap gap-x-4 text-xs sm:text-sm font-mono text-muted-foreground">
                {c.split1_time && <span>{event.checkpoint_names[0] || "Split 1"}: {formatRaceTime(elapsedMs(c.start_time, c.split1_time))}</span>}
                {c.split2_time && <span>{event.checkpoint_names[1] || "Split 2"}: {formatRaceTime(elapsedMs(c.start_time, c.split2_time))}</span>}
              </div>
            )}
            {canControl && (
              <div className="mt-2 sm:mt-3 flex flex-wrap gap-2">
                {c.status === "waiting" && <Button className="h-11 sm:h-14 flex-1 text-base sm:text-lg" onClick={() => startCrews([c.id])}>Start</Button>}
                {c.status === "running" && (
                  <div className="grid min-w-0 flex-1 grid-cols-[repeat(auto-fit,minmax(90px,1fr))] gap-2 sm:grid-cols-[repeat(auto-fit,minmax(120px,1fr))]">
                    {event.checkpoints_count >= 1 && (
                      <Button className="h-auto min-h-11 sm:min-h-14 whitespace-normal break-words px-2 py-2 sm:px-3 sm:py-3 text-sm sm:text-lg" variant="outline" disabled={!!c.split1_time} onClick={() => tap(c, "split1_time")}>
                        Split 1{event.checkpoint_names[0] ? ` · ${event.checkpoint_names[0]}` : ""}
                      </Button>
                    )}
                    {event.checkpoints_count >= 2 && (
                      <Button className="h-auto min-h-11 sm:min-h-14 whitespace-normal break-words px-2 py-2 sm:px-3 sm:py-3 text-sm sm:text-lg" variant="outline" disabled={!!c.split2_time} onClick={() => tap(c, "split2_time")}>
                        Split 2{event.checkpoint_names[1] ? ` · ${event.checkpoint_names[1]}` : ""}
                      </Button>
                    )}
                    <Button className="h-auto min-h-11 sm:min-h-14 text-base sm:text-lg" variant="secondary" onClick={() => tap(c, "finish_time")}>Finish</Button>
                  </div>
                )}
                {c.status !== "waiting" && (
                  <Button variant="outline" className="h-11 px-3 sm:h-14 sm:px-4" onClick={() => undo(c)}><Undo2 className="h-5 w-5 sm:mr-2" /><span className="hidden sm:inline">Undo</span></Button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {canControl && (
        <Button variant="destructive" className="h-14 w-full text-lg" onClick={finishEvent}>Finish event</Button>
      )}

      {canControl && sel.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background p-3 shadow-lg">
          <div className="mx-auto max-w-4xl">
            <Button className="h-14 w-full text-lg" onClick={() => startCrews(sel)}>Start selected ({sel.length})</Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Results ---------------- */

function ResultsView({ event, crews }: { event: RaceEvent; crews: RaceCrew[] }) {
  const results = useMemo(() => buildResults(crews), [crews]);
  const cps = event.checkpoints_count;
  const splitLabel = (i: number) => event.checkpoint_names[i] || `Split ${i + 1}`;
  const dateText = event.start_date ? (event.end_date && event.end_date !== event.start_date ? `${event.start_date} – ${event.end_date}` : event.start_date) : "";
  const rowCells = (r: ReturnType<typeof buildResults>[number]["rows"][number]) => [
    r.position ? String(r.position) : "–", r.crew.bow_number ?? "", r.crew.crew_name, r.crew.boat_type, r.crew.category ?? "",
    ...(cps >= 1 ? [r.crew.split1_time ? formatRaceTime(elapsedMs(r.crew.start_time, r.crew.split1_time)) : ""] : []),
    ...(cps >= 2 ? [r.crew.split2_time ? formatRaceTime(elapsedMs(r.crew.start_time, r.crew.split2_time)) : ""] : []),
    r.finalMs !== null ? formatRaceTime(r.finalMs) : "DNF",
  ];
  const head = ["Pos", "Bow", "Crew", "Boat", "Category", ...(cps >= 1 ? [splitLabel(0)] : []), ...(cps >= 2 ? [splitLabel(1)] : []), "Time"];
  const fileBase = event.name.replace(/[^\w-]+/g, "_");

  const downloadCsv = () => {
    const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
    const lines = [head.map(esc).join(",")];
    for (const g of results) for (const r of g.rows) lines.push(rowCells(r).map(esc).join(","));
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${fileBase}_results.csv`; a.click();
  };

  const downloadPdf = async () => {
    try {
      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;
      const doc = new jsPDF();
      doc.setFontSize(16); doc.text("Muckross Rowing Club", 14, 16);
      doc.setFontSize(13); doc.text(event.name, 14, 24);
      doc.setFontSize(10); doc.text([dateText, event.distance].filter(Boolean).join(" · "), 14, 30);
      let y = 38;
      for (const g of results) {
        doc.setFontSize(12); doc.text(g.category, 14, y);
        autoTable(doc, { startY: y + 2, head: [head], body: g.rows.map(rowCells), styles: { fontSize: 9 }, headStyles: { fillColor: [10, 37, 64] } });
        y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
      }
      doc.save(`${fileBase}_results.pdf`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create PDF");
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-background p-4">
        <div className="text-sm text-muted-foreground">{[dateText, event.distance, `${crews.length} crews`].filter(Boolean).join(" · ")}</div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button className="h-12" onClick={() => void downloadPdf()}><Download className="h-4 w-4 mr-2" />Download PDF</Button>
          <Button className="h-12" variant="outline" onClick={downloadCsv}><Download className="h-4 w-4 mr-2" />Download CSV</Button>
        </div>
      </div>
      {results.length === 0 && <div className="rounded-lg border bg-background p-6 text-sm text-muted-foreground">No crews were entered.</div>}
      {results.map((g) => (
        <section key={g.category} className="rounded-lg border bg-background">
          <h2 className="border-b px-4 py-3 font-serif text-lg">{g.category}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>{head.map((h) => <th key={h} className="px-3 py-2 font-medium whitespace-nowrap">{h}</th>)}</tr>
              </thead>
              <tbody>
                {g.rows.map((r) => (
                  <tr key={r.crew.id} className="border-t">
                    {rowCells(r).map((cell, i) => (
                      <td key={i} className={cn("px-3 py-2 whitespace-nowrap", i >= 5 && "font-mono tabular-nums", i === head.length - 1 && "font-semibold")}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
