/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'success' | 'primary' | 'warning' | 'info';
  dot?: boolean;
  children: React.ReactNode;
}

export function Badge({
  className,
  variant = 'neutral',
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const dotColor = {
    neutral: 'bg-slate-400',
    success: 'bg-[#10B981]',
    primary: 'bg-[#5B5FEF] dark:bg-[#7C83FF]',
    warning: 'bg-amber-500',
    info: 'bg-[#22D3EE]',
  };

  const textColor = {
    neutral: 'text-slate-600 dark:text-slate-400',
    success: 'text-emerald-700 dark:text-emerald-400',
    primary: 'text-[#5B5FEF] dark:text-[#7C83FF]',
    warning: 'text-amber-700 dark:text-amber-400',
    info: 'text-cyan-700 dark:text-cyan-400',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-medium',
        textColor[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColor[variant])}
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </span>
  );
}
