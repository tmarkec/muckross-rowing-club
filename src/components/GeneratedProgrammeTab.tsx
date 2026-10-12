import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { addDays, format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
type Slot = { title: string; body: string } | null;
type DayCell = { am: Slot; pm: Slot; hasPm: boolean; dayOff: boolean; notes?: string };
type Data = { weeks: Record<string, DayCell>[]; weekNotes?: string[] };
type Row = { start_date: string; data: Data; updated_at: string };

export default function GeneratedProgrammeTab({ groupId }: { groupId: string }) {
  const [row, setRow] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("training_programmes")
        .select("start_date,data,updated_at")
        .eq("group_id", groupId)
        .maybeSingle();
      setRow((data as unknown as Row) ?? null);
      setLoading(false);
    };
    void load();
    const ch = supabase
      .channel(`programme-${groupId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "training_programmes", filter: `group_id=eq.${groupId}` }, () => void load())
      .subscribe();
    return () => { void supabase.removeChannel(ch); };
  }, [groupId]);

  if (loading) return <p className="py-6 text-sm text-muted-foreground">Loading…</p>;
  if (!row) {
    return (
      <div className="rounded-lg border bg-background p-6 text-sm text-muted-foreground">
        No programme saved for this group yet.{" "}
        <Button asChild variant="link" className="px-1"><Link to="/coaches/program">Open the Training Programme Builder</Link></Button>
      </div>
    );
  }

  const start = new Date(row.start_date + "T00:00:00");
  const weeks = row.data.weeks ?? [];

  const slot = (label: string | undefined, s: Slot, off?: boolean) =>
    s && (
      <div className={cn("rounded border p-1.5", off ? "bg-muted/50 text-muted-foreground" : "bg-primary/5")}>
        <div className="font-medium text-[11px] leading-tight">
          {label && <span className="mr-1 text-[9px] uppercase text-muted-foreground">{label}</span>}
          {s.title}
        </div>
        {s.body && <pre className="mt-0.5 whitespace-pre-wrap font-sans text-[10px] text-muted-foreground">{s.body}</pre>}
      </div>
    );

  return (
    <div className="space-y-4 mt-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-serif text-xl">Programme from {format(start, "EEEE dd MMM yyyy")}</h2>
          <p className="text-xs text-muted-foreground">
            {weeks.length} weeks · last updated {format(new Date(row.updated_at), "dd MMM yyyy HH:mm")}
          </p>
        </div>
        <Button asChild size="sm" variant="outline"><Link to="/coaches/program">Edit in builder</Link></Button>
      </div>
      {weeks.map((w, wi) => (
        <div key={wi} className="rounded-lg border bg-background">
          <div className="border-b p-3 font-semibold text-sm">
            Week {wi + 1} <span className="font-normal text-muted-foreground">starts {format(addDays(start, wi * 7), "dd/MM")}</span>
          </div>
          <div className="grid gap-2 p-3 sm:grid-cols-2 lg:grid-cols-7">
            {DAYS.map((d, di) => {
              const c = w[d];
              return (
                <div key={d} className="space-y-1">
                  <div className="text-xs font-semibold">
                    {d.slice(0, 3)} <span className="font-normal text-muted-foreground">{format(addDays(start, wi * 7 + di), "dd/MM")}</span>
                  </div>
                  {c ? (
                    <>
                      {slot(c.hasPm ? "AM" : undefined, c.am, c.dayOff)}
                      {c.hasPm && slot("PM", c.pm)}
                      {!c.am && !c.pm && <p className="text-[10px] italic text-muted-foreground">No session</p>}
                      {c.notes && <p className="text-[10px] italic whitespace-pre-wrap text-muted-foreground">{c.notes}</p>}
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>
          {row.data.weekNotes?.[wi] && (
            <div className="border-t bg-muted/20 p-3 text-xs whitespace-pre-wrap"><b>Weekly notes:</b> {row.data.weekNotes[wi]}</div>
          )}
        </div>
      ))}
    </div>
  );
}
