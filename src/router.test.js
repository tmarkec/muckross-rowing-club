import { test, expect } from "bun:test";
import { QueryClient } from "@tanstack/react-query";
import { getRouter } from "./router.tsx";

// The schedule page crashed with "No QueryClient set" because nothing in the app
// provided a cache. These guard the wiring that fixes it.

test("router context carries a QueryClient so every route can use the cache", () => {
  const context = getRouter().options.context;
  expect(context?.queryClient).toBeInstanceOf(QueryClient);
});

test("every request gets its own QueryClient so caches cannot leak between visitors", () => {
  const first = getRouter().options.context.queryClient;
  const second = getRouter().options.context.queryClient;
  expect(first).not.toBe(second);
});

test("cached reads are treated as stale straight away and refetched on mount", () => {
  const queries = getRouter().options.context.queryClient.getDefaultOptions().queries;
  expect(queries.staleTime).toBe(0);
  expect(queries.refetchOnMount).toBe("always");
});
