# Project rules

- Keep calendar fixtures in a shared browser-safe module so Home and News display the same dates.
- Fetch the homepage's published news with a public read-only server function and the existing Query-less route loader; this keeps private drafts out and supports the first render.
- Use a generic Club News badge until articles have a real category field; do not invent article classifications.