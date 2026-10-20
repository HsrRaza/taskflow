'use client';

import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { ColumnDefinition, Task, TaskStatus } from '@/types/task';
import { COLUMNS } from '@/lib/initial-data';
import KanbanColumn from './KanbanColumn';
import TaskCard from './TaskCard';

interface KanbanBoardProps {
  groupedTasks: Record<TaskStatus, Task[]>;
  allTasks: Task[];
  onReorder: (activeId: string, overId: string) => void;
  onAddTask: (status: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteRequest: (task: Task) => void;
}

export default function KanbanBoard({
  groupedTasks,
  allTasks,
  onReorder,
  onAddTask,
  onEditTask,
  onDeleteRequest,
}: KanbanBoardProps) {
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  // Setup accessible & touch-friendly sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement required before drag starts to allow button clicks
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // 200ms press on mobile to distinguish from vertical scrolling
        tolerance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const activeTask = activeTaskId ? allTasks.find((t) => t.id === activeTaskId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTaskId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTaskId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId !== overId) {
      onReorder(activeId, overId);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4 pb-12">
        {COLUMNS.map((column: ColumnDefinition) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={groupedTasks[column.id] || []}
            onAddTask={onAddTask}
            onEditTask={onEditTask}
            onDeleteRequest={onDeleteRequest}
          />
        ))}
      </div>

      {/* Drag Overlay: Displays floating preview of dragging card */}
      <DragOverlay dropAnimation={{
        duration: 200,
        easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
      }}>
        {activeTask ? (
          <div className="w-[300px]">
            <TaskCard
              task={activeTask}
              onEdit={() => {}}
              onDeleteRequest={() => {}}
              isOverlay
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
