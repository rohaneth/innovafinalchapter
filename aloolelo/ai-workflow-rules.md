# AI Workflow Rules

## Approach

Build the **Bias-Aware 360° Performance Review Intelligence System** incrementally using a spec-driven workflow. Context files (`architecture.md`, `code-standards.md`, `progress-tracker.md`, and `project-spec.md`) define what to build, how to build it, and the current state of progress. Always implement against these specs — do not infer or invent behavior from scratch.

## Scoping Rules

- Work on one feature unit at a time.
- Prefer small, verifiable increments over large speculative changes.
- Do not combine unrelated system boundaries in a single implementation step.

## When to Split Work

Split an implementation step if it combines:

1. **Multi-agent orchestration and UI render logic** (e.g., configuring multi-agent loops and designing the report dashboard simultaneously).
2. **Ingestion pipeline and bias detection algorithms** (e.g., parsing raw meeting notes/feedback and applying bias-detection rules in the same step).
3. **Human-in-the-Loop (HITL) approval workflows and persistence layer updates** (e.g., state updates during approval mixed with audit logging implementation).

If a change cannot be verified end to end quickly, the scope is too broad — **split it**.

## Handling Missing Requirements

- Do not invent product behavior not defined in the context files.
- If a requirement is ambiguous, resolve it in the relevant context file before implementing.
- If a requirement is missing, add it as an open question in `progress-tracker.md` before continuing.

## Protected Files

Do not modify the following unless explicitly instructed:

- `components/ui/*` — generated UI library components
- `lib/privacy/*` — core encryption and PII sanitization utilities
- `prisma/schema.prisma` — core data schema (unless completing a migration step)
- Any third-party library internals

## Keeping Docs in Sync

Update the relevant context file whenever implementation changes:

- System architecture or multi-agent boundaries
- Storage model decisions & audit log schema
- Code conventions or standards
- Feature scope

## Before Moving to the Next Unit

1. The current unit works end to end within its defined scope
2. No invariant defined in `architecture.md` was violated
3. `progress-tracker.md` reflects the completed work
4. `npm run build` passes