# EventPro logo

- Concept: a ticket-shaped "E" with an orange flame, spark rays and an orbit swoosh (magenta to deep violet gradient), beside the wordmark "Event" (navy) + "Pro" (magenta).
- Measured colors: magenta `#c9035c`, "Pro" `#c3004c`, violet `#210151`, navy `#010028`, flame `#fd6c01`, rays `#fc9c00`.
- Files:
  - `eventpro-logo-transparent.png` (1086 x 344, transparent): full lockup. Light backgrounds only.
  - `eventpro-logo-transparent-source.png`: original artwork of the transparent lockup.
  - `eventpro-mark.png` (256 px, transparent): the ticket-E mark alone.
  - `eventpro-mark-source.png` / `eventpro-logo-source.png`: original high-resolution artwork. Do not reference them from the app.
  - `app/icon.png` (512 px) and `app/favicon.ico` (16, 32 and 48 px): generated from the mark.
- Light-only rule: the lockup's navy "Event" has no contrast on dark surfaces. On dark backgrounds render the mark plus live text (see `src/shared/ui/Wordmark.tsx`).
- Minimum sizes: mark 24 px, lockup 120 px wide, favicon 16 px. Clear space: one quarter of the mark height on every side.
