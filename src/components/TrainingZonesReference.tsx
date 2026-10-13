import { Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type ZoneRow = {
  zone: string;
  name: string;
  goal: string;
  duration: string;
  ratio: string;
  examples: string[];
  tone: string;
};

export const TRAINING_ZONES: ZoneRow[] = [
  {
    zone: "AN",
    name: "Anaerobic capacity",
    goal: "Peak speed, power, and explosive starts",
    duration: "0.5 to 1.5 min",
    ratio: "1:4 or 1:5 (long rest)",
    examples: ["8 x 250m max sprints", "30 to 60 stroke max efforts", "10 x 1 min (4 min rest)"],
    tone: "bg-chart-1/10 border-chart-1/40",
  },
  {
    zone: "TR",
    name: "Transport and race prep",
    goal: "VO2 max, race speed, and endurance",
    duration: "2 to 7 min",
    ratio: "1:2 or 1:3",
    examples: ["6 x 2 min at race pace", "3 x 1000m", "5 x 750m"],
    tone: "bg-chart-5/10 border-chart-5/40",
  },
  {
    zone: "AT",
    name: "Anaerobic threshold",
    goal: "Lactate clearance, aerobic power, and stamina",
    duration: "6 to 20 min",
    ratio: "4:1 or 2:1",
    examples: ["2 x 20 min (5 min rest)", "4 x 7 min", "3 x 2000m constant pace"],
    tone: "bg-chart-2/10 border-chart-2/40",
  },
  {
    zone: "UT1",
    name: "Aerobic endurance",
    goal: "Harder steady state, technique, and efficiency",
    duration: "20 to 60 min",
    ratio: "5:1 or continuous",
    examples: ["3 x 15 min (3 min rest)", "2 x 30 min", "10km continuous rate piece"],
    tone: "bg-chart-3/10 border-chart-3/40",
  },
  {
    zone: "UT2",
    name: "Basic endurance",
    goal: "Aerobic base building, recovery, and fat utilisation",
    duration: "30 to 90 min",
    ratio: "Continuous (no rest needed)",
    examples: ["45 to 90 min continuous steady row", "2 x 45 min (2 min drink break)", "Easy recovery sessions"],
    tone: "bg-chart-4/10 border-chart-4/40",
  },
];

export function TrainingZonesReferenceButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Lightbulb className="h-4 w-4" />
          Helper Tool
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[85vh] w-[calc(100%-2rem)] max-w-4xl flex-col overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Training Zones Reference Guide</DialogTitle>
          <DialogDescription>
            Quick reference for planning sessions: zone focus, work duration, rest ratios, and typical pieces.
          </DialogDescription>
        </DialogHeader>

        <div className="min-w-0 max-w-full overflow-x-auto rounded-md border">
          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow className="bg-muted/60 hover:bg-muted/60">
                <TableHead className="w-[90px] text-xs uppercase tracking-wider">Zone</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Focus and primary goal</TableHead>
                <TableHead className="whitespace-nowrap text-xs uppercase tracking-wider">Work duration</TableHead>
                <TableHead className="whitespace-nowrap text-xs uppercase tracking-wider">Work : rest</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Practical examples</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {TRAINING_ZONES.map((z) => (
                <TableRow key={z.zone} className="align-top">
                  <TableCell className="py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-bold",
                        z.tone,
                      )}
                    >
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
                      {z.zone}
                    </span>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="font-semibold leading-tight">{z.name}</div>
                    <div className="text-xs text-muted-foreground">{z.goal}</div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap py-3 text-sm tabular-nums">{z.duration}</TableCell>
                  <TableCell className="whitespace-nowrap py-3 text-sm tabular-nums">{z.ratio}</TableCell>
                  <TableCell className="py-3">
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      {z.examples.map((ex) => (
                        <li key={ex}>{ex}</li>
                      ))}
                    </ul>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <p className="text-xs text-muted-foreground md:hidden">
          Swipe the table sideways to see all columns.
        </p>
        <p className="text-xs text-muted-foreground">
          Use these as a planning baseline, then adjust to the athletes you are coaching.
        </p>
      </DialogContent>
    </Dialog>
  );
}
