# UI Context

## Theme

Dark mode first. The design language is a sleek, dark technical workspace—near-black layered background surfaces, crisp border dividers, subtle glassmorphism overlay effects, and vibrant magenta/pink accent highlights for primary AI interactions, evaluation metrics, and bias alerts.

---

## Colors

All components must strictly use these CSS variable tokens—no hardcoded hex values in component inline styles or Tailwind classes.

| Role | CSS Variable | Value | Description |
| :--- | :--- | :--- | :--- |
| **Page background** | `--bg-base` | `#0b0914` | Deep black-purple foundation |
| **Surface** | `--bg-surface` | `#161224` | Layered cards & container panels |
| **Surface elevated** | `--bg-surface-hover` | `#221c38` | Hover states & selected list items |
| **Primary text** | `--text-primary` | `#f5f3f9` | High-contrast body text |
| **Muted text** | `--text-muted` | `#9d95b2` | Subtitles, timestamps, metadata |
| **Primary accent** | `--accent-primary` | `#e035a2` | Vivid pink/magenta buttons & highlights |
| **Accent glow** | `--accent-glow` | `#e035a233` | Focus rings & subtle radial gradients |
| **Secondary accent** | `--accent-secondary` | `#8b5cf6` | Agent indicator badges & subtle accents |
| **Border default** | `--border-default` | `#2d2447` | Structural grid lines & separators |
| **Border bright** | `--border-active` | `#584485` | Active inputs & highlighted cards |
| **Error / Bias alert** | `--state-error` | `#f43f5e` | Severe bias warnings & missing evidence flags |
| **Warning / Gap alert** | `--state-warning` | `#f59e0b` | Imbalance alerts & pending approvals |
| **Success / Approved** | `--state-success` | `#10b981` | HITL approval state & verified claims |

---

## Typography

| Role | Font | Variable | Tailwind Usage |
| :--- | :--- | :--- | :--- |
| **UI Text** | Inter / Geist Sans | `--font-sans` | `font-sans` |
| **Code / Citations** | JetBrains Mono / Geist Mono | `--font-mono` | `font-mono` |

---

## Border Radius

| Context | Class | Usage |
| :--- | :--- | :--- |
| **Inline / Small UI** | `rounded-md` | Badges, buttons, input fields |
| **Cards / Panels** | `rounded-xl` | Metric summary cards, feedback lists |
| **Modals / Overlays** | `rounded-2xl` | HITL approval drawer, detail viewers |

---

## Component Library

- **Base Library**: `shadcn/ui` built on top of Tailwind CSS.
- **Location**: Components reside in `components/ui/` (**Protected File Scope**).
- **Workflow**: Add components via `npx shadcn@latest add [component]` rather than writing custom primitives from scratch.

---

## Layout Patterns

- **Dashboard & Reviewer Workspace**: 3-column split view:
  - *Left Sidebar*: Review metadata, employee profile, data source status.
  - *Center Canvas*: Synthesized performance report (editable in HITL mode).
  - *Right Inspector*: Agent Auditor bias flags, missing voice warnings, and interactive citation inspector.
- **Header / Navigation**: Fixed top navigation bar with border separator (`--border-default`) displaying active review cycle state and RBAC controls.
- **Modals & Drawers**: Centered overlays with backdrop blur (`backdrop-blur-md bg-black/60`) for human overrides and source detail deep dives.
- **Status Cards**: Elevated surface cards (`--bg-surface`) featuring left border accents indicating status (e.g., green for grounded, magenta for review needed, red for bias alert).

---

## Icons

- **Library**: `lucide-react` (stroke-based icons only).
- **Sizing Standard**:
  - `h-4 w-4`: Inline text icons, badges, table status indicators.
  - `h-5 w-5`: Interactive buttons, form inputs, drawer toggles.
  - `h-6 w-6`: Section header icons, hero metrics.