import { describe, expect, test } from "bun:test";
import { fetchPublishedNews } from "./published-news.ts";

describe("dynamic published news", () => {
  function queryTrace(limit) {
    const calls = [];
    const query = {};
    for (const method of ["select", "eq", "order", "limit"]) {
      query[method] = (...args) => { calls.push([method, ...args]); return query; };
    }
    fetchPublishedNews({ from: (table) => { calls.push(["from", table]); return query; } }, limit);
    return calls;
  }
  test("reads saved published articles, not drafts", () => {
    const calls = queryTrace(2);
    expect(calls).toContainEqual(["from", "posts"]);
    expect(calls).toContainEqual(["eq", "published", true]);
  });
  test("orders articles by creation date newest first", () => {
    expect(queryTrace(2).filter(([method]) => method === "order")).toEqual([
      ["order", "created_at", { ascending: false }],
      ["order", "id", { ascending: true }],
    ]);
  });
  test("shows the two latest articles on Home and up to sixty on News", () => {
    expect(queryTrace(2)).toContainEqual(["limit", 2]);
    expect(queryTrace(60)).toContainEqual(["limit", 60]);
  });
});