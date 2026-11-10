---
name: EventPro
description: Backstage production-pass system for the EventPro panel; ink rail, pass-white panels, colour bands that say who holds what.
colors:
  ink: "#15131e"
  ink-2: "#221f30"
  ink-line: "#34304a"
  ink-mute: "#a09cb5"
  rail-text: "#c9c5da"
  pass-white: "#fafaf7"
  wash: "#f1f0f4"
  line: "#e3e1e8"
  line-strong: "#cfccd9"
  mute: "#5e5a70"
  body: "#3f3b52"
  magenta: "#c9035c"
  magenta-bright: "#e3106f"
  cobalt: "#2446e0"
  signal: "#fd6c01"
  magenta-field: "#fce6ef"
  cobalt-field: "#e9edfc"
  cobalt-line: "#c9d2f6"
  signal-field: "#fff0e2"
  signal-line: "#ffcf9e"
  neutral-field: "#ebeaf0"
  danger: "#b4232c"
  danger-field: "#fbe9ea"
  success: "#1d6b4a"
  success-field: "#e3f3ea"
  progress: "#0a6578"
  progress-field: "#e0f1f5"
  violet: "#210151"
typography:
  credential-name:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "3rem"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "0.04em"
    fontVariation: "'wdth' 62"
  row-name:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "0.04em"
    fontVariation: "'wdth' 62"
  band-label:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 800
    letterSpacing: "0.04em"
    fontVariation: "'wdth' 62"
  holder-block:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1.4375rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "0.04em"
    fontVariation: "'wdth' 62"
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.90625rem"
    fontWeight: 400
    lineHeight: 1.45
    fontVariation: "'wdth' 100"
  body-small:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.4
  caption:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    fontFeature: "'tnum'"
rounded:
  mark: "2px"
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "28px"
  tap: "44px"
components:
  button-solid:
    backgroundColor: "{colors.ink}"
    textColor: "#ffffff"
    rounded: "{rounded.lg}"
    padding: "0 14px"
    height: "44px"
  button-solid-hover:
    backgroundColor: "{colors.ink-2}"
  button-outline:
    backgroundColor: "{colors.pass-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "0 14px"
    height: "44px"
  input-field:
    backgroundColor: "#ffffff"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "0 12px"
    height: "44px"
  nav-item-active:
    backgroundColor: "{colors.pass-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "36px"
  nav-item:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.rail-text}"
    rounded: "{rounded.md}"
    height: "36px"
  band-mine:
    backgroundColor: "{colors.magenta}"
    textColor: "#ffffff"
    width: "36px"
  band-bot:
    backgroundColor: "{colors.cobalt}"
    textColor: "#ffffff"
    width: "24px"
  band-pending:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.ink}"
    width: "48px"
  bubble-client:
    backgroundColor: "{colors.pass-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "8px 12px"
  bubble-bot:
    backgroundColor: "{colors.cobalt-field}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "8px 12px"
  bubble-own:
    backgroundColor: "{colors.magenta}"
    textColor: "#ffffff"
    rounded: "{rounded.xl}"
    padding: "8px 12px"
---

# Design System: EventPro

> Scope note. This file records the EventPro BRAND system as built. The whole panel is migrated: the shell (ink rail, phone drawer, section icons), Conversaciones, every panel page (Solicitudes, Catálogo, Sobrecupo, Cronograma, Pagos, Finanzas, Usuarios, Auditoría, Cotizaciones) and the shared UI in `src/shared/ui` (Page, PageHeader, FilterBar, Panel, Notice, LoadingState, Button, fields, Badge, Table, Modal, EmptyState). Login, landing, the operator agenda and `button-link` still use the legacy violet / zinc / Geist line; its tokens (`--brand`, `--ink`, `--line`, `--surface`, `--muted`, Geist faces) remain in `globals.css` until those surfaces migrate. Light theme only. Do not mix legacy tokens with `--ep-*` on one surface.

## Overview

**Creative North Star: "The Backstage Pass"**

Every conversation is a production pass. Its colour band says who holds it and how urgent it is, at a glance, before any text is read. The world is an ink-black backstage rail beside pass-white paper: condensed bold caps for names and credential labels, plain-width Archivo for everything people actually read, flat fields of colour instead of badges, and state carried by marks rather than decoration. It refuses the category default of a grey list with one accent colour and stacked pill badges.

The system is dense and operational. The two encargados work mostly on a desktop, sometimes on a phone, and need to know instantly which conversations need a human. Colour is always paired with text (band labels, holder names, "Atiende el bot"), never alone. Surfaces are flat: borders and tonal fields do the layering, there are no shadows anywhere in the built panel.

The logo is a gradient ticket-shaped "E" (magenta to deep violet) with an orange flame, spark rays and an orbit swoosh, set beside the wordmark "Event" (navy) + "Pro" (magenta). Its measured colors drive the palette: magenta `#c9035c`, "Pro" `#c3004c`, violet `#210151`, navy `#010028`, flame `#fd6c01`, rays `#fc9c00`.

**Key Characteristics:**
- Ink rail (`#15131e`) beside pass-white (`#fafaf7`) panels on a cool wash (`#f1f0f4`) page.
- Four role colours, each one meaning: magenta = "tú" and brand, cobalt = bot, signal orange = pending handoff, ink = another encargado.
- Band width encodes urgency (pending 48px, held 36px, bot 24px); the rotated condensed label names the holder.
- State marks: outline at rest, filled when a person holds it, struck text when resolved.
- Condensed bold caps (Archivo width axis 62%) for names and credential labels; normal width for reading.
- Flat: no shadows, small radii, 1px hairlines in violet-tinted greys.

## Colors

A violet-tinted neutral set (all greys lean toward hue 280) carrying four saturated role colours used as flat fields.

### Primary
- **Access Magenta** (`#c9035c`): "tú", the brand, the active nav icon, own-message bubbles, caret and text selection, focus outlines. The text-safe magenta; white text on it passes.
- **Access Magenta Bright** (`#e3106f`): non-text fills only. Never set text in it.
- **Logo Violet** (`#210151`, `--ep-violet`): brand accent taken from the logo gradient. Never a state color and never body text on dark (it has no contrast on ink). Reserved for brand moments (login, landing) through `--ep-brand-gradient` (`linear-gradient(135deg, #c9035c, #210151)`), not applied anywhere yet. The no-gradient rule for panels still holds.

### Secondary
- **Bot Cobalt** (`#2446e0`): the bot. The 24px band, the "Atiende el bot" holder block, bot bubble label text.
- **Handoff Signal** (`#fd6c01`): a conversation waiting for a person. Always carries ink text, never white. Also the urgent state of the 24 h window bar.

### Neutral
- **Backstage Ink** (`#15131e`): rail, solid buttons, primary text, window countdown bar, selected-row ring, "Enc" band for another encargado.
- **Ink 2** (`#221f30`): rail hover, solid button hover, other-encargado holder block.
- **Ink Line** (`#34304a`): hairlines on ink and the window bar track.
- **Ink Mute** (`#a09cb5`): inactive nav icons, logout border on ink.
- **Rail Text** (`#c9c5da`): nav text on the rail.
- **Pass White** (`#fafaf7`): the panel surface: rows, header, client bubbles, composer, active nav item.
- **Page Wash** (`#f1f0f4`): the page behind panels.
- **Hairline** (`#e3e1e8`) and **Strong Hairline** (`#cfccd9`): row dividers, bubble borders, control borders, scrollbar thumb, the "Libre" band.
- **Muted Ink** (`#5e5a70`) and **Body Ink** (`#3f3b52`): timestamps and secondary text; running text and previews.
- **State fields**: magenta `#fce6ef`, cobalt `#e9edfc` (line `#c9d2f6`), signal `#fff0e2` (line `#ffcf9e`), neutral `#ebeaf0`. Low-chroma tints used behind text that stays ink.
- **Danger** (`#b4232c`, field `#fbe9ea`): failed sends, action errors and negative states (rejected, refunded).
- **Success** (`#1d6b4a`, field `#e3f3ea`): completed or positive states (verified payment, converted quote, active
  user) and confirmation notices. Never a holder colour; always with its text label.
- **Progress** (`#0a6578`, field `#e0f1f5`): states that are under way and need no action from the encargado (quote sent,
  event scheduled or awaiting signature, payment not yet reviewed). Teal, kept apart from Success green and Bot Cobalt.
- **Status tones**: every status chip carries a meaningful colour (progress, warning = a person must act, success,
  danger = rejected, expired, cancelled, inactive). Neutral grey is only for categories that are not states (payment concept).

### Named Rules
**The Band Means Holder Rule.** Magenta, cobalt, signal and ink each mean exactly one holder. Never use a role colour decoratively, and never show a holder colour without its text label.

**The Signal Is Ink-Texted Rule.** Signal orange takes ink text. White on it fails contrast.

**The Magenta Text Rule.** Only `#c9035c` may be text; the bright magenta is for fills.

## Typography

**Display / Label Font:** Archivo at width 62% (`font-stretch`, loaded with the `wdth` axis), weight 800, uppercase, `0.04em` tracking. Utility class `.ep-cond`.
**Body Font:** Archivo at width 100%. Set on `.ep-panel`.
**Mono:** none in the new system.

**Character:** a stencilled production-pass voice for names and labels, a calm grotesque for reading. The width axis does the contrast; there is a single family.

### Hierarchy
- **Credential Name** (800, 3rem / 0.95, condensed caps, desktop only; `1.25rem` on phone): the client name in the thread header.
- **Row Name** (800, 1.1875rem / 1.1, condensed caps): inbox row title.
- **Holder Block** (800, 1.4375rem / 1.1, condensed caps): "ATIENDES TÚ" and its siblings in the header.
- **Band Label** (800, 0.8125rem, condensed caps, vertical-rl rotated 180deg): BOT / DERIVADA / TÚ / ENC / LIBRE.
- **Body** (400, 0.90625rem / 1.45): message text, composer.
- **Body Small** (400-600, 0.8125rem): previews, tabs, buttons.
- **Caption** (500, 0.75rem, tabular numerals): timestamps, window countdown, status marks.

The shell nav and wordmark-adjacent UI use the same Archivo at normal width, `0.875rem`.

### Named Rules
**The Caps Are Names Rule.** Condensed caps are for names and credential labels only. Never set a sentence, a button label or a paragraph in them.

**The Tabular Time Rule.** Anything that counts or stamps time (relative times, 24 h countdown, message times, phone numbers) uses tabular numerals.

## Layout

Desktop is a three-part frame: a 208px ink rail (`lg:w-52`, sticky, full height), a fixed-width inbox column, and a flexible thread pane. The thread header floats in `28px` side margins as a bounded credential (a 1fr identity cell plus a 248px holder-and-window cell); messages and the composer share the same 28px gutters.

On phones the rail becomes a 48px ink top bar with a "Menú" disclosure that opens a full-height ink drawer; it closes on navigation and on Escape (focus returns to the button). The thread owns the screen: the credential header collapses to one line (back button, name, a holder chip and a window chip), the composer to one line. Inbox filters collapse behind a "Filtros (n)" disclosure.

Spacing runs on small steps (4, 8, 12, 16, 28px) with a hard accessibility floor: every control is at least 44px tall on touch (`min-h-11`) and relaxes to 36-40px at `lg`. Rows are at least `5.75rem` tall. Message bubbles cap at 85% width, 34rem at `sm`.

## Elevation & Depth

Flat. There are no box-shadows in the built panel. Depth is conveyed by tonal layering (wash page, pass-white panels, white hover/selected rows), hairline borders, the selected row's 2px inset ink ring, and the single mask-gradient `.ep-fade-top` that fades message content over the first 16px so a bubble is never sliced hard under the header.

### Named Rules
**The Flat Rule.** Surfaces never lift. Hover brightens a surface to white or darkens ink to ink-2; it does not cast.

## Shapes

Mostly small and square-leaning. Role marks are 9px squares with a 2px corner and 1.5px border; Controls (buttons, inputs, composer shell) use 8px; bubbles use 12px with the tail-side top corner cut to 4px (right bubbles `rounded-tr-sm`, left `rounded-tl-sm`); the header credential is 8px. Colour bands are full-height rectangles with no radius, standing on the left edge of a row. The activity pill is the one fully rounded shape.

Mobile chips use 4px. Logo: the ticket-E mark is square (`eventpro-mark.png`, 256px); clear space is one quarter of the mark height on every side; minimum mark size 24px, minimum lockup width 120px, favicon (`app/favicon.ico`) at 16, 32 and 48px.

## Components

### Buttons
Quiet and square-ish, 44px on touch, 40px at `lg` (same height as fields, so they align in filter bars).
- **Solid (Tomar, Enviar, confirm):** ink fill, white text, `0.8125rem`/600, 8px radius; hover ink-2. Reserved for the action that claims or sends.
- **Outline (Reasignarme, Devolver al bot, Cancelar):** pass-white fill, 1px strong hairline, ink text; hover white.
- **Focus:** 2px magenta outline, 2px offset. Disabled: 60% opacity (Enviar 40%).

### Inputs / Fields
- **Style:** white fill, 1px ink border, 8px radius, 44px (40px at `lg`), muted placeholder.
- **Select:** native chrome removed (`.ep-select`), ink square-cap chevron as background image.
- **Checkbox:** 18px, magenta accent.
- **Focus:** 2px magenta outline; caret is magenta inside `.ep-panel`; selection is magenta with white text.

### Navigation (ink rail)
- **Item:** 36px (44px on phone), 6px radius, rail-text on ink; hover ink-2 with pass-white text.
- **Active:** pass-white fill, ink bold text, Lucide icon (18px, stroke 1.75, square caps) in magenta; inactive icons in ink-mute, pass-white on hover. Icons: Solicitudes Inbox, Catálogo Package, Sobrecupo Layers, Cronograma CalendarDays, Pagos Wallet, Finanzas ChartLine, Usuarios Users, Auditoría ScrollText, Conversaciones MessagesSquare, Cotizaciones ReceiptText.
- **Footer:** user name truncated, outline "Salir" button in pass-white on ink.
- **Focus:** pass-white outline inset on ink; magenta on the active (pass-white) item.

### Conversation Row (signature)
A pass-white strip at least 5.75rem tall with a vertical credential band on its left edge. Band: width = urgency (Derivada 48px signal, Tú 36px magenta, Enc 36px ink with the holder's initials, Libre 36px strong-hairline, Bot 24px cobalt), label rotated and condensed. Content: condensed-caps client name, relative time (tabular, bold when pending), preview (semibold when unread), pending rows add the handoff reason in bold, then a mark + lead status, then the unread badge. Selected: white with a 2px inset ink ring. Mark grammar: outline at rest (bot, free), filled when a person holds it (tú, enc, derivada), struck-through text when resolved.

### Credential Header (signature)
The open thread's header is the client's pass: condensed-caps name (3rem on desktop), phone and lead status with its mark, and a right-hand holder block in the holder colour ("ATIENDES TÚ", "ATIENDE EL BOT", "SIN ASIGNAR", "ATIENDE <name>") above an ink window bar: "Ventana 24 h · cierra en <time>" with a 3px progress bar (pass-white, signal when urgent, empty when closed). Real actions (Reasignarme, Devolver al bot) sit below; Tomar lives in the composer notice. On phones it collapses to a one-line header with a holder chip and a window chip.

### Message Bubbles
Flat, bordered, no shadow, 12px radius with a 4px tail corner. Client: pass-white, left. Bot: cobalt-field with cobalt-line border, right, "BOT" label in cobalt. Another encargado: neutral-field, right, name label. Own: magenta with white text, right. Time and delivery mark sit inside the bubble in tabular 11px. Failed sends get a 2px danger outline and an inline reason with "Reintentar". Activity events are a centred pill with a filled magenta mark. Only live incoming client and bot messages play the `chat-in` entrance (420ms, `cubic-bezier(0.22, 1, 0.36, 1)`, 10px rise, 0.98 scale); it is disabled under `prefers-reduced-motion`.

### Composer
A pass-white shell (1px strong hairline, 12px radius, magenta focus-within outline) holding an attach icon button, an auto-growing textarea (`field-sizing: content`, max 10rem) and a solid ink "Enviar". Enter sends, Shift+Enter adds a line (hint shown at `lg`). When blocked, a pass-white notice with the reason and optional action sits above it; errors use a live region.

### Logo / Wordmark
`Wordmark` (`src/shared/ui/Wordmark.tsx`) is the only entry point. `tone="light"` renders the transparent lockup `public/brand/eventpro-logo-transparent.png` (1086 x 344), for light backgrounds only because its navy "Event" disappears on dark. `tone="dark"` (ink rail) renders the transparent mark plus live text: "Event" in pass-white, "Pro" in bright magenta. Mark is 36px tall in the shell; the light lockup is 40px tall.

## Do's and Don'ts

### Do:
- **Do** let a colour band plus its text label say who holds a conversation; width carries urgency.
- **Do** use condensed caps (`.ep-cond`) only for client names, holder blocks and credential labels.
- **Do** keep surfaces flat: hairlines, tonal fields, an inset ink ring for selection.
- **Do** put ink text on signal orange and white text on magenta, cobalt and ink.
- **Do** keep every touch target at least 44px, relaxing to 36-40px at `lg`.
- **Do** use the mark grammar for state: outline at rest, filled when held, struck when resolved.
- **Do** use `--ep-*` tokens on any new migrated surface and keep light theme only until a dark theme is designed.

### Don't:
- **Don't** add shadows, glows or gradient fills to panels, bubbles or buttons.
- **Don't** show holder or status by colour alone.
- **Don't** set body text, buttons or sentences in the condensed caps.
- **Don't** use `#e3106f` for text.
- **Don't** use violet as a state color or as text on dark surfaces; **don't** place the transparent lockup on dark backgrounds.
- **Don't** mix legacy tokens (violet, zinc, Geist, `--brand`) with `--ep-*` on one surface; migrate the surface whole.
- **Don't** replace the standing column band with stacked pill badges on rows.
- **Don't** animate history: the entrance plays only for live incoming messages.

## Not canonized (defects the build carries)

None in the panel. The earlier composer "✕" glyph and the legacy shared Modal are migrated (lucide `X` icon, flat ep Modal). Outside the panel, the operator agenda still uses text-glyph arrows and the legacy line; migrate it with login and landing.
