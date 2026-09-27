/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Sparkles,
  ArrowRight,
  HardDrive,
  MessagesSquare,
  FileText,
  ShieldCheck,
  Layers,
  Zap,
  Globe,
  Lock,
} from 'lucide-react';
import { LanguageSolarSystem } from '../../components/solar/LanguageSolarSystem';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { WorkspaceViewId } from '../../types/navigation';
import { cn } from '../../utils/cn';

interface HomeViewProps {
  sourceLanguage: string;
  targetLanguage: string;
  onSelectSource: (code: string) => void;
  onSelectTarget: (code: string) => void;
  onSwapLanguages: () => void;
  onNavigate: (view: WorkspaceViewId) => void;
  semanticFidelityScore?: number;
  semanticIntegrityStatus?: 'preserved' | 'nuance_change' | 'meaning_changed' | null;
  meaningLockActive?: boolean;
  lockedTermsCount?: number;
}

export function HomeView({
  sourceLanguage,
  targetLanguage,
  onSelectSource,
  onSelectTarget,
  onSwapLanguages,
  onNavigate,
  semanticFidelityScore = 100,
  semanticIntegrityStatus = 'preserved',
  meaningLockActive = true,
  lockedTermsCount = 0,
}: HomeViewProps) {
  const workflowSteps = [
    { num: '01', title: 'Write or Dictate', desc: 'Type or speak naturally in your source language.' },
    { num: '02', title: 'Language Orbit', desc: 'Select source and target nodes in the 3D Solar System.' },
    { num: '03', title: 'Context & Mode', desc: 'Choose domain context (Travel, Business, Academic).' },
    { num: '04', title: 'Translate', desc: 'Translate with the available online service or an installed offline pack.' },
    { num: '05', title: 'Semantic Mirror', desc: 'Verify intent, tone, negation, and Meaning Lock.' },
    { num: '06', title: 'Speak & Listen', desc: 'Natural speech playback and one-tap copy.' },
    { num: '07', title: 'Save to Vault', desc: 'Backup structured record to Google Drive.' },
    { num: '08', title: 'Translation Memory', desc: 'Instant local reuse with IndexedDB memory matching.' },
  ];

  return (
    <div className="space-y-8">
      {/* Brand Hero Introduction */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#5B5FEF]/30 bg-[#5B5FEF]/10 text-[#5B5FEF] dark:text-[#7C83FF] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multimodal Translation Workspace</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white" style={{ textWrap: 'balance' }}>
            Translate. Understand. Speak. Save. Anywhere.
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            LingoFlow brings translation, semantic verification, voice, image/document input, offline packs, and cloud storage into one workspace.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Button
            variant="primary"
            size="md"
            onClick={() => onNavigate('translator')}
            className="shadow-md"
          >
            Launch Translation Cockpit
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => onNavigate('semantic')}
          >
            Inspect Semantic Mirror
          </Button>
        </div>
      </div>

      {/* Signature Visual Identity: 3D Language Solar System */}
      <div className="space-y-2">
        <LanguageSolarSystem
          sourceLanguageCode={sourceLanguage}
          targetLanguageCode={targetLanguage}
          onSelectSource={onSelectSource}
          onSelectTarget={onSelectTarget}
          onSwapLanguages={onSwapLanguages}
          onNavigateToCockpit={() => onNavigate('translator')}
          onOpenSemanticMirror={() => onNavigate('semantic')}
          semanticFidelityScore={semanticFidelityScore}
          semanticIntegrityStatus={semanticIntegrityStatus}
          meaningLockActive={meaningLockActive}
          lockedTermsCount={lockedTermsCount}
        />
      </div>

      {/* The 8-Step Product Flow Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            The Complete LingoFlow Product Flow
          </h2>
          <span className="text-xs text-slate-400">8 End-to-End Capabilities</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {workflowSteps.map((step) => (
            <div
              key={step.num}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-xs space-y-1.5"
            >
              <span className="font-mono text-xs font-bold text-[#5B5FEF] dark:text-[#7C83FF]">
                {step.num}
              </span>
              <h3 className="font-semibold text-xs text-slate-900 dark:text-white">
                {step.title}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Workspace Feature Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card
          title="Semantic Mirror & Meaning Lock"
          subtitle="Signature Linguistic Integrity Engine"
          headerAction={
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('semantic')}
              className="text-xs"
            >
              Open
            </Button>
          }
        >
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
            Inspect tone, entity accuracy, numbers, and logical negation between languages. Lock brand names and proper nouns with Meaning Lock.
          </p>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Semantic integrity visualization</span>
          </div>
        </Card>

        <Card
          title="Offline-First On-Device Engine"
          subtitle="Zero-latency local translation"
          headerAction={
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('languages')}
              className="text-xs"
            >
              Manage
            </Button>
          }
        >
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
            Translates without internet only when a compatible offline language pack is installed.
          </p>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-600 dark:text-cyan-400">
            <HardDrive className="w-3.5 h-3.5" />
            <span>Offline packs available</span>
          </div>
        </Card>

        <Card
          title="Google Drive Translation Vault"
          subtitle="Structured cloud backup"
          headerAction={
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('vault')}
              className="text-xs"
            >
              View Vault
            </Button>
          }
        >
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
            Back up translations to the connected Google Drive Vault.
          </p>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#5B5FEF] dark:text-[#7C83FF]">
            <Globe className="w-3.5 h-3.5" />
            <span>Google Drive integration</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
