export type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'done';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface Assignee {
  name: string;
  initials: string;
  avatarColor: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string; // ISO date string or YYYY-MM-DD
  category: string;
  assignee: Assignee;
  createdAt: string;
  order: number;
}

export interface ColumnDefinition {
  id: TaskStatus;
  title: string;
  color: string;
  dotColor: string;
  badgeBg: string;
}

export interface TaskFilterState {
  search: string;
  priority: TaskPriority | 'all';
  category: string | 'all';
  status: TaskStatus | 'all';
}

export interface TaskMetrics {
  total: number;
  inProgress: number;
  completed: number;
  overdue: number;
}

export type TaskFormData = Omit<Task, 'id' | 'createdAt' | 'order'>;
