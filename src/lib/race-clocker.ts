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

/** Overall elapsed-time ranking, optionally narrowed to one category. Untimed crews stay last. */
export function buildResults(crews: RaceCrew[], category: string | null = null): ResultRow[] {
  const list = category === null ? crews : crews.filter((c) => (c.category?.trim() || "Uncategorised") === category);
  const rows = list.map((crew) => {
    const time = crew.status === "finished" ? elapsedMs(crew.start_time, crew.finish_time) : null;
    const finalMs = time !== null && Number.isFinite(time) && time >= 0 ? time : null;
    return { crew, finalMs, position: null } as ResultRow;
  });
  rows.sort((a, b) => {
    if (a.finalMs === null) return b.finalMs === null ? 0 : 1;
    if (b.finalMs === null) return -1;
    return a.finalMs - b.finalMs;
  });
  return rows.map((row, i) => ({ ...row, position: row.finalMs === null ? null : i + 1 }));
}
