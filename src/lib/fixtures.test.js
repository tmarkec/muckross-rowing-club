import { describe, expect, test } from "bun:test";
import { getUpcomingFixtures, rowToFixture } from "./fixtures.ts";

const rows = [
  { id: "1", name: "Castleconnell Head", location: "", tag: "Head race", start_date: "2026-10-24", end_date: null, url: null },
  { id: "2", name: "Muckross Head", location: "", tag: "Head race", start_date: "2026-12-05", end_date: null, url: null },
  { id: "3", name: "Skibbereen HOR", location: "", tag: "Head race", start_date: "2026-11-14", end_date: null, url: null },
  { id: "4", name: "Kenmare", location: "", tag: "Coastal", start_date: "2026-09-05", end_date: null, url: null },
  { id: "5", name: "Two-day regatta", location: "", tag: "Regatta", start_date: "2026-08-01", end_date: "2026-08-02", url: null },
];
const list = rows.map(rowToFixture);

describe("upcoming calendar events", () => {
  test("excludes past events and sorts soonest first", () => {
    expect(getUpcomingFixtures(list, new Date(2026, 9, 13), 4).map((e) => e.name))
      .toEqual(["Castleconnell Head", "Skibbereen HOR", "Muckross Head"]);
  });
  test("limits the homepage list to four events", () => {
    expect(getUpcomingFixtures(list, new Date(2026, 6, 1), 4)).toHaveLength(4);
  });
  test("keeps an event visible throughout its own day", () => {
    expect(getUpcomingFixtures(list, new Date(2026, 11, 5, 23, 59)).map((e) => e.name)).toEqual(["Muckross Head"]);
  });
  test("multi-day event stays upcoming until its last day", () => {
    expect(getUpcomingFixtures(list, new Date(2026, 7, 2), 1).map((e) => e.name)).toEqual(["Two-day regatta"]);
  });
});
