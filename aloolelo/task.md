# TransitOps — Build Plan (tasks.md)

Derived from `specs.md`, `architecture.md`, `database.md`, and `api.md`. Each unit below follows `ai-workflow-rules.md`: one visible result, one system boundary, dependencies introduced just-in-time, no speculative work. Build top to bottom — later units assume earlier ones are done and verified (`progress-tracker.md` §Verification Checklist).

No stack is chosen (`architecture.md` is stack-agnostic), so units are described in terms of scope, not implementation technology. If a stack is chosen, log it in `progress-tracker.md` before Unit 1.

---

## Phase 0 — Foundation

### Unit 1 — Project Scaffold
- **Builds:** Folder structure per `architecture.md` §22 (`/modules/{auth,vehicles,drivers,trips,maintenance,fuel-expenses,reports,settings}`, `/rules-engine`, `/shared`). Empty app shell that boots and serves a blank page. Database connection wired to an empty schema.
- **Dependencies:** None.
- **Boundary:** Infra only — no business logic, no entities yet.
- **Done when:**
  - [x] App boots locally with no errors.
  - [x] DB connects successfully with zero tables.
  - [x] Folder structure matches architecture.md §22 exactly.

### Unit 2 — Core Auth Tables
- **Builds:** `Roles` and `Users` tables (`database.md` §2.1–2.2), seeded with the 4 fixed roles (Fleet Manager, Dispatcher, Safety Officer, Financial Analyst).
- **Dependencies:** Unit 1.
- **Boundary:** Database only — no API, no UI.
- **Done when:**
  - [x] Roles table seeded with exactly 4 rows, matching specs.md §5.
  - [x] Users table supports email+password storage (hashed, not plaintext).
  - [x] Role Permissions table exists as data-driven config, not hardcoded (architecture.md §8).

### Unit 3 — Auth API (Login, Lockout, Session)
- **Builds:** `POST /auth/login`, session/token issuance, lockout after 5 failed attempts (specs.md §12), role resolution on login.
- **Dependencies:** Unit 2.
- **Boundary:** Backend auth only — no UI yet.
- **Done when:**
  - [ ] Valid credentials return a session/token and resolved role.
  - [ ] 5 consecutive failed attempts locks the account.
  - [ ] Lockout is a cooldown, not permanent, using a configurable (not hardcoded) duration — flagged `[DECISION – verify]` per architecture.md §7 until the real duration is confirmed.
  - [ ] Invalid credentials return a clear error without leaking which field was wrong.

### Unit 4 — Login Screen (UI)
- **Builds:** Login form (email/password), error states, lockout messaging. Wires to Unit 3's API.
- **Dependencies:** Unit 3.
- **Boundary:** UI only — one screen, no navigation shell yet.
- **Done when:**
  - [ ] Successful login redirects somewhere (stub landing page acceptable).
  - [ ] Failed login shows an inline error.
  - [ ] Lockout state is visibly communicated to the user.

### Unit 5 — Role-Aware App Shell
- **Builds:** Persistent navigation shell that shows only the modules a logged-in role can access, per the login-screen mapping in specs.md §6 (Fleet Manager→Fleet/Maintenance; Dispatcher→Dashboard/Trips; Safety Officer→Drivers/Compliance; Financial Analyst→Fuel & Expenses/Analytics).
- **Dependencies:** Unit 4.
- **Boundary:** UI/navigation only — linked module screens can be stubs at this point.
- **Done when:**
  - [ ] Each of the 4 roles sees only their mapped modules in navigation.
  - [ ] Logout returns to the login screen and clears the session.

---

## Phase 1 — Vehicle Registry

### Unit 6 — Vehicle Entity & CRUD API
- **Builds:** `Vehicles` table (database.md), `GET/POST/PUT /vehicles` endpoints (api.md), fields: Reg. No. (unique), Name/Model, Type, Max Load Capacity, Odometer, Acquisition Cost, Status.
- **Dependencies:** Unit 1 (scaffold). Independent of Auth beyond needing a role to test against.
- **Boundary:** Backend only — DB + API, no UI.
- **Done when:**
  - [ ] Registration number uniqueness enforced at the API layer (Business Rule 1).
  - [ ] Status enum restricted to Available/On Trip/In Shop/Retired.
  - [ ] Duplicate reg. no. returns a clear validation error.

### Unit 7 — Vehicle Registry Screen
- **Builds:** Vehicle list, create/edit form, status badges. Wires to Unit 6.
- **Dependencies:** Unit 6, Unit 5 (shell).
- **Boundary:** UI only.
- **Done when:**
  - [ ] Fleet Manager can create, view, and edit a vehicle end-to-end.
  - [ ] Status badge colors match architecture.md §4 shared-component convention.
  - [ ] Client-side validation mirrors server-side, but server remains source of truth.

---

## Phase 2 — Driver Management

### Unit 8 — Driver Entity & CRUD API
- **Builds:** `Drivers` table, `GET/POST/PUT /drivers` endpoints. Fields: Name, License No., License Category, License Expiry, Contact, Safety Score, Status.
- **Dependencies:** Unit 1.
- **Boundary:** Backend only.
- **Done when:**
  - [ ] Status enum restricted to Available/On Trip/Off Duty/Suspended.
  - [ ] License expiry stored as a date, queryable for future compliance checks.
  - [ ] `[DECISION – verify]` logged: behavior when a driver is created with an already-expired license is undefined (api.md §9 item 6) — default to allow creation but flag on read, pending confirmation.

### Unit 9 — Driver Management Screen
- **Builds:** Driver list, create/edit form, status badges.
- **Dependencies:** Unit 8, Unit 5.
- **Boundary:** UI only.
- **Done when:**
  - [ ] Safety Officer can create, view, and edit a driver end-to-end.
  - [ ] Expired-license drivers are visually flagged in the list (supports specs.md §3 problem statement: "expired licenses going undetected").

---

## Phase 3 — Rules Engine (introduced just-in-time, before Trip Dispatch needs it)

### Unit 10 — Rules Engine Skeleton
- **Builds:** The Rules Engine component itself (architecture.md §3/§10) as the sole path allowed to mutate Vehicle/Driver `status`. No transitions implemented yet — just the interface/contract other services will call into.
- **Dependencies:** Unit 6, Unit 8 (needs both entities to exist).
- **Boundary:** Backend architecture only — no trip logic yet.
- **Done when:**
  - [ ] No code path outside the Rules Engine can write to Vehicle/Driver `status`.
  - [ ] Interface accepts a transition type and the entities involved, and is unit-testable in isolation.

---

## Phase 4 — Trip Dispatch (the core workflow)

### Unit 11 — Trip Entity & Draft Creation API
- **Builds:** `Trips` table, `POST /trips` (create as Draft), `GET /trips`. Fields: source, destination, vehicle, driver, cargo weight, planned distance.
- **Dependencies:** Unit 10.
- **Boundary:** Backend only — Draft state only, no dispatch/complete/cancel yet.
- **Done when:**
  - [ ] Vehicle/driver dropdowns (API-level) only return "available" candidates (Business Rule 2, 4).
  - [ ] Cargo-over-capacity is rejected at creation (Business Rule 5).

### Unit 12 — Dispatch Transition
- **Builds:** `POST /trips/{id}/dispatch` through the Rules Engine: Trip→Dispatched, Vehicle→On Trip, Driver→On Trip (Business Rule 6), atomically.
- **Dependencies:** Unit 11, Unit 10.
- **Boundary:** Backend, one Rules Engine transition only.
- **Done when:**
  - [ ] Expired-license or Suspended drivers cannot be dispatched (Business Rule 3).
  - [ ] Already On Trip vehicle/driver cannot be dispatched again (Business Rule 4).
  - [ ] Dispatch is atomic — partial failure leaves no entity in an inconsistent state.

### Unit 13 — Complete Transition
- **Builds:** `POST /trips/{id}/complete`: Trip→Completed, Vehicle/Driver→Available (Business Rule 7), odometer update, fuel log creation.
- **Dependencies:** Unit 12.
- **Boundary:** Backend, one Rules Engine transition only.
- **Done when:**
  - [ ] `final_odometer_km` rejected if less than the vehicle's current odometer (database.md §2.4).
  - [ ] Only a `Dispatched` trip can be completed (`409 TRIP_NOT_DISPATCHED` otherwise).
  - [ ] A linked Fuel Log entry is created as a side effect.
  - [ ] Manual entry by Dispatcher is used per the `[DECISION – verify]` default in architecture.md §5 — flagged, not silently assumed elsewhere.

### Unit 14 — Cancel Transition
- **Builds:** `POST /trips/{id}/cancel`: Draft→Cancelled (no-op on Vehicle/Driver) or Dispatched→Cancelled (restores Vehicle/Driver to Available, Business Rule 8).
- **Dependencies:** Unit 12.
- **Boundary:** Backend, one Rules Engine transition only.
- **Done when:**
  - [ ] Cancelling a Draft trip does not touch Vehicle/Driver status.
  - [ ] Cancelling a Dispatched trip restores both to Available.
  - [ ] Cancelling a Completed trip is rejected (`409 TRIP_ALREADY_COMPLETED`) per the `[DECISION – verify]` default (api.md §9 item 9) — flagged pending confirmation, not treated as final.

### Unit 15 — Trip Dispatcher Screen
- **Builds:** Trip list, create-trip form (with capacity/availability validation surfaced inline), dispatch/complete/cancel actions.
- **Dependencies:** Units 11–14, Unit 5.
- **Boundary:** UI only.
- **Done when:**
  - [ ] Cargo-over-capacity shows the specific blocking message (specs.md §8, "Capacity exceeded by 200 kg – dispatch blocked" behavior).
  - [ ] Dispatcher can walk a trip through Draft→Dispatched→Completed and separately test Cancel, end to end.

---

## Phase 5 — Maintenance

### Unit 16 — Maintenance Entity & Open/Close Transitions
- **Builds:** `MaintenanceLogs` table, `POST /maintenance` (open, sets Vehicle→In Shop, Business Rule 9), `POST /maintenance/{id}/close` (Business Rule 10, restores Available unless Retired), `PUT /maintenance/{id}`.
- **Dependencies:** Unit 10 (Rules Engine), Unit 6 (Vehicles).
- **Boundary:** Backend, both Rules Engine transitions together (they're small and always used as a pair, per the "merge units that get done together" rule).
- **Done when:**
  - [ ] Opening a record removes the vehicle from dispatch selection immediately.
  - [ ] Closing a record restores Available unless vehicle is Retired.
  - [ ] `[DECISION – verify]` (database.md §2.7): rejecting a new record if the vehicle already has an open record — implemented and flagged, not assumed silently.

### Unit 17 — Maintenance Screen
- **Builds:** Service record list, create/close form.
- **Dependencies:** Unit 16, Unit 5.
- **Boundary:** UI only.
- **Done when:**
  - [ ] Fleet Manager can open and close a maintenance record end-to-end and see the vehicle status update live.

---

## Phase 6 — Fuel & Expense Management

### Unit 18 — Fuel Log & Expense API
- **Builds:** `FuelLogs`, `Expenses` tables, `GET/POST /fuel-logs`, `GET/POST /expenses`, Total Operational Cost computation (Fuel + Maintenance) per vehicle.
- **Dependencies:** Unit 6, Unit 13 (fuel logs can originate from trip completion).
- **Boundary:** Backend only.
- **Done when:**
  - [ ] `liters` and `fuel_cost` must be > 0.
  - [ ] Total Operational Cost auto-computed and queryable per vehicle.
  - [ ] `[DECISION – verify]` (database.md §2.9): `expenses.total_cost` computed vs. stored — pick one, flag it, don't leave ambiguous.

### Unit 19 — Fuel & Expense Screen
- **Builds:** "Log Fuel" and "+ Add Expense" actions, per-vehicle cost view.
- **Dependencies:** Unit 18, Unit 5.
- **Boundary:** UI only.
- **Done when:**
  - [ ] Financial Analyst can log fuel and add an expense end-to-end.
  - [ ] Total Operational Cost is visible and matches the API computation.

---

## Phase 7 — Dashboard & Reports

### Unit 20 — Dashboard KPI API
- **Builds:** `GET /reports/dashboard`: Active/Available/In-Maintenance Vehicles, Active/Pending Trips, Drivers On Duty, Fleet Utilization %, Recent Trips, with type/status/region filters.
- **Dependencies:** Units 6, 8, 11–14 (needs real trip/vehicle/driver data to aggregate).
- **Boundary:** Backend only.
- **Done when:**
  - [ ] All KPI fields listed in specs.md §8 (Dashboard) are present and computed from live data, not stubs.

### Unit 21 — Dashboard Screen
- **Builds:** KPI cards, filters, Recent Trips table.
- **Dependencies:** Unit 20, Unit 5.
- **Boundary:** UI only.
- **Done when:**
  - [ ] Filters visibly change the KPI values and Recent Trips table.

### Unit 22 — Analytics API (blocked pending decision)
- **Builds:** `GET /reports/analytics`: Fuel Efficiency, Fleet Utilization, Operational Cost — **excluding** Vehicle ROI initially.
- **Dependencies:** Units 18, 20.
- **Boundary:** Backend only.
- **Done when:**
  - [ ] Fuel Efficiency, Fleet Utilization, and Operational Cost are correctly computed and returned.
  - [ ] Vehicle ROI is explicitly **not implemented** in this unit — the `revenue` field has no source anywhere in `database.md` (api.md §9 item 12). Do not stub a fake revenue value to make this unit "complete." Flag it as a standalone blocked follow-up unit (see Unit 22a below) instead of silently shipping a wrong number.

### Unit 22a — Vehicle ROI (blocked — do not start until unblocked)
- **Builds:** `vehicle_roi_pct` calculation and its API field, once a `revenue` source is confirmed.
- **Dependencies:** Unit 22, **and** a user decision on where `revenue` comes from (new field on Trips? a billing entity? manual entry?).
- **Boundary:** Backend only, isolated from Unit 22 so the rest of Analytics isn't held hostage by this one gap.
- **Done when:**
  - [ ] `revenue` source is confirmed and documented in `database.md` before any code is written here.
  - [ ] ROI formula matches specs.md §8: `(Revenue − (Maintenance+Fuel)) / Acquisition Cost`.

### Unit 23 — Reports & Analytics Screen + CSV Export
- **Builds:** Analytics view (excluding ROI until Unit 22a lands), CSV export (mandatory per specs.md §8).
- **Dependencies:** Unit 22, Unit 5.
- **Boundary:** UI only. PDF export is bonus scope — do not build in this unit.
- **Done when:**
  - [ ] CSV export produces a valid file matching the on-screen analytics data.
  - [ ] ROI column is either hidden or clearly marked "pending" until Unit 22a is done — never shown with a fabricated number.

---

## Phase 8 — Settings & RBAC

### Unit 24 — Settings & RBAC Matrix API
- **Builds:** `GET/PUT /settings` (depot name, currency, distance unit), `GET/PUT /settings/rbac` (role/module/access_level matrix).
- **Dependencies:** Unit 2 (Roles/Permissions tables).
- **Boundary:** Backend only.
- **Done when:**
  - [ ] Access level values restricted to {None, View, Edit}.
  - [ ] Authorization defaulted to Fleet Manager only, flagged `[DECISION – verify]` (api.md §9 item 13) pending confirmation.

### Unit 25 — Settings Screen
- **Builds:** Depot config form, RBAC matrix editor UI.
- **Dependencies:** Unit 24, Unit 5.
- **Boundary:** UI only.
- **Done when:**
  - [ ] Fleet Manager can view and edit the RBAC matrix and depot settings end-to-end.
  - [ ] Changes take effect on other roles' navigation without requiring a re-login (or, if re-login is required, that's documented as expected behavior).

---

## Phase 9 — Bonus (optional, only after mandatory scope is complete and verified)

### Unit 26 — License-Expiry Email Reminders
- **Builds:** Background job (architecture.md §12) scanning license expiry, sending reminder emails.
- **Dependencies:** Unit 9 (Drivers), email service credentials configured.
- **Boundary:** Backend background job only.
- **Done when:**
  - [ ] A driver with a license expiring within the configured window triggers exactly one reminder (no duplicates).

### Unit 27 — PDF Export for Reports
- **Builds:** PDF variant of `GET /reports/export`.
- **Dependencies:** Unit 23.
- **Boundary:** Backend + minimal UI toggle.
- **Done when:**
  - [ ] PDF export produces a readable document matching the CSV export's data.

---

## Notes on Ordering

- Auth (Units 2–5) comes first because every other module is role-gated.
- Vehicle Registry and Driver Management (Units 6–9) are built before Trip Dispatch because trips depend on both entities existing and having an "available" status to select from.
- The Rules Engine (Unit 10) is introduced **just before** it's needed by Trip Dispatch — not built speculatively in Phase 0 — per the just-in-time dependency rule.
- Maintenance (Units 16–17) comes after Trip Dispatch because both consume the same Rules Engine, and Trip Dispatch is the higher-priority mandatory workflow (specs.md §4).
- Dashboard (Units 20–21) is built after the modules it aggregates (Vehicles, Drivers, Trips) so its KPIs reflect real data rather than stubs.
- Vehicle ROI is deliberately split into its own blocked unit (22a) rather than bundled into Analytics (22), so one undocumented field doesn't stall Fuel Efficiency, Utilization, and Operational Cost — all of which are fully specified and ready to build now.
- Bonus scope (Units 26–27) is last and explicitly gated on mandatory scope being complete, per specs.md §4.
