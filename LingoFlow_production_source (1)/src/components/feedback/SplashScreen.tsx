/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { LingoFlowLogo } from '../branding/LingoFlowLogo';
import { cn } from '../../utils/cn';

interface SplashScreenProps {
  onComplete: () => void;
  minDurationMs?: number;
}

export function SplashScreen({ onComplete, minDurationMs = 380 }: SplashScreenProps) {
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Quick readiness check without artificial long delays
    const timer = setTimeout(() => {
      setIsFading(true);
      const exitTimer = setTimeout(() => {
        onComplete();
      }, 180);
      return () => clearTimeout(exitTimer);
    }, minDurationMs);

    return () => clearTimeout(timer);
  }, [onComplete, minDurationMs]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F8FAFC] dark:bg-[#080B14] transition-opacity duration-200',
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      )}
    >
      <div className="flex flex-col items-center max-w-sm px-6 text-center select-none">
        <LingoFlowLogo size="xl" showWordmark={true} />

        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 font-normal">
          Multimodal Translation Workspace
        </p>

        {/* Minimalist indeterminate loading track with LingoFlow colors */}
        <div className="w-48 h-1 mt-6 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative">
          <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-[#5B5FEF] via-[#7C83FF] to-[#22D3EE] animate-pulse" />
        </div>

        <button
          type="button"
          onClick={onComplete}
          className="mt-6 text-[11px] text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer"
        >
          Skip initialization
        </button>
      </div>
    </div>
  );
}
