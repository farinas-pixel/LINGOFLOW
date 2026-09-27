/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  Moon,
  Sun,
  Monitor,
  Trash2,
  HardDrive,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { getEnvConfiguration } from '../../config/env.config';
import { APP_CONFIG } from '../../config/app.config';
import { defaultStorageService } from '../../services/storage/LocalStorageService';

export function SettingsView() {
  const { theme, resolvedTheme } = useTheme();
  const envConfig = getEnvConfiguration();
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleClearPreferences = async () => {
    try {
      await defaultStorageService.clear();
      setResetMessage('Preferences cleared. Workspace reset to default state.');
      setTimeout(() => setResetMessage(null), 3000);
    } catch {
      setResetMessage('Error clearing storage.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Workspace Settings
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Environment security, visual presentation, and offline data persistence.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Appearance & Theme System */}
        <Card
          title="Appearance & Theme"
          subtitle="Dual light/dark design system with system sync"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">
                  Color Scheme Preference
                </div>
                <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                  Currently active: <span className="font-mono">{theme}</span> (resolved to <span className="font-mono">{resolvedTheme}</span>)
                </div>
              </div>
              <ThemeToggle variant="segmented" />
            </div>

            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 space-y-2">
              <div className="font-medium text-slate-800 dark:text-slate-200">
                Design System Color Palette
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-[#5B5FEF]" title="Primary #5B5FEF" />
                <div className="w-5 h-5 rounded-md bg-[#22D3EE]" title="Secondary #22D3EE" />
                <div className="w-5 h-5 rounded-md bg-[#10B981]" title="Success #10B981" />
                <div className="w-5 h-5 rounded-md bg-[#080B14] border border-slate-700" title="Dark BG #080B14" />
                <div className="w-5 h-5 rounded-md bg-[#111827] border border-slate-700" title="Dark Card #111827" />
                <div className="w-5 h-5 rounded-md bg-[#7C83FF]" title="Dark Primary #7C83FF" />
              </div>
            </div>
          </div>
        </Card>

        {/* Security & Environment Handling */}
        <Card
          title="Secure Environment Isolation"
          subtitle="API key handling and runtime verification"
          headerAction={
            <Badge variant="success" dot={true}>
              Hardening Active
            </Badge>
          }
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              In accordance with security standards, all private API credentials are managed via server-side injection. Zero hardcoded secret keys in client source.
            </p>

            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 space-y-2.5 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Gemini Key Present:</span>
                <span className={envConfig.hasGeminiApiKey ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400'}>
                  {envConfig.hasGeminiApiKey ? 'Detected (Secure)' : 'Not Injected'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Runtime Mode:</span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold">
                  {envConfig.isDevelopment ? 'Development' : 'Production'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Hosting Origin:</span>
                <span className="text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                  {envConfig.appUrl || 'Local Host'}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Local Storage & Cache Controls */}
        <Card
          title="Offline Storage Maintenance"
          subtitle="Local preferences and cached workspace artifacts"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              LingoFlow uses local browser storage for offline caching, theme configuration, and user preference state.
            </p>

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearPreferences}
                className="text-rose-600 hover:text-rose-700 dark:text-rose-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Local Preferences
              </Button>

              {resetMessage && (
                <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                  {resetMessage}
                </span>
              )}
            </div>
          </div>
        </Card>

        {/* Product Identity */}
        <Card
          title="About LingoFlow"
          subtitle="System version and build specifications"
        >
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
              <span className="text-slate-500 dark:text-slate-400">Product Name:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{APP_CONFIG.name}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
              <span className="text-slate-500 dark:text-slate-400">Build Version:</span>
              <span className="font-mono text-slate-900 dark:text-white">v{APP_CONFIG.version}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
              <span className="text-slate-500 dark:text-slate-400">Current Phase:</span>
              <span className="font-semibold text-[#5B5FEF] dark:text-[#7C83FF]">{APP_CONFIG.phase}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 dark:text-slate-400">Character Mascot Policy:</span>
              <span className="text-slate-700 dark:text-slate-300 font-mono">Enforced (Zero Characters)</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
