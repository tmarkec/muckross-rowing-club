import { useMemo, useState } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

// ---------- Concept2 pacing engine ----------

export type Zone = {
  key: string;
  label: string;
  description: string;
  lowPct: number; // lower % of baseline watts
  highPct: number; // upper % of baseline watts
};

export const ZONES: Zone[] = [
  { key: "AN",  label: "AN / AN2", description: "Anaerobic / Muscle capacity", lowPct: 102, highPct: 110 },
  { key: "TR",  label: "TR",        description: "Transport / Race prep",       lowPct: 90,  highPct: 98 },
  { key: "AT",  label: "AT",        description: "Anaerobic threshold",         lowPct: 80,  highPct: 88 },
  { key: "UT1", label: "UT1",       description: "Aerobic endurance",           lowPct: 66,  highPct: 78 },
  { key: "UT2", label: "UT2",       description: "Aerobic base / steady state", lowPct: 50,  highPct: 64 },
];

export function parse2kToSeconds(input: string): number | null {
  const trimmed = input.trim();
  // Accept m:ss(.t), mm:ss(.t)
  const m = trimmed.match(/^(\d{1,2}):(\d{1,2})(?:\.(\d{1,2}))?$/);
  if (!m) return null;
  const min = parseInt(m[1], 10);
  const sec = parseInt(m[2], 10);
  const tenths = m[3] ? parseFloat(`0.${m[3]}`) : 0;
  if (sec >= 60) return null;
  const total = min * 60 + sec + tenths;
  if (!isFinite(total) || total <= 0) return null;
  return total;
}

export function formatSplit(seconds: number): string {
  if (!isFinite(seconds) || seconds <= 0) return "—";
  const m = Math.floor(seconds / 60);
  const rest = seconds - m * 60;
  const s = rest.toFixed(1).padStart(4, "0");
  return `${m}:${s}`;
}

export function wattsFromSplit(splitSeconds: number): number {
  return 2.8 / Math.pow(splitSeconds / 500, 3);
}

export function splitFromWatts(watts: number): number {
  return Math.pow(2.8 / watts, 1 / 3) * 500;
}

export type ZoneRange = {
  zone: Zone;
  fastSplit: number; // seconds — faster end (higher watts)
  slowSplit: number; // seconds — slower end (lower watts)
  highWatts: number;
  lowWatts: number;
};

export function computeZones(twoKSeconds: number): ZoneRange[] {
  const baseSplit = twoKSeconds / 4;
  const baseWatts = wattsFromSplit(baseSplit);
  return ZONES.map((z) => {
    const highWatts = baseWatts * (z.highPct / 100);
    const lowWatts = baseWatts * (z.lowPct / 100);
    return {
      zone: z,
      highWatts,
      lowWatts,
      fastSplit: splitFromWatts(highWatts), // higher watts = faster split
      slowSplit: splitFromWatts(lowWatts),
    };
  });
}

// ---------- Shared UI ----------

export function CoachingSafetyGuidance() {
  return (
    <div className="space-y-3 text-sm leading-relaxed">
      <p>
        <strong>GOLDEN RULE:</strong> Do not follow this chart blindly. These numbers are an
        algorithmic baseline. Coaches must know their individual athletes, monitor recovery,
        and track physiological progress through real-world boathouse observation.
      </p>
      <p>
        <strong>DEVELOPING & LIGHTER ROWERS:</strong> Lighter, younger, or developing junior
        athletes should row at the LOWER END (slower splits) of these calculated ranges during
        UT2, UT1, and AT sessions to protect growing lower backs and build true baseline
        aerobic efficiency.
      </p>
      <p>
        <strong>SENIOR & MASTERS:</strong> Prioritize consistency over raw speed. Over a 10-12
        week training block, as technical and stroke-by-stroke aerobic capacity stabilizes,
        senior/masters athletes can gradually look to progress their target splits toward the
        HIGHER END (faster splits) of the range safely.
      </p>
      <p>
        <strong>NOT APPLICABLE TO UNDER 14s:</strong> Junior rowers under the age of 14 must
        not train using intensive split thresholds. Keep their work entirely focused on
        technique and safety.
      </p>
    </div>
  );
}

export function PacingZoneTable({ twoKSeconds }: { twoKSeconds: number }) {
  const ranges = useMemo(() => computeZones(twoKSeconds), [twoKSeconds]);
  const baseSplit = twoKSeconds / 4;
  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground">
        Based on a 2 km of <span className="font-semibold text-foreground">{formatSplit(twoKSeconds)}</span>{" "}
        (average split <span className="font-semibold text-foreground">{formatSplit(baseSplit)}/500m</span>,
        baseline {wattsFromSplit(baseSplit).toFixed(0)} W).
      </div>
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[110px]">Zone</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead className="text-right">% Watts</TableHead>
              <TableHead className="text-right">Slower → Faster /500m</TableHead>
              <TableHead className="text-right">Watts range</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ranges.map((r) => (
              <TableRow key={r.zone.key}>
                <TableCell className="font-semibold">{r.zone.label}</TableCell>
                <TableCell className="text-muted-foreground">{r.zone.description}</TableCell>
                <TableCell className="text-right tabular-nums">{r.zone.lowPct}–{r.zone.highPct}%</TableCell>
                <TableCell className="text-right tabular-nums font-medium">
                  {formatSplit(r.slowSplit)} – {formatSplit(r.fastSplit)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {r.lowWatts.toFixed(0)}–{r.highWatts.toFixed(0)} W
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function GuidanceModalButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Info className="h-4 w-4" />
          <span>⚠️ Coaching &amp; safety guidance</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Coaching &amp; safety guidance</DialogTitle>
        </DialogHeader>
        <CoachingSafetyGuidance />
      </DialogContent>
    </Dialog>
  );
}

// ---------- Standalone Coach Workbench ----------

export default function CoachesPaceCalculator() {
  const [raw, setRaw] = useState("7:30.0");
  const [submitted, setSubmitted] = useState<number | null>(parse2kToSeconds("7:30.0"));
  const [error, setError] = useState<string | null>(null);

  const handleCalc = () => {
    const secs = parse2kToSeconds(raw);
    if (secs == null) {
      setError("Enter a 2 km time formatted as mm:ss.0 (e.g. 7:30.0).");
      setSubmitted(null);
      return;
    }
    setError(null);
    setSubmitted(secs);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-background p-6">
        <h2 className="font-serif text-xl mb-1">Workbench</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Enter any 2 km erg target time and instantly see the 500 m split ranges for each
          training zone.
        </p>
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(e) => { e.preventDefault(); handleCalc(); }}
        >
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              2 km erg target (mm:ss.0)
            </label>
            <Input
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              placeholder="7:30.0"
              className="w-40 font-mono"
              inputMode="text"
            />
          </div>
          <Button type="submit">Calculate targets</Button>
        </form>
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      </div>

      {submitted != null && (
        <div className="rounded-lg border bg-background p-6">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
            <h2 className="font-serif text-xl">Training zones</h2>
            <GuidanceModalButton />
          </div>
          <PacingZoneTable twoKSeconds={submitted} />
        </div>
      )}

      <div className="rounded-lg border border-amber-300 bg-amber-50 p-5 text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100">
        <h3 className="font-semibold mb-2">⚠️ Coaching &amp; safety guidance</h3>
        <CoachingSafetyGuidance />
      </div>
    </div>
  );
}