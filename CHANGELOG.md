# Changelog

All notable changes to FacilityFlow are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project
adheres to semantic versioning while pre-1.0.

## [0.3.0] — 2026-09-07

### Added

- **Parts inventory** (`/inventory`): storeroom stock levels with reorder
  thresholds, stock-status and category filters, supplier links into vendor
  profiles, and a requisition modal that validates quantity against on-hand
  stock (no negative or over-stock issues).
- **Technician pages** (`/technicians`, `/technicians/[id]`): certifications
  with expiry tracking, shift schedules, active assignments, and 30-day
  performance metrics (completions, MTTR, first-time fix rate, SLA
  compliance).
- **SLA configuration** (`/sla-config`): admin editor for response / on-site /
  resolution targets per priority with cross-field validation; saved policy
  feeds the intake SLA auto-calculation.
- **Micro-interactions**: kanban drag ghost + drop-zone highlighting, work
  order stepper pop animation on status change, button press-scale states for
  gloved hands, and shimmer skeleton loaders for the dispatch board and
  vendor directory. All animations respect `prefers-reduced-motion`.
- **Offline simulation**: status-bar toggle + banner notification to exercise
  the offline queue UX; the Online/Offline pill reflects real connectivity
  or the simulation.
- **Validation hardening**: critical-priority work orders now require an
  intake photo; vendor dispatch requires an SLA acknowledgment checkbox and a
  format-validated confirmation email.

### Changed

- Secondary navigation (inventory, technicians, SLA config) added to the
  desktop sidebar "Manage" group and a status-bar menu.
- Kanban drop targets scale and tint on hover-over during drag.

## [0.2.0] — 2026-09-04

### Added

- **Work order management**: five-column dispatch board (New, Assigned,
  In Progress, Awaiting Parts, Completed) with drag-and-drop, list-table
  toggle, search across ID/title/location, priority/category/status/assignee
  filters, and a validated intake form with SLA auto-calculation by priority.
- **Work order detail pages** (`/workorders/[id]`): lifecycle stepper
  (Reported → Verified), activity timeline, parts checklist with cost
  roll-up, live SLA countdown, technician card, related work orders per
  asset, and Update Status / Add Note / Upload Photo / Escalate / Close
  actions.
- **Preventive maintenance** (`/preventive`): month calendar with overdue
  flags, upcoming list, category/frequency filters, recurring-task
  scheduling, PM history log, and PM-to-work-order dispatch.
- **Vendor management** (`/vendors`): specialty-filtered directory with
  search, quick dispatch, and profile pages with performance scorecards and
  contract status.
- **Asset registry** (`/assets`): filterable table, add-asset form, and
  profile pages with QR-tag placeholders and maintenance history.
- Data model v2: structured locations (building/floor/zone/room),
  technicians, activity timelines, parts lines, and expanded fixtures.

## [0.1.0] — 2026-08-24

### Added

- **Foundation**: Next.js 14 App Router + TypeScript strict-mode scaffold,
  ESLint/Prettier toolchain, and CI-friendly scripts.
- **Industrial design system**: safety-white canvas, industrial-charcoal
  chrome, safety-orange accents, Barlow/Inter typography, 48px touch-target
  utilities, and CSS-variable design tokens.
- **Component library**: Button (primary/secondary/outline/danger/success),
  priority badges, status indicators, toast system, and offline indicator.
- **Navigation shell**: top status bar (connection state, open-work-order
  count, emergency dispatch, role/shift), desktop sidebar, mobile bottom tab
  bar, and the `(app)` route group.
- **PWA baseline**: web manifest, service worker with offline shell fallback,
  and production-only registration.
- Demo fixtures for the Meridian Tower evaluation building and an
  operations reports page.
