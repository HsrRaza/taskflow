'use client';

import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Search,
  Bell,
  X,
  RotateCcw,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  onOpenNewTaskModal: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onResetDemo: () => void;
}

export default function Header({
  onOpenNewTaskModal,
  searchValue,
  onSearchChange,
  onResetDemo,
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    {
      id: 1,
      title: 'Sprint review tomorrow at 10 AM',
      time: '15m ago',
      icon: Clock,
      unread: true,
    },
    {
      id: 2,
      title: 'Alex moved "OAuth2 PKCE" to Done',
      time: '1h ago',
      icon: CheckCircle2,
      unread: true,
    },
    {
      id: 3,
      title: 'Weekly project velocity report ready',
      time: '3h ago',
      icon: Sparkles,
      unread: false,
    },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
      <div className="flex h-20 items-center justify-between px-4 sm:px-8 max-w-[1600px] mx-auto w-full">
        {/* Left side: Logo & Branding + Workspace Title */}
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-slate-900">TaskFlow</span>
                <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 border border-indigo-100">
                  PRO
                </span>
              </div>
            </div>
          </div>

          <div className="hidden md:block h-6 w-px bg-slate-200" />

          <div className="hidden sm:block">
            <h1 className="text-sm md:text-base font-semibold tracking-tight text-slate-800">
              My Workspace
            </h1>
            <p className="text-[11px] text-slate-400">
              Plan your work. Make progress.
            </p>
          </div>
        </div>

        {/* Right side: Search + Reset + Notification + New Task + User Avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search bar */}
          <div className="relative w-36 sm:w-56 md:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/70 pl-8 pr-8 text-xs sm:text-sm text-slate-800 placeholder-slate-400 transition-all focus:border-indigo-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            />
            {searchValue && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-600"
                aria-label="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Reset Demo button */}
          <button
            onClick={onResetDemo}
            className="hidden md:inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 shadow-2xs hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            title="Restore default demo tasks"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
            <span>Reset Demo</span>
          </button>

          {/* Notifications dropdown trigger */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 ${
                showNotifications ? 'bg-slate-100 text-slate-900' : ''
              }`}
              aria-label="Notifications"
            >
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-600" />
              </span>
            </button>

            {/* Notification popover */}
            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 top-full mt-2 z-50 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                  <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
                    <span className="text-xs font-semibold text-slate-900">Notifications</span>
                    <span className="text-[10px] font-medium text-indigo-600 hover:underline cursor-pointer">
                      Mark all as read
                    </span>
                  </div>
                  <div className="mt-1 divide-y divide-slate-100">
                    {notifications.map((n) => {
                      const Icon = n.icon;
                      return (
                        <div
                          key={n.id}
                          className={`flex items-start gap-3 p-2.5 rounded-lg transition-colors hover:bg-slate-50 cursor-pointer ${
                            n.unread ? 'bg-indigo-50/30' : ''
                          }`}
                        >
                          <div className="rounded-md bg-indigo-100/70 p-1.5 text-indigo-600">
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-800 line-clamp-1">
                              {n.title}
                            </p>
                            <span className="text-[10px] text-slate-400">{n.time}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* "+ New Task" Button */}
          <button
            onClick={onOpenNewTaskModal}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-indigo-600 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-white shadow-xs transition-all hover:bg-indigo-500 hover:shadow-indigo-500/20 active:scale-[0.98] focus:outline-hidden focus:ring-2 focus:ring-indigo-600/30"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden xs:inline">New Task</span>
            <span className="xs:hidden">New</span>
          </button>

          {/* User profile avatar */}
          <div className="relative pl-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-[11px] font-semibold text-white ring-2 ring-slate-100">
              HR
            </div>
            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full border border-white bg-emerald-500" />
          </div>
        </div>
      </div>
    </header>
  );
}
