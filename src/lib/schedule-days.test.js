import { describe, expect, test } from "bun:test";
import { DAYS, dayLabel, dayName, dayNumber, matchesDay } from "./schedule-days.ts";

describe("schedule day normalisation", () => {
  test("maps numeric strings and numbers to Monday-first day names", () => {
    expect(["1", "2", "3", "4", "5", "6", "7"].map((v) => dayName(v))).toEqual([
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ]);
    expect([1, 2, 3, 4, 5, 6, 7].map((v) => dayName(v))).toEqual([
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ]);
  });
  test("treats 0 and '0' as Sunday, the same as 7", () => {
    expect(dayName("0")).toBe("Sunday");
    expect(dayName(0)).toBe("Sunday");
  });
  test("a filter matches either the raw stored string or the day name", () => {
    expect(matchesDay("1", "Monday")).toBe(true);
    expect(matchesDay("Monday", "1")).toBe(true);
    expect(matchesDay("Tue", 2)).toBe(true);
    expect(matchesDay("Thurs", "4")).toBe(true);
    expect(matchesDay("Sunday", 7)).toBe(true);
    expect(matchesDay("Monday", "2")).toBe(false);
    expect(matchesDay("Monday", null)).toBe(false);
  });
  test("leaves values outside the week unrecognised instead of guessing", () => {
    expect(dayNumber("TBC")).toBeNull();
    expect(dayNumber("8")).toBeNull();
    expect(dayNumber("")).toBeNull();
    expect(dayLabel("TBC")).toBe("TBC");
    expect(dayLabel(null)).toBe("Unscheduled");
  });
  test("the day list is Monday first", () => {
    expect([...DAYS]).toEqual([
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ]);
  });
});
