export type CrewStatus = "waiting" | "running" | "finished" | "dnf";
export type RaceCrew = {
  id: string;
  event_id: string;
  boat_type: string;
  crew_name: string;
  bow_number: string | null;
  category: string | null;
  start_time: string | null;
  split1_time: string | null;
  split2_time: string | null;
  finish_time: string | null;
  status: CrewStatus;
};

export const BOAT_TYPES = ["1x", "2x", "2-", "4x", "4-", "4+", "8+", "other"];
export const CATEGORY_SUGGESTIONS = ["Junior", "Senior", "Masters", "Novice", "J14", "J15", "J16", "J18"];

/** Milliseconds between two ISO timestamps, or null if either is missing. */
export function elapsedMs(start: string | null, end: string | null): number | null {
  if (!start || !end) return null;
  return new Date(end).getTime() - new Date(start).getTime();
}

/** Formats ms as hh:mm:ss.s */
export function formatRaceTime(ms: number | null): string {
  if (ms === null || !Number.isFinite(ms) || ms < 0) return "--:--:--.-";
  const tenths = Math.floor(ms / 100);
  const t = tenths % 10;
  const totalSec = Math.floor(tenths / 10);
  const s = totalSec % 60;
  const m = Math.floor(totalSec / 60) % 60;
  const h = Math.floor(totalSec / 3600);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(h)}:${p(m)}:${p(s)}.${t}`;
}

export type ResultRow = { position: number | null; crew: RaceCrew; finalMs: number | null };

/** Groups crews by category, finished crews sorted by elapsed time, DNF/unfinished last. */
export function buildResults(crews: RaceCrew[]): { category: string; rows: ResultRow[] }[] {
  const groups = new Map<string, RaceCrew[]>();
  for (const c of crews) {
    const key = c.category?.trim() || "Uncategorised";
    groups.set(key, [...(groups.get(key) ?? []), c]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([category, list]) => {
      const done = list
        .filter((c) => c.status === "finished" && elapsedMs(c.start_time, c.finish_time) !== null)
        .map((c) => ({ crew: c, finalMs: elapsedMs(c.start_time, c.finish_time) }))
        .sort((a, b) => (a.finalMs ?? 0) - (b.finalMs ?? 0))
        .map((r, i) => ({ ...r, position: i + 1 }));
      const rest = list
        .filter((c) => !done.some((d) => d.crew.id === c.id))
        .map((c) => ({ crew: c, finalMs: null, position: null }));
      return { category, rows: [...done, ...rest] };
    });
}
