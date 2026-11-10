# EventPro logo

- Concept: a ticket-shaped "E" with spark accents and an orbit swoosh (magenta to purple gradient, orange accents).
- Files:
  - `eventpro-mark.png` (256 px, transparent): the ticket-E mark alone. Used on dark surfaces next to live "EventPro" text.
  - `eventpro-logo.png` (1086 × 362, opaque white background): full lockup with the "EventPro" wordmark. Use only on light backgrounds.
  - `eventpro-mark-source.png` / `eventpro-logo-source.png`: original high-resolution artwork. Do not reference them from the app.
  - `app/icon.png` (512 px): favicon generated from the mark.
- On dark backgrounds never use the full lockup: its background is opaque and the navy "Event" has no contrast on ink. Render the mark plus text instead (see `src/shared/ui/Wordmark.tsx`).
- Minimum size: mark 24 px.
