'use client';

import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  Settings,
  Sparkles,
  Layers,
  X,
  RotateCcw,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeNav: string;
  onNavChange: (nav: string) => void;
  taskCount: number;
  onResetDemo: () => void;
}

export default function Sidebar({
  isOpen,
  onClose,
  activeNav,
  onNavChange,
  taskCount,
  onResetDemo,
}: SidebarProps) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'my-tasks', label: 'My Tasks', icon: CheckSquare, badge: taskCount },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const projects = [
    { name: 'Core App', color: 'bg-indigo-500' },
    { name: 'Design System', color: 'bg-pink-500' },
    { name: 'Platform', color: 'bg-amber-500' },
    { name: 'Infrastructure', color: 'bg-emerald-500' },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo & Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <span className="font-semibold text-slate-900 tracking-tight text-base">TaskFlow</span>
              <span className="ml-1.5 rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700 border border-indigo-100">
                PRO
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Workspace
            </p>
            <nav className="mt-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavChange(item.id);
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-50/80 text-indigo-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`h-4 w-4 transition-colors ${
                          isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          isActive
                            ? 'bg-indigo-200/60 text-indigo-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Projects section */}
          <div>
            <div className="flex items-center justify-between px-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Projects
              </p>
              <Sparkles className="h-3 w-3 text-slate-400" />
            </div>
            <div className="mt-2 space-y-1">
              {projects.map((proj) => (
                <div
                  key={proj.name}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-default"
                >
                  <span className={`h-2 w-2 rounded-full ${proj.color}`} />
                  <span className="truncate">{proj.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Demo Reset */}
          <div className="pt-2">
            <button
              onClick={onResetDemo}
              className="flex w-full items-center gap-2.5 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-600 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
              <span>Reset Demo Tasks</span>
            </button>
          </div>
        </div>

        {/* User profile footer */}
        <div className="border-t border-slate-100 p-3">
          <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-slate-50 transition-colors">
            <div className="relative">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-white">
                HR
              </div>
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-900">Hassan Raza</p>
              <p className="truncate text-[11px] text-slate-400">Lead Engineer</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
