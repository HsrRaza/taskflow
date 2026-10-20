'use client';

import React from 'react';
import { TaskFilterState, TaskPriority } from '@/types/task';
import { AVAILABLE_CATEGORIES } from '@/lib/initial-data';
import { Filter, X } from 'lucide-react';

interface TaskFiltersProps {
  filters: TaskFilterState;
  onFilterChange: <K extends keyof TaskFilterState>(field: K, value: TaskFilterState[K]) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  totalTasks: number;
  filteredCount: number;
}

export default function TaskFilters({
  filters,
  onFilterChange,
  onClearFilters,
  hasActiveFilters,
  totalTasks,
  filteredCount,
}: TaskFiltersProps) {
  const priorities: { label: string; value: TaskPriority | 'all' }[] = [
    { label: 'All Priorities', value: 'all' },
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-xs">
      {/* Filter Selects & Pills */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mr-1">
          <Filter className="h-3.5 w-3.5" />
          <span>Filters:</span>
        </div>

        {/* Priority Filter */}
        <select
          value={filters.priority}
          onChange={(e) => onFilterChange('priority', e.target.value as TaskPriority | 'all')}
          className="h-8 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-medium text-slate-700 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
        >
          {priorities.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>

        {/* Category / Project Filter */}
        <select
          value={filters.category}
          onChange={(e) => onFilterChange('category', e.target.value)}
          className="h-8 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-medium text-slate-700 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
        >
          <option value="all">All Projects</option>
          {AVAILABLE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 text-xs font-medium text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            <span>Clear filters</span>
          </button>
        )}
      </div>

      {/* Task Count Info */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span>
          Showing <strong className="font-semibold text-slate-900">{filteredCount}</strong> of{' '}
          {totalTasks} tasks
        </span>
      </div>
    </div>
  );
}
