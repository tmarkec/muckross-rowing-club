import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
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

const DATA: Record<string, { label: string; sections: Section }> = {
  "j17_18_m": {
    label: "J17 & J18 Male (Senior Juniors)",
    sections: {
      sculling: [
        { boat: "Single Scull (1x)", oar: "286 – 288", inboard: "87 – 89", spanOrSpread: "158 – 160" },
        { boat: "Double Scull (2x)", oar: "286 – 288", inboard: "87 – 89", spanOrSpread: "159 – 160" },
        { boat: "Quad Scull (4x)",   oar: "287 – 289", inboard: "88 – 89", spanOrSpread: "159 – 161" },
      ],
      sweep: [
        { boat: "Pair (2-)",         oar: "370 – 372", inboard: "114 – 116", spanOrSpread: "84 – 86" },
        { boat: "Coxed Four (4+)",   oar: "370 – 372", inboard: "114 – 115", spanOrSpread: "84 – 85" },
        { boat: "Coxless Four (4-)", oar: "371 – 373", inboard: "113 – 115", spanOrSpread: "83 – 85" },
        { boat: "Eight (8+)",        oar: "371 – 373", inboard: "113 – 114", spanOrSpread: "83 – 84" },
      ],
    },
  },
  "j17_18_f": {
    label: "J17 & J18 Female (Senior Juniors)",
    sections: {
      sculling: [
        { boat: "Single Scull (1x)", oar: "284 – 286", inboard: "86 – 88", spanOrSpread: "157 – 159" },
        { boat: "Double Scull (2x)", oar: "284 – 286", inboard: "86 – 88", spanOrSpread: "158 – 159" },
        { boat: "Quad Scull (4x)",   oar: "285 – 287", inboard: "87 – 88", spanOrSpread: "158 – 160" },
      ],
      sweep: [
        { boat: "Pair (2-)",         oar: "368 – 370", inboard: "113 – 115", spanOrSpread: "83 – 85" },
        { boat: "Coxed Four (4+)",   oar: "368 – 370", inboard: "113 – 114", spanOrSpread: "83 – 84" },
        { boat: "Coxless Four (4-)", oar: "369 – 371", inboard: "112 – 114", spanOrSpread: "82 – 84" },
        { boat: "Eight (8+)",        oar: "369 – 371", inboard: "112 – 113", spanOrSpread: "82 – 83" },
      ],
    },
  },
  "j15_16_m": {
    label: "J15 & J16 Male",
    sections: {
      sculling: [
        { boat: "Single Scull (1x)", oar: "284 – 286", inboard: "86 – 88", spanOrSpread: "157 – 159" },
        { boat: "Double Scull (2x)", oar: "284 – 286", inboard: "86 – 88", spanOrSpread: "158 – 159" },
        { boat: "Quad Scull (4x)",   oar: "285 – 287", inboard: "87 – 88", spanOrSpread: "158 – 160" },
      ],
      sweep: [
        { boat: "Pair (2-)",         oar: "368 – 370", inboard: "113 – 115", spanOrSpread: "83 – 85" },
        { boat: "Coxed Four (4+)",   oar: "368 – 370", inboard: "113 – 114", spanOrSpread: "83 – 84" },
        { boat: "Coxless Four (4-)", oar: "369 – 371", inboard: "112 – 114", spanOrSpread: "82 – 84" },
        { boat: "Eight (8+)",        oar: "369 – 371", inboard: "112 – 113", spanOrSpread: "82 – 83" },
      ],
    },
  },
  "j15_16_f": {
    label: "J15 & J16 Female",
    sections: {
      sculling: [
        { boat: "Single Scull (1x)", oar: "282 – 284", inboard: "85 – 87", spanOrSpread: "156 – 158" },
        { boat: "Double Scull (2x)", oar: "282 – 284", inboard: "85 – 87", spanOrSpread: "156 – 158" },
        { boat: "Quad Scull (4x)",   oar: "283 – 285", inboard: "86 – 87", spanOrSpread: "157 – 159" },
      ],
      sweep: [
        { boat: "Pair (2-)",         oar: "366 – 368", inboard: "112 – 114", spanOrSpread: "82 – 84" },
        { boat: "Coxed Four (4+)",   oar: "366 – 368", inboard: "112 – 113", spanOrSpread: "82 – 83" },
        { boat: "Coxless Four (4-)", oar: "367 – 369", inboard: "111 – 113", spanOrSpread: "81 – 83" },
        { boat: "Eight (8+)",        oar: "367 – 369", inboard: "112 – 113", spanOrSpread: "82 – 84" },
      ],
    },
  },
  "j14_mixed": {
    label: "J14 & Younger (Mixed / Development) — Sculling only",
    sections: {
      sculling: [
        { boat: "Single Scull (1x)", oar: "280 – 283", inboard: "85 – 87", spanOrSpread: "156 – 158" },
        { boat: "Double Scull (2x)", oar: "280 – 283", inboard: "85 – 87", spanOrSpread: "156 – 158" },
        { boat: "Coxed Quad (4x+)",  oar: "281 – 284", inboard: "86 – 87", spanOrSpread: "157 – 159" },
      ],
    },
  },
};

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
  const [category, setCategory] = useState<keyof typeof DATA>("j17_18_m");

  useEffect(() => {
    if (!loading && !session) void navigate({ to: "/coaches/login" });
  }, [loading, session, navigate]);

  const current = useMemo(() => DATA[category], [category]);

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
            <Button asChild size="sm" variant="outline">
              <Link to="/coaches">← Dashboard</Link>
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-background p-6">
          <div className="flex flex-wrap items-end gap-4 mb-6">
            <div className="min-w-[260px]">
              <label className="text-sm font-medium mb-1 block">Category</label>
              <Select value={category} onValueChange={(v) => setCategory(v as keyof typeof DATA)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(DATA).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
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
        </div>
      </div>
    </div>
  );
}