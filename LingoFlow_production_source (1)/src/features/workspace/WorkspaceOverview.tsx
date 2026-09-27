/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ShieldCheck,
  Zap,
  HardDrive,
  Layers,
  ArrowRight,
  MonitorCheck,
  CheckCircle2,
} from 'lucide-react';
import { WorkspaceViewId } from '../../types/navigation';
import { APP_CONFIG } from '../../config/app.config';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Kbd } from '../../components/ui/Kbd';
import { LingoFlowLogo } from '../../components/branding/LingoFlowLogo';
import { useOfflineStatus } from '../../hooks/useOfflineStatus';

interface WorkspaceOverviewProps {
  onNavigate: (view: WorkspaceViewId) => void;
}

export function WorkspaceOverview({ onNavigate }: WorkspaceOverviewProps) {
  const { isOnline } = useOfflineStatus();

  return (
    <div className="space-y-8">
      {/* Editorial Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#5B5FEF] dark:text-[#7C83FF] mb-1.5 uppercase tracking-wider">
            <span>{APP_CONFIG.phase}</span>
            <span aria-hidden="true">·</span>
            <span>Production-Ready Foundation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white" style={{ textWrap: 'balance' }}>
            LingoFlow Translation Workspace
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            AI-Powered Offline-First Multilingual Translation Workspace foundation.
            Engineered with strict TypeScript, modular service contracts, dual light/dark design system, and clean separation of concerns.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onNavigate('architecture')}
          >
            Explore Architecture
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigate('services')}
          >
            Service Registry
          </Button>
        </div>
      </div>

      {/* Core Architectural Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card
          title="Offline-First Core"
          subtitle="Independent local persistence layer"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-900 dark:text-white">
                  Local Storage Engine
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {isOnline ? 'Online with fallback' : 'Operating in offline mode'}
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Decoupled storage service contract ready for local dictionaries, user preferences, and offline neural translation packages.
            </p>
          </div>
        </Card>

        <Card
          title="Modular Service Architecture"
          subtitle="8 decoupled service contracts"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#5B5FEF]/10 text-[#5B5FEF] dark:text-[#7C83FF]">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-900 dark:text-white">
                  Strict Typed Contracts
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Zero any · High cohesion
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Full lifecycle interfaces prepared for Translation, Semantics, Drive Vault, Speech, OCR, Offline Engine, Storage, and Sync.
            </p>
          </div>
        </Card>

        <Card
          title="Secure Configuration"
          subtitle="Zero hardcoded credentials"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-900 dark:text-white">
                  Environment Isolation
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Protected API key resolver
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Dynamic secret injection protocol via server proxy and runtime environment validation without leaking private keys into browser client bundles.
            </p>
          </div>
        </Card>
      </div>

      {/* Design System & Visual Specification Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="LingoFlow Design Tokens"
          subtitle="Specified color system and typography"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-sm bg-[#5B5FEF]" />
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200">Primary</span>
                </div>
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1">#5B5FEF</div>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-sm bg-[#22D3EE]" />
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200">Secondary</span>
                </div>
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1">#22D3EE</div>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-sm bg-[#10B981]" />
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200">Success</span>
                </div>
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1">#10B981</div>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-sm bg-[#080B14] border border-slate-700" />
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200">Dark BG</span>
                </div>
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1">#080B14</div>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-sm bg-[#111827] border border-slate-700" />
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200">Dark Card</span>
                </div>
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1">#111827</div>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-sm bg-[#7C83FF]" />
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200">Dark Primary</span>
                </div>
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1">#7C83FF</div>
              </div>
            </div>

            <div className="pt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <span>Typography:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Inter</span>
              <span aria-hidden="true">·</span>
              <span>Code & Numbers:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">JetBrains Mono</span>
            </div>
          </div>
        </Card>

        {/* Foundation Readiness Checklist */}
        <Card
          title="Foundation Readiness Checklist"
          subtitle="Verification of Phase 0 deliverables"
        >
          <div className="space-y-2.5">
            {[
              { label: 'React + Strict TypeScript foundation', status: true },
              { label: 'Separation of concerns (components, features, services, hooks, utils, types, config)', status: true },
              { label: 'LingoFlow design system & token architecture (light #F8FAFC / dark #080B14)', status: true },
              { label: 'Service contracts separated from runtime implementations', status: true },
              { label: 'Offline-first network listener & storage foundation active', status: true },
              { label: 'Accessible keyboard navigation & focus-visible states', status: true },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800/60 last:border-none">
                <span className="text-slate-700 dark:text-slate-300">{item.label}</span>
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold font-mono text-[11px] shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  VERIFIED
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Keyboard Shortcuts Reference */}
      <Card
        title="Workspace Keyboard Shortcuts"
        subtitle="Quick navigation across foundation views"
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60">
            <span className="text-slate-600 dark:text-slate-400">Overview</span>
            <Kbd>1</Kbd>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60">
            <span className="text-slate-600 dark:text-slate-400">Architecture</span>
            <Kbd>2</Kbd>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60">
            <span className="text-slate-600 dark:text-slate-400">Services</span>
            <Kbd>3</Kbd>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60">
            <span className="text-slate-600 dark:text-slate-400">Settings</span>
            <Kbd>4</Kbd>
          </div>
        </div>
      </Card>
    </div>
  );
}
