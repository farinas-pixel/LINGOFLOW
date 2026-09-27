/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { cn } from '../../utils/cn';

interface LingoFlowLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
}

export function LingoFlowLogo({
  className,
  size = 'md',
  showWordmark = true,
}: LingoFlowLogoProps) {
  const sizeMap = {
    sm: { icon: 22, text: 'text-sm' },
    md: { icon: 28, text: 'text-base' },
    lg: { icon: 36, text: 'text-xl' },
    xl: { icon: 48, text: 'text-2xl' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={cn('inline-flex items-center gap-2.5 select-none', className)}>
      {/* Abstract LingoFlow Translation Nexus Logo Mark (No character/mascot) */}
      <div
        className="relative shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#5B5FEF] via-[#484CD8] to-[#22D3EE] p-[2px] shadow-sm shadow-[#5B5FEF]/20"
        style={{ width: currentSize.icon + 8, height: currentSize.icon + 8 }}
        aria-hidden="true"
      >
        <div className="w-full h-full rounded-[10px] bg-[#080B14] flex items-center justify-center overflow-hidden">
          <svg
            width={currentSize.icon}
            height={currentSize.icon}
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="lf_flow_1" x1="4" y1="6" x2="28" y2="26" gradientUnits="userSpaceOnUse">
                <stop stopColor="#5B5FEF" />
                <stop offset="0.55" stopColor="#7C83FF" />
                <stop offset="1" stopColor="#22D3EE" />
              </linearGradient>
              <linearGradient id="lf_flow_2" x1="28" y1="6" x2="4" y2="26" gradientUnits="userSpaceOnUse">
                <stop stopColor="#22D3EE" />
                <stop offset="1" stopColor="#5B5FEF" />
              </linearGradient>
            </defs>

            {/* Geometric Multilingual Translation Wave / Interlocking Flow Curves */}
            <path
              d="M7 11C7 8.79086 8.79086 7 11 7H17C21.4183 7 25 10.5817 25 15V15C25 17.2091 23.2091 19 21 19H15C10.5817 19 7 15.4183 7 11V11Z"
              stroke="url(#lf_flow_1)"
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M25 21C25 23.2091 23.2091 25 21 25H15C10.5817 25 7 21.4183 7 17V17C7 14.7909 8.79086 13 11 13H17C21.4183 13 25 16.5817 25 21V21Z"
              stroke="url(#lf_flow_2)"
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="16" cy="16" r="2.25" fill="#22D3EE" />
          </svg>
        </div>
      </div>

      {showWordmark && (
        <div className="flex flex-col">
          <span className={cn('font-bold tracking-tight text-slate-900 dark:text-white leading-none', currentSize.text)}>
            Lingo<span className="text-[#5B5FEF] dark:text-[#7C83FF]">Flow</span>
          </span>
          <span className="text-[10px] font-medium tracking-wider text-slate-500 dark:text-slate-400 uppercase mt-0.5">
            Workspace
          </span>
        </div>
      )}
    </div>
  );
}
