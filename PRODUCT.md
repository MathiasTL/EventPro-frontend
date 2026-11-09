# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Encargado / Administrador (primary panel user):** one of the two people who run the business. Works mostly at a
  desktop, also checks the panel from a phone. Jobs: take over WhatsApp conversations the bot hands off, reply inside
  the 24 h service window, return them to the bot, validate payments, approve simultaneous shows, issue contracts,
  and read finances. Roles in the app: `SUPERADMIN` and `ENCARGADO`.
- **Operador (cast and crew, freelance):** artists, DJs, animators, tent crews. Use the mobile web in the field to see
  the day's agenda, register balance collection with photo evidence, and report show extensions.
- **Cliente (external):** talks to the business only through WhatsApp; uses the mobile web solely to review and sign
  the contract. Reaches the public landing page.

## Product Purpose

EventPro automates the commercial and operational cycle of an event-entertainment promoter in Lima, Peru (Hora Loca
shows, DJ, MC, children's shows, baby showers, themed decoration, tents, giant characters): from the first WhatsApp
contact with a chatbot, deterministic quotes with mobility pricing, advance-payment validation and signed PDF
contracts, to the operating schedule and financial dashboards. Success means the two encargados answer faster, stop
hand-building quotes and contracts, and never lose sight of the agenda, client observations, or margins.

## Positioning

Automation with human control at the critical points: the bot handles the routine conversation and quoting, while the
encargado keeps the final word (handoff inbox, manual approvals, overrides, manual contract mode). Chatwoot is a
hidden gateway; users only ever see EventPro.

## Operating Context

- Conversations arrive from WhatsApp (Meta Cloud API through self-hosted Chatwoot); replies are limited by WhatsApp's
  24 h service window. Updates stream in real time.
- Payments are local: Yape, Plin and bank transfers, verified from screenshots.
- Prices in soles (S/), Spanish (Peru) locale, dates and times in Lima time.
- Academic project with no real customers: a demo deployment on an Oracle VM, used for evaluator presentations.

## Capabilities and Constraints

- Panel sections: Solicitudes, Catálogo, Sobrecupo, Cronograma, Pagos, Finanzas, Usuarios, Auditoría,
  Conversaciones, Cotizaciones.
- Encargado views are desktop-first and responsive; operador and cliente views are mobile-first and fully usable from
  360 px (RNF-06.1). No native app or installable PWA in this phase.
- Stack: Next.js 16 + React + Tailwind CSS v4 + TanStack Query; feature-sliced structure under `src/`.
- UI copy is neutral Spanish (Peru), never Rioplatense voseo.
- Out of scope: SUNAT electronic invoices, card payment gateways.

## Brand Commitments

- Name: **EventPro**. No logo exists yet; a logo is part of the brand redesign.
- 2026-11-09 decision: the visual identity is being **redesigned for the whole EventPro brand** (panel, login and
  landing share one system). Rollout order: panel first, starting with Conversaciones as the pilot, then the rest of
  the panel, then login and landing. The previous line (violet-700 accent, zinc neutrals, Geist, light only) is
  evidence, not a constraint.
- WhatsApp green is used only to mean WhatsApp.

## Evidence on Hand

- Real demo data in the deployed backend (conversations, quotes, payments) from test clients.
- Business facts: payment instructions, packages and prices exist in the catalog and bot messages.
- No testimonials, client logos, photography, or press. Do not fabricate them.

## Product Principles

1. The human stays in control: every automated step that matters shows its state and lets the encargado act.
2. Urgency must read at a glance: a pending handoff or a closing service window must never look like routine info.
3. Speed of operation over decoration in the panel; expression lives in the brand moments (landing, login, empty
   states).
4. One brand, many surfaces: panel, login and landing feel like the same product.

## Accessibility & Inclusion

Target WCAG 2.2 AA: visible keyboard focus, polite live announcements for real-time updates, touch targets of at
least 44 px on touch layouts, and color never as the only signal.
