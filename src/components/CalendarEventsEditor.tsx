import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { rowToFixture, ROWING_IRELAND_EVENTS_URL, type CalendarEventRow } from "@/lib/fixtures";

const empty = { name: "", location: "", tag: "Regatta", start_date: "", end_date: "", url: ROWING_IRELAND_EVENTS_URL };

export function CalendarEventsEditor() {
  const [rows, setRows] = useState<CalendarEventRow[]>([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("calendar_events")
      .select("id, name, location, tag, start_date, end_date, url").order("start_date", { ascending: false });
    if (error) toast.error(error.message);
    setRows(data ?? []);
  }, []);
  useEffect(() => { void load(); }, [load]);

  const reset = () => { setForm(empty); setEditingId(null); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.start_date) return toast.error("Name and start date are required.");
    if (form.end_date && form.end_date < form.start_date) return toast.error("End date can't be before the start date.");
    setSaving(true);
    const payload = {
      name: form.name.trim(), location: form.location.trim(), tag: form.tag.trim() || "Regatta",
      start_date: form.start_date, end_date: form.end_date || null, url: form.url.trim() || null,
    };
    const { error } = editingId
      ? await supabase.from("calendar_events").update(payload).eq("id", editingId)
      : await supabase.from("calendar_events").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(editingId ? "Event updated" : "Event added");
    reset();
    void load();
  };

  const remove = async (row: CalendarEventRow) => {
    if (!confirm(`Delete "${row.name}"?`)) return;
    const { error } = await supabase.from("calendar_events").delete().eq("id", row.id);
    if (error) return toast.error(error.message);
    toast.success("Event deleted");
    if (editingId === row.id) reset();
    void load();
  };

  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="mt-6 space-y-6">
      <Card className="p-5">
        <h2 className="font-serif text-xl">{editingId ? "Edit event" : "Add event"}</h2>
        <p className="mb-4 text-sm text-muted-foreground">Events appear on the homepage key dates and are highlighted on the News page calendar.</p>
        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><Label htmlFor="ev-name">Event name</Label><Input id="ev-name" value={form.name} onChange={set("name")} required /></div>
          <div><Label htmlFor="ev-loc">Location</Label><Input id="ev-loc" value={form.location} onChange={set("location")} /></div>
          <div><Label htmlFor="ev-tag">Type</Label><Input id="ev-tag" value={form.tag} onChange={set("tag")} placeholder="Head race, Regatta…" /></div>
          <div><Label htmlFor="ev-start">Start date</Label><Input id="ev-start" type="date" value={form.start_date} onChange={set("start_date")} required /></div>
          <div><Label htmlFor="ev-end">End date (optional)</Label><Input id="ev-end" type="date" value={form.end_date} onChange={set("end_date")} /></div>
          <div className="sm:col-span-2"><Label htmlFor="ev-url">Link (optional)</Label><Input id="ev-url" type="url" value={form.url} onChange={set("url")} /></div>
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" disabled={saving}>{saving ? "Saving…" : editingId ? "Save changes" : "Add event"}</Button>
            {editingId && <Button type="button" variant="outline" onClick={reset}>Cancel</Button>}
          </div>
        </form>
      </Card>

      <Card className="p-5">
        <h2 className="mb-3 font-serif text-xl">All events</h2>
        {rows.length === 0 ? <p className="text-sm text-muted-foreground">No events yet.</p> : (
          <ul className="divide-y">
            {rows.map((row) => {
              const f = rowToFixture(row);
              return (
                <li key={row.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="font-semibold break-words">{row.name}</p>
                    <p className="text-xs text-muted-foreground">{f.dateLabel}{row.location ? ` · ${row.location}` : ""} · {row.tag}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button size="icon" variant="ghost" aria-label={`Edit ${row.name}`} onClick={() => { setEditingId(row.id); setForm({ name: row.name, location: row.location, tag: row.tag, start_date: row.start_date, end_date: row.end_date ?? "", url: row.url ?? "" }); window.scrollTo({ top: 0, behavior: "smooth" }); }}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" aria-label={`Delete ${row.name}`} onClick={() => void remove(row)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
