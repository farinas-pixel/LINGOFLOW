/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Menu, Wifi, WifiOff, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { WorkspaceViewId } from '../../types/navigation';
import { NAVIGATION_ITEMS } from '../../config/app.config';
import { ThemeToggle } from '../ui/ThemeToggle';
import { LingoFlowLogo } from '../branding/LingoFlowLogo';
import { cn } from '../../utils/cn';

interface HeaderProps {
  activeView: WorkspaceViewId;
  onSelectView: (view: WorkspaceViewId) => void;
  isOnline: boolean;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onOpenMobileNav: () => void;
}

export function Header({
  activeView,
  onSelectView,
  isOnline,
  isSidebarCollapsed,
  onToggleSidebar,
  onOpenMobileNav,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#080B14]/90 backdrop-blur-md px-4 sm:px-6">
      {/* Zone 1: Brand & Workspace Anchor */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="md:hidden p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={onToggleSidebar}
          className="hidden md:flex p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-lg cursor-pointer transition-colors"
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>

        <div className="flex items-center gap-2">
          <LingoFlowLogo size="sm" showWordmark={isSidebarCollapsed} />
        </div>
      </div>

      {/* Zone 2: Navigation Links / View Tabs */}
      <nav
        aria-label="Workspace navigation"
        className="hidden xl:flex items-center gap-1 p-0.5 rounded-lg bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 overflow-x-auto max-w-[50vw]"
      >
        {NAVIGATION_ITEMS.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectView(item.id)}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap',
                isActive
                  ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              )}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Actions & System Status */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Real Network Offline-First Status */}
        <div
          className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 px-2 py-1 rounded-md select-none"
          title={isOnline ? 'Online - Workspace connected' : 'Offline - Local storage active'}
        >
          {isOnline ? (
            <Wifi className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-amber-500" />
          )}
          <span className="hidden sm:inline font-mono text-[11px]">
            {isOnline ? 'Online' : 'Offline Mode'}
          </span>
        </div>

        <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800" />

        <ThemeToggle variant="compact" />
      </div>
    </header>
  );
}
