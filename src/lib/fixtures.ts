const ROWING_IRELAND_EVENTS_URL = "https://www.rowingireland.ie/regatta-hors/events/";
const LOUGHQUITTANE_DOC_URL =
  "https://docs.google.com/document/d/1Pn9WN71Uy3xYIQ1sO4FJzbL_95N-YKNkicJEAKes6EU/edit?tab=t.0";

export type Fixture = {
  date: Date;
  endDate: Date;
  dateLabel: string;
  name: string;
  location: string;
  tag: string;
  url?: string;
};

export const fixtures: Fixture[] = [
  {
    date: new Date(2026, 7, 30),
    endDate: new Date(2026, 7, 30),
    dateLabel: "Sun 30 Aug 2026",
    name: "Loughquittane Heritage Regatta",
    location: "Loughquittane Lake",
    tag: "Regatta",
    url: LOUGHQUITTANE_DOC_URL,
  },
  {
    date: new Date(2026, 11, 5),
    endDate: new Date(2026, 11, 5),
    dateLabel: "Sat 5 Dec 2026",
    name: "Muckross Head",
    location: "NRC, Farran Wood, Cork",
    tag: "Head race",
    url: ROWING_IRELAND_EVENTS_URL,
  },
  {
    date: new Date(2026, 8, 5),
    endDate: new Date(2026, 8, 5),
    dateLabel: "Sat 5 Sep 2026",
    name: "Kenmare Endurance Regatta (Coastal)",
    location: "Kenmare, Co. Kerry",
    tag: "Coastal",
    url: ROWING_IRELAND_EVENTS_URL,
  },
  {
    date: new Date(2026, 8, 12),
    endDate: new Date(2026, 8, 12),
    dateLabel: "Sat 12 Sep 2026",
    name: "Swift Racing Coastal Junior Championships",
    location: "Bantry, Co. Cork",
    tag: "Championships",
    url: ROWING_IRELAND_EVENTS_URL,
  },
  {
    date: new Date(2026, 9, 10),
    endDate: new Date(2026, 9, 10),
    dateLabel: "Sat 10 Oct 2026",
    name: "St Michael's Masters & Juniors HOR",
    location: "O'Briensbridge, Co. Clare",
    tag: "Head race",
    url: ROWING_IRELAND_EVENTS_URL,
  },
  {
    date: new Date(2026, 9, 24),
    endDate: new Date(2026, 9, 24),
    dateLabel: "Sat 24 Oct 2026",
    name: "Castleconnell Head",
    location: "Castleconnell, Co. Limerick",
    tag: "Head race",
    url: ROWING_IRELAND_EVENTS_URL,
  },
  {
    date: new Date(2026, 10, 14),
    endDate: new Date(2026, 10, 14),
    dateLabel: "Sat 14 Nov 2026",
    name: "Skibbereen HOR",
    location: "Marina, Cork",
    tag: "Head race",
    url: ROWING_IRELAND_EVENTS_URL,
  },
];


export function getUpcomingFixtures(today = new Date(), limit = fixtures.length) {
  const startOfToday = new Date(today);
  startOfToday.setHours(0, 0, 0, 0);
  return fixtures.filter((fixture) => fixture.date >= startOfToday)
    .sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, limit);
}
