import { useEffect, useMemo, useState } from "react";
import { format, addDays } from "date-fns";
import { CalendarIcon, Plus, Printer, Trash2, X, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
type DayName = (typeof DAYS)[number];

type Slot = { title: string; body: string };
type DayCell = {
  am: Slot | null;       // primary slot (single)
  pm: Slot | null;       // optional pm slot
  hasPm: boolean;
  dayOff: boolean;
};
type WeekRow = Record<DayName, DayCell>;

type Preset = {
  id: string;
  title: string;
  category: string;
  body: string;
  sort_order: number;
};

function emptyDay(): DayCell {
  return { am: null, pm: null, hasPm: false, dayOff: false };
}
function emptyWeek(): WeekRow {
  return DAYS.reduce((acc, d) => ({ ...acc, [d]: emptyDay() }), {} as WeekRow);
}

function nextMonday(from: Date = new Date()): Date {
  const d = new Date(from);
  const day = d.getDay(); // 0 Sun .. 6 Sat
  const diff = (8 - day) % 7 || 7;
  d.setDate(d.getDate() + (day === 1 ? 0 : diff));
  d.setHours(0, 0, 0, 0);
  return d;
}

type Props = { isAdmin: boolean };

export default function TrainingProgramBuilder({ isAdmin }: Props) {
  const [startDate, setStartDate] = useState<Date>(() => nextMonday());
  const [weeks, setWeeks] = useState<WeekRow[]>(() => [emptyWeek(), emptyWeek(), emptyWeek(), emptyWeek()]);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [assigning, setAssigning] = useState<{ wi: number; day: DayName; slot: "am" | "pm" } | null>(null);

  useEffect(() => { void loadPresets(); }, []);
  async function loadPresets() {
    const { data, error } = await supabase
      .from("training_presets")
      .select("id,title,category,body,sort_order")
      .order("sort_order");
    if (error) { toast.error("Couldn't load presets"); return; }
    setPresets((data ?? []) as Preset[]);
  }

  const isMonday = startDate.getDay() === 1;

  function dateFor(weekIndex: number, dayIndex: number): Date {
    return addDays(startDate, weekIndex * 7 + dayIndex);
  }

  function updateCell(wi: number, day: DayName, update: (c: DayCell) => DayCell) {
    setWeeks((prev) => prev.map((w, i) => (i === wi ? { ...w, [day]: update(w[day]) } : w)));
  }

  function assignPreset(p: Preset) {
    if (!assigning) return;
    updateCell(assigning.wi, assigning.day, (c) => ({
      ...c,
      dayOff: p.title.toLowerCase().includes("day off"),
      [assigning.slot]: { title: p.title, body: p.body },
    }));
    setAssigning(null);
  }

  function clearSlot(wi: number, day: DayName, slot: "am" | "pm") {
    updateCell(wi, day, (c) => ({ ...c, [slot]: null, ...(slot === "am" ? { dayOff: false } : {}) }));
  }
  function markDayOff(wi: number, day: DayName) {
    updateCell(wi, day, () => ({
      am: { title: "Day Off", body: "Rest day" }, pm: null, hasPm: false, dayOff: true,
    }));
  }
  function togglePm(wi: number, day: DayName) {
    updateCell(wi, day, (c) => ({ ...c, hasPm: !c.hasPm, ...(c.hasPm ? { pm: null } : {}) }));
  }

  function appendWeek() { setWeeks((p) => [...p, emptyWeek()]); }
  function removeWeek(i: number) { setWeeks((p) => p.filter((_, idx) => idx !== i)); }

  return (
    <div className="space-y-6 print:space-y-3">
      {/* Controls */}
      <div className="rounded-lg border bg-background p-4 print:hidden">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Cycle Start Date (Must be a Monday)
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-[260px] justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(startDate, "EEEE dd MMM yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(d) => d && setStartDate(d)}
                  weekStartsOn={1}
                  disabled={(d) => d.getDay() !== 1}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            {!isMonday && (
              <p className="text-xs text-destructive">Start date must be a Monday.</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={() => window.print()} variant="default">
              <Printer className="mr-2 h-4 w-4" /> Download Training Program
            </Button>
          </div>
        </div>
      </div>

      {/* Print header */}
      <div className="hidden print:block">
        <h1 className="text-2xl font-semibold">Training Program — {format(startDate, "dd MMM yyyy")}</h1>
        <p className="text-xs text-muted-foreground">{weeks.length} week cycle</p>
      </div>

      {/* Desktop grid */}
      <div className="hidden md:block print:block overflow-x-auto rounded-lg border bg-background">
        <table className="w-full border-collapse text-xs print:text-[10px]">
          <thead>
            <tr className="bg-muted/40">
              <th className="w-20 border-b border-r p-2 text-left font-semibold">Week</th>
              {DAYS.map((d, di) => (
                <th key={d} className="border-b border-r p-2 text-left font-semibold">
                  <div>{d}</div>
                  <div className="text-[10px] text-muted-foreground font-normal">
                    {format(dateFor(0, di), "dd/MM")}
                  </div>
                </th>
              ))}
              <th className="w-12 border-b p-2 print:hidden" />
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, wi) => (
              <tr key={wi} className="align-top">
                <td className="border-b border-r p-2 font-semibold">
                  <div>Week {wi + 1}</div>
                  <div className="text-[10px] text-muted-foreground font-normal">
                    {format(dateFor(wi, 0), "dd/MM")}
                  </div>
                </td>
                {DAYS.map((d, di) => {
                  const cell = week[d];
                  return (
                    <td key={d} className="border-b border-r p-1.5 min-w-[140px]">
                      <div className="text-[10px] text-muted-foreground mb-1 print:mb-0.5">
                        {format(dateFor(wi, di), "dd/MM")}
                      </div>
                      <SlotBlock
                        label={cell.hasPm ? "AM" : undefined}
                        slot={cell.am}
                        dayOff={cell.dayOff}
                        onAssign={() => setAssigning({ wi, day: d, slot: "am" })}
                        onClear={() => clearSlot(wi, d, "am")}
                        onDayOff={() => markDayOff(wi, d)}
                      />
                      {cell.hasPm && (
                        <div className="mt-1">
                          <SlotBlock
                            label="PM"
                            slot={cell.pm}
                            onAssign={() => setAssigning({ wi, day: d, slot: "pm" })}
                            onClear={() => clearSlot(wi, d, "pm")}
                          />
                        </div>
                      )}
                      {!cell.dayOff && (
                        <button
                          type="button"
                          onClick={() => togglePm(wi, d)}
                          className="mt-1 w-full rounded border border-dashed py-0.5 text-[10px] text-muted-foreground hover:bg-muted print:hidden"
                        >
                          {cell.hasPm ? "− Remove PM" : "+ Add PM Session"}
                        </button>
                      )}
                    </td>
                  );
                })}
                <td className="border-b p-1 text-center print:hidden">
                  {weeks.length > 1 && (
                    <Button size="icon" variant="ghost" onClick={() => removeWeek(wi)}>
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile accordion */}
      <div className="md:hidden print:hidden space-y-3">
        {weeks.map((week, wi) => (
          <details key={wi} className="rounded-lg border bg-background" open={wi === 0}>
            <summary className="cursor-pointer list-none p-3 font-semibold flex justify-between items-center">
              <span>Week {wi + 1} — starts {format(dateFor(wi, 0), "dd/MM")}</span>
              <span className="text-xs text-muted-foreground">tap</span>
            </summary>
            <div className="divide-y">
              {DAYS.map((d, di) => {
                const cell = week[d];
                return (
                  <div key={d} className="p-3">
                    <div className="text-xs font-semibold mb-2">
                      {d} <span className="text-muted-foreground font-normal">{format(dateFor(wi, di), "dd/MM")}</span>
                    </div>
                    <SlotBlock
                      label={cell.hasPm ? "AM" : undefined}
                      slot={cell.am}
                      dayOff={cell.dayOff}
                      onAssign={() => setAssigning({ wi, day: d, slot: "am" })}
                      onClear={() => clearSlot(wi, d, "am")}
                      onDayOff={() => markDayOff(wi, d)}
                    />
                    {cell.hasPm && (
                      <div className="mt-2">
                        <SlotBlock label="PM" slot={cell.pm}
                          onAssign={() => setAssigning({ wi, day: d, slot: "pm" })}
                          onClear={() => clearSlot(wi, d, "pm")} />
                      </div>
                    )}
                    {!cell.dayOff && (
                      <button type="button" onClick={() => togglePm(wi, d)}
                        className="mt-2 w-full rounded border border-dashed py-1 text-xs text-muted-foreground">
                        {cell.hasPm ? "− Remove PM" : "+ Add PM Session"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </details>
        ))}
      </div>

      <div className="flex justify-center print:hidden">
        <Button variant="outline" onClick={appendWeek}>
          <Plus className="mr-2 h-4 w-4" /> Add Week to Schedule
        </Button>
      </div>

      {/* Assign preset modal */}
      <Dialog open={!!assigning} onOpenChange={(o) => !o && setAssigning(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Choose a session preset</DialogTitle>
            <DialogDescription>
              {assigning ? `${assigning.day} ${assigning.slot.toUpperCase()} — Week ${assigning.wi + 1}` : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 max-h-[60vh] overflow-y-auto">
            {presets.map((p) => (
              <button key={p.id} type="button" onClick={() => assignPreset(p)}
                className="text-left rounded-md border p-3 hover:border-primary hover:bg-muted/40 transition">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium">{p.title}</div>
                  <Badge variant="secondary">{p.category}</Badge>
                </div>
                <pre className="mt-1 whitespace-pre-wrap font-sans text-xs text-muted-foreground">{p.body}</pre>
              </button>
            ))}
            {presets.length === 0 && <p className="text-sm text-muted-foreground">No presets yet.</p>}
          </div>
          <DialogFooter className="flex-wrap gap-2 sm:justify-between">
            {assigning && (
              <Button variant="ghost" onClick={() => { markDayOff(assigning.wi, assigning.day); setAssigning(null); }}>
                Mark Day Off
              </Button>
            )}
            <Button variant="outline" onClick={() => setAssigning(null)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isAdmin && <PresetManager presets={presets} onChange={loadPresets} />}

      <PrintStyles />
    </div>
  );
}

function SlotBlock({
  label, slot, dayOff, onAssign, onClear, onDayOff,
}: {
  label?: string;
  slot: Slot | null;
  dayOff?: boolean;
  onAssign: () => void;
  onClear: () => void;
  onDayOff?: () => void;
}) {
  if (!slot) {
    return (
      <div className="space-y-1 print:hidden">
        <button type="button" onClick={onAssign}
          className="w-full rounded border border-dashed py-2 text-[11px] text-muted-foreground hover:bg-muted">
          {label ? `+ Assign ${label}` : "+ Assign session"}
        </button>
        {onDayOff && (
          <button type="button" onClick={onDayOff}
            className="w-full text-[10px] text-muted-foreground hover:text-foreground">
            mark day off
          </button>
        )}
      </div>
    );
  }
  return (
    <div className={cn(
      "rounded border p-1.5 group relative",
      dayOff ? "bg-muted/50 text-muted-foreground" : "bg-primary/5",
    )}>
      <div className="flex items-start justify-between gap-1">
        <div className="font-medium text-[11px] leading-tight">
          {label && <span className="mr-1 text-[9px] uppercase text-muted-foreground">{label}</span>}
          {slot.title}
        </div>
        <button type="button" onClick={onClear}
          className="opacity-0 group-hover:opacity-100 print:hidden text-muted-foreground hover:text-destructive">
          <X className="h-3 w-3" />
        </button>
      </div>
      <pre className="mt-0.5 whitespace-pre-wrap font-sans text-[10px] leading-snug text-muted-foreground print:text-foreground">
        {slot.body}
      </pre>
    </div>
  );
}

// ---------- Admin preset manager ----------

function PresetManager({ presets, onChange }: { presets: Preset[]; onChange: () => void | Promise<void> }) {
  const [editing, setEditing] = useState<Preset | null>(null);
  const [open, setOpen] = useState(false);

  function openNew() {
    setEditing({ id: "", title: "", category: "General", body: "", sort_order: (presets.at(-1)?.sort_order ?? 0) + 10 });
    setOpen(true);
  }
  function openEdit(p: Preset) { setEditing(p); setOpen(true); }

  async function save() {
    if (!editing) return;
    if (!editing.title.trim() || !editing.body.trim()) { toast.error("Title and body required"); return; }
    const payload = { title: editing.title, category: editing.category, body: editing.body, sort_order: editing.sort_order };
    const { error } = editing.id
      ? await supabase.from("training_presets").update(payload).eq("id", editing.id)
      : await supabase.from("training_presets").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved");
    setOpen(false); setEditing(null);
    await onChange();
  }

  async function remove(id: string) {
    if (!confirm("Delete this preset?")) return;
    const { error } = await supabase.from("training_presets").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    await onChange();
  }

  return (
    <div className="rounded-lg border bg-background p-6 print:hidden">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div>
          <h2 className="font-serif text-xl">Global Session Preset Manager</h2>
          <p className="text-xs text-muted-foreground">Admin only — edits the master template library.</p>
        </div>
        <Button size="sm" onClick={openNew}><Plus className="mr-1.5 h-4 w-4" /> New preset</Button>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {presets.map((p) => (
          <div key={p.id} className="rounded-md border p-3 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{p.title}</span>
                <Badge variant="secondary" className="text-[10px]">{p.category}</Badge>
              </div>
              <pre className="mt-1 whitespace-pre-wrap font-sans text-xs text-muted-foreground">{p.body}</pre>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button size="icon" variant="ghost" onClick={() => openEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button>
              <Button size="icon" variant="ghost" onClick={() => remove(p.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit preset" : "New preset"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Label>Title</Label>
                <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>Category</Label>
                  <Input value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
                </div>
                <div className="grid gap-1.5">
                  <Label>Sort order</Label>
                  <Input type="number" value={editing.sort_order}
                    onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value || "0", 10) })} />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label>Body</Label>
                <Textarea rows={6} value={editing.body}
                  onChange={(e) => setEditing({ ...editing, body: e.target.value })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PrintStyles() {
  return (
    <style>{`
      @media print {
        @page { size: A4 landscape; margin: 10mm; }
        body { background: white !important; }
        header, nav, aside, footer, [data-print-hide] { display: none !important; }
        .print\\:hidden { display: none !important; }
        .print\\:block { display: block !important; }
      }
    `}</style>
  );
}