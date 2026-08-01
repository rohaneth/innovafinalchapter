 Code Standards (`code-standards.md`)

## General

- **Single Responsibility**: Keep modules, agent nodes, and utility functions small, focused, and single-purpose.
- **Root Cause Resolution**: Address the underlying logic or schema issue when bugs arise—never stack workarounds or bypass validation steps.
- **Separation of Concerns**: Keep agent orchestration, data access, privacy/sanitization logic, and UI components isolated in their respective system boundaries.

## TypeScript

- **Strict Type Checking**: Strict mode is required across the entire codebase (`strict: true`).
- **No `any`**: Avoid `any` under all circumstances. Use explicit interfaces, generic parameters, or `unknown` with type guards.
- **Boundary Validation**: Validate all external inputs (e.g., feedback submissions, raw meeting notes, LLM outputs) at system boundaries using **Zod** schema validation before processing.

## Next.js (App Router)

- **Server-First Components**: Default to React Server Components (RSC) for data fetching and report rendering.
- **Explicit Client Boundaries**: Use `'use client'` only when browser interactivity or client state (e.g., HITL interactive report editors, filter controls) requires it.
- **Focused Route Handlers**: Keep route handlers light—delegate multi-agent execution, PII scrubbing, and database operations to shared library modules.

## Styling

- **Design System Tokens**: Use CSS custom properties and Tailwind utility classes—never hardcode hex values or arbitrary unit values in components.
- **Layout Consistency**: Ensure all UI views follow consistent spacing, typography, and border radius tokens defined in `components/ui/`.

## API Routes & Agents

- **Input & Role Validation**: Validate request payloads and verify user credentials/RBAC permissions (via Clerk) before executing any workflow or database operation.
- **Structured LLM Outputs**: Enforce strict JSON schema responses (e.g., via `zodToJsonSchema`) for all agent prompts to guarantee deterministic structures for claims, citations, and bias flags.
- **Consistent API Responses**: Standardize JSON response shapes across all endpoints:
  ```json
  {
    "success": true,
    "data": { ... },
    "error": null
  }
  ```

## Data, Privacy, and Audit

- **Structured Metadata in Database**: Store user records, review metadata, audit trail events, and citations directly in PostgreSQL via Prisma.
- **Unstructured Evidence Vectorization**: Store text chunks and vector embeddings of meeting notes and feedback in `pgvector` for retrieval.
- **PII Scrubbing Prior to LLM Calls**: All raw text inputs must pass through `lib/privacy/anonymize.ts` before being dispatched to agent models.

## File Organization

- `app/` — Next.js App Router routes, API endpoints, and server actions.
- `components/` — Feature components (e.g., `HITLApprovalPanel`, `BiasFlagList`, `EvidenceViewer`).
- `components/ui/` — Base UI component primitives built with Tailwind and shadcn/ui (**Protected File Scope**).
- `lib/agents/` — Multi-agent state graph, agent node definitions (Collector, Retriever, Synthesizer, Auditor), and prompt templates.
- `lib/privacy/` — PII redaction, data hashing, and encryption utilities.
- `lib/db/` — Prisma client instantiations, queries, and vector database operations.
- `types/` — Shared TypeScript interfaces, domain entities, and agent schema definitions.
