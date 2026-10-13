import { describe, expect, test } from "bun:test";
import { getUpcomingFixtures } from "./fixtures.ts";

describe("homepage upcoming calendar events", () => {
  test("excludes past dates and keeps the three remaining 2026 fixtures in chronological order", () => {
    expect(getUpcomingFixtures(new Date(2026, 9, 13), 4).map((event) => event.name))
      .toEqual(["Castleconnell Head", "Skibbereen HOR", "Muckross Head"]);
  });
  test("limits the homepage list to four events", () => {
    expect(getUpcomingFixtures(new Date(2026, 7, 1), 4)).toHaveLength(4);
  });
  test("keeps an event visible throughout its own day", () => {
    expect(getUpcomingFixtures(new Date(2026, 11, 5, 23, 59)).map((event) => event.name)).toEqual(["Muckross Head"]);
  });
});