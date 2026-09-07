# FacilityFlow — CMMS for Commercial Building Operations

A production-grade CMMS demo for building operations teams: work order
dispatch, preventive maintenance, vendor management, parts inventory, and an
asset registry — built mobile-first for engineers working in mechanical rooms,
on roofs, and everywhere the Wi-Fi doesn't reach.

## Project overview

FacilityFlow connects building engineers with maintenance vendors and tracks
the full lifecycle of facility work:

- **Dispatch board** (`/workorders`) — five-column kanban with drag-and-drop
  status transitions, list-table toggle, search, and multi-facet filters.
- **Work order detail** (`/workorders/[id]`) — lifecycle stepper, activity
  timeline, parts checklist with cost roll-up, live SLA countdown, and
  one-tap field actions sized for gloved hands.
- **Preventive maintenance** (`/preventive`) — month calendar with overdue
  flags, recurring task scheduling, completion history, and PM-to-work-order
  dispatch.
- **Vendors** (`/vendors`) — specialty-filtered directory, performance
  scorecards (SLA compliance, quality, response vs. target), contract status,
  and a dispatch flow with SLA acknowledgment.
- **Asset registry** (`/assets`) — equipment inventory with warranty tracking,
  QR-tag placeholders, and per-asset maintenance history.
- **Parts inventory** (`/inventory`) — stock levels against reorder
  thresholds, supplier links, and validated storeroom requisitions.
- **Technicians** (`/technicians`) — certifications, shift schedules, active
  assignments, and 30-day performance metrics.
- **SLA configuration** (`/sla-config`) — admin-defined response / on-site /
  resolution targets per priority, enforced at work order intake.

Demo data (Meridian Tower) ships in `src/lib/fixtures.ts`: 12 work orders,
15 assets, 6 vendors, 8 PM tasks, 12 inventory SKUs, and 5 technicians.

## Tech stack

| Concern   | Choice                                                    |
| --------- | --------------------------------------------------------- |
| Framework | Next.js 14 (App Router), React 18, TypeScript strict mode |
| Styling   | Tailwind CSS 3.4 with CSS-variable design tokens          |
| State     | Zustand (`src/lib/store.ts`) + SWR for reference data     |
| Quality   | ESLint (`next/core-web-vitals`), Prettier, `tsc --noEmit` |
| Fonts     | Barlow (headings) + Inter (body) via `next/font`          |

## Offline-first PWA architecture

- **Installable** — `src/app/manifest.ts` generates a standalone web manifest
  with theme colors and a maskable icon.
- **Shell caching** — `public/sw.js` serves the app shell
  stale-while-revalidate; navigations that fail fall back to
  `public/offline.html`. Registered only in production builds
  (`src/app/pwa-register.tsx`).
- **Queued mutations** — every work order mutation stamps an entry in the
  store's `pendingSync` map. That map is the integration point for an
  IndexedDB write queue + background sync when the backend lands.
- **Demo simulation** — the status-bar wifi toggle (and the yellow banner)
  simulates offline mode so the queue-first UX can be reviewed without
  actually leaving the network.

## Field usability features

- 48px minimum touch targets everywhere (`.tap-target` utility + `Button`
  sizes), with `lg` (56px) as the gloved-hands default for field actions.
- Press-state scale feedback on all buttons, suppressed under
  `prefers-reduced-motion` (all animations are disabled globally too).
- Safety-white `#F8FAFC` canvas, industrial-charcoal `#1E293B` chrome, and
  safety-orange `#F97316` reserved for urgent actions; status colors always
  paired with labels — never color alone.
- Barlow for headings (industrial signage feel), Inter for body legibility.
- Overdue/SLA-breach states render in red with explicit copy.
- Mobile bottom tab bar (64px targets), desktop sidebar with a Manage group.

## Setup

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (all routes prerender)
npm run lint       # ESLint (next/core-web-vitals)
npm run format     # Prettier
```

Node 18+ recommended. No environment variables are required for local
development; see `.env.example` for the optional public-site URL.

## Project layout

```
src/
├── app/                  # App Router pages ((app) group carries the shell)
├── components/
│   ├── ui/               # Button, Badge, Toast, Skeleton, Avatar, ...
│   ├── layout/           # AppShell, status bar, sidebar, tab bar, nav.ts
│   ├── work-orders/      # board, cards, detail, stepper, timeline, parts
│   ├── pm/               # calendar, schedule form, history log
│   ├── vendors/          # directory, profile, dispatch modal
│   ├── assets/           # registry, add form, profile
│   ├── inventory/        # stock table, requisition modal
│   ├── technicians/      # directory, profile
│   └── sla/              # SLA policy editor
└── lib/                  # types, fixtures, store, hooks, sla, utils
```

Swap `src/lib/fixtures.ts` for API routes when the backend lands — components
consume the SWR/store hooks in `src/lib/hooks.ts` and stay unchanged. See
`CHANGELOG.md` for release history.
