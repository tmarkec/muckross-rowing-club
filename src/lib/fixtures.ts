export const ROWING_IRELAND_EVENTS_URL = "https://www.rowingireland.ie/regatta-hors/events/";

export type Fixture = {
  id: string;
  date: Date;
  endDate: Date;
  dateLabel: string;
  name: string;
  location: string;
  tag: string;
  url?: string;
};

/** Raw calendar row as stored in the database (dates as YYYY-MM-DD). */
export type CalendarEventRow = {
  id: string;
  name: string;
  location: string;
  tag: string;
  start_date: string;
  end_date: string | null;
  url: string | null;
};

function parseLocalDate(value: string) {
  const [y, m, d] = value.slice(0, 10).split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function label(date: Date) {
  return date.toLocaleDateString("en-IE", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

export function rowToFixture(row: CalendarEventRow): Fixture {
  const date = parseLocalDate(row.start_date);
  const endRaw = row.end_date ? parseLocalDate(row.end_date) : date;
  const endDate = endRaw < date ? date : endRaw;
  const dateLabel = endDate.getTime() === date.getTime() ? label(date) : `${label(date)} – ${label(endDate)}`;
  return { id: row.id, date, endDate, dateLabel, name: row.name, location: row.location, tag: row.tag, url: row.url || undefined };
}

/** Events that have not finished yet, soonest first. */
export function getUpcomingFixtures(list: Fixture[], today = new Date(), limit = list.length) {
  const startOfToday = new Date(today);
  startOfToday.setHours(0, 0, 0, 0);
  return list.filter((fixture) => fixture.endDate >= startOfToday)
    .sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, limit);
}
