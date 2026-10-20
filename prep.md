# TaskFlow — Senior Frontend Interview Preparation Guide

This guide is a comprehensive reference and interview preparation document for **TaskFlow**, a high-performance single-page Kanban dashboard built with **Next.js (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS**, and **@dnd-kit**.

---

## Table of Contents
1. [Project Overview & Key Decisions](#1-project-overview--key-decisions)
2. [Component Architecture & Hierarchy](#2-component-architecture--hierarchy)
3. [Data Flow, Props & Callback Mechanics](#3-data-flow-props--callback-mechanics)
4. [Drag-and-Drop Engineering with @dnd-kit](#4-drag-and-drop-engineering-with-dnd-kit)
5. [Preventing Data Corruption & Duplication](#5-preventing-data-corruption--duplication)
6. [Why Immutable State Updates Matter](#6-why-immutable-state-updates-matter)
7. [LocalStorage Persistence & Hydration Safety](#7-localstorage-persistence--hydration-safety)
8. [Client vs Server Components Strategy](#8-client-vs-server-components-strategy)
9. [Scaling to Production: Database & API Migration](#9-scaling-to-production-database--api-migration)
10. [Top 15 Senior Frontend Interview Q&As](#10-top-15-senior-frontend-interview-qas)
11. [What One Problem Did You Face & How Did You Fix It?](#11-what-one-problem-did-you-face--how-did-you-fix-it)
12. [Code Directory & File Reference](#12-code-directory--file-reference)

---

## 1. Project Overview & Key Decisions

- **Goal**: Build a production-grade, single-page Kanban task management application inspired by Linear, Trello, and modern SaaS products.
- **Tech Stack**:
  - **Framework**: Next.js 16 (App Router)
  - **Runtime & UI**: React 19
  - **Language**: TypeScript (strict mode, zero `any`)
  - **Styling**: Tailwind CSS v4
  - **Drag-and-Drop**: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
  - **Icons**: `lucide-react`
- **Key Constraints & Architectural Highlights**:
  - Single-page application at `/`.
  - Zero backend/database requirement, yet robust offline persistence using `localStorage`.
  - Zero hydration mismatch or SSR render thrashing via React 19's `useSyncExternalStore`.
  - Drag-and-drop functional on mobile touchscreens, tablets, and desktop with keyboard accessibility.
  - Active search and filtering completely isolated from the master collection to prevent accidental data loss during drag-and-drop reordering.

---

## 2. Component Architecture & Hierarchy

The codebase separates concerns across data contracts, utility logic, presentation, and state orchestration:

```
src / job-tracker/
├── types/
│   └── task.ts                      # Domain models, status/priority unions, metrics & filter state
├── lib/
│   ├── initial-data.ts              # Seed data, column metadata, assignees, categories
│   └── task-utils.ts                # Pure functions: filtering, metrics, date calculations
├── hooks/
│   └── useTasks.ts                  # Centralized business logic, immutable state mutations & persistence
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx              # Navigation shell, project filters, user profile, demo reset
│   │   └── Header.tsx               # Workspace title, global search bar, notifications, "+ New Task" trigger
│   └── dashboard/
│       ├── SummaryCards.tsx         # Real-time computed metrics (Total, In Progress, Done, Overdue)
│       ├── TaskFilters.tsx          # Priority, project dropdowns, clear filters, match counter
│       ├── KanbanBoard.tsx          # DndContext setup, sensors, collision algorithms, drag overlay
│       ├── KanbanColumn.tsx         # Droppable target, sortable context container, empty state drop zone
│       ├── TaskCard.tsx             # Draggable card, metadata badges, actions menu, overlay preview
│       ├── TaskModal.tsx            # Accessible modal for task creation & editing
│       └── DeleteConfirmModal.tsx   # Destructive action confirmation dialog
└── app/
    ├── layout.tsx                   # Root HTML shell, fonts, global metadata
    └── page.tsx                     # Main composition root
```

### Why Each Component Exists
1. **`app/page.tsx`**: Composition root. It holds zero business logic; its only responsibility is gluing the UI shell, modals, and the `useTasks` hook together.
2. **`useTasks.ts`**: The headless controller. By decoupling state logic from JSX, the UI remains purely declarative. We can swap local state for TanStack Query / API calls without modifying visual components.
3. **`KanbanBoard.tsx`**: Encapsulates all drag-and-drop coordination. Isolating the `DndContext` here ensures layout components like `Sidebar` or `Header` do not re-render during drag interactions.
4. **`KanbanColumn.tsx`**: Serves as the droppable container. Handles empty state rendering so that empty columns remain valid drop targets.
5. **`TaskCard.tsx`**: Encapsulates dragging listeners, micro-interactions, and visual representations. It includes an `isOverlay` mode to render the pristine preview inside `<DragOverlay>`.
6. **`TaskModal.tsx` & `DeleteConfirmModal.tsx`**: Isolated dialogs that prevent form state dirtying from leaking into the main board.

---

## 3. Data Flow, Props & Callback Mechanics

TaskFlow strictly adheres to **unidirectional data flow**:

```
                         ┌─────────────────┐
                         │   useTasks()    │
                         │ (Master State)  │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │   app/page.tsx  │
                         └────────┬────────┘
             ┌────────────────────┼───────────────────┐
             ▼                    ▼                   ▼
     ┌──────────────┐     ┌───────────────┐   ┌───────────────┐
     │  Header.tsx  │     │ SummaryCards  │   │ TaskFilters   │
     └──────────────┘     └───────────────┘   └───────────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ KanbanBoard.tsx │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ KanbanColumn.tsx│ (x4 columns)
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │   TaskCard.tsx  │ (Individual cards)
                         └─────────────────┘
```

### Callback Bubbling
- **Drag Reorder**: `TaskCard` drag event ➔ `KanbanBoard.handleDragEnd` ➔ calls `onReorder(activeId, overId)` ➔ processed by `useTasks.reorderTasks`.
- **Task Creation**: Header or Column "+" button ➔ triggers `handleOpenCreateModal(status)` in `page.tsx` ➔ opens `TaskModal` with that status pre-selected.
- **Task Deletion**: `TaskCard` action menu ➔ triggers `onDeleteRequest(task)` ➔ opens `DeleteConfirmModal` ➔ user confirms ➔ invokes `deleteTask(task.id)` in `useTasks`.

---

## 4. Drag-and-Drop Engineering with @dnd-kit

Drag-and-drop in modern web apps requires handling pointer differences, touch scrolling, and accessibility.

### Sensor Configuration
Configured in [`components/dashboard/KanbanBoard.tsx`](file:///home/hassanraza/tracker/job-tracker/components/dashboard/KanbanBoard.tsx):

```typescript
const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5, // 5px threshold prevents accidental dragging when clicking Edit/Delete
    },
  }),
  useSensor(TouchSensor, {
    activationConstraint: {
      delay: 200, // 200ms hold on touch devices prevents hijacking normal page scrolling
      tolerance: 6,
    },
  }),
  useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates, // Full keyboard a11y navigation
  })
);
```

### Collision Detection: `closestCorners`
We chose `closestCorners` instead of `rectIntersection` or `pointerWithin`:
- Works reliably when moving cards between columns with varying heights.
- Accurately detects empty columns as valid drop targets.

### DragOverlay: Smooth 60fps Previews
Instead of moving the actual DOM node during drag (which causes layout jitter and repaints), `@dnd-kit` renders a detached clone inside `<DragOverlay>`:
- The dragged card in the column is dimmed (`opacity: 0.3`).
- The overlay card renders with elevation shadow, slight rotation (`rotate-1`), and `cursor-grabbing`.

---

## 5. Preventing Data Corruption & Duplication

A common failure mode in multi-container Kanban boards is **task duplication** or **disappearing tasks** when moving between columns, especially under active search filters.

### The Problem
If the board operates directly on the *filtered* list:
1. User filters for "Redis" (1 task visible).
2. User drags the task to "Done".
3. If state updates replace the master list with the filtered list, all other tasks are permanently lost!

### The Solution: Master State vs. Derived View
In [`hooks/useTasks.ts`](file:///home/hassanraza/tracker/job-tracker/hooks/useTasks.ts):
- `tasks`: The master array containing all tasks.
- `filteredTasks`: A memoized derived view computed via `filterTasks(tasks, filters)`.
- `reorderTasks`: Always executes against `tasks` (the master source of truth).

### Column Move Logic (Zero Duplication)
```typescript
// 1. Separate the moving task from all other tasks
const activeTask = prev.find((t) => t.id === activeId);
const otherTasks = prev.filter((t) => t.id !== activeId);

// 2. Isolate tasks in target column
const targetColumnTasks = otherTasks
  .filter((t) => t.status === targetStatus)
  .sort((a, b) => a.order - b.order);

// 3. Update active task's status
const updatedActive = { ...activeTask, status: targetStatus };

// 4. Splice into exact target index
targetColumnTasks.splice(insertAt, 0, updatedActive);

// 5. Re-index orders for the target column
const reindexedTarget = targetColumnTasks.map((t, idx) => ({ ...t, order: idx }));

// 6. Merge with unaffected columns
return [...otherTasks.filter((t) => t.status !== targetStatus), ...reindexedTarget];
```
This guarantees that:
- The task is removed from its source column.
- The task exists exactly once in the target column.
- Orders in unaffected columns remain intact.

---

## 6. Why Immutable State Updates Matter

In React, state should never be modified directly (`task.status = 'done'` or `tasks.push(newTask)`).

### Why Immutability is Essential:
1. **Shallow Referential Equality**:
   React checks `prevProps === nextProps` or `prevState === nextState`. If you mutate an object in place, its memory address remains unchanged. React assumes nothing has changed and skips re-rendering.
2. **Predictable `useMemo` & `useEffect` Dependencies**:
   Derived calculations (e.g. `computeTaskMetrics(tasks)`) rely on reference changes to recalculate. Mutating in-place means metrics will not update.
3. **Pure Functions & Testability**:
   Pure update functions make state transitions deterministic, repeatable, and easily testable without mock fixtures.

---

## 7. LocalStorage Persistence & Hydration Safety

### The Hydration Mismatch Pitfall
When Next.js pre-renders a Client Component on the server:
- If you read `window.localStorage` during the initial component execution, the server does not have `window`, while the client does.
- The resulting HTML will differ, throwing React Error `#418` / `#423` (*Hydration mismatch*).
- Furthermore, in Next.js 16 (Turbopack), calling `new Date()` or reading client storage during static prerender is strictly flagged.

### The Solution: React 19 `useSyncExternalStore`
Instead of using messy `useEffect(() => { setIsMounted(true); }, [])` which triggers cascading re-renders and ESLint warnings, TaskFlow uses `useSyncExternalStore`:

```typescript
// hooks/useTasks.ts
const isMounted = useSyncExternalStore(
  () => () => {},
  () => true,  // Client snapshot
  () => false  // Server snapshot
);

const clientDate = useSyncExternalStore(
  () => () => {},
  () => new Date().toISOString().split('T')[0], // Client: real current date
  () => '2026-10-20'                           // Server: deterministic static anchor
);
```

### Result:
- On the server, `isMounted` is `false`. A skeleton loader renders.
- On the client hydration pass, `isMounted` is initially `false`, matching the server HTML exactly.
- Immediately after hydration, React updates `isMounted` to `true`, rendering the interactive Kanban board.
- Zero hydration mismatch, zero render-blocking warnings.

---

## 8. Client vs Server Components Strategy

| Component | Directive | Justification |
|---|---|---|
| `app/layout.tsx` | *Server* | Static HTML shell, loads Google Fonts (`Geist`), sets SEO metadata. |
| `lib/task-utils.ts` | *Server / Shared* | Pure calculation functions with zero side effects. |
| `lib/initial-data.ts`| *Server / Shared* | Static immutable seed data. |
| `app/page.tsx` | `"use client"` | Root coordinator managing modal open/close state and client hook. |
| `useTasks.ts` | `"use client"` | Hook utilizing `useState`, `useEffect`, `useSyncExternalStore`, and `localStorage`. |
| `KanbanBoard.tsx` | `"use client"` | Requires DOM refs and event listeners for `@dnd-kit`. |
| `KanbanColumn.tsx` | `"use client"` | Registers droppable DOM nodes via `useDroppable`. |
| `TaskCard.tsx` | `"use client"` | Sortable drag listeners (`useSortable`) and interactive menus. |
| `TaskModal.tsx` | `"use client"` | Form state, escape key listeners, input validation. |

---

## 9. Scaling to Production: Database & API Migration

To evolve TaskFlow from a client-side demo into an enterprise SaaS platform:

```
[Client (Next.js)] ───► TanStack Query ───► Next.js Route Handlers ───► Prisma / Drizzle ───► PostgreSQL
        ▲                                                                                       │
        └────────────────────── WebSocket / SSE Broadcast ──────────────────────────────────────┘
```

### 1. Database Schema (PostgreSQL + Prisma)
```prisma
model Task {
  id          String       @id @default(uuid())
  title       String
  description String?
  status      TaskStatus   @default(TODO)
  priority    TaskPriority @default(MEDIUM)
  dueDate     DateTime?
  category    String
  order       Float        // Or LexoRank string for O(1) reordering
  assigneeId  String?
  assignee    User?        @relation(fields: [assigneeId], references: [id])
  workspaceId String
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  @@index([workspaceId, status, order])
}
```

### 2. LexoRank vs Array Index for Ordering
- **Problem with Array Index (0, 1, 2, ...)**: Moving a card from position 10 to position 1 requires updating the `order` column for all 9 intermediate tasks in the database (O(N) write operations).
- **Solution (LexoRank / Fractional Indexing)**:
  - Backlog task A has rank `"aaaa"`, task B has rank `"bbbb"`.
  - Inserting between them assigns rank `"aaam"`.
  - Only **one single row** needs an update in the database!

### 3. Optimistic UI Updates via TanStack Query
```typescript
const queryClient = useQueryClient();

const moveMutation = useMutation({
  mutationFn: ({ taskId, status, order }) => api.patch(`/tasks/${taskId}`, { status, order }),
  onMutate: async ({ taskId, status, order }) => {
    // 1. Cancel in-flight queries
    await queryClient.cancelQueries({ queryKey: ['tasks'] });
    // 2. Snapshot current state for rollback
    const previousTasks = queryClient.getQueryData(['tasks']);
    // 3. Optimistically update client cache immediately
    queryClient.setQueryData(['tasks'], (old) => applyReorder(old, taskId, status, order));
    return { previousTasks };
  },
  onError: (err, variables, context) => {
    // 4. Rollback to previous state on failure
    queryClient.setQueryData(['tasks'], context.previousTasks);
    toast.error('Failed to move task. Reverting changes.');
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  },
});
```

---

## 10. Top 15 Senior Frontend Interview Q&As

### Q1: How did you prevent hydration mismatch issues with localStorage in Next.js?
**Answer**:
"In SSR frameworks like Next.js, `localStorage` is inaccessible on the server. If client code reads `localStorage` during initial render, the client DOM will not match the server-rendered HTML, resulting in hydration errors.
I resolved this using React 19's `useSyncExternalStore`. It accepts a client snapshot function and a server snapshot function. On the server, `isMounted` evaluates to `false`, rendering a lightweight skeleton. On the initial client hydration pass, it remains `false` to match the server markup, and immediately updates to `true` afterwards, rendering the persisted tasks safely."

### Q2: Why did you choose `@dnd-kit` over `react-beautiful-dnd` or the native HTML5 Drag and Drop API?
**Answer**:
"1. `react-beautiful-dnd` is deprecated and has compatibility issues with React 18/19 concurrent rendering.
2. The HTML5 Drag and Drop API has severe limitations: poor mobile touch support, inability to customize drag image transparency/rotation reliably, and platform-inconsistent event timing.
3. `@dnd-kit` is modular, lightweight (tree-shakeable), supports React 19, provides built-in accessibility through `KeyboardSensor`, and offers full control over collision detection and drag overlays."

### Q3: How do you handle performance when dragging cards in a board with hundreds of tasks?
**Answer**:
"Three techniques:
1. **DragOverlay**: Instead of animating the real component in the DOM list, `@dnd-kit` renders a single lightweight clone in `<DragOverlay>`.
2. **Fine-grained Memoization**: Columns and cards are wrapped in `React.memo` or separated into sub-trees so moving a card in Column A does not trigger re-renders in Column C.
3. **Sensor Thresholds**: Using a 5px movement constraint prevents re-render thrashing on accidental mouse clicks."

### Q4: Explain the difference between `useCallback` and `useMemo` in your custom hook.
**Answer**:
"`useMemo` caches the **result of a calculation** (e.g. `filteredTasks` or `metrics`), only recomputing when its input dependencies change.
`useCallback` caches a **function instance** across renders (e.g. `createTask` or `moveTask`). This prevents child components like `KanbanColumn` or `KanbanBoard` from unnecessarily re-rendering due to receiving newly created function references on every parent render."

### Q5: How did you ensure that filtered views don't corrupt the task state when moving tasks?
**Answer**:
"I decoupled the **master collection** from the **presentation view**. The `tasks` array in `useTasks` always contains the full list of tasks. Filtering by search query, priority, or category produces a derived view via `useMemo`. When a drag event ends, `reorderTasks` receives the IDs and mutates the *master* list, never the filtered slice. This guarantees that hidden tasks are never dropped or overwritten."

### Q6: What was the ESLint `react-hooks/set-state-in-effect` warning, and how did you resolve it?
**Answer**:
"The new React 19 / ESLint compiler flags calling `setState` synchronously at the top level of `useEffect` because it causes cascading re-renders (render ➔ effect ➔ re-render).
I fixed this in two places:
1. In `TaskModal`, instead of syncing props to state in an effect, I initialized state directly and assigned a dynamic `key` (`key={editingTask?.id ?? 'create'}`) from the parent. When the task changes, React automatically remounts the modal with fresh state.
2. In `useTasks`, I replaced `setIsMounted(true)` with `useSyncExternalStore`."

### Q7: How would you make this Kanban board accessible according to WCAG 2.1 AA?
**Answer**:
"1. **Keyboard Drag-and-Drop**: Configured `KeyboardSensor` with `sortableKeyboardCoordinates`, allowing users to select a card with `Space`, navigate with arrows, and drop with `Space`.
2. **Semantic HTML & ARIA**: Use `role='region'` with `aria-label` for columns, proper button roles, and `aria-hidden` on decorative icons.
3. **Focus Management**: Trapping focus inside `TaskModal` when open and restoring focus to the triggering element upon dismissal.
4. **Color Contrast**: Ensuring badges and text meet a minimum 4.5:1 contrast ratio against card backgrounds."

### Q8: What is the benefit of controlled vs uncontrolled inputs in `TaskModal`?
**Answer**:
"`TaskModal` uses controlled inputs (`value` and `onChange`) because:
1. It allows instant validation feedback (e.g., clearing the title error as soon as the user types a character).
2. It facilitates form reset and pre-filling when editing existing tasks.
3. It makes form submission logic purely declarative."

### Q9: How does Tailwind CSS v4 differ from v3 in this project?
**Answer**:
"Tailwind CSS v4 is configured via CSS-first configuration using `@import 'tailwindcss';` rather than a JavaScript-based `tailwind.config.js`. It features an ultra-fast Rust-based engine (LightningCSS), automatic utility detection, and modern CSS variables integration."

### Q10: How would you handle concurrent edits if two users move the same task simultaneously?
**Answer**:
"In a real-time collaborative environment:
1. Use **Optimistic Locking**: Every task row has a `version` integer. When sending an update, send the known version. If the database version is higher, reject the change with `409 Conflict`.
2. Use **CRDTs (Conflict-free Replicated Data Types)** or a library like **Yjs** if implementing real-time cursor presence and collaborative card editing.
3. Broadcast updates over WebSockets so other connected clients immediately see column movements without manual page refreshes."

### Q11: Why is array index (`order: number`) problematic in large-scale databases, and how does LexoRank solve it?
**Answer**:
"With sequential integer indices (0, 1, 2, 3), inserting an item between 0 and 1 requires incrementing the order of every subsequent item, resulting in an O(N) database write operation.
LexoRank uses lexicographical string ordering (e.g., between `'a'` and `'c'` is `'b'`). Inserting an item only requires calculating a midpoint string and writing that single row (O(1))."

### Q12: How does Next.js App Router static prerendering interact with dynamic client dates?
**Answer**:
"Next.js 16 prerenders client components into static HTML at build time. If a component evaluates `new Date()` directly in its render phase, Next.js flags it as an unstable value (`blocking-prerender-current-time-client`) because the server date will freeze into the static artifact.
I solved this by providing a deterministic fallback date during server prerendering, and subscribing to the real client date via `useSyncExternalStore` upon mount."

### Q13: What is the role of `crypto.randomUUID()` vs sequential IDs?
**Answer**:
"Sequential IDs (1, 2, 3) are collision-prone when multiple tasks are created on the client before syncing with a database. `crypto.randomUUID()` generates standard RFC 4122 v4 UUIDs cryptographically guaranteed to be globally unique, allowing safe client-side task creation without ID collisions."

### Q14: How does TaskFlow maintain responsive design across mobile and desktop?
**Answer**:
"1. **Collapsible Sidebar**: The sidebar shifts from a fixed left navigation on desktop (`lg:static lg:translate-x-0`) into a slide-over mobile drawer (`fixed inset-y-0 z-50`) with backdrop blur.
2. **Responsive Grid**: Kanban columns collapse into a vertical stack on mobile (`grid-cols-1`), two columns on tablets (`md:grid-cols-2`), and 4 columns on desktop (`xl:grid-cols-4`).
3. **Adaptive Header**: Actions dynamically hide secondary labels on smaller screens (e.g., '+ New' on mobile vs '+ New Task' on desktop)."

### Q15: If you had 2 more weeks to work on this, what would you add?
**Answer**:
"1. **Sub-tasks & Checklist Progress**: Adding nested checklist items with progress bars on the card.
2. **Activity Audit Trail**: A slide-over activity drawer showing history (who moved a card, timestamped changes).
3. **Keyboard Shortcuts**: Linear-style navigation (`C` for create, `Cmd+K` command palette, `J/K` for card selection).
4. **Backend Sync**: Integration with PostgreSQL via Drizzle ORM and Server Actions with optimistic caching."

---

## 11. What One Problem Did You Face & How Did You Fix It?

In an interview, you are frequently asked: *"Tell me about a specific technical challenge you encountered while building this application, and how you solved it."*

Here are the **three strongest options** you can present, depending on whether the interviewer is focused on **Next.js & React 19 Core**, **Complex UI Interactions**, or **State Architecture**:

---

### Option 1 (Recommended — Shows Deep Next.js 16 & React 19 Mastery)
#### "Handling SSR Prerender Evaluation of `new Date()` & LocalStorage Hydration Without Cascading Renders"

**The Challenge:**
> "In Next.js 16 with Turbopack, client components are pre-evaluated at build time to produce static HTML. When the application evaluated `new Date()` inside utility functions during render (to calculate `isOverdue` and format relative due dates) and attempted to read `window.localStorage` on initial state setup, Next.js threw `blocking-prerender-current-time-client` and React flagged hydration mismatches (#418).
>
> In earlier React versions, developers typically fixed this with `useEffect(() => setIsMounted(true), [])`. However, in React 19 with the latest ESLint rules, calling `setState` synchronously inside an effect triggers `react-hooks/set-state-in-effect`, which prevents cascading render cycles that degrade performance."

**How I Fixed It:**
> "Instead of relying on `useEffect` state synchronization, I leveraged React 19’s native **`useSyncExternalStore`**:
> ```typescript
> const isMounted = useSyncExternalStore(
>   () => () => {},
>   () => true,  // Client snapshot
>   () => false  // Server snapshot
> );
> 
> const clientDate = useSyncExternalStore(
>   () => () => {},
>   () => new Date().toISOString().split('T')[0], // Client: real current date
>   () => '2026-10-20'                           // Server: deterministic static anchor
> );
> ```
> By providing an explicit server snapshot and client snapshot, Next.js prerenders a deterministic skeleton on the server with zero time-instability errors. On the client, hydration matches the server HTML exactly before transitioning to the interactive board. This eliminated both the hydration mismatch and the cascading `setState` warning completely."

---

### Option 2 (Shows Deep UI/UX & Interaction Engineering)
#### "Drag Sensors Hijacking Button Clicks & Mobile Scrolling"

**The Challenge:**
> "A subtle but frustrating interaction issue occurred when adding the 3-dots action menu, Edit button, and Delete button inside draggable task cards.
> 
> By default, `@dnd-kit` attaches pointer down listeners across the entire card container. Whenever a user clicked the Edit or Delete button, the drag-and-drop listener intercepted the event as the start of a drag motion, suppressing the button's `onClick` handler. Furthermore, on mobile touchscreens, users couldn't scroll down the columns because vertical swipe gestures were being captured as card drags."

**How I Fixed It:**
> "I fine-tuned sensor activation constraints in `KanbanBoard.tsx`:
> 1. Configured `PointerSensor` with an **activation constraint of `{ distance: 5 }`**. The user must drag by at least 5 pixels before dragging initiates, allowing single clicks on Edit, Delete, or menus to fire naturally.
> 2. Configured `TouchSensor` with **`{ delay: 200, tolerance: 6 }`**. Quick touch swipes scroll the board vertically, while pressing and holding for 200ms enters the drag mode."

---

### Option 3 (Shows Strong Architectural State Modeling)
#### "Preventing Silent Data Corruption When Dragging Under Active Search/Filters"

**The Challenge:**
> "If a user searched for 'Redis', only 1 task remained visible on the board. In a naive implementation, if the user dragged that card to 'Done', the drop event handler would update the visible array and save it to `localStorage`, permanently wiping out the other 8 tasks that were filtered out!"

**How I Fixed It:**
> "I decoupled the **Master State** from the **Derived View** inside `useTasks.ts`:
> - `tasks` is the single source of truth containing the full task collection.
> - `filteredTasks` is a memoized view computed via `useMemo` strictly for rendering.
> - The drag reorder handler (`reorderTasks`) receives task IDs and computes immutable splices against the **master collection**, never the filtered slice.
> This guarantees that moving cards under active filters never deletes or corrupts hidden data."

---

## 12. Code Directory & File Reference

- **Types**: [`types/task.ts`](file:///home/hassanraza/tracker/job-tracker/types/task.ts)
- **Utilities**: [`lib/task-utils.ts`](file:///home/hassanraza/tracker/job-tracker/lib/task-utils.ts)
- **Seed Data**: [`lib/initial-data.ts`](file:///home/hassanraza/tracker/job-tracker/lib/initial-data.ts)
- **Custom Hook**: [`hooks/useTasks.ts`](file:///home/hassanraza/tracker/job-tracker/hooks/useTasks.ts)
- **Composition Root**: [`app/page.tsx`](file:///home/hassanraza/tracker/job-tracker/app/page.tsx)
- **Sidebar**: [`components/layout/Sidebar.tsx`](file:///home/hassanraza/tracker/job-tracker/components/layout/Sidebar.tsx)
- **Header**: [`components/layout/Header.tsx`](file:///home/hassanraza/tracker/job-tracker/components/layout/Header.tsx)
- **Summary Cards**: [`components/dashboard/SummaryCards.tsx`](file:///home/hassanraza/tracker/job-tracker/components/dashboard/SummaryCards.tsx)
- **Task Filters**: [`components/dashboard/TaskFilters.tsx`](file:///home/hassanraza/tracker/job-tracker/components/dashboard/TaskFilters.tsx)
- **Kanban Board**: [`components/dashboard/KanbanBoard.tsx`](file:///home/hassanraza/tracker/job-tracker/components/dashboard/KanbanBoard.tsx)
- **Kanban Column**: [`components/dashboard/KanbanColumn.tsx`](file:///home/hassanraza/tracker/job-tracker/components/dashboard/KanbanColumn.tsx)
- **Task Card**: [`components/dashboard/TaskCard.tsx`](file:///home/hassanraza/tracker/job-tracker/components/dashboard/TaskCard.tsx)
- **Task Modal**: [`components/dashboard/TaskModal.tsx`](file:///home/hassanraza/tracker/job-tracker/components/dashboard/TaskModal.tsx)
- **Delete Modal**: [`components/dashboard/DeleteConfirmModal.tsx`](file:///home/hassanraza/tracker/job-tracker/components/dashboard/DeleteConfirmModal.tsx)
