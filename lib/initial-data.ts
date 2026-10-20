import { ColumnDefinition, Task, Assignee } from '@/types/task';

export const COLUMNS: ColumnDefinition[] = [
  {
    id: 'backlog',
    title: 'Backlog',
    color: 'slate',
    dotColor: 'bg-slate-400',
    badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  {
    id: 'todo',
    title: 'To Do',
    color: 'amber',
    dotColor: 'bg-amber-400',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    color: 'indigo',
    dotColor: 'bg-indigo-500',
    badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  {
    id: 'done',
    title: 'Done',
    color: 'emerald',
    dotColor: 'bg-emerald-500',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
];

export const AVAILABLE_ASSIGNEES: Assignee[] = [
  { name: 'Sarah Chen', initials: 'SC', avatarColor: 'bg-indigo-500 text-white' },
  { name: 'Alex Rivera', initials: 'AR', avatarColor: 'bg-emerald-500 text-white' },
  { name: 'Marcus Vance', initials: 'MV', avatarColor: 'bg-amber-500 text-white' },
  { name: 'Elena Rostova', initials: 'ER', avatarColor: 'bg-violet-500 text-white' },
  { name: 'David Kim', initials: 'DK', avatarColor: 'bg-rose-500 text-white' },
];

export const AVAILABLE_CATEGORIES = [
  'Core App',
  'Design System',
  'Infrastructure',
  'Platform',
  'DevOps',
  'Performance',
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Audit design tokens for WCAG AA compliance',
    description: 'Review color contrast ratios across dark & light themes in the new design system components.',
    status: 'backlog',
    priority: 'low',
    dueDate: '2026-11-02',
    category: 'Design System',
    assignee: AVAILABLE_ASSIGNEES[0], // Sarah
    createdAt: '2026-10-18T10:00:00.000Z',
    order: 0,
  },
  {
    id: 'task-2',
    title: 'Investigate Redis cache eviction anomalies',
    description: 'Diagnose intermittent cache drops occurring under peak traffic loads in EU cluster.',
    status: 'backlog',
    priority: 'medium',
    dueDate: '2026-10-28',
    category: 'Infrastructure',
    assignee: AVAILABLE_ASSIGNEES[4], // David
    createdAt: '2026-10-18T11:00:00.000Z',
    order: 1,
  },
  {
    id: 'task-3',
    title: 'Implement OAuth2 PKCE flow for mobile clients',
    description: 'Upgrade the authentication service to support secure authorization code grant with PKCE.',
    status: 'todo',
    priority: 'high',
    dueDate: '2026-10-23',
    category: 'Core App',
    assignee: AVAILABLE_ASSIGNEES[1], // Alex
    createdAt: '2026-10-19T08:30:00.000Z',
    order: 0,
  },
  {
    id: 'task-4',
    title: 'Export workspace analytics to CSV/JSON',
    description: 'Allow team owners to export their quarterly task turnaround data and velocity charts.',
    status: 'todo',
    priority: 'medium',
    dueDate: '2026-10-19', // overdue for demonstration
    category: 'Platform',
    assignee: AVAILABLE_ASSIGNEES[2], // Marcus
    createdAt: '2026-10-17T14:00:00.000Z',
    order: 1,
  },
  {
    id: 'task-5',
    title: 'Refactor webhook idempotency keys',
    description: 'Store stripe webhook signatures in distributed lock table to prevent duplicate billing charges.',
    status: 'todo',
    priority: 'high',
    dueDate: '2026-10-26',
    category: 'Core App',
    assignee: AVAILABLE_ASSIGNEES[3], // Elena
    createdAt: '2026-10-19T12:00:00.000Z',
    order: 2,
  },
  {
    id: 'task-6',
    title: 'Redesign task drawer with live presence',
    description: 'Streamline sidebar interactions and show real-time avatar indicators when teammates view tasks.',
    status: 'in-progress',
    priority: 'high',
    dueDate: '2026-10-22',
    category: 'Design System',
    assignee: AVAILABLE_ASSIGNEES[0], // Sarah
    createdAt: '2026-10-18T16:00:00.000Z',
    order: 0,
  },
  {
    id: 'task-7',
    title: 'Optimize Next.js bundle & dynamic imports',
    description: 'Split heavy vendor chunks and enable code-splitting on charts to reduce LCP below 1.2s.',
    status: 'in-progress',
    priority: 'medium',
    dueDate: '2026-10-25',
    category: 'Performance',
    assignee: AVAILABLE_ASSIGNEES[4], // David
    createdAt: '2026-10-19T09:00:00.000Z',
    order: 1,
  },
  {
    id: 'task-8',
    title: 'Migrate route handlers to Turbopack runtime',
    description: 'Verified edge runtime compatibility and converted legacy API middleware handlers.',
    status: 'done',
    priority: 'low',
    dueDate: '2026-10-16',
    category: 'Platform',
    assignee: AVAILABLE_ASSIGNEES[1], // Alex
    createdAt: '2026-10-15T11:00:00.000Z',
    order: 0,
  },
  {
    id: 'task-9',
    title: 'Setup automated PR preview deployments',
    description: 'Integrated GitHub actions workflow with staging environment for fast QA validation.',
    status: 'done',
    priority: 'medium',
    dueDate: '2026-10-14',
    category: 'DevOps',
    assignee: AVAILABLE_ASSIGNEES[2], // Marcus
    createdAt: '2026-10-14T10:00:00.000Z',
    order: 1,
  },
];
