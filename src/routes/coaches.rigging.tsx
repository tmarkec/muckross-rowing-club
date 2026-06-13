import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/coaches/rigging")({
  head: () => ({ meta: [{ title: "Rigging measurements — Coaches Corner" }, { name: "robots", content: "noindex" }] }),
  component: RiggingPage,
});

type Row = { boat: string; oar: string; inboard: string; spanOrSpread: string };
type Section = { sculling: Row[]; sweep?: Row[] };
type Category = { key: string; label: string; sections: Section };

function RigTable({ rows, spanLabel }: { rows: Row[]; spanLabel: "Span" | "Spread" }) {
  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Boat class</TableHead>
            <TableHead>Oar length (cm)</TableHead>
            <TableHead>Inboard (cm)</TableHead>
            <TableHead>{spanLabel} (cm)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.boat}>
              <TableCell className="font-medium">{r.boat}</TableCell>
              <TableCell>{r.oar}</TableCell>
              <TableCell>{r.inboard}</TableCell>
              <TableCell>{r.spanOrSpread}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function RigginGuideModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Rigging guide & notes</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quick rigging reference for coaches</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            <span className="font-semibold text-foreground">Starting point:</span>{" "}
            When in doubt, start exactly in the middle of the provided ranges.
          </p>
          <p>
            <span className="font-semibold text-foreground">Athlete profile:</span>{" "}
            Move toward the upper end of the ranges for exceptionally tall or heavy
            crews. Drop toward the lower end for lightweight or smaller athletes.
          </p>
          <p>
            <span className="font-semibold text-foreground">Troubleshooting stroke rate:</span>{" "}
            If athletes are struggling to hit or maintain target ratings, shorten the
            overall oar length by 1–2 cm but keep the inboard identical. This shortens
            the outboard lever, reducing load at the mid-drive without messing up hand
            overlap or cabin spacing.
          </p>
          <p>
            <span className="font-semibold text-foreground">Span vs spread:</span>{" "}
            Span is used for sculling (pin-to-pin across the boat). Spread is used for
            sweep (pin to the boat's centreline).
          </p>
          <p>
            <span className="font-semibold text-foreground">Span (Sculling)</span> is the
            total distance measured directly across the boat from pin to pin (typically
            159 cm – 161 cm), dictating handle overlap and initial catch load.{" "}
            <span className="font-semibold text-foreground">Spread (Sweep)</span> is
            measured from a single pin to the boat's center keel line (typically
            83 cm – 85 cm) for one-oared rowing.
          </p>
          <p>
            Altering these positions shifts the pivot point relative to the athlete's
            seat: widening the distance (pushing the pins out) reduces the blade's
            entry angle at the catch and decreases leverage, creating a lighter, easier
            stroke feel ideal for smaller or developing rowers. Conversely, narrowing
            the distance (pulling the pins in) forces a much sharper catch angle that
            drastically increases the initial leverage and resistance, creating a
            significantly heavier, high-torque load suited for powerful, heavyweight
            athletes.
          </p>
          <p className="text-xs">
            These figures are club guidance ranges — always confirm against the boat
            manufacturer's specification and adjust for individual athlete biomechanics.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RiggingPage() {
  const { loading, session, isCoach, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<Category[]>([]);
  const [category, setCategory] = useState<string>("");
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !session) void navigate({ to: "/coaches/login" });
  }, [loading, session, navigate]);

  useEffect(() => {
    if (!session) return;
    void supabase
      .from("rigging_measurements")
      .select("category_key, category_label, section, boat, oar_range, inboard_range, span_or_spread_range, sort_order")
      .order("category_label").order("section").order("sort_order")
      .then(({ data: rows }) => {
        const map = new Map<string, Category>();
        (rows ?? []).forEach((r) => {
          let cat = map.get(r.category_key);
          if (!cat) {
            cat = { key: r.category_key, label: r.category_label, sections: { sculling: [] } };
            map.set(r.category_key, cat);
          }
          const row: Row = { boat: r.boat, oar: r.oar_range, inboard: r.inboard_range, spanOrSpread: r.span_or_spread_range };
          if (r.section === "sweep") {
            if (!cat.sections.sweep) cat.sections.sweep = [];
            cat.sections.sweep.push(row);
          } else {
            cat.sections.sculling.push(row);
          }
        });
        const list = Array.from(map.values());
        setData(list);
        if (list.length > 0) setCategory((c) => c || list[0].key);
        setDataLoading(false);
      });
  }, [session]);

  const current = useMemo(() => data.find((c) => c.key === category), [data, category]);

  if (loading || !session) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  }
  if (!isCoach && !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center">Not authorised.</div>;
  }

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="font-serif text-3xl">Rigging measurements</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Club reference ranges for oar length, inboard, span and spread.
            </p>
          </div>
          <div className="flex gap-2">
            <RigginGuideModal />
            {isAdmin && (
              <Button asChild size="sm" variant="outline">
                <Link to="/coaches/admin/rigging">Edit ranges</Link>
              </Button>
            )}
            <Button asChild size="sm" variant="outline">
              <Link to="/coaches">← Coaches Corner</Link>
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-background p-6">
          {dataLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : data.length === 0 ? (
            <p className="text-sm text-muted-foreground">No rigging data yet. Ask an admin to add some.</p>
          ) : !current ? null : (
          <>
          <div className="flex flex-wrap items-end gap-4 mb-6">
            <div className="min-w-[260px]">
              <label className="text-sm font-medium mb-1 block">Category</label>
              <Select value={category} onValueChange={(v) => setCategory(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {data.map((c) => (
                    <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-6">
            <section>
              <h2 className="font-serif text-xl mb-2">Sculling</h2>
              <RigTable rows={current.sections.sculling} spanLabel="Span" />
            </section>
            {current.sections.sweep && (
              <section>
                <h2 className="font-serif text-xl mb-2">Sweep</h2>
                <RigTable rows={current.sections.sweep} spanLabel="Spread" />
              </section>
            )}
          </div>
          </>
          )}
        </div>
      </div>
    </div>
  );
}