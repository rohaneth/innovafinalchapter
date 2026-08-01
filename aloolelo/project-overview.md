# Bias-Aware 360° Performance Review Intelligence System

## Overview

The Bias-Aware 360° Performance Review Intelligence System is an agentic AI workspace for HR teams, people managers, and employees designed to eliminate subjectivity, recency bias, and evidence gaps from performance evaluations. By ingesting multi-source feedback (self-assessments, peer/manager reviews, project goals, and meeting notes), the platform uses a coordinated multi-agent workflow to synthesize comprehensive reviews, flag bias or unsupported claims, and enforce Human-in-the-Loop (HITL) approval before finalizing reports for employees.

## Goals

1. **Grounded Evidence Synthesis**: 100% of generated review summaries and rating proposals must cite specific source data entries (meeting notes, peer feedback, or project outcomes).
2. **Bias & Gap Detection**: Detect recency bias, gender/personality bias, unsupported claims, and stakeholder feedback imbalances with zero unflagged hallucinations.
3. **Streamlined HITL Approval**: Reduce HR/manager review prep time by 60% through an interactive dashboard for reviewing, editing, and approving syntheses.

## Core User Flow

1. **Data Ingestion**: HR Admins or Managers trigger a 360° review cycle, collecting self-assessments, manager/peer feedback, project outcomes, and meeting notes.
2. **PII Scrubbing & Anonymization**: All incoming text is sanitized to redact sensitive personally identifiable information (PII) before storage and vectorization.
3. **Multi-Agent Processing**: 
   - *Collector* aggregates inputs across data boundaries.
   - *Retriever* pulls relevant grounded project evidence via vector search.
   - *Synthesizer* generates structured review drafts (strengths, growth areas, impact highlights, goal progress).
   - *Auditor* scans output for bias, ungrounded claims, or missing stakeholder voices.
4. **Human-in-the-Loop (HITL) Review**: HR/Managers inspect the draft in the interactive dashboard, review flagged bias warnings, inspect source citations, and manually adjust content if needed.
5. **Approval & Publication**: Once approved by the reviewer, the report is finalized and made visible to the employee.

## Features

### Multi-Agent Intelligence Engine

- **Collector & Retriever Agents**: Semantic vector indexing and evidence grounding using vector search across project artifacts and meeting notes.
- **Synthesizer Agent**: Automated generation of structured report sections (Strengths, Areas for Growth, Impact Highlights, Goal Progress).
- **Auditor Agent**: Automated detection of recency bias, personality vs. performance phrasing, ungrounded assertions, and stakeholder input imbalance.

### Governance & HITL Dashboard

- **Interactive Reviewer Portal**: Side-by-side view comparing generated synthesis against original source feedback and audit flags.
- **Manual Overrides & Editing**: Full manual editing capabilities for managers with change tracking against agent recommendations.
- **Audit Logging & Privacy Engine**: End-to-end PII sanitization and an append-only audit trail capturing agent actions, bias alerts, and human edits.

## Scope

### In Scope

- Ingestion of unstructured feedback text, self-assessments, and meeting transcripts.
- Multi-agent processing pipeline (Collector, Retriever, Synthesizer, Auditor).
- Grounded citation generation mapping every review claim to source data IDs.
- Rule-based and LLM-driven bias detection.
- HITL reviewer dashboard with manual override and approval gates.
- Role-based access control (RBAC) separating Employee, Manager, and HR Admin views.

### Out of Scope

- Automated compensation or salary adjustment calculations.
- Real-time video/audio processing during live meeting calls (transcripts must be provided).
- Integration with third-party HRIS platforms (e.g., Workday, BambooHR) for initial version (mock/JSON ingestion used instead).

## Success Criteria

1. **Strict Approval Gate**: Unreviewed or unapproved reports are strictly inaccessible to subject employees.
2. **Citation Traceability**: Clicking any section highlight in the reviewer dashboard correctly renders and highlights the corresponding source document chunk.
3. **Audit Completeness**: Every state transition (ingestion, agent execution, bias flag generation, human edit, final approval) is recorded in the append-only audit log.