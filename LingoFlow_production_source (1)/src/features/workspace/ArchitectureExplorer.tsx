/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Boxes,
  Code2,
  Cpu,
  Layers,
  Sparkles,
  Wifi,
  WifiOff,
  ChevronRight,
  Shield,
  FileCode,
} from 'lucide-react';
import { FUTURE_MODULE_SPECS } from '../../config/app.config';
import { ServiceId, ServiceMetadata } from '../../types/service';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../utils/cn';

export function ArchitectureExplorer() {
  const [selectedServiceId, setSelectedServiceId] = useState<ServiceId>('storageService');

  const selectedSpec =
    FUTURE_MODULE_SPECS.find((s) => s.id === selectedServiceId) ?? FUTURE_MODULE_SPECS[0];

  const layers = [
    {
      name: 'components/',
      description: 'Reusable UI primitives (Button, Card, Badge, ThemeToggle) & Layout (Header, Sidebar, AppShell).',
      badge: 'Presentation',
    },
    {
      name: 'features/',
      description: 'Self-contained functional domains (workspace foundation, settings, future cockpit & mirror).',
      badge: 'Domain Feature',
    },
    {
      name: 'services/',
      description: 'Core ServiceRegistry and strict interfaces for translation, offline engine, OCR, speech, storage & sync.',
      badge: 'Business Engine',
    },
    {
      name: 'hooks/',
      description: 'Custom React lifecycle hooks (useTheme, useMediaQuery, useKeyboardShortcut, useOfflineStatus).',
      badge: 'Reactive Hooks',
    },
    {
      name: 'utils/',
      description: 'Pure utility functions, safe storage wrapper, device platform detection, and class merge helper.',
      badge: 'Pure Helpers',
    },
    {
      name: 'types/',
      description: 'Strict TypeScript type definitions, domain contracts, and navigation models with zero any.',
      badge: 'Strict Types',
    },
    {
      name: 'config/',
      description: 'Centralized product configuration, design system tokens, and secure API key resolver.',
      badge: 'Configuration',
    },
  ];

  return (
    <div className="space-y-8">
      {/* View Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          System Architecture & Service Contracts
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Decoupled, modular layer organization engineered for LingoFlow.
        </p>
      </div>

      {/* Architectural Layer Separation */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          1. Layer Separation of Concerns
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {layers.map((layer) => (
            <div
              key={layer.name}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-[#5B5FEF] dark:text-[#7C83FF]">
                  {layer.name}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                  {layer.badge}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                {layer.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 8 Prepared Future Modules */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              2. Future Modules & Service Contracts (8 Modules)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Contracts defined with strict TypeScript interfaces, scheduled roadmap phases, and offline capabilities.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Module List */}
          <div className="lg:col-span-5 space-y-2">
            {FUTURE_MODULE_SPECS.map((spec) => {
              const isSelected = spec.id === selectedServiceId;
              return (
                <button
                  key={spec.id}
                  type="button"
                  onClick={() => setSelectedServiceId(spec.id)}
                  className={cn(
                    'w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between',
                    isSelected
                      ? 'border-[#5B5FEF] dark:border-[#7C83FF] bg-[#5B5FEF]/5 dark:bg-[#7C83FF]/10 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] hover:border-slate-300 dark:hover:border-slate-700'
                  )}
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {spec.name}
                      </span>
                      {spec.isOfflineCapable ? (
                        <span title="Offline Capable" className="inline-flex">
                          <WifiOff className="w-3 h-3 text-cyan-600 dark:text-cyan-400 shrink-0" />
                        </span>
                      ) : (
                        <span title="Requires Network" className="inline-flex">
                          <Wifi className="w-3 h-3 text-slate-400 shrink-0" />
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      <span>{spec.id}</span>
                      <span aria-hidden="true">·</span>
                      <span>{spec.phaseScheduled}</span>
                    </div>
                  </div>
                  <ChevronRight
                    className={cn(
                      'w-4 h-4 shrink-0 transition-transform',
                      isSelected ? 'text-[#5B5FEF] dark:text-[#7C83FF] translate-x-0.5' : 'text-slate-400'
                    )}
                  />
                </button>
              );
            })}
          </div>

          {/* Module Detail Panel */}
          <div className="lg:col-span-7">
            <Card
              title={selectedSpec.name}
              subtitle={`Contract Identifier: ${selectedSpec.id}`}
              headerAction={
                <Badge
                  variant={selectedSpec.status === 'ready' ? 'success' : 'neutral'}
                  dot={true}
                >
                  {selectedSpec.status === 'ready' ? 'Phase 0 Ready' : 'Phase 1-3 Scheduled'}
                </Badge>
              }
            >
              <div className="space-y-5 text-xs">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                    Functional Purpose
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {selectedSpec.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Offline Architecture:</span>
                    <p className="text-slate-900 dark:text-white font-semibold mt-0.5">
                      {selectedSpec.isOfflineCapable ? 'Local On-Device Capable' : 'Cloud / Server Synchronized'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Implementation Target:</span>
                    <p className="text-slate-900 dark:text-white font-semibold mt-0.5">
                      {selectedSpec.phaseScheduled}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                    Contract Capabilities
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedSpec.capabilities.map((cap, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px]"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                    Service Contract File
                  </h4>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                    <FileCode className="w-3.5 h-3.5 text-[#5B5FEF] dark:text-[#7C83FF]" />
                    <span>src/services/contracts/{selectedSpec.id}.ts</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
