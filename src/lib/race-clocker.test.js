import { test, expect } from "bun:test";
import { buildResults, formatRaceTime, elapsedMs } from "./race-clocker.ts";

const c = (id, cat, status, start, finish) => ({
  id, event_id: "e", boat_type: "1x", crew_name: id, bow_number: null, category: cat,
  start_time: start, split1_time: null, split2_time: null, finish_time: finish, status,
});

test("crew time is its own finish minus its own start", () => {
  expect(elapsedMs("2026-01-01T10:00:00.000Z", "2026-01-01T10:07:30.250Z")).toBe(450250);
  expect(formatRaceTime(450250)).toBe("00:07:30.2");
});

test("results sort by elapsed time per category with DNF last", () => {
  const res = buildResults([
    c("slow", "Junior", "finished", "2026-01-01T10:00:00Z", "2026-01-01T10:08:00Z"),
    c("dnf", "Junior", "dnf", "2026-01-01T10:00:00Z", null),
    c("fast", "Junior", "finished", "2026-01-01T10:05:00Z", "2026-01-01T10:12:00Z"),
  ]);
  expect(res[0].rows.map((r) => r.crew.id)).toEqual(["fast", "slow", "dnf"]);
  expect(res[0].rows[2].position).toBe(null);
});
