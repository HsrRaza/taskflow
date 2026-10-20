# TaskFlow ⚡

> A minimalist, high-performance Kanban task management dashboard inspired by Linear, Trello, and modern SaaS interfaces. Built with **Next.js 16**, **React 19**, **TypeScript**, **Tailwind CSS v4**, and **@dnd-kit**.

![Next.js](https://img.shields.io/badge/Next.js-16.4-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.3-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 🌟 Features

- **🎯 Fluid Drag-and-Drop**:
  - Reorder cards within the same column or move them seamlessly between columns.
  - Powered by `@dnd-kit` with accessible keyboard navigation (`Space`/`Arrows`), fine-tuned pointer sensors, and smooth touch-device support.
  - 60fps floating drag preview via `<DragOverlay>` with elevation shadow and rotation.
- **📊 Real-Time Metric Cards**:
  - Dynamic summary counters for *Total Tasks*, *In Progress*, *Completed*, and *Overdue*.
  - Metrics compute automatically on task creation, edits, movements, and deletions.
- **🔍 Instant Search & Multi-Field Filtering**:
  - Live search across task titles and descriptions.
  - Filter by priority (*Low*, *Medium*, *High*) and project categories.
  - Master state isolation ensures filtering never drops, duplicates, or corrupts hidden tasks when moving cards.
- **✏️ Complete Task Lifecycle (CRUD)**:
  - Accessible create and edit modal with input validation (prevents empty/whitespace titles).
  - Pre-fills column status when clicking a column's quick-add `+` button.
  - Confirmation dialog for safe task deletions.
  - Metadata badges: due dates, overdue warnings, priority dots, category chips, and team assignee avatars.
- **💾 Safe Client-Side Persistence**:
  - Automatically syncs state with browser `localStorage`.
  - Zero hydration mismatch (`#418`) or cascading re-render warnings through React 19's `useSyncExternalStore`.
  - One-click **"Reset Demo Tasks"** button in the sidebar to restore initial seed data anytime.
- **📱 Responsive SaaS Aesthetic**:
  - Clean light neutral palette, dark slate typography, restrained indigo accents, and subtle borders.
  - Mobile slide-over navigation drawer, adaptive headers, and collapsible multi-column layouts.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router & Turbopack) |
| **UI Library** | [React 19](https://react.dev/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (Strict mode, zero `any`) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **Drag & Drop** | [@dnd-kit](https://dndkit.com/) (`core`, `sortable`, `utilities`) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Package Manager**| [pnpm](https://pnpm.io/) |

---

## 📂 Project Structure

```text
taskflow/
├── app/
│   ├── layout.tsx                # Root layout, metadata & Geist font configuration
│   ├── page.tsx                  # TaskFlow single-page composition root
│   └── globals.css               # Tailwind CSS v4 directives & theme styles
├── components/
│   ├── layout/
│   │   └── Header.tsx            # Sticky header, branding, search bar, notifications, "+ New Task" trigger
│   └── dashboard/
│       ├── KanbanBoard.tsx       # DnD context, sensors (pointer/touch/keyboard), collision detection
│       ├── KanbanColumn.tsx      # Droppable column target, sortable context, empty state
│       ├── TaskCard.tsx          # Draggable card, priority badges, overdue indicators, action menus
│       ├── TaskModal.tsx         # Create/Edit modal with field validation and column prefill
│       ├── DeleteConfirmModal.tsx# Destructive action confirmation dialog
│       ├── SummaryCards.tsx      # Live metrics (Total, In Progress, Done, Overdue)
│       └── TaskFilters.tsx       # Priority & project filters, clear button, match counter
├── hooks/
│   └── useTasks.ts               # Custom hook: immutable state updates, persistence, reordering
├── lib/
│   ├── initial-data.ts           # Initial seed tasks, columns, assignees, and categories
│   └── task-utils.ts             # Pure utility functions: filtering, metrics, date calculations
├── types/
│   └── task.ts                   # Strongly-typed data models, unions, filter & metric types
├── prep.md                       # Comprehensive senior frontend interview preparation guide
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.18+ or v20+
- **pnpm**: v9+ (recommended) or `npm` / `yarn`

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/HsrRaza/taskflow.git
   cd taskflow
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   # or: npm install
   ```

3. **Start the development server**:
   ```bash
   pnpm dev
   ```

4. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000).

---

## 🧪 Available Scripts

| Command | Action |
|---|---|
| `pnpm dev` | Starts the local dev server on port 3000 with Turbopack |
| `pnpm build` | Compiles optimized production build with static prerendering |
| `pnpm start` | Runs the compiled production build |
| `pnpm lint` | Runs ESLint checks (passes with 0 errors and 0 warnings) |

---

## 🧠 Key Architecture Decisions

1. **Hydration-Safe Persistence via `useSyncExternalStore`**:
   Instead of traditional `useEffect` mounting triggers that cause cascading renders, `useSyncExternalStore` provides a deterministic server snapshot (`false`) and client snapshot (`true`), guaranteeing zero hydration mismatch between SSR and browser rendering.
2. **Master State vs. Derived View Pattern**:
   The `useTasks` hook maintains the master collection as the single source of truth. Search queries and dropdown filters compute a memoized derived view (`filteredTasks`) for display, while drag reorder handlers mutate the master list. This prevents accidental data loss when moving tasks while filters are active.
3. **Fine-Tuned Sensor Constraints**:
   - `PointerSensor` enforces a `5px` movement threshold to prevent card clicks (edit/delete buttons) from being hijacked by drag events.
   - `TouchSensor` enforces a `200ms` press threshold with a `6px` tolerance so mobile users can scroll vertically through columns without accidentally picking up cards.

---

## 📖 Interview & Technical Guide

For an in-depth breakdown of the component hierarchy, data flow diagrams, drag-and-drop mechanics, and 15+ senior frontend interview Q&As, see **[`prep.md`](prep.md)**.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
