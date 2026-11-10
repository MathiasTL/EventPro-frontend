---
version: 1
slug: "src-pages-conversations-index-tsx"
primary_target: "src/pages/conversations/index.tsx"
related_targets: ["src/widgets/conversation-inbox","src/widgets/conversation-thread"]
---

# Surface brief: Conversaciones (panel pilot)

Scope: `/panel/conversations`, the pilot of the EventPro brand redesign (whole panel next, then login and landing).
Visitor mode: Operate.
Audience and job: the two encargados take over WhatsApp conversations the bot hands off, reply inside the 24 h
service window, and return them to the bot. Desktop-first, responsive to phone.
Constraints: no invented features; only real actions (Tomar, Reasignarme, Devolver al bot, Enviar, Reintentar,
attachments, filters, load older). Keep Block 1/2 behavior (links, URL filters, focus, live region, 44px targets).
Chosen direction: Credencial backstage (assigned by the roll; user chose it 2026-11-09).
Reference sketch: `.impeccable/mocks/decision/assigned.html` (composition the build matches; its "Ver cotización" and
"Marcar resuelta" buttons are not real features and are replaced by the real actions).
Memorable moment: the open thread's header is the client's credential, with who holds it and the window countdown.
Unresolved: logo (Codex generates it); dark theme not in scope for the pilot.

## Direction contract

THESIS: Every conversation is a production pass: its colour band says who holds it and how urgent it is at a glance.
Refuses the category default of a grey list with one accent and stacked badges.

OWN-WORLD: Ink #15131E shell rail; pass white #FAFAF7 panels; magenta #CC1170 for "tú" and brand (text-safe);
cobalt #2446E0 for bot; signal orange #FF5A1F for pending handoff. Archivo with condensed bold caps for names and
credential labels, normal width for body. Colour bands are fields, width encodes urgency; states are marks: outline
at rest, filled when held, struck when resolved. No radius beyond small; no shadows on bubbles.

STORY: The encargado sees at once which conversations need a human, takes one, answers inside the window, and hands
it back to the bot, never wondering who holds what.

FIRST VIEWPORT: Left ink rail with EVENTPRO wordmark and section nav. Inbox column: condensed "CONVERSACIONES" title,
search, tabs with counts, rows standing on vertical credential bands (BOT / DERIVADA / TÚ). Thread: credential header
(PASS · CLIENTE kicker, client name in large condensed caps, phone, quote state), holder block in magenta ("ATIENDES
TÚ") over an ink window countdown bar; real actions below; messages; composer with Enviar. On phones the thread owns
the screen; header and composer collapse to one line each.

FORM: Credencial backstage, candidate 5 of 7 on the ordered list. seed:a62d18fc80a50668

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
