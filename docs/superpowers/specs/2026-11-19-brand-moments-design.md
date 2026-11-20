# Brand moments: EventPro showcase, login and promoter site — design

Date: 2026-11-19 · Status: draft for approval · Builder: Codex (via Orca worker) · Verifier: Claude

## 1. Intent and why

EventPro is a finalist candidate in **Software Innovation Awards 2026 (FISI – UNMSM)**, Category III (cycles VII–X).
The gala with Expo and final evaluation is on **2026-11-25, 5:00 p.m.**; rehearsal on 2026-11-23. Finalists pitch and
demo the prototype. The team will **project** the EventPro landing while pitching; jurors may also open it on their
phones (access is not public-promoted).

Rubric (Category III, 100 pts): problem 10, creativity/innovation 20, technical quality 25, development and
functioning 20, impact 15, presentation 10. Cross-cutting distinctions that a strong page helps with: **UX**,
**IA y Datos**, **Premio del Público**.

The current landing (`src/pages/landing`) speaks to the promoter's end client under the EventPro name, which mixes two
audiences. The user decided:

- EventPro (the system) gets its own **showcase landing that explains the system** to the jury.
- The promoter gets its own **client-facing site** under a **fictitious brand**, whose only job is to sell and send
  people to WhatsApp to get a quote.
- **Login** is EventPro's door and moves to the EventPro brand.

## 2. Goals, non-goals, anti-goals

Goals
- A jury member understands in under a minute: the problem, what EventPro automates, where humans keep control, and
  that it is real, working software.
- The showcase reads well **on a projector** (large type, high contrast, one idea per screen) and is fully usable
  from 360 px.
- Login and showcase look like the same product as the panel (one brand: "Credencial backstage", `DESIGN.md`).
- The promoter site is eye-catching and persuasive for an end client and has one dominant action: WhatsApp.

Non-goals
- No live backend calls from either landing (no live quote calculator, no live data fetch).
- No WhatsApp number migration or Meta business verification work.
- No operator agenda (`/agenda`) restyle, no panel changes, no backend changes (the bot's greeting name is a follow-up).

Anti-goals (failure even if it "works")
- Fabricated testimonials, client logos, stock "happy customers", invented metrics or awards (`PRODUCT.md` forbids it;
  the contest bases forbid falsified results). Numbers shown must come from the docs or real demo data.
- A generic, templated "AI-made" SaaS page (purple gradient blobs, three identical feature cards, emoji icons).
- Anything that can break on stage: autoplay video from external hosts, third-party embeds, network-dependent hero.
- Promoter site saying "EventPro" anywhere, or showing the panel login as a primary action.

## 3. Constraints

- Stack: Next.js 16 App Router + React 19 + Tailwind v4, feature-sliced under `src/` (pages in `src/pages/*`, routes in
  `app/*` re-export them). Only existing deps (`lucide-react`); a small animation lib is allowed only if CSS cannot do
  it, and must be justified.
- Brand tokens: `--ep-*` in `src/app/styles/globals.css`, rules in `DESIGN.md`. `--ep-brand-gradient`
  (magenta `#c9035c` → violet `#210151`) and `public/brand/eventpro-logo-transparent.png` are reserved for exactly
  these brand moments. Do not mix legacy tokens (`--brand`, `--ink`, `--line`, `--muted`, Geist) with `--ep-*` on one
  surface.
- UI copy: neutral Spanish (Peru), `tú` form, never voseo. Code, identifiers and comments in English.
- Accessibility: WCAG 2.2 AA, visible focus, 44 px touch targets, `prefers-reduced-motion` respected (animations
  degrade to the final state).
- WhatsApp number comes from an env var (`NEXT_PUBLIC_WHATSAPP_NUMBER` or the existing mechanism in
  `src/pages/landing/ui/actions.tsx` if one exists); no hardcoded number.
- Deadline: all three pieces ready for rehearsal on 2026-11-23; priority order below.
- No commits without the user's explicit confirmation; all work on one feature branch.

## 4. Approaches considered

- **A. Story with a scripted demo (chosen).** Problem → animated, front-end-choreographed flow (chat → quote → contract
  → panel) using real demo values → real panel screenshots → architecture and stack → impact. Always renders perfectly
  on stage; the "it really works" proof is the live panel demo the team does after the landing.
- B. Live embedded demo (e.g. type a district, backend computes mobility via Google Maps). Strongest technical proof,
  but depends on venue network and the VM; a failure happens in front of the jury, and it costs more days. Rejected.
- Separate app/deploy for the promoter site: cleaner separation, but double deploy work in 3 days. Rejected; one
  Next.js app with three routes.

## 5. Routes and priority

| Priority | Route | Piece | Brand |
|---|---|---|---|
| 1 | `/` | EventPro showcase landing | EventPro "Credencial backstage" |
| 2 | `/login` | EventPro login | EventPro |
| 3 | `/la-tremenda` | Promoter client site | Fictitious promoter brand "La Tremenda" |

The existing client-oriented landing content (WhatsApp flow copy, `ChatThread`) is reused/moved into the promoter
site where useful. `app/page.tsx` metadata is rewritten for the showcase.

## 6. Piece 1 — EventPro showcase (`/`)

Audience: jury. Projector-first. One idea per viewport-height section. Dark ink stage (`--ep-ink`) for hero and the
flow section (better on projectors), light `--ep-pass` sections for reading-heavy parts. Brand gradient only on the
hero accent and the final CTA.

Sections, in order:
1. **Header**: transparent lockup, anchors (Problema, Cómo funciona, Producto, Arquitectura), "Ingresar al panel"
   (→ `/login`), "Ver sitio del cliente" (→ `/la-tremenda`).
2. **Hero**: one-line promise (e.g. "De un mensaje de WhatsApp a un contrato firmado, sin perder el control."),
   short subline, primary CTA "Ver cómo funciona" (scroll), secondary "Ingresar al panel". Visual: the hero entrance
   is the start of the scripted flow (a WhatsApp chat bubble that turns into a quote card).
3. **El problema (As-Is)**: the five pain points from `backend/Docs/01-requisitos/01-vision-alcance-y-actores.md` §1.2
   (slow manual WhatsApp quoting, error-prone manual contracts, agenda in memory, lost client notes, no financial
   visibility), phrased as the business lived them. Contrast with the To-Be in the same section.
4. **El flujo (scripted demo — the centerpiece)**: a scroll- or step-driven sequence, 4–5 steps, each with a short
   caption: (1) client writes on WhatsApp and the bot shows packages; (2) deterministic quote with mobility computed
   (Google Maps distance, +15 % commercial surcharge, 10 % advance); (3) advance payment via Yape/Plin verified by the
   encargado; (4) PDF contract signed with OTP from the phone; (5) the event lands in the schedule and finances.
   Values must match real demo data or the documented tariff (1.00/km, 0.30/min, min S/ 20, ×1.15). Built with
   front-end components that mimic the real UI; no network.
5. **Control humano**: handoff inbox (bot → encargado → bot), 24 h service window, manual approvals (sobrecupo),
   overrides. This is the product's positioning; give it its own section.
6. **El producto**: real screenshots of the panel (Conversaciones, Cotizaciones, Cronograma, Finanzas) and the
   operator mobile agenda, in device frames. Screenshots captured from the demo deployment with demo data only
   (no real personal phone numbers visible; blur or use test clients).
7. **Arquitectura y stack**: a clean diagram (hexagonal backend, WhatsApp Cloud API → Chatwoot gateway → FastAPI/
   backend → Postgres; Next.js frontend; Google Maps; PDF + OTP) and a compact stack list. Source of truth for the
   architecture: `backend/Docs/02-arquitectura/`. Inline SVG or HTML/CSS, not an image.
8. **Impacto**: what changes for each actor (cliente, encargado, elenco) — qualitative unless a number is documented.
9. **Equipo y cierre**: team members and roles (from the application form), course/contest mention, final CTA
   "Ingresar al panel" + "Ver sitio del cliente".
10. **Footer**.

Motion: a hero entrance and the flow sequence are the two "dealt moments"; everything else is quiet. All motion off
under `prefers-reduced-motion`.

## 7. Piece 2 — Login (`/login`)

Split layout on desktop: left brand panel (`--ep-brand-gradient` or ink with the lockup, one line of positioning,
e.g. "Panel de operación de eventos"), right the form on `--ep-pass`. Single column on mobile with the lockup on top.
Uses the migrated `src/shared/ui` ep components (Field, Input, Button, ErrorBanner). Keep current behavior: role-based
redirect (`OPERADOR` → `/agenda`, else `/panel`), error banner, loading state. Add: password visibility toggle,
`aria-live` error, link back to `/`. Remove the hardcoded prefilled email `admin@eventpro.pe` (decision: it looks
unfinished on a projector; demo credentials are typed by the presenter).

## 8. Piece 3 — Promoter site (`/la-tremenda`)

Fictitious brand **"La Tremenda — Shows y eventos"** (Claude's proposal, user may rename; the name must not appear
in EventPro surfaces except the "Ver sitio del cliente" link). Own festive palette and type, clearly different from
EventPro's backstage brand but still accessible; a simple wordmark (text-based, no generated logo image needed).

One page, mobile-first, persuasive:
1. Hero with the WhatsApp CTA ("Cotiza por WhatsApp") as the only primary action; supporting line about speed
   ("Cotización en el chat, con movilidad incluida").
2. What we do: the real service lines (Hora Loca, DJ, MC, shows infantiles, baby showers, decoración temática, toldos,
   personajes gigantes). Prices only if taken from the catalog/demo data; otherwise "desde" omitted.
3. How booking works in 3 steps (reuse current `HowItWorks` copy, client voice).
4. Payment and trust facts that are true: Yape/Plin/transfer, 10 % advance, digital contract signed from the phone.
   No testimonials.
5. Final WhatsApp CTA + sticky mobile WhatsApp button. Footer with a discreet "Acceso del equipo" link to `/login`.

Imagery: no stock "happy customer" photos. Use illustration, typography, color and shapes; any photo must be licensed
and generic (party lights, confetti), never implying real clients.

## 9. Left to the builder

Exact copy wording within the stated intent; component split; animation technique (CSS/IntersectionObserver
preferred); fictitious brand palette and type choice; diagram styling; screenshot framing. The builder must use the
frontend design skills available to it and follow `DESIGN.md` for EventPro surfaces.

## 10. Verification (Claude)

Per piece: `npm run lint`, `npx tsc --noEmit`, `npm run build`; Playwright screenshots at 1920×1080 (projector),
1366×768 and 375×812; keyboard pass; reduced-motion pass; contrast check of key text; review against the anti-goals
list. Findings go back to Codex as a bounded correction.

## 11. Resolved after builder check

Calls made by Claude (user may override):
- **Team section**: names and roles only, no photos, no emails. Source: `Postulacion_EventPro_Software_Innovation_Awards_2026.docx`
  (repo parent folder): Mathias James Torres Lezama (Líder Técnico), Luis David Morales Brenis (Desarrollador Full
  Stack), Alan Nicolás García Avalos (Desarrollador Full Stack), Renzo Pedro Cordero Alfaro (Desarrollador Frontend).
- **Showcase surfaces**: ink (`--ep-ink`) for header, hero, flow and final CTA; `--ep-pass` for problem, control
  humano, producto, arquitectura, impacto, equipo. `--ep-brand-gradient` only as hero accent and final CTA band.
- **Login brand panel**: `--ep-brand-gradient` with the transparent lockup (it is a brand moment).
- **Promoter site**: reachable from the showcase ("Ver sitio del cliente") and will be shown to the jury, so it must
  look good at 1920×1080 too, but it is designed mobile-first.
- **Promoter prices**: show "desde S/ X" taken from the live catalog (captured 2026-11-20): Hora Loca Básica S/ 450, Hora Loca Medium S/ 750, Hora Loca Premium S/ 1,200, Combo Full Fiesta (Hora Loca + DJ) S/ 1,300, Servicio de DJ y Luces Pro S/ 600, Show Infantil Divertido S/ 650, Paquete Baby Shower Especial S/ 550, Ambientación y Toldos Estándar S/ 900. Extras: Bailarín/Animador S/ 150, Cañón de confeti S/ 120, Hora extra DJ S/ 150, Muñeco Gorila Gigante S/ 250, Robot LED con pistola de CO2 S/ 350.
- **Old landing**: `/` becomes the showcase; no auth redirect is added. `ChatThread`, `HowItWorks` copy and
  `WhatsAppAction` move to the promoter site; `Audiences`/`ClosingCta` are replaced. The flow demo may reuse
  `ChatThread` visuals but lives in the showcase slice. `button-link` migrates to `--ep-*` tokens.
- **WhatsApp number**: keep the existing mechanism (`buildWhatsAppUrl()` from `@/shared/config`,
  `NEXT_PUBLIC_WHATSAPP_NUMBER`), which already renders an inert CTA when unset. The verifier checks the deployed
  env has the number before rehearsal.
- **Panel screenshots (user decision 2026-11-20)**: Claude captures real screenshots from production with Playwright,
  logged in as an encargado (password typed by the user, never stored), demo data only, real phone numbers hidden.
  Stored in `public/showcase/` as optimized WebP/PNG before Codex starts the Producto section.
- **Screenshot inventory** (`public/showcase/`, 1600×1000 WebP, phones and address masked): `panel-conversations-open.webp`
  (bot quote summary: services S/ 1,000 + mobility S/ 80.50, advance S/ 100), `panel-quotes.webp`,
  `panel-catalogo.webp`, `panel-solicitudes.webp` (manual flow: solicitud → comprobante → contrato PDF).
  Not captured: Cronograma (shows "Cliente/Paquete pendiente de integración" placeholders — known data issue, do not
  feature), Finanzas (all S/ 0.00, no liquidated events), operator agenda (needs an operator account). The Producto
  section uses these four; cronograma/finanzas/agenda are shown only as part of the scripted flow, never as fake
  screenshots.
