/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Home,
  Languages,
  Sparkles,
  MessagesSquare,
  FileText,
  History,
  Globe,
  HardDrive,
  Settings,
  X,
  Database,
  CheckCircle2,
} from 'lucide-react';
import { WorkspaceViewId } from '../../types/navigation';
import { NAVIGATION_ITEMS, APP_CONFIG } from '../../config/app.config';
import { LingoFlowLogo } from '../branding/LingoFlowLogo';
import { Kbd } from '../ui/Kbd';
import { cn } from '../../utils/cn';

interface SidebarProps {
  activeView: WorkspaceViewId;
  onSelectView: (view: WorkspaceViewId) => void;
  isCollapsed: boolean;
  isMobileNavOpen: boolean;
  onCloseMobileNav: () => void;
}

const iconMap = {
  Home,
  Languages,
  Sparkles,
  MessagesSquare,
  FileText,
  History,
  Globe,
  HardDrive,
  Settings,
};

export function Sidebar({
  activeView,
  onSelectView,
  isCollapsed,
  isMobileNavOpen,
  onCloseMobileNav,
}: SidebarProps) {
  const handleNavClick = (id: WorkspaceViewId) => {
    onSelectView(id);
    onCloseMobileNav();
  };

  const navContent = (
    <div className="flex flex-col h-full justify-between">
      {/* Top Branding Section */}
      <div>
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200 dark:border-slate-800">
          <LingoFlowLogo size="md" showWordmark={!isCollapsed} />
          {isMobileNavOpen && (
            <button
              type="button"
              onClick={onCloseMobileNav}
              className="p-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg cursor-pointer md:hidden"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Item List */}
        <div className="px-3 py-4 space-y-1">
          <div className={cn('px-2 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500', isCollapsed && 'sr-only')}>
            Navigation
          </div>
          {NAVIGATION_ITEMS.map((item) => {
            const Icon = iconMap[item.iconName];
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                title={item.label}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left',
                  isActive
                    ? 'bg-[#5B5FEF]/10 dark:bg-[#7C83FF]/15 text-[#5B5FEF] dark:text-[#7C83FF] font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                )}
              >
                <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-[#5B5FEF] dark:text-[#7C83FF]' : 'text-slate-400')} />
                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between min-w-0">
                    <span className="truncate">{item.label}</span>
                    {item.shortcut && (
                      <Kbd className="ml-2 text-[10px] opacity-75">{item.shortcut}</Kbd>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Foundation Status Card */}
      {!isCollapsed ? (
        <div className="p-3 m-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>{APP_CONFIG.phase}</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Production-focused TypeScript architecture with explicit service states.
          </p>
          <div className="mt-2.5 pt-2 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span>Storage: Local</span>
            <span className="font-mono">v{APP_CONFIG.version}</span>
          </div>
        </div>
      ) : (
        <div className="p-2 flex justify-center text-slate-400" title="Foundation Ready">
          <Database className="w-4 h-4" />
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080B14] transition-all duration-200 shrink-0',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {navContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
          onClick={onCloseMobileNav}
          aria-hidden="true"
        />
      )}

      {/* Mobile Slide-in Drawer */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-[#080B14] shadow-xl md:hidden transition-transform duration-200 border-r border-slate-200 dark:border-slate-800',
          isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {navContent}
      </div>
    </>
  );
}
