/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { cn } from '../../utils/cn';

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export function Kbd({ className, children, ...props }: KbdProps) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center justify-center min-w-[20px] px-1.5 py-0.5 text-[11px] font-mono font-medium rounded border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-[0_1px_0_1px_rgba(0,0,0,0.05)] select-none',
        className
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}
