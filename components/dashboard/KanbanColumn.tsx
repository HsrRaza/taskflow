'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ColumnDefinition, Task, TaskStatus } from '@/types/task';
import TaskCard from './TaskCard';
import { Plus, Inbox } from 'lucide-react';

interface KanbanColumnProps {
  column: ColumnDefinition;
  tasks: Task[];
  onAddTask: (status: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteRequest: (task: Task) => void;
}

export default function KanbanColumn({
  column,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteRequest,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
  });

  const taskIds = tasks.map((t) => t.id);

  return (
    <div
      ref={setNodeRef}
      className={`flex h-full min-w-[280px] w-full flex-col rounded-2xl border transition-colors ${
        isOver
          ? 'border-indigo-400 bg-indigo-50/30'
          : 'border-slate-200/80 bg-slate-100/50'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/60 bg-white/50 rounded-t-2xl">
        <div className="flex items-center gap-2.5">
          <span className={`h-2.5 w-2.5 rounded-full ${column.dotColor}`} />
          <h2 className="text-sm font-semibold text-slate-800">
            {column.title}
          </h2>
          <span className="rounded-full bg-slate-200/70 px-2 py-0.5 text-xs font-semibold text-slate-600">
            {tasks.length}
          </span>
        </div>

        {/* Add task to this column */}
        <button
          onClick={() => onAddTask(column.id)}
          className="rounded-lg p-1 text-slate-400 hover:bg-white hover:text-slate-700 hover:shadow-xs transition-all"
          title={`Add task to ${column.title}`}
          aria-label={`Add task to ${column.title}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Cards List / Drop Target */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[350px]">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDeleteRequest={onDeleteRequest}
            />
          ))}
        </SortableContext>

        {/* Empty State / Drop Target helper */}
        {tasks.length === 0 && (
          <div
            onClick={() => onAddTask(column.id)}
            className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer ${
              isOver
                ? 'border-indigo-400 bg-indigo-50/50'
                : 'border-slate-200/90 hover:border-slate-300 hover:bg-white/40'
            }`}
          >
            <div className="rounded-full bg-slate-100 p-2.5 text-slate-400 mb-2">
              <Inbox className="h-4 w-4" />
            </div>
            <p className="text-xs font-medium text-slate-600">No tasks here</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Drop task or click + to add
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
