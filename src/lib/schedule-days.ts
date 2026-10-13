// Browser-safe day helpers for the training schedule views.
//
// day_of_week is a smallint in the database, but records have also been saved
// as numeric strings ('1', '2', ...) and as day names ('Monday'), so every read
// path normalises the value before filtering, grouping or rendering.

export const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export type DayName = (typeof DAYS)[number];
export type DayValue = number | string | null | undefined;

const ALIASES: Record<string, number> = {
  mon: 1,
  monday: 1,
  tue: 2,
  tues: 2,
  tuesday: 2,
  wed: 3,
  weds: 3,
  wenes: 3,
  wednesday: 3,
  thu: 4,
  thur: 4,
  thurs: 4,
  thursday: 4,
  fri: 5,
  friday: 5,
  sat: 6,
  saturday: 6,
  sun: 7,
  sunday: 7,
};

function fromNumber(n: number): number | null {
  if (!Number.isFinite(n)) return null;
  const i = Math.trunc(n);
  // Some feeds use 0 for Sunday, others use 7.
  if (i === 0) return 7;
  return i >= 1 && i <= 7 ? i : null;
}

/** Normalise any stored day value to Monday-first 1..7, or null if unrecognised. */
export function dayNumber(value: DayValue): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return fromNumber(value);
  const text = String(value).trim();
  if (!text) return null;
  if (/^\d+$/.test(text)) return fromNumber(Number(text));
  const key = text.toLowerCase().replace(/[^a-z]/g, "");
  return ALIASES[key] ?? null;
}

/** The day name for any stored value, e.g. '3' and 3 both give 'Wednesday'. */
export function dayName(value: DayValue): DayName | null {
  const n = dayNumber(value);
  return n ? DAYS[n - 1] : null;
}

/** Display label: the day name when recognised, otherwise the raw stored text. */
export function dayLabel(value: DayValue, fallback = "Unscheduled"): string {
  const name = dayName(value);
  if (name) return name;
  const text = value === null || value === undefined ? "" : String(value).trim();
  return text || fallback;
}

/**
 * True when a stored value belongs to `day`. Accepts either form on both sides,
 * so a filter set to 'Monday' still matches a row stored as '1' or 1.
 */
export function matchesDay(value: DayValue, day: DayValue): boolean {
  const a = dayNumber(value);
  const b = dayNumber(day);
  return a !== null && b !== null && a === b;
}

/** Today as Monday-first 1..7. */
export function todayIndex(): number {
  const d = new Date().getDay();
  return d === 0 ? 7 : d;
}
