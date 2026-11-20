# Brand Moments Implementation Plan

> **For agentic workers:** Builder is Codex (Orca worker), verifier is Claude. Execute task by task; after each task
> stop, report the commands you ran with their observed output, and wait for verification. Do NOT commit; Claude
> proposes commits and the user confirms them. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `/` with an EventPro showcase for the FISI jury, redesign `/login` on the EventPro brand, and add a
client-facing promoter site at `/la-tremenda`.

**Architecture:** One Next.js app, three routes. Each page is a feature-sliced page under `src/pages/<name>/` with
`index.tsx` + `ui/*` section components; `app/*/page.tsx` only re-exports and declares metadata. Showcase and login
use `--ep-*` tokens; the promoter site gets its own scoped tokens. All motion is CSS + `IntersectionObserver`, no
network calls.

**Tech Stack:** Next.js 16.4.6 (App Router, read `node_modules/next/dist/docs/` before using any Next API — this
version has breaking changes), React 19.2, Tailwind CSS v4, `lucide-react`, `next/image`, `next/font/google`.

**Spec:** `docs/superpowers/specs/2026-11-19-brand-moments-design.md` (read it fully, especially §6–§8 and §11).

## Global Constraints

- Branch: `feat/brand-moments` from `main`. No commits by the builder.
- UI copy: neutral Spanish (Peru), `tú` form; never voseo or Rioplatense slang. Code, identifiers, comments: English.
- EventPro surfaces use only `--ep-*` tokens and `--font-ep` (Archivo) per `DESIGN.md`; never mix legacy `--brand`,
  `--ink`, `--line`, `--muted`, Geist on the same surface.
- `--ep-brand-gradient` only on: showcase hero accent, showcase final CTA band, login brand panel.
- No fabricated testimonials, logos, metrics, awards or stock "customer" photos. Numbers only from the spec.
- No new runtime dependency unless CSS cannot do it; justify any addition in the report.
- WhatsApp links only through `buildWhatsAppUrl(message)` from `@/shared/config` (inert CTA when the number is unset).
- Every animation must render its final state under `prefers-reduced-motion: reduce` and when JS has not run
  (server-rendered content is visible by default; animation classes are added client-side).
- Projector legibility: at 1920×1080, body copy ≥ 18px, section titles ≥ 48px, contrast ≥ 4.5:1 for text.
- Responsive: no horizontal scroll from 360px to 1920px; touch targets ≥ 44px.
- Images via `next/image` with explicit `width`/`height` and meaningful Spanish `alt`.

## Review Focus

1. **Reduced motion / no-JS**: content hidden at `opacity:0` until an observer fires would leave sections blank on
   stage if hydration is slow → content must be visible by default (checked in each task's Playwright step with
   `emulateMedia({ reducedMotion: 'reduce' })` and with JS disabled).
2. **360px width**: wide flow cards, device frames and the architecture diagram overflow → `scrollWidth <= innerWidth`
   at 360px on every page.
3. **Projector at 1920×1080**: thin text and low-contrast mute grays wash out → contrast and size checks above.
4. **Unset `NEXT_PUBLIC_WHATSAPP_NUMBER`**: promoter CTAs must render disabled, never `href="https://wa.me/?..."`.
5. **Keyboard**: the flow stepper and login password toggle must be operable by keyboard with visible focus.

## Verification commands (every task)

```bash
npm run lint
npx tsc --noEmit
npm run build
```
Expected: all exit 0, no new warnings in touched files. Then `npm run start` (or `npm run dev`) and Claude runs the
Playwright checks listed per task at 1920×1080, 1366×768 and 375×812 (plus 360px overflow check).

---

### Task 1: Route restructure + showcase shell (header, hero, footer)

**Files:**
- Create: `src/pages/showcase/index.tsx`, `src/pages/showcase/ui/showcase-header.tsx`,
  `src/pages/showcase/ui/showcase-hero.tsx`, `src/pages/showcase/ui/showcase-footer.tsx`,
  `src/pages/showcase/lib/use-reveal.ts`
- Move: `src/pages/landing/*` → `src/pages/promoter/*` (unchanged content for now; renamed export `PromoterPage`)
- Create: `app/la-tremenda/page.tsx` (re-exports `PromoterPage`, metadata title "La Tremenda · Shows y eventos en Lima")
- Modify: `app/page.tsx` (re-export `ShowcasePage`; metadata title "EventPro · Software Innovation Awards 2026",
  description from spec §1/§6)
- Modify: `src/shared/ui/button-link.tsx` (migrate variants to `--ep-*`; add `variant: "gradient" | "ghost-inverse"`
  for ink surfaces; keep `whatsapp`)

**Interfaces:**
- Produces: `export function ShowcasePage(): JSX.Element`; `export function PromoterPage(): JSX.Element`;
  `useReveal<T extends HTMLElement>(): React.RefObject<T>` — adds `data-revealed="true"` when intersecting; CSS in
  globals keys animations off `[data-reveal]:not([data-revealed])` only inside `@media (prefers-reduced-motion: no-preference)`.
- Header anchors: `#problema`, `#flujo`, `#producto`, `#arquitectura`; actions "Ver sitio del cliente" → `/la-tremenda`,
  "Ingresar al panel" → `/login`.

- [ ] Step 1: Branch `feat/brand-moments`; move landing → promoter; wire both routes; run verification commands.
- [ ] Step 2: Build header (ink, transparent lockup `public/brand/eventpro-logo-transparent.png`, sticky, mobile menu
  as a `<details>` or button-toggled list), hero (ink stage, gradient accent, headline
  "De un mensaje de WhatsApp a un contrato firmado, sin perder el control." — builder may refine within intent —
  CTA "Ver cómo funciona" → `#flujo`, secondary "Ingresar al panel"; hero visual = a WhatsApp bubble morphing into a
  quote card with the real values S/ 1,000.00 servicios + S/ 80.50 movilidad = S/ 1,080.50), footer (team line, FISI
  2026 mention, links).
- [ ] Step 3: Verify: commands pass; `/la-tremenda` renders the old landing; `/` hero at 1920×1080 fits above the fold.

### Task 2: Problem (As-Is → To-Be) + scripted flow (centerpiece)

**Files:**
- Create: `src/pages/showcase/ui/problem-section.tsx`, `src/pages/showcase/ui/flow-section.tsx`,
  `src/pages/showcase/ui/flow-steps/*.tsx` (one visual per step), `src/pages/showcase/model/flow-steps.ts`

**Interfaces:**
- Produces: `FLOW_STEPS: readonly FlowStep[]` where
  `type FlowStep = { id: "chat" | "quote" | "payment" | "contract" | "schedule"; title: string; caption: string }`.
- Flow visuals use only these values: package "Combo Full Fiesta (Hora Loca + DJ)", servicios S/ 1,000.00,
  movilidad S/ 80.50 (tariff 1.00/km, 0.30/min, min S/ 20, ×1.15), total S/ 1,080.50, adelanto S/ 100.00,
  payment via Yape/Plin verified by the encargado, PDF contract signed with OTP, event lands in Cronograma.

- [ ] Step 1: Problem section (`#problema`, light `--ep-pass`): five As-Is pains from spec §6.3 paired with the To-Be
  answer; no Word-contract wording — say "contratos armados a mano".
- [ ] Step 2: Flow section (`#flujo`, ink): sticky visual + scrolling captions on ≥1024px; stacked cards < 1024px;
  also a keyboard-operable stepper (buttons with `aria-current="step"`) so the presenter can advance with arrow keys.
- [ ] Step 3: Verify: commands pass; reduced-motion shows all 5 steps; arrow keys move steps; 360px no overflow.

### Task 3: Control humano, Producto, Arquitectura, Impacto, Equipo + final CTA

**Files:**
- Create: `src/pages/showcase/ui/control-section.tsx`, `product-section.tsx`, `architecture-section.tsx`,
  `impact-section.tsx`, `team-section.tsx`, `closing-cta.tsx`, `device-frame.tsx`

**Interfaces:**
- Consumes: screenshots `public/showcase/panel-{conversations-open,quotes,catalogo,solicitudes}.webp` (1600×1000).
- Team (exact): Mathias James Torres Lezama — Líder Técnico; Luis David Morales Brenis — Desarrollador Full Stack;
  Alan Nicolás García Avalos — Desarrollador Full Stack; Renzo Pedro Cordero Alfaro — Desarrollador Frontend.

- [ ] Step 1: Control humano: handoff bot → encargado → bot, 24 h window, manual approvals (sobrecupo), overrides.
- [ ] Step 2: Producto: the four screenshots in browser-style frames with one-line captions; no other screenshots.
- [ ] Step 3: Arquitectura: inline SVG/HTML diagram: WhatsApp Cloud API → Chatwoot (gateway oculto) → FastAPI backend
  (hexagonal) → PostgreSQL; Redis worker (outbox/retries); Google Maps (movilidad); ReportLab PDF + OTP; Next.js
  frontend on Vercel; backend on Oracle VM. Verify names against `backend/Docs/02-arquitectura/` before writing.
- [ ] Step 4: Impacto per actor (cliente, encargado, elenco), qualitative. Equipo. Closing gradient CTA band.
- [ ] Step 5: Verify: commands pass; images load with alt text; diagram readable at 375px (stack vertically).

### Task 4: Login redesign

**Files:**
- Modify: `src/pages/login/index.tsx` (split into `src/pages/login/ui/login-form.tsx` and `ui/brand-panel.tsx`)

**Interfaces:**
- Keep: `loginRequest(email, password)`, `startSession(...)`, redirect `OPERADOR` → `/agenda`, else `/panel`.

- [ ] Step 1: Desktop split (brand panel with `--ep-brand-gradient` + lockup + "Panel de operación de eventos" |
  form on `--ep-pass`); mobile single column with lockup on top. Use ep `Field`, `Input`, `Button`, `ErrorBanner`.
- [ ] Step 2: Remove the prefilled `admin@eventpro.pe` (initial state `""`); add password visibility toggle (button with
  `aria-pressed` and `aria-label` "Mostrar contraseña"/"Ocultar contraseña"); error region `aria-live="polite"`;
  link "Volver al inicio" → `/`.
- [ ] Step 3: Verify: commands pass; keyboard-only login flow works; wrong password shows the banner.

### Task 5: Promoter site "La Tremenda" (`/la-tremenda`)

**Files:**
- Modify/replace: `src/pages/promoter/**` (rewrite sections), scoped tokens in `src/pages/promoter/promoter.css`
  imported by `src/pages/promoter/index.tsx` (or a `.promoter` scope in globals) — no `--ep-*` usage here.
- Create: `src/pages/promoter/model/catalog.ts`

**Interfaces:**
- `PROMOTER_PACKAGES` and `PROMOTER_EXTRAS` with the exact "desde" prices from spec §11.
- WhatsApp: `buildWhatsAppUrl("Hola La Tremenda, quiero cotizar mi evento.")`.

- [ ] Step 1: Own festive palette and display font (via `next/font/google`, scoped variable), text wordmark
  "La Tremenda". Never the words "EventPro" on this page.
- [ ] Step 2: Sections per spec §8: hero with WhatsApp CTA, services with "desde S/ X", 3-step booking (reuse
  `ChatThread` and old how-it-works copy), payments/trust facts (Yape, Plin, transferencia, adelanto, contrato digital
  firmado desde el celular), final CTA, sticky mobile WhatsApp button, footer link "Acceso del equipo" → `/login`.
- [ ] Step 3: Verify: commands pass; with the env var unset every WhatsApp CTA is disabled; 360px no overflow.

### Task 6: Polish pass from verification findings

- [ ] Step 1: Apply the bounded correction list Claude sends after verifying Tasks 1–5 (one round).
- [ ] Step 2: Update `DESIGN.md` scope note: login and showcase migrated; promoter site has its own scoped brand;
  `button-link` migrated; legacy tokens remain only for the operator agenda.
- [ ] Step 3: Verify: commands pass.
