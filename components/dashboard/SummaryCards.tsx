'use client';

import React from 'react';
import { TaskMetrics } from '@/types/task';
import { CheckCircle2, Clock, AlertCircle, ListTodo } from 'lucide-react';

interface SummaryCardsProps {
  metrics: TaskMetrics;
  onFilterByMetric?: (type: 'all' | 'in-progress' | 'done' | 'overdue') => void;
}

export default function SummaryCards({ metrics }: SummaryCardsProps) {
  const cards = [
    {
      label: 'Total Tasks',
      value: metrics.total,
      icon: ListTodo,
      iconColor: 'text-slate-600',
      iconBg: 'bg-slate-100',
      description: 'Across all 4 sprint columns',
    },
    {
      label: 'In Progress',
      value: metrics.inProgress,
      icon: Clock,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50',
      description: 'Actively in development',
    },
    {
      label: 'Completed',
      value: metrics.completed,
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      description: `${metrics.total > 0 ? Math.round((metrics.completed / metrics.total) * 100) : 0}% completion rate`,
    },
    {
      label: 'Overdue',
      value: metrics.overdue,
      icon: AlertCircle,
      iconColor: metrics.overdue > 0 ? 'text-rose-600' : 'text-slate-400',
      iconBg: metrics.overdue > 0 ? 'bg-rose-50' : 'bg-slate-100',
      description: metrics.overdue > 0 ? 'Requires immediate attention' : 'All deadlines on track',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="group relative overflow-hidden rounded-xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">{card.label}</span>
              <div className={`rounded-lg p-2 ${card.iconBg} ${card.iconColor} transition-transform group-hover:scale-105`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                {card.value}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400 truncate">
              {card.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
