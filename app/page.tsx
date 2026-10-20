'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import SummaryCards from '@/components/dashboard/SummaryCards';
import TaskFilters from '@/components/dashboard/TaskFilters';
import KanbanBoard from '@/components/dashboard/KanbanBoard';
import TaskModal from '@/components/dashboard/TaskModal';
import DeleteConfirmModal from '@/components/dashboard/DeleteConfirmModal';
import { useTasks } from '@/hooks/useTasks';
import { Task, TaskFormData, TaskStatus } from '@/types/task';

export default function TaskFlowPage() {
  const {
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
    reorderTasks,
    resetToDemo,
    setFilterField,
    clearFilters,
  } = useTasks();

  // Navigation & UI state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('overview');

  // Modal states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultColumnStatus, setDefaultColumnStatus] = useState<TaskStatus>('todo');

  // Delete modal state
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Handlers for Task Creation & Editing
  const handleOpenCreateModal = (status: TaskStatus = 'todo') => {
    setEditingTask(null);
    setDefaultColumnStatus(status);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleModalSubmit = (formData: TaskFormData) => {
    if (editingTask) {
      updateTask(editingTask.id, formData);
    } else {
      createTask(formData);
    }
  };

  const handleDeleteConfirm = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete.id);
      setTaskToDelete(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50/70 font-sans text-slate-900 antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {/* Left Sidebar */}
      <Sidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        activeNav={activeNav}
        onNavChange={setActiveNav}
        taskCount={tasks.length}
        onResetDemo={resetToDemo}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Sticky Header */}
        <Header
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenNewTaskModal={() => handleOpenCreateModal('todo')}
          searchValue={filters.search}
          onSearchChange={(value) => setFilterField('search', value)}
          activeFilterCount={hasActiveFilters ? 1 : 0}
        />

        {/* Workspace Canvas */}
        <main className="flex-1 px-4 sm:px-8 py-6 space-y-6 max-w-[1600px] w-full mx-auto">
          {/* Summary Metric Cards */}
          <section aria-label="Task Summary Metrics">
            <SummaryCards metrics={metrics} />
          </section>

          {/* Filtering and Search Toolbar */}
          <section aria-label="Task Filters">
            <TaskFilters
              filters={filters}
              onFilterChange={setFilterField}
              onClearFilters={clearFilters}
              hasActiveFilters={hasActiveFilters}
              totalTasks={tasks.length}
              filteredCount={filteredTasks.length}
            />
          </section>

          {/* Kanban Board Container */}
          <section aria-label="Kanban Board" className="pt-2">
            {!isMounted ? (
              /* Loading skeleton during client hydration */
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-96 rounded-2xl border border-slate-200/80 bg-white/60 p-4 animate-pulse space-y-4"
                  >
                    <div className="h-5 w-24 bg-slate-200 rounded" />
                    <div className="h-28 bg-slate-100 rounded-xl" />
                    <div className="h-28 bg-slate-100 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : (
              <KanbanBoard
                groupedTasks={groupedTasks}
                allTasks={tasks}
                onReorder={reorderTasks}
                onAddTask={(status) => handleOpenCreateModal(status)}
                onEditTask={handleOpenEditModal}
                onDeleteRequest={(task) => setTaskToDelete(task)}
              />
            )}
          </section>
        </main>
      </div>

      {/* Create / Edit Task Modal */}
      <TaskModal
        key={editingTask ? editingTask.id : isTaskModalOpen ? `create-${defaultColumnStatus}` : 'closed'}
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleModalSubmit}
        initialTask={editingTask}
        defaultStatus={defaultColumnStatus}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(taskToDelete)}
        task={taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
