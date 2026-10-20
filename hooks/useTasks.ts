'use client';

import { useState, useEffect, useCallback, useMemo, useSyncExternalStore } from 'react';
import { Task, TaskFormData, TaskStatus, TaskMetrics, TaskFilterState } from '@/types/task';
import { INITIAL_TASKS } from '@/lib/initial-data';
import { computeTaskMetrics, filterTasks, groupTasksByColumn } from '@/lib/task-utils';

const STORAGE_KEY = 'taskflow_tasks_v1';
const emptySubscribe = () => () => {};

export function useTasks() {
  // Safe client-side mount detection without cascading renders
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  // Deterministic date on server, real client date on browser
  const clientDate = useSyncExternalStore(
    emptySubscribe,
    () => new Date().toISOString().split('T')[0],
    () => '2026-10-20'
  );

  // Initialize tasks from localStorage on client, or INITIAL_TASKS on server
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.warn('Failed to initialize from localStorage:', e);
      }
    }
    return INITIAL_TASKS;
  });

  // Filters state
  const [filters, setFilters] = useState<TaskFilterState>({
    search: '',
    priority: 'all',
    category: 'all',
    status: 'all',
  });

  // Save to localStorage when tasks change (only after client mounted)
  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.warn('Failed to write to localStorage:', e);
    }
  }, [tasks, isMounted]);

  // Derived filtered tasks & metrics
  const filteredTasks = useMemo(() => filterTasks(tasks, filters), [tasks, filters]);
  const metrics: TaskMetrics = useMemo(
    () => computeTaskMetrics(tasks, clientDate),
    [tasks, clientDate]
  );
  const groupedTasks = useMemo(() => groupTasksByColumn(filteredTasks), [filteredTasks]);

  // Create a new task
  const createTask = useCallback((formData: TaskFormData) => {
    const newTask: Task = {
      ...formData,
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      order: 0, // placed at the top of the column
    };

    setTasks((prev) => {
      // Shift orders for tasks in the same status
      const updated = prev.map((t) =>
        t.status === newTask.status ? { ...t, order: t.order + 1 } : t
      );
      return [newTask, ...updated];
    });

    return newTask;
  }, []);

  // Update an existing task
  const updateTask = useCallback((id: string, updates: Partial<TaskFormData>) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        return {
          ...t,
          ...updates,
        };
      })
    );
  }, []);

  // Delete a task
  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Move task to a specific column / index
  const moveTask = useCallback((taskId: string, targetStatus: TaskStatus, newIndex?: number) => {
    setTasks((prev) => {
      const taskIndex = prev.findIndex((t) => t.id === taskId);
      if (taskIndex === -1) return prev;

      const task = prev[taskIndex];
      const otherTasks = prev.filter((t) => t.id !== taskId);

      const targetColumnTasks = otherTasks
        .filter((t) => t.status === targetStatus)
        .sort((a, b) => a.order - b.order);

      const updatedTask: Task = {
        ...task,
        status: targetStatus,
      };

      const insertAt = typeof newIndex === 'number' && newIndex >= 0
        ? Math.min(newIndex, targetColumnTasks.length)
        : targetColumnTasks.length;

      targetColumnTasks.splice(insertAt, 0, updatedTask);

      const reindexedTarget = targetColumnTasks.map((t, idx) => ({
        ...t,
        order: idx,
      }));

      const remainingTasks = otherTasks.filter((t) => t.status !== targetStatus);

      return [...remainingTasks, ...reindexedTarget];
    });
  }, []);

  // Direct reorder between or within columns
  const reorderTasks = useCallback((activeId: string, overId: string) => {
    setTasks((prev) => {
      const activeTask = prev.find((t) => t.id === activeId);
      if (!activeTask) return prev;

      const validStatuses: TaskStatus[] = ['backlog', 'todo', 'in-progress', 'done'];
      // Case 1: Dropped over a column container
      if (validStatuses.includes(overId as TaskStatus)) {
        const targetStatus = overId as TaskStatus;
        if (activeTask.status === targetStatus) return prev;

        const targetColumnTasks = prev
          .filter((t) => t.status === targetStatus && t.id !== activeId)
          .sort((a, b) => a.order - b.order);

        const updatedActive = {
          ...activeTask,
          status: targetStatus,
          order: targetColumnTasks.length,
        };

        return prev.map((t) => (t.id === activeId ? updatedActive : t));
      }

      // Case 2: Dropped over another task
      const overTask = prev.find((t) => t.id === overId);
      if (!overTask) return prev;

      const sourceStatus = activeTask.status;
      const targetStatus = overTask.status;

      // Same column reordering
      if (sourceStatus === targetStatus) {
        const columnTasks = prev
          .filter((t) => t.status === sourceStatus)
          .sort((a, b) => a.order - b.order);

        const oldIndex = columnTasks.findIndex((t) => t.id === activeId);
        const newIndex = columnTasks.findIndex((t) => t.id === overId);

        if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return prev;

        const [moved] = columnTasks.splice(oldIndex, 1);
        columnTasks.splice(newIndex, 0, moved);

        const reindexed = columnTasks.map((t, idx) => ({ ...t, order: idx }));
        const otherColumns = prev.filter((t) => t.status !== sourceStatus);

        return [...otherColumns, ...reindexed];
      }

      // Different column move
      const targetColumnTasks = prev
        .filter((t) => t.status === targetStatus && t.id !== activeId)
        .sort((a, b) => a.order - b.order);

      const targetIndex = targetColumnTasks.findIndex((t) => t.id === overId);
      const insertAt = targetIndex >= 0 ? targetIndex : targetColumnTasks.length;

      const updatedActive: Task = {
        ...activeTask,
        status: targetStatus,
      };

      targetColumnTasks.splice(insertAt, 0, updatedActive);

      const reindexedTarget = targetColumnTasks.map((t, idx) => ({ ...t, order: idx }));
      const remainingTasks = prev.filter((t) => t.id !== activeId && t.status !== targetStatus);

      return [...remainingTasks, ...reindexedTarget];
    });
  }, []);

  // Reset to initial demo data
  const resetToDemo = useCallback(() => {
    setTasks(INITIAL_TASKS);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TASKS));
    } catch (e) {
      console.warn('Failed to reset localStorage:', e);
    }
  }, []);

  // Update a single filter field
  const setFilterField = useCallback(<K extends keyof TaskFilterState>(field: K, value: TaskFilterState[K]) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      priority: 'all',
      category: 'all',
      status: 'all',
    });
  }, []);

  const hasActiveFilters = Boolean(
    filters.search.trim() ||
    filters.priority !== 'all' ||
    filters.category !== 'all' ||
    filters.status !== 'all'
  );

  return {
    tasks,
    filteredTasks,
    groupedTasks,
    metrics,
    filters,
    isMounted,
    hasActiveFilters,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    reorderTasks,
    resetToDemo,
    setFilterField,
    clearFilters,
  };
}
