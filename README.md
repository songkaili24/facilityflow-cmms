# FacilityFlow — CMMS for Commercial Building Operations

A production-grade foundation for a computerized maintenance management system:
work order tracking, preventive maintenance scheduling, vendor dispatch, and an
asset registry — built mobile-first for building engineers working in the field,
online or off.

## Stack

| Concern   | Choice                                                       |
| --------- | ------------------------------------------------------------ |
| Framework | Next.js 14 (App Router), React 18, TypeScript strict mode    |
| Styling   | Tailwind CSS 3.4 with CSS-variable design tokens             |
| State     | Zustand (`src/lib/store.ts`) + SWR for the data layer        |
| Quality   | ESLint (`next/core-web-vitals`), Prettier, `tsc --noEmit`    |
| PWA       | Web manifest, service worker (`public/sw.js`), offline shell |

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (all routes prerender static)
npm run lint       # ESLint
npm run format     # Prettier across the repo
```

## Design system

Design tokens live in `src/app/globals.css` (CSS variables) and are surfaced
through Tailwind in `tailwind.config.ts`.

| Token        | Value               | Use                                  |
| ------------ | ------------------- | ------------------------------------ |
| `background` | `#F8FAFC`           | Safety white — app canvas            |
| `charcoal-*` | `#0F172A`–`#334155` | Industrial charcoal — chrome, nav    |
| `accent`     | `#F97316`           | Safety orange — urgent actions, CTAs |
| `success`    | `#22C55E`           | Completed work                       |
| `warning`    | `#F59E0B`           | In-progress work                     |
| `danger`     | `#EF4444`           | Critical/emergency, SLA breaches     |
| `info`       | `#0EA5E9`           | Assigned/operational states          |

- **Typography**: Barlow (`--font-barlow`) for headings via `font-heading`,
  Inter (`--font-inter`) for body via `font-sans` (loaded with `next/font`).
- **Touch targets**: the `.tap-target` utility enforces a ≥48px square; `Button`
  sizes `md`/`lg` both clear the minimum, `lg` is the gloved-hands field size.
- **Contrast**: charcoal-on-white for body text; status colors always paired
  with labels or iconography, never color alone.

## Component library (`src/components`)

| Component             | File                                      | Notes                                                                   |
| --------------------- | ----------------------------------------- | ----------------------------------------------------------------------- |
| Button                | `ui/Button.tsx`                           | primary / secondary / outline / ghost / danger / success, `sm–lg` sizes |
| Badge / PriorityBadge | `ui/Badge.tsx`                            | Critical, High, Medium, Low + status variants                           |
| StatusIndicator       | `ui/StatusIndicator.tsx`                  | `StatusDot` + `StatusBadge`                                             |
| Toast                 | `ui/Toast.tsx`                            | `ToastProvider` + `useToast()` — dispatch confirmations                 |
| OfflineIndicator      | `ui/OfflineIndicator.tsx`                 | Online/Offline pill driven by `navigator.onLine`                        |
| TopStatusBar          | `layout/TopStatusBar.tsx`                 | Connection state, open-WO count, emergency button, role/shift           |
| Sidebar / TabBar      | `layout/Sidebar.tsx`, `layout/TabBar.tsx` | Desktop sidebar + mobile bottom tabs (5 sections)                       |
| EmergencyDialog       | `layout/EmergencyDialog.tsx`              | Full dispatch flow with simulated paging + toast                        |
| WorkOrderCard         | `work-orders/WorkOrderCard.tsx`           | Status, priority flag, checklist progress, **swipe right to advance**   |
| ChecklistStepper      | `work-orders/ChecklistStepper.tsx`        | Interactive step-by-step progress (Stepper)                             |
| FilterChips           | `work-orders/FilterChips.tsx`             | Category filters synced to the ops store                                |
| KanbanBoard           | `work-orders/KanbanBoard.tsx`             | Desktop drag-and-drop across status columns                             |
| WorkOrderDetail       | `work-orders/WorkOrderDetail.tsx`         | Desktop split view; mobile full-screen sheet                            |
| PhotoCapture          | `field/PhotoCapture.tsx`                  | Camera capture with previews; annotation is a stub                      |
| SignatureCapture      | `field/SignatureCapture.tsx`              | Pointer-event canvas signature                                          |
| VoiceMemoButton       | `field/VoiceMemoButton.tsx`               | Mic recording with graceful fallback to a flagged note                  |
| PmCalendar            | `pm/PmCalendar.tsx`                       | Month grid of PM tasks + mobile upcoming list + dispatch dialog         |

## Data flow

`src/lib/fixtures.ts` generates realistic Meridian Tower demo data (timestamps
are relative to load, so SLAs are always "live"). `src/lib/hooks.ts` exposes
SWR-backed hooks — `useWorkOrders`, `usePmTasks`, `useVendors`, `useAssets`,
`useOpsMetrics` — that components consume. To wire a real backend, replace the
`networkFetcher` switch with API route calls; no component changes needed.

Mutations (status advance, checklist toggles, notes, PM dispatch) go through
the Zustand ops store and flag entries in `pendingSync` — the hook point for
offline queuing and sync.

## PWA readiness

- `src/app/manifest.ts` generates the web manifest (standalone display, theme
  colors, maskable icon).
- `public/sw.js` caches the shell stale-while-revalidate and serves
  `public/offline.html` when a navigation fails offline.
- `src/app/pwa-register.tsx` registers the worker in production builds.

## Routes

```
/                        Landing / marketing page
/workorders              Dispatch board: kanban (drag-and-drop) + list table, search,
                         priority/category/status/assignee filters, New Work Order intake
/workorders/[id]         Detail: status stepper (Reported→Verified), activity timeline,
                         parts checklist with costs, SLA countdown, technician card,
                         related WOs for the same asset, action buttons
/preventive              PM calendar + upcoming list, overdue flags, Schedule PM form,
                         PM history log, PM→work order dispatch
/vendors                 Directory with specialty filter + search; profile pages add a
                         performance scorecard, contract status, and Dispatch Vendor flow
/assets                  Registry table with category/warranty filters, Add Asset form;
                         profile pages show QR tag placeholder + maintenance history
/reports                 Monthly operations roll-up (SLA, PM completion, MTTR) (server-rendered)
```

## Next steps for production

1. Replace fixtures with API routes; add auth and role-gate the sidebar/status bar.
2. Implement the offline queue against `pendingSync` (IndexedDB + background sync).
3. Hook photo/signature/voice capture to object storage and the transcription service.
4. Add Playwright smoke tests over the dispatch, advance-status, and emergency flows.
