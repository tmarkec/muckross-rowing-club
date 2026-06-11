import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PacingZoneTable, GuidanceModalButton } from "@/components/CoachesPaceCalculator";

export const Route = createFileRoute("/coaches/groups/$groupId/athletes/$athleteId")({
  head: () => ({ meta: [{ title: "Athlete profile — Coaches Corner" }, { name: "robots", content: "noindex" }] }),
  component: AthleteProfile,
});

type Athlete = {
  id: string;
  group_id: string;
  first_name: string;
  last_name: string;
  dob: string | null;
  erg_2k_seconds: number | null;
  notes: string | null;
};
type Attendance = {
  id: string;
  athlete_id: string;
  session_date: string;
  session_part: "single" | "am" | "pm";
  status: "present" | "absent";
};

function fmt2k(seconds: number | null): string {
  if (seconds == null) return "—";
  const m = Math.floor(seconds / 60);
  const s = (seconds % 60).toFixed(1).padStart(4, "0");
  return `${m}:${s}`;
}

function ageFromDob(dob: string | null): string {
  if (!dob) return "—";
  const d = new Date(dob);
  const diff = Date.now() - d.getTime();
  const age = new Date(diff).getUTCFullYear() - 1970;
  return `${age}`;
}

function ageNumberFromDob(dob: string | null): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return null;
  const diff = Date.now() - d.getTime();
  return new Date(diff).getUTCFullYear() - 1970;
}

function AthleteProfile() {
  const { groupId, athleteId } = Route.useParams();
  const { loading, session, isCoach, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [records, setRecords] = useState<Attendance[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (!loading && !session) void navigate({ to: "/coaches/login" });
  }, [loading, session, navigate]);

  const load = useCallback(async () => {
    setBusy(true);
    const { data: a } = await supabase.from("athletes").select("*").eq("id", athleteId).eq("group_id", groupId).maybeSingle();
    setAthlete((a as Athlete | null) ?? null);
    if (a) {
      const { data: att } = await supabase.from("attendance").select("*").eq("athlete_id", athleteId).order("session_date", { ascending: false });
      setRecords((att ?? []) as Attendance[]);
    }
    setBusy(false);
  }, [athleteId, groupId]);

  useEffect(() => { if (session) void load(); }, [load, session]);

  // Group by year-month
  const monthly = useMemo(() => {
    const map = new Map<string, Attendance[]>();
    records.forEach((r) => {
      const key = r.session_date.slice(0, 7); // YYYY-MM
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    });
    return Array.from(map.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([month, rs]) => {
        const present = rs.filter((r) => r.status === "present").length;
        const pct = Math.round((present / rs.length) * 100);
        const label = new Date(`${month}-01`).toLocaleString("default", { month: "long", year: "numeric" });
        return { month, label, present, total: rs.length, pct, rows: rs };
      });
  }, [records]);

  if (loading || !session) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  if (!isCoach && !isAdmin) return <div className="min-h-screen flex items-center justify-center">Not authorised.</div>;
  if (busy) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  if (!athlete) return <div className="min-h-screen flex items-center justify-center">Athlete not found.</div>;

  const lifetimePct = records.length === 0 ? null : Math.round(records.filter((r) => r.status === "present").length / records.length * 100);

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="font-serif text-3xl">{athlete.first_name} {athlete.last_name}</h1>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link to="/coaches/groups/$groupId" params={{ groupId }}>← Back to group</Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-3 sm:grid-cols-4 mb-6">
          <Stat label="Date of birth" value={athlete.dob ?? "—"} sub={athlete.dob ? `Age ${ageFromDob(athlete.dob)}` : undefined} />
          <Stat label="2 km PB" value={fmt2k(athlete.erg_2k_seconds)} />
          <Stat label="Overall attendance" value={lifetimePct == null ? "—" : `${lifetimePct}%`} sub={`${records.filter(r => r.status === "present").length}/${records.length} sessions`} />
          <Stat label="Months recorded" value={`${monthly.length}`} />
        </div>

        {athlete.notes && (
          <div className="mb-6 rounded-lg border bg-background p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notes</div>
            <p className="mt-1 text-sm whitespace-pre-wrap">{athlete.notes}</p>
          </div>
        )}

        {/* Pacing zones */}
        <div className="mb-6 rounded-lg border bg-background p-6">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
            <h2 className="font-serif text-xl">Training pace zones</h2>
            {athlete.erg_2k_seconds != null && (ageNumberFromDob(athlete.dob) ?? 99) >= 14 && (
              <GuidanceModalButton />
            )}
          </div>
          {(() => {
            const age = ageNumberFromDob(athlete.dob);
            if (age != null && age < 14) {
              return (
                <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100">
                  📊 Pacing zones are not applicable to U14 athletes. Focus should remain
                  entirely on technique, active fun, team boat dynamics, and getting moving
                  together as a group!
                </div>
              );
            }
            if (athlete.erg_2k_seconds == null) {
              return (
                <p className="text-sm text-muted-foreground">
                  No 2 km score on file. Enter a test time to view your pacing profiles.
                </p>
              );
            }
            return <PacingZoneTable twoKSeconds={athlete.erg_2k_seconds} />;
          })()}
        </div>

        <div className="rounded-lg border bg-background p-6">
          <h2 className="font-serif text-xl mb-4">Attendance by month</h2>
          {monthly.length === 0 ? (
            <p className="text-sm text-muted-foreground">No attendance recorded yet.</p>
          ) : (
            <div className="space-y-4">
              {monthly.map((m) => {
                const colour = m.pct >= 80 ? "bg-green-500" : m.pct >= 50 ? "bg-yellow-500" : "bg-red-500";
                const textColour = m.pct >= 80 ? "text-green-600" : m.pct >= 50 ? "text-yellow-600" : "text-red-600";
                return (
                  <div key={m.month}>
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className="text-sm font-medium">{m.label}</span>
                      <span className={`text-sm font-semibold tabular-nums ${textColour}`}>{m.pct}% <span className="text-xs text-muted-foreground font-normal">({m.present}/{m.total})</span></span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div className={`h-full ${colour}`} style={{ width: `${m.pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-serif text-2xl">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}