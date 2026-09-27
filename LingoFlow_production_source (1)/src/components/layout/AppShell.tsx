/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { WorkspaceViewId } from '../../types/navigation';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useOfflineStatus } from '../../hooks/useOfflineStatus';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';

interface AppShellProps {
  activeView: WorkspaceViewId;
  onSelectView: (view: WorkspaceViewId) => void;
  children: React.ReactNode;
}

export function AppShell({ activeView, onSelectView, children }: AppShellProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { isOnline } = useOfflineStatus();

  // Keyboard navigation shortcuts
  useKeyboardShortcut([
    {
      key: '1',
      description: 'Switch to Home',
      action: () => onSelectView('home'),
    },
    {
      key: '2',
      description: 'Switch to Translator',
      action: () => onSelectView('translator'),
    },
    {
      key: '3',
      description: 'Switch to Semantic Mirror',
      action: () => onSelectView('semantic'),
    },
    {
      key: '4',
      description: 'Switch to Conversation',
      action: () => onSelectView('conversation'),
    },
    {
      key: '5',
      description: 'Switch to Media & Docs',
      action: () => onSelectView('media'),
    },
    {
      key: '6',
      description: 'Switch to History & Stats',
      action: () => onSelectView('history'),
    },
    {
      key: '7',
      description: 'Switch to Languages',
      action: () => onSelectView('languages'),
    },
    {
      key: '8',
      description: 'Switch to Vault',
      action: () => onSelectView('vault'),
    },
    {
      key: '9',
      description: 'Switch to Settings',
      action: () => onSelectView('settings'),
    },
    {
      key: 'b',
      metaKey: true,
      description: 'Toggle Sidebar',
      action: () => setIsSidebarCollapsed((prev) => !prev),
    },
    {
      key: 'Escape',
      description: 'Close Mobile Drawer',
      action: () => setIsMobileNavOpen(false),
    },
  ]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8FAFC] dark:bg-[#080B14] text-[#111827] dark:text-slate-100 font-sans selection:bg-[#5B5FEF]/20 selection:text-[#5B5FEF]">
      {/* Skip link for accessibility */}
      <a
        href="#main-workspace"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#5B5FEF] focus:text-white focus:rounded-md focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Workspace Sidebar */}
      <Sidebar
        activeView={activeView}
        onSelectView={onSelectView}
        isCollapsed={isSidebarCollapsed}
        isMobileNavOpen={isMobileNavOpen}
        onCloseMobileNav={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          activeView={activeView}
          onSelectView={onSelectView}
          isOnline={isOnline}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
          onOpenMobileNav={() => setIsMobileNavOpen(true)}
        />

        <main
          id="main-workspace"
          tabIndex={-1}
          className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8 focus:outline-none"
        >
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
