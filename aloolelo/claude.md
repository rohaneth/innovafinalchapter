# TransitOps — Application Building Context

Before implementing any feature, fixing a bug, or making an architectural decision, read the project documentation in the following order. Do not skip any file, even if the requested task appears small.

## Required Reading Order

1. `progress-tracker.md`
   - Understand the current project state.
   - Review completed work, current implementation, next tasks, open questions, and architecture decisions.
   - Always resume from this file.

2. `specs.md`
   - Master functional specification.
   - Project scope.
   - User roles and permissions (RBAC).
   - Module requirements.
   - Business rules.
   - Missing Information log.
   - Open Questions.

3. `artitecture.md`
   - Overall system architecture.
   - Component boundaries.
   - Data flow.
   - Rules Engine responsibilities.
   - Architecture decisions.
   - Any `[DECISION – verify]` items.

4. `database.md`
   - Complete database schema.
   - Entity definitions.
   - Relationships.
   - Constraints.
   - Field specifications.
   - Never invent database fields.

5. `api.md`
   - REST API contracts.
   - Endpoints.
   - Request/response formats.
   - Validation rules.
   - Error responses.
   - API-related decisions.

6. `task.md`
   - Ordered implementation roadmap.
   - Complete tasks from top to bottom unless instructed otherwise.

7. `README.md`
   - Project overview.
   - Setup instructions.
   - Development commands.
   - Repository information.
   - Do **not** treat this as the source of business requirements.

---

# Development Rules

For every implementation session:

1. Always begin by reading `progress-tracker.md`.

2. Re-read all documentation in the order listed above before writing any code.

3. Never rely on memory from previous sessions.

4. Only work on the current task listed in `task.md`.

5. Never modify documentation unless explicitly instructed.

6. Never invent:
   - business rules
   - database fields
   - API behavior
   - user roles
   - workflows

7. If any documentation is:
   - incomplete,
   - inconsistent,
   - conflicting,
   - ambiguous,

   stop implementation and ask for clarification instead of making assumptions.

8. If implementation exposes a problem in:
   - `specs.md`
   - `artitecture.md`
   - `database.md`
   - `api.md`

   report the issue before continuing.

9. After completing a meaningful implementation unit:

   - update `progress-tracker.md`
   - mark completed work
   - record architecture decisions
   - update next tasks
   - note new questions if discovered

10. Never skip documentation review, even for small changes.

---

# Important Notes

- `README.md` is only for repository documentation and setup.
- Business requirements come only from `specs.md`.
- Architecture comes only from `artitecture.md`.
- Database design comes only from `database.md`.
- API contracts come only from `api.md`.
- Task execution order comes only from `task.md`.
- Current project status always comes from `progress-tracker.md`.

If any instruction from the codebase conflicts with these documents, stop and request clarification before proceeding.