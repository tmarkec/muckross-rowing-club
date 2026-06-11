import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Plus, Printer, RotateCcw, Trash2, X, Search, Users } from "lucide-react";

type Group = { id: string; name: string };
type Athlete = { id: string; first_name: string; last_name: string };
type Boat = { id: string; name: string; type: string };

const BOAT_CLASSES = ["1x", "2x", "2-", "4x", "4x+", "4-", "4+", "8x", "8+"] as const;
type BoatClass = typeof BOAT_CLASSES[number];

function seatsFor(cls: BoatClass): string[] {
  switch (cls) {
    case "1x": return ["Stroke"];
    case "2x":
    case "2-": return ["Bow", "Stroke"];
    case "4x":
    case "4-": return ["Bow", "2", "3", "Stroke"];
    case "4x+":
    case "4+": return ["Bow", "2", "3", "Stroke", "Cox"];
    case "8x":
    case "8+": return ["Bow", "2", "3", "4", "5", "6", "7", "Stroke", "Cox"];
  }
}

type Crew = {
  id: string;
  boatId: string | null;
  boatLabel: string;
  cls: BoatClass;
  notes: string;
  seats: Record<string, string | null>; // seat name -> athleteId
};

const uid = () => Math.random().toString(36).slice(2, 10);

export default function RegattaLineupBoard() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupId, setGroupId] = useState<string>("");
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [boats, setBoats] = useState<Boat[]>([]);
  const [search, setSearch] = useState("");
  const [selectedAthlete, setSelectedAthlete] = useState<string | null>(null);
  const [crews, setCrews] = useState<Crew[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [seatPicker, setSeatPicker] = useState<{ crewId: string; seat: string } | null>(null);

  // Load groups
  useEffect(() => {
    void supabase.from("groups").select("id, name").order("name").then(({ data }) => {
      const list = (data ?? []) as Group[];
      setGroups(list);
      if (list.length && !groupId) setGroupId(list[0].id);
    });
    void supabase.from("club_boats" as never).select("id, name, type").order("type").order("name").then(({ data }) => {
      setBoats(((data as unknown) as Boat[]) ?? []);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load athletes for group
  useEffect(() => {
    if (!groupId) { setAthletes([]); return; }
    void supabase.from("athletes").select("id, first_name, last_name").eq("group_id", groupId).order("last_name").then(({ data }) => {
      setAthletes(((data as unknown) as Athlete[]) ?? []);
    });
  }, [groupId]);

  const filteredAthletes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return athletes;
    return athletes.filter((a) => `${a.first_name} ${a.last_name}`.toLowerCase().includes(q));
  }, [athletes, search]);

  const assignmentCount = useMemo(() => {
    const map = new Map<string, number>();
    crews.forEach((c) => Object.values(c.seats).forEach((id) => {
      if (id) map.set(id, (map.get(id) ?? 0) + 1);
    }));
    return map;
  }, [crews]);

  const athleteName = (id: string | null) => {
    if (!id) return null;
    const a = athletes.find((x) => x.id === id);
    return a ? `${a.first_name} ${a.last_name}` : "—";
  };

  function addCrew(boatId: string | null, cls: BoatClass, notes: string) {
    let label = `${cls}`;
    if (boatId) {
      const b = boats.find((x) => x.id === boatId);
      if (b) label = `${b.name} (${b.type})`;
    }
    const seats: Record<string, string | null> = {};
    seatsFor(cls).forEach((s) => { seats[s] = null; });
    setCrews((prev) => [...prev, { id: uid(), boatId, boatLabel: label, cls, notes, seats }]);
  }

  function assignSeat(crewId: string, seat: string, athleteId: string | null) {
    setCrews((prev) => prev.map((c) => c.id === crewId ? { ...c, seats: { ...c.seats, [seat]: athleteId } } : c));
  }

  function onSeatClick(crewId: string, seat: string) {
    const crew = crews.find((c) => c.id === crewId);
    if (!crew) return;
    if (crew.seats[seat]) {
      // tap occupied -> clear
      assignSeat(crewId, seat, null);
      return;
    }
    if (selectedAthlete) {
      // Prevent same athlete in the same crew twice
      if (Object.values(crew.seats).includes(selectedAthlete)) {
        toast.error("That athlete is already in this crew.");
        return;
      }
      assignSeat(crewId, seat, selectedAthlete);
      setSelectedAthlete(null);
      return;
    }
    // open picker (mobile-friendly)
    setSeatPicker({ crewId, seat });
  }

  function resetBoard() {
    if (!confirm("Reset the entire board? All crews and assignments will be cleared.")) return;
    setCrews([]);
    setSelectedAthlete(null);
    toast.success("Board cleared");
  }

  function deleteCrew(id: string) {
    setCrews((prev) => prev.filter((c) => c.id !== id));
  }

  const groupName = groups.find((g) => g.id === groupId)?.name ?? "";

  return (
    <div className="space-y-4">
      {/* Top controls */}
      <div className="flex flex-wrap items-end gap-3 print:hidden">
        <div className="grow min-w-[180px]">
          <Label className="text-xs">Group</Label>
          <Select value={groupId} onValueChange={setGroupId}>
            <SelectTrigger><SelectValue placeholder="Select group" /></SelectTrigger>
            <SelectContent>
              {groups.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Create Crew Entry
        </Button>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-1" /> Download Lineups (PDF)
        </Button>
        <Button variant="destructive" onClick={resetBoard}>
          <RotateCcw className="h-4 w-4 mr-1" /> Reset Board
        </Button>
      </div>

      {selectedAthlete && (
        <div className="rounded-md border border-primary bg-primary/10 px-3 py-2 text-sm flex items-center justify-between print:hidden">
          <span>Selected: <strong>{athleteName(selectedAthlete)}</strong> — tap any empty seat to assign.</span>
          <Button size="sm" variant="ghost" onClick={() => setSelectedAthlete(null)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)] print:block">
        {/* Roster */}
        <aside className="print:hidden">
          {/* Mobile dropdown */}
          <div className="lg:hidden">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {selectedAthlete ? athleteName(selectedAthlete) : `Group Roster (${athletes.length})`}
                  </span>
                  <span className="text-xs text-muted-foreground">Browse ▾</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[calc(100vw-2rem)] p-2" align="start">
                <Roster
                  athletes={filteredAthletes}
                  search={search}
                  setSearch={setSearch}
                  selectedAthlete={selectedAthlete}
                  setSelectedAthlete={setSelectedAthlete}
                  assignmentCount={assignmentCount}
                  maxHeight="55vh"
                />
              </PopoverContent>
            </Popover>
          </div>
          {/* Desktop fixed-height roster */}
          <div className="hidden lg:block rounded-lg border bg-background p-3">
            <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">Group Roster ({athletes.length})</div>
            <Roster
              athletes={filteredAthletes}
              search={search}
              setSearch={setSearch}
              selectedAthlete={selectedAthlete}
              setSelectedAthlete={setSelectedAthlete}
              assignmentCount={assignmentCount}
              maxHeight="70vh"
            />
          </div>
        </aside>

        {/* Crews */}
        <section className="space-y-4">
          <div className="hidden print:block mb-4">
            <h1 className="font-serif text-2xl">Crew Lineups{groupName ? ` — ${groupName}` : ""}</h1>
            <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString()}</p>
          </div>
          {crews.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-background p-10 text-center text-sm text-muted-foreground print:hidden">
              No crews yet. Click <strong>+ Create Crew Entry</strong> to start building lineups.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 print:grid-cols-2">
              {crews.map((crew) => (
                <CrewCard
                  key={crew.id}
                  crew={crew}
                  athleteName={athleteName}
                  onSeatClick={onSeatClick}
                  onDelete={() => deleteCrew(crew.id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Create crew dialog */}
      <CreateCrewDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        boats={boats}
        onCreate={(boatId, cls, notes) => { addCrew(boatId, cls, notes); setCreateOpen(false); }}
      />

      {/* Mobile seat picker */}
      <Sheet open={!!seatPicker} onOpenChange={(o) => !o && setSeatPicker(null)}>
        <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Assign athlete to {seatPicker?.seat}</SheetTitle>
          </SheetHeader>
          <div className="mt-3 relative">
            <Search className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="Search athletes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="mt-3 space-y-1">
            {(() => {
              const crew = seatPicker ? crews.find((c) => c.id === seatPicker.crewId) : null;
              const usedInCrew = new Set(crew ? Object.values(crew.seats).filter(Boolean) as string[] : []);
              const available = filteredAthletes.filter((a) => !usedInCrew.has(a.id));
              if (available.length === 0) {
                return <p className="text-sm text-muted-foreground py-4 text-center">No available athletes.</p>;
              }
              return available.map((a) => {
              const count = assignmentCount.get(a.id) ?? 0;
              return (
                <button
                  key={a.id}
                  type="button"
                  className="w-full flex items-center justify-between rounded-md border bg-background px-3 py-2 text-left text-sm hover:border-primary"
                  onClick={() => {
                    if (seatPicker) assignSeat(seatPicker.crewId, seatPicker.seat, a.id);
                    setSeatPicker(null);
                  }}
                >
                  <span>{a.first_name} {a.last_name}</span>
                  <Badge variant={count > 0 ? "default" : "secondary"}>[{count}]</Badge>
                </button>
              );
              });
            })()}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Roster({
  athletes, search, setSearch, selectedAthlete, setSelectedAthlete, assignmentCount, maxHeight,
}: {
  athletes: Athlete[];
  search: string;
  setSearch: (v: string) => void;
  selectedAthlete: string | null;
  setSelectedAthlete: (id: string | null) => void;
  assignmentCount: Map<string, number>;
  maxHeight: string;
}) {
  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search athletes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 h-9"
        />
      </div>
      <div className="overflow-y-auto space-y-1 pr-1" style={{ maxHeight }}>
        {athletes.length === 0 && (
          <p className="text-xs text-muted-foreground py-4 text-center">No athletes.</p>
        )}
        {athletes.map((a) => {
          const count = assignmentCount.get(a.id) ?? 0;
          const isSelected = selectedAthlete === a.id;
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => setSelectedAthlete(isSelected ? null : a.id)}
              className={`w-full flex items-center justify-between rounded-md border px-2.5 py-2 text-left text-sm transition ${
                isSelected ? "border-primary bg-primary/10" : "bg-background hover:border-primary/50"
              }`}
            >
              <span className="truncate">{a.first_name} {a.last_name}</span>
              <Badge variant={count > 0 ? "default" : "secondary"} className="ml-2 shrink-0">[{count}]</Badge>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CrewCard({
  crew, athleteName, onSeatClick, onDelete,
}: {
  crew: Crew;
  athleteName: (id: string | null) => string | null;
  onSeatClick: (crewId: string, seat: string) => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-lg border bg-background p-4 print:border-black print:break-inside-avoid">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <div className="font-serif text-lg truncate">{crew.boatLabel}</div>
          {crew.notes && <div className="text-xs text-muted-foreground mt-0.5">{crew.notes}</div>}
        </div>
        <Button size="icon" variant="ghost" onClick={onDelete} className="print:hidden h-7 w-7">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-1">
        {Object.entries(crew.seats).map(([seat, aid]) => {
          const name = athleteName(aid);
          return (
            <button
              key={seat}
              type="button"
              onClick={() => onSeatClick(crew.id, seat)}
              className={`w-full grid grid-cols-[56px_minmax(0,1fr)] items-center gap-2 rounded-md border px-2 py-1.5 text-left text-xs sm:text-sm sm:px-2.5 sm:py-2 transition print:border-black ${
                aid ? "border-primary/50 bg-primary/5" : "border-dashed bg-muted/30 hover:border-primary"
              }`}
            >
              <span className="font-mono text-[10px] sm:text-xs font-semibold uppercase text-muted-foreground">{seat}</span>
              <span className={`truncate ${aid ? "font-medium" : "text-muted-foreground"}`}>
                {name ?? "— empty —"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CreateCrewDialog({
  open, onOpenChange, boats, onCreate,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  boats: Boat[];
  onCreate: (boatId: string | null, cls: BoatClass, notes: string) => void;
}) {
  const [boatId, setBoatId] = useState<string>("");
  const [cls, setCls] = useState<BoatClass>("8+");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) { setBoatId(""); setCls("8+"); setNotes(""); }
  }, [open]);

  // Auto-pick class from selected boat
  useEffect(() => {
    if (!boatId) return;
    const b = boats.find((x) => x.id === boatId);
    if (b && (BOAT_CLASSES as readonly string[]).includes(b.type)) {
      setCls(b.type as BoatClass);
    }
  }, [boatId, boats]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Create Crew Entry</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Boat (optional)</Label>
            <Select value={boatId || "none"} onValueChange={(v) => setBoatId(v === "none" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="No boat (class only)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No boat (class only)</SelectItem>
                {boats.map((b) => (
                  <SelectItem key={b.id} value={b.id}>{b.name} ({b.type})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Boat Class</Label>
            <Select value={cls} onValueChange={(v) => setCls(v as BoatClass)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {BOAT_CLASSES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Notes</Label>
            <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Heat 1 — Senior 8+" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onCreate(boatId || null, cls, notes.trim())}>Add crew</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}