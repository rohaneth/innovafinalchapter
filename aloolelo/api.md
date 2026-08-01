# TransitOps — API Contract (api.md)

Design only — no backend code. Built from `specs.md`, `architecture.md`, `database.md`. Endpoints not backed by any documented requirement are not invented; every endpoint maps to a functional requirement or business rule. Undocumented details are marked **[DECISION – verify]**.

---

## 0. Conventions

- **Base path:** `/api/v1`
- **Format:** JSON request/response bodies.
- **Auth:** Bearer token (issued at login), sent as `Authorization: Bearer <token>` on every request except `POST /auth/login`. **[DECISION – verify]** — session/token mechanism itself is unconfirmed (architecture.md §7); token-in-header is the default assumed here.
- **Standard error shape:** `{ "error": { "code": string, "message": string } }`
- **Standard list response:** `{ "data": [...], "page": int, "page_size": int, "total": int }` — **[DECISION – verify]** pagination isn't documented anywhere; included as a default since Vehicle/Driver/Trip lists could grow.
- **RBAC enforcement:** every endpoint below checks the caller's role against `Role Permissions` (database.md §2.2) server-side before executing. "Authorization" per endpoint states the *intended* role(s) per specs.md §5/§6 login-screen mapping; exact module-level grants are still pending (specs.md §16.3), so this is enforced generically off the Role Permissions table, not hardcoded per endpoint.
- **Rate limiting:** not documented anywhere in source files. **[DECISION – verify]**: only `POST /auth/login` gets a recommended limit (brute-force mitigation); no other endpoint has a documented or assumed limit.

---

## 1. Auth Module

### POST /auth/login
- **Purpose:** authenticate and issue a session token.
- **Authentication:** none. **Authorization:** public.
- **Request Body:** `{ email, password, role }`
- **Response Body:** `{ token, user: { user_id, name, email, role } }`
- **Validation:** email format; password required; account not currently locked (`locked_until` in the future).
- **Business Rules:** lockout after 5 failed attempts, timed cooldown (specs.md §12; database.md §2.3). Each failed attempt increments `failed_login_count`; success resets it.
- **Possible Errors / Status Codes:** `400` malformed body; `401` invalid credentials; `423` account locked.
- **Rate Limit:** **[DECISION – verify]** recommend 10 requests/min per IP.
- **Example Request:** `{ "email": "raven@transitops.in", "password": "•••", "role": "Dispatcher" }`
- **Example Response (200):** `{ "token": "…", "user": { "user_id": 1, "name": "Raven K.", "role": "Dispatcher" } }`
- **Example Response (423):** `{ "error": { "code": "ACCOUNT_LOCKED", "message": "Invalid credentials. Account locked after 5 failed attempts." } }` *(message matches Screenshot 0 exactly)*

### POST /auth/logout
- **Purpose:** invalidate current token/session.
- **Authentication:** required. **Authorization:** any authenticated role.
- **Request Body:** none. **Response Body:** `{ success: true }`.
- **Status Codes:** `200`, `401` if already unauthenticated.

### POST /auth/forgot-password
- **[DECISION – verify]** entire endpoint is speculative — the "Forgot password?" link is visible in Screenshot 0 but its flow is undocumented (specs.md §16.11). Included as a placeholder only.
- **Request Body:** `{ email }`. **Response Body:** `{ success: true }` (generic response regardless of email existing, standard practice to avoid account enumeration).

---

## 2. Vehicles Module

### GET /vehicles
- **Purpose:** list/search the vehicle registry (specs.md §8 Vehicle Registry).
- **Authentication:** required. **Authorization:** Fleet Manager (edit); other roles per Role Permissions (view-only where granted).
- **Query Parameters:** `type`, `status`, `search` (registration no.), `page`, `page_size`.
- **Response Body:** paginated list of Vehicle objects (database.md §2.4 fields).
- **Status Codes:** `200`, `401`, `403`.

### GET /vehicles/{id}
- **Purpose:** single vehicle detail. **Authorization:** same as above. **Status Codes:** `200`, `404`.

### POST /vehicles
- **Purpose:** register a new vehicle. **Authorization:** Fleet Manager (per Screenshot 0/8 mapping).
- **Request Body:** `{ registration_no, name, type, max_capacity_kg, odometer_km, acquisition_cost }` (status defaults to `Available`).
- **Validation:** `registration_no` unique (Business Rule 1); `max_capacity_kg` > 0.
- **Possible Errors:** `409` duplicate registration number; `422` invalid capacity.
- **Business Rules:** registration number uniqueness (specs.md §9.1).
- **Example Request:** `{ "registration_no": "GJ01AB4521", "name": "VAN-05", "type": "Van", "max_capacity_kg": 500, "odometer_km": 74000, "acquisition_cost": 620000 }`

### PUT /vehicles/{id}
- **Purpose:** update vehicle master data (not status — see below). **Authorization:** Fleet Manager.
- **Request Body:** any subset of editable fields except `status`.
- **Validation:** same uniqueness/capacity rules as create.
- **Possible Errors:** `404`, `409`, `422`.

### POST /vehicles/{id}/retire
- **Purpose:** mark a vehicle Retired (terminal state). **Authorization:** Fleet Manager.
- **[DECISION – verify]** trigger/permissions for this action are undocumented (specs.md §16.10, database.md §2.4) — modeled as an explicit action rather than a raw status edit, since Retired is terminal and shouldn't be reachable via generic PATCH.
- **Business Rules:** Retired vehicles are excluded from dispatch selection (Business Rule 2).
- **Possible Errors:** `409` if vehicle currently On Trip or In Shop — **[DECISION – verify]** whether retirement is blocked while active; modeled here as blocked to avoid orphaning an in-progress trip/maintenance record.

---

## 3. Drivers Module

### GET /drivers
- **Purpose:** list/search drivers (specs.md §8 Driver Management).
- **Authorization:** Safety Officer (edit); others per Role Permissions.
- **Query Parameters:** `status`, `license_category`, `search`, `page`, `page_size`.
- **Response Body:** paginated Driver objects, `contact_number` masked in response payload for non-Safety-Officer roles. **[DECISION – verify]** masking scope — Screenshot 3 shows masking in UI; whether it's UI-only or also enforced at the API layer for lower-privilege roles is undocumented, modeled here as API-enforced to be safe.

### GET /drivers/{id}
- Same authorization pattern. **Status Codes:** `200`, `404`.

### POST /drivers
- **Purpose:** add a driver. **Authorization:** Safety Officer.
- **Request Body:** `{ name, license_no, license_category, license_expiry, contact_number }` (status defaults to `Available`).
- **Validation:** `license_expiry` must be a future date to default to `Available` — **[DECISION – verify]**; if already expired at creation, recommend defaulting to a non-assignable state rather than `Available`.
- **Possible Errors:** `409` duplicate `license_no` **[DECISION – verify, database.md §9 item 3]**.

### PUT /drivers/{id}
- **Purpose:** update driver profile. **Authorization:** Safety Officer.
- **Validation:** same as create.

### PATCH /drivers/{id}/status
- **Purpose:** manually toggle status (Available/Off Duty/Suspended) — matches the "TOGGLE STAT" control in Screenshot 3.
- **Authorization:** Safety Officer.
- **Request Body:** `{ status }` (one of Available, Off Duty, Suspended — **not** On Trip, which is Rules-Engine-only).
- **Validation:** rejects setting `On Trip` manually (only the Rules Engine sets this, on dispatch).
- **Business Rules:** Suspended blocks trip assignment (Business Rule 3).
- **Possible Errors:** `422` if attempting to manually set `On Trip`; `409` if driver currently on an active trip and being set to Off Duty/Suspended — **[DECISION – verify]** whether this should be blocked; modeled as blocked to avoid pulling a driver off an in-progress trip.

---

## 4. Trips Module

### GET /trips
- **Purpose:** Live Board listing (specs.md §8 Trip Management).
- **Authorization:** Dispatcher (edit); others per Role Permissions.
- **Query Parameters:** `status`, `vehicle_id`, `driver_id`, `page`, `page_size`.
- **Response Body:** paginated Trip objects including `trip_code`, source/destination, status, ETA.

### GET /trips/{id}
- **Status Codes:** `200`, `404`.

### POST /trips
- **Purpose:** create a trip in `Draft` status.
- **Authorization:** Dispatcher.
- **Request Body:** `{ source, destination, vehicle_id, driver_id, cargo_weight_kg, planned_distance_km }`
- **Validation:** `vehicle_id`/`driver_id` must currently be `Available` (Business Rules 2–4); `cargo_weight_kg` ≤ selected vehicle's `max_capacity_kg` (Business Rule 5).
- **Possible Errors:** `422 CAPACITY_EXCEEDED` — message mirrors Screenshot 4: *"Capacity exceeded by {n} kg – dispatch blocked"*; `422 VEHICLE_UNAVAILABLE`; `422 DRIVER_UNAVAILABLE`; `422 DRIVER_INELIGIBLE` (expired license/Suspended, Business Rule 3).
- **Example Request:** `{ "source": "Gandhinagar Depot", "destination": "Ahmedabad Hub", "vehicle_id": 5, "driver_id": 12, "cargo_weight_kg": 450, "planned_distance_km": 38 }`
- **Example Error (422):** `{ "error": { "code": "CAPACITY_EXCEEDED", "message": "Capacity exceeded by 200 kg - dispatch blocked" } }`

### POST /trips/{id}/dispatch
- **Purpose:** transition Draft → Dispatched; sets Vehicle and Driver to `On Trip` (Business Rule 6), executed atomically through the Rules Engine (architecture.md §10).
- **Authorization:** Dispatcher.
- **Validation:** re-checks vehicle/driver availability and cargo capacity at dispatch time (not just at creation), since time may have passed since the trip was drafted.
- **Possible Errors:** `409` if vehicle/driver became unavailable since Draft was created; `422 CAPACITY_EXCEEDED`.
- **Status Codes:** `200`, `409`, `422`.

### POST /trips/{id}/complete
- **Purpose:** transition Dispatched → Completed; releases Vehicle and Driver to `Available` (Business Rule 7).
- **Authorization:** Dispatcher.
- **Request Body:** `{ final_odometer_km, fuel_consumed_l }` — **[DECISION – verify]** manual entry by Dispatcher (architecture.md §5 decision), per the "On Complete: odometer → fuel log → expenses" note (Screenshot 4).
- **Validation:** `final_odometer_km` ≥ vehicle's current `odometer_km` (database.md §2.4 edge case — odometer must never decrease); trip must currently be `Dispatched`.
- **Side Effects:** creates a Fuel Log entry linked to this trip (database.md §2.8); updates Vehicle `odometer_km`.
- **Possible Errors:** `422 ODOMETER_INVALID`; `409 TRIP_NOT_DISPATCHED`.

### POST /trips/{id}/cancel
- **Purpose:** cancel a trip.
- **Authorization:** Dispatcher.
- **Business Rules:** if trip is `Dispatched`, restores Vehicle and Driver to `Available` (Business Rule 8). If trip is still `Draft`, no vehicle/driver restoration occurs, since neither was changed at Draft stage (database.md §2.6 edge case — Draft cancellation is a no-op on Vehicle/Driver status).
- **Validation:** **[DECISION – verify, specs.md §17.4]** rejects cancellation if trip is already `Completed` — modeled as not allowed by default.
- **Possible Errors:** `409 TRIP_ALREADY_COMPLETED`.

---

## 5. Maintenance Module

### GET /maintenance
- **Purpose:** service log listing (specs.md §8 Maintenance).
- **Authorization:** Fleet Manager (edit); others per Role Permissions.
- **Query Parameters:** `vehicle_id`, `record_status`, `page`, `page_size`.

### POST /maintenance
- **Purpose:** open a new maintenance record.
- **Authorization:** Fleet Manager.
- **Request Body:** `{ vehicle_id, service_type, cost, service_date }` (`record_status` defaults to `Active`/`In Shop`).
- **Side Effect (Business Rule 9):** sets `Vehicles.status = In Shop`, executed through the Rules Engine, removing the vehicle from dispatch selection.
- **Validation:** **[DECISION – verify, database.md §2.7]** rejects a new record if the vehicle already has an open (`Active`) maintenance record.
- **Possible Errors:** `409 MAINTENANCE_ALREADY_OPEN`.

### PUT /maintenance/{id}
- **Purpose:** update a maintenance record (cost, service type, date) while still open.
- **Authorization:** Fleet Manager.

### POST /maintenance/{id}/close
- **Purpose:** close a maintenance record.
- **Authorization:** Fleet Manager.
- **Side Effect (Business Rule 10):** sets `record_status = Completed`; sets `Vehicles.status = Available` **unless** the vehicle is `Retired` — executed through the Rules Engine.
- **Possible Errors:** `409 ALREADY_CLOSED`.

---

## 6. Fuel & Expense Module

### GET /fuel-logs
- **Purpose:** fuel log listing (specs.md §8 Fuel & Expense Management).
- **Authorization:** Financial Analyst (edit); others per Role Permissions.
- **Query Parameters:** `vehicle_id`, `date_from`, `date_to`, `page`, `page_size`.

### POST /fuel-logs
- **Purpose:** manually log fuel ("Log Fuel" action, Screenshot 6).
- **Authorization:** Financial Analyst.
- **Request Body:** `{ vehicle_id, trip_id (optional), log_date, liters, fuel_cost }`
- **Validation:** `liters` and `fuel_cost` > 0 (database.md §2.8 edge case).

### GET /expenses
- **Purpose:** other-expenses listing (toll/misc). **Authorization:** Financial Analyst (edit); others per Role Permissions.
- **Query Parameters:** `vehicle_id`, `trip_id`, `page`, `page_size`.

### POST /expenses
- **Purpose:** "+ Add Expense" action (Screenshot 6).
- **Authorization:** Financial Analyst.
- **Request Body:** `{ vehicle_id, trip_id (optional), toll_cost, other_cost, maintenance_linked }`
- **Response Body:** includes computed `total_cost` (database.md §2.9 — `[DECISION – verify]` stored vs. computed).

---

## 7. Reports Module

### GET /reports/dashboard
- **Purpose:** Dashboard KPIs (specs.md §8 Dashboard).
- **Authorization:** Dispatcher (per login-screen mapping); readable by other roles per Role Permissions.
- **Query Parameters:** `type`, `status`, `region` (filters per PDF §3.2).
- **Response Body:** `{ active_vehicles, available_vehicles, vehicles_in_maintenance, active_trips, pending_trips, drivers_on_duty, fleet_utilization_pct, recent_trips: [...] }`

### GET /reports/analytics
- **Purpose:** Reports & Analytics module (specs.md §8).
- **Authorization:** Financial Analyst.
- **Response Body:** `{ fuel_efficiency_km_per_l, fleet_utilization_pct, operational_cost, vehicle_roi_pct, top_costliest_vehicles: [...] }`
- **Business Rules:** `vehicle_roi_pct = (revenue - (maintenance + fuel)) / acquisition_cost` (PDF §3.8 formula, confirmed on-screen Screenshot 7). **[DECISION – verify]** `revenue` is not defined as a stored field anywhere in database.md — its source is unconfirmed (see api.md §9 below).

### GET /reports/export
- **Purpose:** export analytics/report data.
- **Authorization:** Financial Analyst.
- **Query Parameters:** `format` (`csv` mandatory, `pdf` optional per PDF §3.8).
- **Response:** file stream, `Content-Type` per format.
- **Possible Errors:** `400 UNSUPPORTED_FORMAT` if `format` is neither csv nor pdf.

---

## 8. Settings Module

### GET /settings
- **Purpose:** read depot/system config (specs.md §8 Settings).
- **Authorization:** **[DECISION – verify, specs.md §17.2]** defaulted to Fleet Manager only, per architecture.md §8 decision.

### PUT /settings
- **Purpose:** update depot name, currency, distance unit ("Save changes," Screenshot 8).
- **Authorization:** same as above.
- **Request Body:** `{ depot_name, currency, distance_unit }`

### GET /settings/rbac
- **Purpose:** read the Role Permissions matrix (Screenshot 8 RBAC table).
- **Authorization:** Fleet Manager (assumed, same as above).
- **Response Body:** list of `{ role, module, access_level }`.

### PUT /settings/rbac
- **Purpose:** update a role's module-level access.
- **Authorization:** Fleet Manager (assumed).
- **Request Body:** `{ role_id, module, access_level }`
- **Validation:** `access_level` ∈ {None, View, Edit}.

---

## 9. Consolidated [DECISION – verify] Log

1. Token/session mechanism (bearer token assumed) — §0.
2. Pagination shape (not documented anywhere) — §0.
3. Login rate limit value — §1.
4. `/auth/forgot-password` entire flow — §1.
5. Contact-number masking enforced at API layer vs. UI-only — §3.
6. Behavior when a driver is created with an already-expired license — §3.
7. Blocking status toggle to Off Duty/Suspended while a driver is On Trip — §3.
8. Vehicle retirement blocked while On Trip/In Shop — §2.
9. Cancel-from-Completed disallowed — §4.
10. One open maintenance record per vehicle enforced at API level — §5.
11. `expenses.total_cost` computed vs. stored — §6.
12. **New gap surfaced while writing this file:** `vehicle_roi_pct`'s `revenue` term (PDF §3.8 formula) has no source field anywhere in `database.md` — Trips have no revenue/fare field, and no pricing/billing entity exists in any screenshot. This needs a source before `/reports/analytics` can be implemented. Added to the open-questions list below.
13. Settings/RBAC-matrix endpoint authorization (Fleet Manager assumed) — §8.

All items trace back to the same open questions in `specs.md` §16–17 and `architecture.md`/`database.md` decision logs, plus one new item (#12 above) discovered during API design — **where does trip/vehicle "Revenue" come from for the ROI calculation?** This should be added to the answers you're compiling before `tasks.md`.
