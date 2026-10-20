'use client';

import React, { useState } from 'react';
import {
  Menu,
  Plus,
  Search,
  Bell,
  X,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenNewTaskModal: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  activeFilterCount: number;
}

export default function Header({
  onOpenMobileMenu,
  onOpenNewTaskModal,
  searchValue,
  onSearchChange,
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
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="flex h-20 items-center justify-between px-4 sm:px-8">
        {/* Left side: Hamburger (mobile) + Titles */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onOpenMobileMenu}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Open mobile menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              My Workspace
            </h1>
            <p className="hidden text-xs sm:block text-slate-500 mt-0.5">
              Plan your work. Make progress.
            </p>
          </div>
        </div>

        {/* Right side: Search + Notification + New Task */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Search bar */}
          <div className="relative w-44 sm:w-64 md:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/70 pl-9 pr-8 text-xs sm:text-sm text-slate-800 placeholder-slate-400 transition-all focus:border-indigo-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            />
            {searchValue && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-600"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

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
        </div>
      </div>
    </header>
  );
}
