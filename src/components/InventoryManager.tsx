import { useEffect, useMemo, useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Trash2, Plus } from "lucide-react";

const BOAT_TYPES = ["1x", "2x", "2-", "4x", "4x+", "4+", "8x", "8+", "Offshore"] as const;
type BoatType = typeof BOAT_TYPES[number];
type OarCategory = "Sweep" | "Scull" | "Offshore";

type Boat = {
  id: string;
  name: string;
  type: BoatType;
  assigned_group: string | null;
  status: string;
  is_private: boolean;
  notes: string | null;
};

type Oar = {
  id: string;
  category: OarCategory;
  quantity: number;
  assigned_group: string | null;
  brand_notes: string | null;
};

type DraftBoat = {
  key: string;
  name: string;
  type: BoatType;
  assigned_group: string;
  is_private: boolean;
  notes: string;
};
type DraftOar = {
  key: string;
  category: OarCategory;
  quantity: number;
  assigned_group: string;
  brand_notes: string;
};

const uid = () => Math.random().toString(36).slice(2, 10);

export function InventoryManager({ coachGroupNames = [] }: { coachGroupNames?: string[] }) {
  const { isAdmin } = useAuth();
  const [boats, setBoats] = useState<Boat[]>([]);
  const [oars, setOars] = useState<Oar[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [b, o] = await Promise.all([
      supabase.from("club_boats" as never).select("*").order("type").order("name"),
      supabase.from("club_oars" as never).select("*").order("category"),
    ]);
    if (b.error) toast.error(b.error.message);
    if (o.error) toast.error(o.error.message);
    setBoats(((b.data as unknown) as Boat[]) ?? []);
    setOars(((o.data as unknown) as Oar[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <div className="space-y-6">
      <SummaryPanel boats={boats} oars={oars} />
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading inventory…</p>
      ) : isAdmin ? (
        <AdminBatchEntry boats={boats} oars={oars} onSaved={load} />
      ) : (
        <CoachReadOnlyView boats={boats} oars={oars} coachGroupNames={coachGroupNames} />
      )}
    </div>
  );
}

/* ---------- Summary ---------- */

function SummaryPanel({ boats, oars }: { boats: Boat[]; oars: Oar[] }) {
  const oarBreakdown = useMemo(() => {
    const sweep = oars.filter((o) => o.category === "Sweep").reduce((a, o) => a + (o.quantity || 0), 0);
    const scull = oars.filter((o) => o.category === "Scull").reduce((a, o) => a + (o.quantity || 0), 0);
    const offshore = oars.filter((o) => o.category === "Offshore").reduce((a, o) => a + (o.quantity || 0), 0);
    return { sweep, scull, offshore, total: sweep + scull + offshore };
  }, [oars]);

  const boatBreakdown = useMemo(() => {
    const map = new Map<BoatType, number>(BOAT_TYPES.map((t) => [t, 0]));
    for (const b of boats) map.set(b.type, (map.get(b.type) ?? 0) + 1);
    return map;
  }, [boats]);

  return (
    <div className="rounded-lg border bg-background p-5">
      <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
        <h2 className="font-serif text-xl">Boats & Oars summary</h2>
        <div className="text-xs text-muted-foreground">
          {boats.length} boats · {oarBreakdown.total} oars
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Oars</div>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary">{oarBreakdown.scull} Sculling</Badge>
            <Badge variant="secondary">{oarBreakdown.sweep} Sweep</Badge>
            <Badge variant="secondary">{oarBreakdown.offshore} Offshore</Badge>
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Boats by class</div>
          <div className="flex gap-2 flex-wrap">
            {BOAT_TYPES.map((t) => (
              <Badge key={t} variant="outline">{t}: {boatBreakdown.get(t) ?? 0}</Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Admin batch entry ---------- */

function AdminBatchEntry({ boats, oars, onSaved }: { boats: Boat[]; oars: Oar[]; onSaved: () => void | Promise<void> }) {
  const [draftBoats, setDraftBoats] = useState<DraftBoat[]>([]);
  const [draftOars, setDraftOars] = useState<DraftOar[]>([]);
  const [bulkCount, setBulkCount] = useState(1);
  const [bulkType, setBulkType] = useState<BoatType>("1x");
  const [saving, setSaving] = useState(false);

  const addBulkBoats = () => {
    const n = Math.max(1, Math.min(50, Number(bulkCount) || 1));
    const rows: DraftBoat[] = Array.from({ length: n }, () => ({
      key: uid(), name: "", type: bulkType, assigned_group: "", is_private: false, notes: "",
    }));
    setDraftBoats((d) => [...d, ...rows]);
  };
  const addOarRow = () => {
    setDraftOars((d) => [...d, { key: uid(), category: "Scull", quantity: 1, assigned_group: "", brand_notes: "" }]);
  };

  const updateBoat = (key: string, patch: Partial<DraftBoat>) =>
    setDraftBoats((d) => d.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const updateOar = (key: string, patch: Partial<DraftOar>) =>
    setDraftOars((d) => d.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const removeBoat = (key: string) => setDraftBoats((d) => d.filter((r) => r.key !== key));
  const removeOar = (key: string) => setDraftOars((d) => d.filter((r) => r.key !== key));

  const isDirty = draftBoats.length > 0 || draftOars.length > 0;

  const saveAll = async () => {
    if (!isDirty) return;
    const invalid = draftBoats.find((b) => !b.name.trim());
    if (invalid) { toast.error("Every boat needs a name."); return; }
    setSaving(true);
    try {
      if (draftBoats.length) {
        const payload = draftBoats.map((b) => ({
          name: b.name.trim(),
          type: b.type,
          assigned_group: b.assigned_group.trim() || null,
          is_private: b.is_private,
          notes: b.notes.trim() || null,
        }));
        const { error } = await supabase.from("club_boats" as never).insert(payload as never);
        if (error) throw error;
      }
      if (draftOars.length) {
        const payload = draftOars.map((o) => ({
          category: o.category,
          quantity: Math.max(0, Number(o.quantity) || 0),
          assigned_group: o.assigned_group.trim() || null,
          brand_notes: o.brand_notes.trim() || null,
        }));
        const { error } = await supabase.from("club_oars" as never).insert(payload as never);
        if (error) throw error;
      }
      toast.success("Boats & oars saved");
      setDraftBoats([]);
      setDraftOars([]);
      await onSaved();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const deleteBoat = async (id: string) => {
    if (!confirm("Delete this boat permanently?")) return;
    const { error } = await supabase.from("club_boats" as never).delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Boat deleted");
    void onSaved();
  };
  const deleteOar = async (id: string) => {
    if (!confirm("Delete this oar set permanently?")) return;
    const { error } = await supabase.from("club_oars" as never).delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Oar set deleted");
    void onSaved();
  };

  return (
    <div className="space-y-6">
      {/* Bulk add boats workbench */}
      <section className="rounded-lg border bg-background p-5">
        <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
          <h3 className="font-serif text-lg">Bulk add boats</h3>
          <div className="flex items-end gap-2 flex-wrap">
            <div>
              <Label className="text-xs">Count</Label>
              <Input type="number" min={1} max={50} className="w-20" value={bulkCount}
                onChange={(e) => setBulkCount(Number(e.target.value))} />
            </div>
            <div>
              <Label className="text-xs">Hull class</Label>
              <Select value={bulkType} onValueChange={(v) => setBulkType(v as BoatType)}>
                <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {BOAT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button size="sm" variant="secondary" onClick={addBulkBoats}><Plus className="h-4 w-4 mr-1" />Add rows</Button>
          </div>
        </div>

        {draftBoats.length === 0 ? (
          <p className="text-sm text-muted-foreground">No draft rows. Pick a count + class and click "Add rows".</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground uppercase">
                <tr>
                  <th className="py-2 pr-2">Name</th>
                  <th className="py-2 pr-2">Class</th>
                  <th className="py-2 pr-2">Group</th>
                  <th className="py-2 pr-2">Private</th>
                  <th className="py-2 pr-2">Notes</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {draftBoats.map((b) => (
                  <tr key={b.key} className="border-t">
                    <td className="py-1 pr-2"><Input value={b.name} onChange={(e) => updateBoat(b.key, { name: e.target.value })} placeholder="e.g. Aoife" /></td>
                    <td className="py-1 pr-2">
                      <Select value={b.type} onValueChange={(v) => updateBoat(b.key, { type: v as BoatType })}>
                        <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                        <SelectContent>{BOAT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </td>
                    <td className="py-1 pr-2"><Input className="w-24" value={b.assigned_group} onChange={(e) => updateBoat(b.key, { assigned_group: e.target.value })} placeholder="J16" /></td>
                    <td className="py-1 pr-2"><Checkbox checked={b.is_private} onCheckedChange={(v) => updateBoat(b.key, { is_private: !!v })} /></td>
                    <td className="py-1 pr-2"><Input value={b.notes} onChange={(e) => updateBoat(b.key, { notes: e.target.value })} placeholder="optional" /></td>
                    <td className="py-1"><Button size="icon" variant="ghost" onClick={() => removeBoat(b.key)}><Trash2 className="h-4 w-4" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Bulk add oars */}
      <section className="rounded-lg border bg-background p-5">
        <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
          <h3 className="font-serif text-lg">Bulk add oars</h3>
          <Button size="sm" variant="secondary" onClick={addOarRow}><Plus className="h-4 w-4 mr-1" />Add row</Button>
        </div>

        {draftOars.length === 0 ? (
          <p className="text-sm text-muted-foreground">No draft rows.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground uppercase">
                <tr>
                  <th className="py-2 pr-2">Category</th>
                  <th className="py-2 pr-2">Qty</th>
                  <th className="py-2 pr-2">Group</th>
                  <th className="py-2 pr-2">Brand / notes</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {draftOars.map((o) => (
                  <tr key={o.key} className="border-t">
                    <td className="py-1 pr-2">
                      <Select value={o.category} onValueChange={(v) => updateOar(o.key, { category: v as OarCategory })}>
                        <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Scull">Scull</SelectItem>
                          <SelectItem value="Sweep">Sweep</SelectItem>
                          <SelectItem value="Offshore">Offshore</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-1 pr-2"><Input type="number" min={0} className="w-20" value={o.quantity} onChange={(e) => updateOar(o.key, { quantity: Number(e.target.value) })} /></td>
                    <td className="py-1 pr-2"><Input className="w-24" value={o.assigned_group} onChange={(e) => updateOar(o.key, { assigned_group: e.target.value })} placeholder="J18" /></td>
                    <td className="py-1 pr-2"><Input value={o.brand_notes} onChange={(e) => updateOar(o.key, { brand_notes: e.target.value })} placeholder="e.g. Concept2 Skinny" /></td>
                    <td className="py-1"><Button size="icon" variant="ghost" onClick={() => removeOar(o.key)}><Trash2 className="h-4 w-4" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="sticky bottom-2 z-10 flex items-center justify-between gap-2 rounded-lg border bg-background/95 backdrop-blur p-3">
        <div className="text-sm text-muted-foreground">
          {isDirty
            ? `${draftBoats.length} boat row(s), ${draftOars.length} oar row(s) pending`
            : "No pending changes"}
        </div>
        <div className="flex gap-2">
          {isDirty && <Button variant="outline" size="sm" onClick={() => { setDraftBoats([]); setDraftOars([]); }}>Discard</Button>}
          <Button size="sm" disabled={!isDirty || saving} onClick={saveAll}>
            {saving ? "Saving…" : "Save entire boats & oars configuration"}
          </Button>
        </div>
      </div>

      {/* Existing inventory list with delete */}
      <section className="rounded-lg border bg-background p-5">
        <h3 className="font-serif text-lg mb-3">Current boats ({boats.length})</h3>
        <ExistingBoatsTable boats={boats} onDelete={deleteBoat} />
      </section>
      <section className="rounded-lg border bg-background p-5">
        <h3 className="font-serif text-lg mb-3">Current oars ({oars.length} sets)</h3>
        <ExistingOarsTable oars={oars} onDelete={deleteOar} />
      </section>
    </div>
  );
}

function ExistingBoatsTable({ boats, onDelete }: { boats: Boat[]; onDelete: (id: string) => void }) {
  if (boats.length === 0) return <p className="text-sm text-muted-foreground">No boats yet.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-xs text-muted-foreground uppercase">
          <tr><th className="py-2 pr-2">Name</th><th className="py-2 pr-2">Class</th><th className="py-2 pr-2">Group</th><th className="py-2 pr-2">Private</th><th className="py-2 pr-2">Notes</th><th></th></tr>
        </thead>
        <tbody>
          {boats.map((b) => (
            <tr key={b.id} className="border-t">
              <td className="py-1 pr-2 font-medium">{b.name}</td>
              <td className="py-1 pr-2"><Badge variant="outline">{b.type}</Badge></td>
              <td className="py-1 pr-2">{b.assigned_group ?? "—"}</td>
              <td className="py-1 pr-2">{b.is_private ? "Yes" : "—"}</td>
              <td className="py-1 pr-2 text-muted-foreground">{b.notes ?? ""}</td>
              <td className="py-1"><Button size="icon" variant="ghost" onClick={() => onDelete(b.id)}><Trash2 className="h-4 w-4" /></Button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ExistingOarsTable({ oars, onDelete }: { oars: Oar[]; onDelete: (id: string) => void }) {
  if (oars.length === 0) return <p className="text-sm text-muted-foreground">No oars yet.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-xs text-muted-foreground uppercase">
          <tr><th className="py-2 pr-2">Category</th><th className="py-2 pr-2">Qty</th><th className="py-2 pr-2">Group</th><th className="py-2 pr-2">Brand / notes</th><th></th></tr>
        </thead>
        <tbody>
          {oars.map((o) => (
            <tr key={o.id} className="border-t">
              <td className="py-1 pr-2"><Badge variant="secondary">{o.category}</Badge></td>
              <td className="py-1 pr-2">{o.quantity}</td>
              <td className="py-1 pr-2">{o.assigned_group ?? "—"}</td>
              <td className="py-1 pr-2 text-muted-foreground">{o.brand_notes ?? ""}</td>
              <td className="py-1"><Button size="icon" variant="ghost" onClick={() => onDelete(o.id)}><Trash2 className="h-4 w-4" /></Button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Coach read-only ---------- */

function CoachReadOnlyView({
  boats, oars, coachGroupNames,
}: { boats: Boat[]; oars: Oar[]; coachGroupNames: string[] }) {
  const [search, setSearch] = useState("");

  const groupSet = useMemo(
    () => new Set(coachGroupNames.map((g) => g.toLowerCase())),
    [coachGroupNames],
  );
  const matchesGroup = (g: string | null) => !!g && groupSet.has(g.toLowerCase());

  const filter = <T extends { assigned_group: string | null; }>(rows: T[], extra: (r: T) => string) => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      (r.assigned_group ?? "").toLowerCase().includes(q) || extra(r).toLowerCase().includes(q),
    );
  };

  const publicBoats = boats.filter((b) => !b.is_private);
  const privateBoats = boats.filter((b) => b.is_private);

  const sortedPublicBoats = useMemo(() => {
    const arr = filter(publicBoats, (b) => `${b.name} ${b.type} ${b.notes ?? ""}`);
    return [...arr].sort((a, b) => {
      const aM = matchesGroup(a.assigned_group) ? 0 : 1;
      const bM = matchesGroup(b.assigned_group) ? 0 : 1;
      if (aM !== bM) return aM - bM;
      return a.name.localeCompare(b.name);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicBoats, search, coachGroupNames]);

  const sortedOars = useMemo(() => {
    const arr = filter(oars, (o) => `${o.category} ${o.brand_notes ?? ""}`);
    return [...arr].sort((a, b) => {
      const aM = matchesGroup(a.assigned_group) ? 0 : 1;
      const bM = matchesGroup(b.assigned_group) ? 0 : 1;
      if (aM !== bM) return aM - bM;
      return a.category.localeCompare(b.category);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oars, search, coachGroupNames]);

  return (
    <div className="space-y-4">
      <Input placeholder="Search by group, name, brand…" value={search} onChange={(e) => setSearch(e.target.value)} />

      <section className="rounded-lg border bg-background p-5">
        <h3 className="font-serif text-lg mb-3">Boats</h3>
        {sortedPublicBoats.length === 0 ? (
          <p className="text-sm text-muted-foreground">No boats found.</p>
        ) : (
          <ul className="divide-y">
            {sortedPublicBoats.map((b) => {
              const mine = matchesGroup(b.assigned_group);
              return (
                <li key={b.id} className={`py-2 flex items-center justify-between gap-2 flex-wrap ${mine ? "bg-primary/5 -mx-2 px-2 rounded" : ""}`}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{b.name}</span>
                    <Badge variant="outline">{b.type}</Badge>
                    {b.assigned_group && (
                      <Badge variant={mine ? "default" : "secondary"}>{b.assigned_group}</Badge>
                    )}
                  </div>
                  {b.notes && <span className="text-xs text-muted-foreground">{b.notes}</span>}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="rounded-lg border bg-background p-5">
        <h3 className="font-serif text-lg mb-3">Oars</h3>
        {sortedOars.length === 0 ? (
          <p className="text-sm text-muted-foreground">No oars found.</p>
        ) : (
          <ul className="divide-y">
            {sortedOars.map((o) => {
              const mine = matchesGroup(o.assigned_group);
              return (
                <li key={o.id} className={`py-2 flex items-center justify-between gap-2 flex-wrap ${mine ? "bg-primary/5 -mx-2 px-2 rounded" : ""}`}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary">{o.category}</Badge>
                    <span className="font-medium">×{o.quantity}</span>
                    {o.assigned_group && (
                      <Badge variant={mine ? "default" : "outline"}>{o.assigned_group}</Badge>
                    )}
                  </div>
                  {o.brand_notes && <span className="text-xs text-muted-foreground">{o.brand_notes}</span>}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {privateBoats.length > 0 && (
        <Accordion type="single" collapsible>
          <AccordionItem value="private">
            <AccordionTrigger className="rounded-lg border bg-muted/40 px-4">
              Private Owner Fleets ({privateBoats.length})
            </AccordionTrigger>
            <AccordionContent className="rounded-b-lg border border-t-0 bg-background px-4 pt-3">
              <ul className="divide-y">
                {privateBoats.map((b) => (
                  <li key={b.id} className="py-2 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{b.name}</span>
                      <Badge variant="outline">{b.type}</Badge>
                      {b.assigned_group && <Badge variant="secondary">{b.assigned_group}</Badge>}
                    </div>
                    {b.notes && <span className="text-xs text-muted-foreground">{b.notes}</span>}
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
}