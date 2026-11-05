import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/coaches/race-clocker/")({
  head: () => ({ meta: [{ title: "Race Clocker — Coaches Corner" }, { name: "robots", content: "noindex" }] }),
  component: RaceClockerList,
});

type EventRow = {
  id: string; name: string; distance: string | null; start_date: string | null; end_date: string | null;
  status: string; race_crews: { count: number }[];
};

function RaceClockerList() {
  const { loading, session, isCoach, isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventRow[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<EventRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { if (!loading && !session) void navigate({ to: "/coaches/login" }); }, [loading, session, navigate]);

  useEffect(() => {
    if (!session || (!isCoach && !isAdmin)) return;
    const load = async () => {
      const { data, error } = await supabase
        .from("race_events")
        .select("id,name,distance,start_date,end_date,status,race_crews(count)")
        .order("start_date", { ascending: false, nullsFirst: false });
      if (error) toast.error(error.message);
      setEvents((data as unknown as EventRow[]) ?? []);
    };
    void load();
    const ch = supabase.channel("race-events-list")
      .on("postgres_changes", { event: "*", schema: "public", table: "race_events" }, () => void load())
      .subscribe();
    return () => { void supabase.removeChannel(ch); };
  }, [session, isCoach, isAdmin]);

  if (loading || !session) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  if (!isCoach && !isAdmin) return <div className="min-h-screen flex items-center justify-center">Not authorised.</div>;

  const create = async () => {
    if (!user) return;
    setCreating(true);
    const { data, error } = await supabase.from("race_events").insert({ name: "New event", created_by: user.id }).select("id").single();
    setCreating(false);
    if (error || !data) return toast.error(error?.message ?? "Could not create event");
    await supabase.from("race_event_controllers").insert({ event_id: data.id, coach_id: user.id });
    void navigate({ to: "/coaches/race-clocker/$eventId", params: { eventId: data.id } });
  };

  const deleteEvent = async () => {
    if (!isAdmin || !deleteTarget || deleting) return;
    setDeleting(true);
    try {
      const { data, error } = await supabase.from("race_events").delete().eq("id", deleteTarget.id).select("id").maybeSingle();
      if (error || !data) {
        toast.error(error?.message ?? "Event could not be deleted. Refresh and try again.");
        return;
      }
      setEvents((current) => current?.filter((event) => event.id !== data.id) ?? null);
      setDeleteTarget(null);
      toast.success("Event and all its crews permanently deleted.");
    } catch {
      toast.error("Event could not be deleted. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const today = new Date().toISOString().slice(0, 10);
  const live = (events ?? []).filter((e) => e.status === "running");
  const past = (events ?? []).filter((e) => e.status === "finished");
  const upcoming = (events ?? []).filter((e) => e.status === "draft");

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-5 flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="font-serif text-3xl">Race Clocker</h1>
            <p className="text-sm text-muted-foreground mt-1">Time crews on the water, one stopwatch per crew.</p>
          </div>
          <Button asChild size="sm" variant="outline"><Link to="/coaches">← Coaches Corner</Link></Button>
        </div>
        <Button onClick={create} disabled={creating} className="mb-5 h-12"><Plus className="h-4 w-4 mr-2" />Create event</Button>
        {events === null ? <p className="text-sm text-muted-foreground">Loading events…</p> : (
          <Tabs defaultValue={live.length ? "live" : "upcoming"}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
              <TabsTrigger value="live">Live ({live.length})</TabsTrigger>
              <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
            </TabsList>
            {([["upcoming", upcoming], ["live", live], ["past", past]] as const).map(([k, list]) => (
              <TabsContent key={k} value={k} className="space-y-3 mt-4">
                {list.length === 0 ? <div className="rounded-lg border bg-background p-6 text-sm text-muted-foreground">No events here yet.</div> :
                  list.map((e) => (
                    <div key={e.id} className="rounded-lg border bg-background p-4 hover:border-primary transition">
                    <Link to="/coaches/race-clocker/$eventId" params={{ eventId: e.id }} className="block">
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-serif text-lg">{e.name}</div>
                        <Badge variant={e.status === "running" ? "default" : e.status === "finished" ? "secondary" : "outline"}>
                          {e.status === "draft" ? "Draft" : e.status === "running" ? "Live" : "Finished"}
                        </Badge>
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {[e.distance, e.start_date && (e.end_date && e.end_date !== e.start_date ? `${e.start_date} – ${e.end_date}` : e.start_date), `${e.race_crews?.[0]?.count ?? 0} crews`].filter(Boolean).join(" · ")}
                        {e.status === "draft" && e.start_date && e.start_date < today ? " · date passed" : ""}
                      </div>
                    </Link>
                    {isAdmin && (
                      <div className="mt-3 flex justify-end">
                        <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(e)} aria-label={`Delete ${e.name} permanently`}>
                          <Trash2 className="mr-2 h-4 w-4" />Delete event
                        </Button>
                      </div>
                    )}
                    </div>
                  ))}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open && !deleting) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently delete event?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes “{deleteTarget?.name}” and all its crews, split times, results and coach assignments. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={deleting} onClick={(event) => { event.preventDefault(); void deleteEvent(); }}>
              {deleting ? "Deleting…" : "Delete permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
