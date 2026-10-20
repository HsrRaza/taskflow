import { Task, TaskFilterState, TaskMetrics, TaskStatus } from '@/types/task';

/**
 * Checks if a given YYYY-MM-DD date string is strictly before the reference date
 */
export function isOverdue(dateString: string, referenceDate?: Date | string | null): boolean {
  if (!dateString) return false;

  const [year, month, day] = dateString.split('-').map(Number);
  if (!year || !month || !day) return false;

  // Use UTC to avoid timezone shift inconsistencies
  const targetTime = Date.UTC(year, month - 1, day);

  let refTime: number;
  if (referenceDate instanceof Date) {
    refTime = Date.UTC(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  } else if (typeof referenceDate === 'string' && referenceDate) {
    const [ry, rm, rd] = referenceDate.split('-').map(Number);
    refTime = Date.UTC(ry, (rm || 1) - 1, rd || 1);
  } else {
    // Default fallback anchor for deterministic prerender
    refTime = Date.UTC(2026, 9, 20);
  }

  return targetTime < refTime;
}

/**
 * Formats a YYYY-MM-DD date to a human readable label
 */
export function formatDueDate(dateString: string, referenceDate?: Date | string | null): string {
  if (!dateString) return 'No due date';

  const [year, month, day] = dateString.split('-').map(Number);
  if (!year || !month || !day) return dateString;

  const targetTime = Date.UTC(year, month - 1, day);

  let refTime: number;
  if (referenceDate instanceof Date) {
    refTime = Date.UTC(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  } else if (typeof referenceDate === 'string' && referenceDate) {
    const [ry, rm, rd] = referenceDate.split('-').map(Number);
    refTime = Date.UTC(ry, (rm || 1) - 1, rd || 1);
  } else {
    refTime = Date.UTC(2026, 9, 20);
  }

  const diffDays = Math.round((targetTime - refTime) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[month - 1]} ${day}`;
}

/**
 * Computes high-level dashboard metrics dynamically from the task collection
 */
export function computeTaskMetrics(tasks: Task[], referenceDate?: Date | string | null): TaskMetrics {
  let inProgress = 0;
  let completed = 0;
  let overdue = 0;

  for (const task of tasks) {
    if (task.status === 'in-progress') inProgress++;
    if (task.status === 'done') completed++;
    if (task.status !== 'done' && isOverdue(task.dueDate, referenceDate)) overdue++;
  }

  return {
    total: tasks.length,
    inProgress,
    completed,
    overdue,
  };
}

/**
 * Applies search, priority, category, and status filters cleanly to a list of tasks
 */
export function filterTasks(tasks: Task[], filters: TaskFilterState): Task[] {
  const query = filters.search.trim().toLowerCase();

  return tasks.filter((task) => {
    // Search query matching title, description, or category
    if (query) {
      const matchTitle = task.title.toLowerCase().includes(query);
      const matchDesc = task.description.toLowerCase().includes(query);
      const matchCategory = task.category.toLowerCase().includes(query);
      if (!matchTitle && !matchDesc && !matchCategory) return false;
    }

    // Priority filter
    if (filters.priority !== 'all' && task.priority !== filters.priority) {
      return false;
    }

    // Category filter
    if (filters.category !== 'all' && task.category !== filters.category) {
      return false;
    }

    // Status filter
    if (filters.status !== 'all' && task.status !== filters.status) {
      return false;
    }

    return true;
  });
}

/**
 * Groups tasks by column status, ordered by their `order` index
 */
export function groupTasksByColumn(tasks: Task[]): Record<TaskStatus, Task[]> {
  const grouped: Record<TaskStatus, Task[]> = {
    backlog: [],
    todo: [],
    'in-progress': [],
    done: [],
  };

  const sorted = [...tasks].sort((a, b) => a.order - b.order);

  for (const task of sorted) {
    if (grouped[task.status]) {
      grouped[task.status].push(task);
    } else {
      grouped.backlog.push(task);
    }
  }

  return grouped;
}
