/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { ThemeMode } from '../../types/theme';
import { cn } from '../../utils/cn';

interface ThemeToggleProps {
  className?: string;
  variant?: 'segmented' | 'compact';
}

export function ThemeToggle({ className, variant = 'compact' }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={cn(
          'p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B5FEF] dark:focus-visible:ring-[#7C83FF] cursor-pointer',
          className
        )}
        title={`Current mode: ${theme} (resolved: ${resolvedTheme}). Click to switch.`}
        aria-label="Toggle color theme"
      >
        {resolvedTheme === 'dark' ? (
          <Moon className="w-4 h-4 text-[#7C83FF]" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500" />
        )}
      </button>
    );
  }

  const modes: Array<{ id: ThemeMode; label: string; icon: React.ReactNode }> = [
    { id: 'light', label: 'Light', icon: <Sun className="w-3.5 h-3.5" /> },
    { id: 'dark', label: 'Dark', icon: <Moon className="w-3.5 h-3.5" /> },
    { id: 'system', label: 'System', icon: <Monitor className="w-3.5 h-3.5" /> },
  ];

  return (
    <div
      role="group"
      aria-label="Theme selection"
      className={cn(
        'inline-flex items-center p-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60',
        className
      )}
    >
      {modes.map((mode) => {
        const isActive = theme === mode.id;
        return (
          <button
            key={mode.id}
            type="button"
            onClick={() => setTheme(mode.id)}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap',
              isActive
                ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            )}
            aria-pressed={isActive}
          >
            {mode.icon}
            <span>{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
}
