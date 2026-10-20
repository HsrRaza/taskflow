'use client';

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, TaskPriority } from '@/types/task';
import { formatDueDate, isOverdue } from '@/lib/task-utils';
import {
  Calendar,
  MoreVertical,
  Pencil,
  Trash2,
  GripVertical,
  AlertCircle,
} from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDeleteRequest: (task: Task) => void;
  isOverlay?: boolean;
}

const priorityStyles: Record<TaskPriority, { badge: string; dot: string }> = {
  low: {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    dot: 'bg-emerald-500',
  },
  medium: {
    badge: 'bg-amber-50 text-amber-700 border-amber-200/80',
    dot: 'bg-amber-500',
  },
  high: {
    badge: 'bg-rose-50 text-rose-700 border-rose-200/80',
    dot: 'bg-rose-500',
  },
};

export default function TaskCard({
  task,
  onEdit,
  onDeleteRequest,
  isOverlay = false,
}: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    disabled: isOverlay,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const overdue = task.status !== 'done' && isOverdue(task.dueDate);
  const priorityInfo = priorityStyles[task.priority] || priorityStyles.medium;

  const cardContent = (
    <div
      className={`group relative rounded-xl border bg-white p-4 transition-all ${
        isOverlay
          ? 'cursor-grabbing border-indigo-400 shadow-xl ring-2 ring-indigo-400/20 rotate-1'
          : isDragging
          ? 'opacity-30 border-dashed border-slate-300 shadow-none'
          : 'border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      {/* Top row: Category tag + Priority badge + Action menu */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 border border-slate-200/70">
            {task.category}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium border ${priorityInfo.badge}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${priorityInfo.dot}`} />
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
        </div>

        {/* Drag Handle + Action Menu */}
        <div className="flex items-center gap-1">
          {!isOverlay && (
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab text-slate-300 hover:text-slate-600 active:cursor-grabbing p-1 rounded transition-colors"
              title="Drag task"
            >
              <GripVertical className="h-4 w-4" />
            </div>
          )}

          {!isOverlay && (
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                aria-label="Task options"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                    }}
                  />
                  <div className="absolute right-0 top-full mt-1 z-40 w-32 rounded-lg border border-slate-200 bg-white py-1 shadow-lg text-xs">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        onEdit(task);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5 text-slate-400" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        onDeleteRequest(task);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                      <span>Delete</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="mt-2.5 text-sm font-semibold text-slate-900 line-clamp-2 leading-snug">
        {task.title}
      </h3>

      {/* Description */}
      {task.description && (
        <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Bottom row: Due date & Assignee */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        {/* Due date indicator */}
        <div
          className={`flex items-center gap-1.5 text-xs font-medium ${
            overdue
              ? 'text-rose-600'
              : task.status === 'done'
              ? 'text-slate-400'
              : 'text-slate-500'
          }`}
          title={overdue ? 'Task is overdue' : `Due: ${task.dueDate}`}
        >
          {overdue ? (
            <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
          ) : (
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
          )}
          <span>{formatDueDate(task.dueDate)}</span>
        </div>

        {/* Assignee Avatar */}
        <div
          className="flex items-center gap-1.5"
          title={`Assigned to ${task.assignee.name}`}
        >
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold ring-2 ring-white shadow-xs ${task.assignee.avatarColor}`}
          >
            {task.assignee.initials}
          </div>
        </div>
      </div>
    </div>
  );

  if (isOverlay) {
    return cardContent;
  }

  return (
    <div ref={setNodeRef} style={style}>
      {cardContent}
    </div>
  );
}
