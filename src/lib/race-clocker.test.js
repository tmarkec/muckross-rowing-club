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

test("overall results sort across categories by elapsed time with DNF last", () => {
  const res = buildResults([
    c("slow", "Junior", "finished", "2026-01-01T10:00:00Z", "2026-01-01T10:08:00Z"),
    c("dnf", "Junior", "dnf", "2026-01-01T10:00:00Z", null),
    c("fast", "Senior", "finished", "2026-01-01T10:05:00Z", "2026-01-01T10:12:00Z"),
  ]);
  expect(res.map((r) => r.crew.id)).toEqual(["fast", "slow", "dnf"]);
  expect(res.map((r) => r.position)).toEqual([1, 2, null]);
});

test("category filtering is optional and only includes the chosen category", () => {
  const crews = [c("junior", "Junior", "finished", "2026-01-01T10:00:00Z", "2026-01-01T10:08:00Z"), c("senior", "Senior", "finished", "2026-01-01T10:00:00Z", "2026-01-01T10:07:00Z")];
  expect(buildResults(crews, "Junior").map((r) => r.crew.id)).toEqual(["junior"]);
  expect(buildResults(crews).map((r) => r.crew.id)).toEqual(["senior", "junior"]);
});

test("finished view reorders as a faster crew finishes, using duration rather than finish timestamp", () => {
  const slow = c("slow", "Junior", "finished", "2026-01-01T10:00:00Z", "2026-01-01T10:08:00Z");
  const fast = c("fast", "Senior", "running", "2026-01-01T10:05:00Z", null);
  const finished = (crews) => buildResults(crews.filter((crew) => crew.status === "finished" || crew.status === "dnf")).map((r) => r.crew.id);
  expect(finished([slow, fast])).toEqual(["slow"]);
  expect(finished([slow, { ...fast, status: "finished", finish_time: "2026-01-01T10:12:00Z" }])).toEqual(["fast", "slow"]);
});
