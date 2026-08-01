# Progress Tracker

Update this file after every meaningful implementation change. The agent updates it after every unit; the user updates it when making architectural decisions or resolving open questions.

## Current Phase
- Documentation phase — building the doc chain (specs → architecture → database → api → workflow-rules → tasks → main) before any code is written.

## Current Goal
- Write `tasks.md`: break the confirmed scope (specs.md §4, §7–§9) into ordered, dependency-aware implementation units, following the scoping/splitting rules in `ai-workflow-rules.md` (one module/endpoint/transition per unit; DB → API → UI split for Rules Engine transitions).

## Completed
- `specs.md` — Master Functional Specification. Scope, roles, RBAC, 9 modules, 10 mandatory business rules, workflow, NFRs, security, conflict log, missing-information log, open questions.
- `architecture.md` — Architecture Blueprint. Layered architecture, component breakdown, centralized Rules Engine, frontend/backend/DB/auth/authorization design, folder structure, risks, verification checklist. Framework/technology-agnostic by design.
- `database.md` — Database Design. Entities derived from screenshots + specs/architecture, descriptive types only, no invented fields.
- `api.md` — API Design. REST endpoints grouped by module (auth, vehicles, drivers, trips, maintenance, fuel-expenses, reports, settings), request/response bodies, validation, error codes, consolidated `[DECISION – verify]` log (13 items).
- `ai-workflow-rules.md` — Agent behavior rules: spec-driven, incremental, one-unit-at-a-time scoping, Rules Engine boundary, missing-info/decision-log handling, protected files, doc-sync rules, pre-next-unit checklist.
- `task.md` — Build Plan.
- **Unit 1 — Project Scaffold:** Folder structure matching `artitecture.md` §22 established, Express app shell boots successfully, and SQLite database wired with zero tables.
- **Unit 2 — Core Auth Tables:** Designed schemas for `roles`, `role_permissions`, and `users`, enabled automatic database initialization/seeding, and created a secure native password hashing utility.
- **Unit 3 — Auth API (Login, Lockout, Session):** Implemented stateless AES-256-GCM authentication tokens, dynamic login validation, failed login tracking, and timed lockout enforcement.

## In Progress
- None.

## Next Up
- **Unit 4 — Login Screen (UI):** Build the login interface with email/password inputs, validation, error/lockout notifications, and wire it to the auth API.

## Open Questions
*(carried forward from specs.md §17 and api.md §9 — unresolved as of this file's creation)*
- Exact lockout cooldown duration? (specs.md §17.1)
- Is Settings restricted to specific roles? (specs.md §17.2 / architecture.md §8)
- Is Financial Analyst fully read-only, or can they create/edit Fuel & Expense entries? (specs.md §17.3)
- Can a Completed trip be cancelled? Currently modeled as **not allowed**. (specs.md §17.4 / api.md `POST /trips/{id}/cancel`)
- Target scale (vehicles/drivers/trips per day)? (specs.md §17.5)
- Approved NFR targets to replace the draft list in specs.md §11?
- **Highest priority gap:** `vehicle_roi_pct`'s `revenue` term (specs.md/PDF §3.8 formula) has no source field anywhere in `database.md` — Trips have no revenue/fare field and no pricing/billing entity exists in any screenshot. Blocks implementation of `GET /reports/analytics`. (api.md §9 item 12)
- Full RBAC permission matrix — illegible in Screenshot 8, only partially confirmed (specs.md §16.3)
- License Category exhaustive list unconfirmed (LMV/HMV observed only) (specs.md §16.5)
- Triggers for Vehicle → Retired and Driver → Off Duty/Suspended undocumented (specs.md §16.10)

## Architecture Decisions
*(carried forward from architecture.md — defaults chosen to unblock design, each marked [DECISION – verify] at its source; listed here so future sessions don't re-litigate them without cause)*
- RBAC and business-rule enforcement live server-side only, never trusted from the client (architecture.md §1).
- A single, centralized Rules Engine is the **only** component allowed to mutate Vehicle/Driver `status` or execute cross-entity effects — not folded into individual services (architecture.md §3, §10).
- RBAC/permission matrix stored as configurable data, not hardcoded, since the real matrix isn't fully known yet (architecture.md §8).
- Trip completion (odometer + fuel entry) modeled as a manual form step by the Dispatcher (architecture.md §5).
- Maintenance-record status and Vehicle status kept as decoupled but Rules-Engine-synchronized fields (architecture.md §6).
- Settings module access defaulted to Fleet Manager only, pending confirmation (architecture.md §8).
- Financial Analyst defaulted to read-only except direct create/edit on Fuel & Expense entries (architecture.md §8).
- Cancel is only allowed from Draft or Dispatched, not from Completed (architecture.md §13).
- Session/auth state kept externalized (stateless API) to preserve horizontal scaling, even though no target scale is documented (architecture.md §17).
- No file storage, background jobs (beyond an optional license-expiry scan), caching, or audit logging included in this pass — all flagged as future/optional, not omissions (architecture.md §11–12, §16, §19, §25).

## Session Notes
- Doc chain order in use: `specs.md` → `architecture.md` → `database.md` → `api.md` → `ai-workflow-rules.md` → `tasks.md` → `main.md`.
- Two distinct gap-tracking conventions are in play — don't merge them: **"Missing Information"** (never defined anywhere) vs. **"[DECISION – verify]"** (a stated default awaiting sign-off). See `ai-workflow-rules.md` §4.
- `odoo hackathon notion.docx` and `README.md` are process templates only — never requirements sources.
- No technology/framework has been chosen yet; `architecture.md` is intentionally stack-agnostic. If a stack is chosen, log it here as an Architecture Decision before `tasks.md` assumes one.
- To resume a new session on this project: read this file first, then treat `tasks.md` (once written) as the authoritative next-step list.
