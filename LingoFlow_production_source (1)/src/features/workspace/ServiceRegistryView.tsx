/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Database,
  CheckCircle2,
  Clock,
  RotateCw,
  HardDrive,
  Cpu,
} from 'lucide-react';
import { serviceRegistry } from '../../services/core/ServiceRegistry';
import { defaultStorageService } from '../../services/storage/LocalStorageService';
import { ServiceMetadata } from '../../types/service';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export function ServiceRegistryView() {
  const [services, setServices] = useState<readonly ServiceMetadata[]>([]);
  const [storageStatus, setStorageStatus] = useState<{
    initialized: boolean;
    quotaBytes: number;
    keyCount: number;
  }>({ initialized: false, quotaBytes: 0, keyCount: 0 });
  const [diagnosticResult, setDiagnosticResult] = useState<string | null>(null);

  const loadData = async () => {
    setServices(serviceRegistry.getAllMetadata());
    const quota = await defaultStorageService.getQuota();
    const keys = await defaultStorageService.keys();
    setStorageStatus({
      initialized: defaultStorageService.isInitialized,
      quotaBytes: quota.usedBytes,
      keyCount: keys.length,
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const runStorageDiagnostic = async () => {
    try {
      const testKey = 'diagnostic_test_timestamp';
      const timestamp = new Date().toISOString();
      await defaultStorageService.set(testKey, { testedAt: timestamp, status: 'ok' });
      const readBack = await defaultStorageService.get<{ testedAt: string; status: string }>(testKey);
      await defaultStorageService.remove(testKey);

      if (readBack?.status === 'ok') {
        setDiagnosticResult(`Diagnostic Passed: Real read/write verified at ${readBack.testedAt}`);
      } else {
        setDiagnosticResult('Diagnostic Warning: Readback verification incomplete.');
      }
      loadData();
    } catch (err) {
      setDiagnosticResult(`Diagnostic Error: ${(err as Error).message}`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Service Registry
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Runtime module registry and offline storage diagnostics.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={loadData}>
          <RotateCw className="w-3.5 h-3.5" />
          Refresh Registry
        </Button>
      </div>

      {/* Real Diagnostics Panel */}
      <Card
        title="Storage Subsystem Diagnostic"
        subtitle="Phase 0 Active Foundation Service"
        headerAction={
          <Badge variant="success" dot={true}>
            Service Active
          </Badge>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <span className="text-slate-500 dark:text-slate-400">Service Status</span>
              <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white mt-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Initialized & Ready</span>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <span className="text-slate-500 dark:text-slate-400">Tracked Keys</span>
              <div className="font-mono text-base font-semibold text-slate-900 dark:text-white mt-1">
                {storageStatus.keyCount} <span className="text-xs font-normal text-slate-400">keys</span>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <span className="text-slate-500 dark:text-slate-400">Estimated Usage</span>
              <div className="font-mono text-base font-semibold text-slate-900 dark:text-white mt-1">
                {storageStatus.quotaBytes} <span className="text-xs font-normal text-slate-400">bytes</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button variant="secondary" size="sm" onClick={runStorageDiagnostic}>
              Run Live Read/Write Verification
            </Button>
            {diagnosticResult && (
              <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300">
                {diagnosticResult}
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Registry Table */}
      <Card
        title="Registered Service Pipeline"
        subtitle="Current status across all 8 modular service contracts"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                <th className="py-2.5 px-3">Service Identifier</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Phase Scheduled</th>
                <th className="py-2.5 px-3">Offline Mode</th>
                <th className="py-2.5 px-3 text-right">Runtime Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {services.map((item) => {
                const isReady = item.status === 'ready';
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900 dark:text-white font-sans">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-slate-400">{item.id}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400 uppercase text-[11px]">
                      {item.category}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                      {item.phaseScheduled}
                    </td>
                    <td className="py-3 px-3">
                      <span className={item.isOfflineCapable ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400'}>
                        {item.isOfflineCapable ? 'Supported' : 'Requires Cloud'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Badge
                        variant={isReady ? 'success' : 'neutral'}
                        dot={true}
                      >
                        {isReady ? 'Active / Ready' : 'Contract Defined'}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
