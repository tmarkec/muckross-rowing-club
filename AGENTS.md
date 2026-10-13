# Project rules

- Keep calendar fixtures in a shared browser-safe module so Home and News display the same dates.
- Fetch the homepage's published news with a public read-only server function and the existing Query-less route loader; this keeps private drafts out and supports the first render.
- Share the published-news query between Home and News so visibility and ordering stay consistent.
- Use a generic Club News badge until articles have a real category field; do not invent article classifications.
- Pin every TanStack package to the exact set `@tanstack/react-start` declares; a looser range mixes router-core versions and the server crashes with "object is not iterable".
- Give each request its own QueryClient through router context and provide it once in the root route, so cached reads work in every route without leaking data between visitors.
- Keep anonymous and published reads on policies that never call the role helper functions; those helpers are not runnable by signed-out visitors.
- Normalise every day_of_week value through the shared helpers in `src/lib/schedule-days.ts` before grouping, filtering or saving, because stored values arrive as numbers, numeric strings or day names.
