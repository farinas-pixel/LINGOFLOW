/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  RotateCw,
  Lock,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  GitCompare,
  Sliders,
  HelpCircle,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../utils/cn';

interface MeaningLockRule {
  id: string;
  dimension: 'intent' | 'tone' | 'entities' | 'numbers' | 'negation' | 'formality' | 'custom_term';
  term?: string;
  label: string;
  enabled: boolean;
}

interface SemanticAnalysisResult {
  fidelityScore: number;
  integrityStatus: 'preserved' | 'nuance_change' | 'meaning_changed';
  intent: {
    preserved: boolean;
    sourceIntent: string;
    targetIntent: string;
  };
  tone: {
    sourceTone: string;
    targetTone: string;
    alignment: 'exact' | 'acceptable' | 'drift_detected';
  };
  entities: {
    detected: string[];
    preserved: string[];
    missing: string[];
  };
  numbersAndDates: {
    preserved: boolean;
    details: string;
  };
  negation: {
    preserved: boolean;
    note: string;
  };
  formality: {
    source: number;
    target: number;
  };
  findings: string[];
  repairSuggestion?: string | null;
}

interface SemanticMirrorViewProps {
  sourceText?: string;
  translatedText?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  onApplyRevision?: (revised: string) => void;
  onUpdateIntegrity?: (
    score: number,
    status: 'preserved' | 'nuance_change' | 'meaning_changed',
    lockedCount: number
  ) => void;
}

export function SemanticMirrorView({
  sourceText: propSourceText = '',
  translatedText: propTranslatedText = '',
  sourceLanguage = 'en',
  targetLanguage = 'es',
  onApplyRevision,
  onUpdateIntegrity,
}: SemanticMirrorViewProps) {
  const [sourceText, setSourceText] = useState(propSourceText);
  const [translatedText, setTranslatedText] = useState(propTranslatedText);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<SemanticAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Meaning Lock Rules
  const [meaningLocks, setMeaningLocks] = useState<MeaningLockRule[]>([
    { id: '1', dimension: 'intent', label: 'Core Communicative Intent', enabled: true },
    { id: '2', dimension: 'tone', label: 'Emotional Tone & Register', enabled: true },
    { id: '3', dimension: 'entities', label: 'Proper Names & Entities', enabled: true },
    { id: '4', dimension: 'numbers', label: 'Numbers, Dates & Quantities', enabled: true },
    { id: '5', dimension: 'negation', label: 'Logical Negation (Not/Never)', enabled: true },
    { id: '6', dimension: 'formality', label: 'Formality Alignment', enabled: true },
  ]);
  const [newCustomTerm, setNewCustomTerm] = useState('');

  // Repair Translation states
  const [isRepairing, setIsRepairing] = useState(false);
  const [repairRevision, setRepairRevision] = useState<string | null>(null);
  const [repairSuccess, setRepairSuccess] = useState(false);

  // Semantic Orbit canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Perform Real Semantic Analysis
  const runSemanticAnalysis = async () => {
    if (!sourceText.trim() || !translatedText.trim()) return;

    setIsAnalyzing(true);
    setAnalysisError(null);
    setRepairRevision(null);

    const activeLocks = meaningLocks
      .filter((m) => m.enabled)
      .map((m) => ({ dimension: m.dimension, term: m.term || m.label }));

    try {
      const res = await fetch('/api/semantic-mirror', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceText,
          translatedText,
          sourceLanguage,
          targetLanguage,
          lockedTerms: activeLocks,
        }),
      });

      if (!res.ok) {
        throw new Error('Semantic analysis service unavailable.');
      }

      const data: SemanticAnalysisResult = await res.json();
      setAnalysis(data);
      onUpdateIntegrity?.(
        data.fidelityScore,
        data.integrityStatus,
        meaningLocks.filter((m) => m.enabled).length
      );
    } catch (err: any) {
      setAnalysisError(err.message || 'Semantic analysis unavailable.');
      // Do not fabricate a semantic score when the real AI service is unavailable.
      // A structural fallback may be added later only if it is explicitly labeled
      // as non-semantic and its checks are independently verifiable.
      setAnalysis(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (sourceText && translatedText) {
      runSemanticAnalysis();
    }
  }, []);

  // Semantic Orbit Visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angleOffset = 0;

    const orbitNodes = [
      { name: 'Intent', preserved: analysis ? analysis.intent.preserved : false, angle: 0 },
      { name: 'Tone', preserved: analysis ? analysis.tone.alignment !== 'drift_detected' : false, angle: (Math.PI * 2) / 6 },
      { name: 'Entities', preserved: analysis ? analysis.entities.missing.length === 0 : false, angle: (Math.PI * 4) / 6 },
      { name: 'Numbers', preserved: analysis ? analysis.numbersAndDates.preserved : false, angle: (Math.PI * 6) / 6 },
      { name: 'Negation', preserved: analysis ? analysis.negation.preserved : false, angle: (Math.PI * 8) / 6 },
      { name: 'Formality', preserved: analysis ? Math.abs(analysis.formality.source - analysis.formality.target) <= 25 : false, angle: (Math.PI * 10) / 6 },
    ];

    const renderOrbit = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, rect.width, rect.height);

      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rx = Math.min(cx - 35, 140);
      const ry = rx * 0.45; // Perspective inclination

      angleOffset += 0.008;

      // Draw Orbit Ellipse
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(91, 95, 239, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 6]);
      ctx.stroke();

      // Center Core
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#5B5FEF';
      ctx.shadowColor = '#5B5FEF';
      ctx.shadowBlur = 12;
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 8px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('CORE', cx, cy);

      // Draw Orbit Nodes
      orbitNodes.forEach((node) => {
        const curAngle = node.angle + angleOffset;
        const nx = cx + Math.cos(curAngle) * rx;
        const ny = cy + Math.sin(curAngle) * ry;

        const nodeColor = node.preserved ? '#10B981' : '#F59E0B';

        ctx.beginPath();
        ctx.arc(nx, ny, 7, 0, Math.PI * 2);
        ctx.fillStyle = nodeColor;
        ctx.shadowColor = nodeColor;
        ctx.shadowBlur = 8;
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.font = '9px Inter, sans-serif';
        ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#94A3B8' : '#475569';
        ctx.fillText(node.name, nx, ny + 14);
      });

      ctx.restore();
      animId = requestAnimationFrame(renderOrbit);
    };

    renderOrbit();

    return () => cancelAnimationFrame(animId);
  }, [analysis]);

  // Add Custom Locked Term
  const handleAddCustomTerm = () => {
    if (!newCustomTerm.trim()) return;
    const rule: MeaningLockRule = {
      id: Date.now().toString(),
      dimension: 'custom_term',
      term: newCustomTerm.trim(),
      label: `Lock term: "${newCustomTerm.trim()}"`,
      enabled: true,
    };
    setMeaningLocks((prev) => [...prev, rule]);
    setNewCustomTerm('');
  };

  const removeLockRule = (id: string) => {
    setMeaningLocks((prev) => prev.filter((r) => r.id !== id));
  };

  const toggleLockRule = (id: string) => {
    setMeaningLocks((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  // Repair Translation Action
  const handleRepair = async () => {
    setIsRepairing(true);
    const lockedTerms = meaningLocks.filter((l) => l.enabled).map((l) => l.term || l.label);

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sourceText,
          sourceLanguage,
          targetLanguage,
          mode: 'accurate',
          context: 'formal',
          lockedTerms,
        }),
      });

      if (!res.ok) throw new Error('Repair translation failed');
      const data = await res.json();
      setRepairRevision(data.translatedText);
      setRepairSuccess(true);
    } catch (err: any) {
      alert(`Repair error: ${err.message}`);
    } finally {
      setIsRepairing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#5B5FEF] dark:text-[#7C83FF] uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Signature Capability</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Semantic Mirror & Meaning Integrity
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Multi-dimensional semantic integrity analysis. Compare source communicative intent against translated output, enforce Meaning Lock constraints, and inspect nuance drift.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={runSemanticAnalysis}
          disabled={isAnalyzing || !sourceText || !translatedText}
          className="shrink-0"
        >
          {isAnalyzing ? (
            <>
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
              Analyzing Semantics...
            </>
          ) : (
            <>
              <RotateCw className="w-3.5 h-3.5" />
              Re-Analyze Integrity
            </>
          )}
        </Button>
      </div>

      {/* Input Comparison Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]">
          <span className="text-xs font-semibold text-[#5B5FEF] dark:text-[#7C83FF] block mb-2">
            SOURCE TEXT ({sourceLanguage.toUpperCase()})
          </span>
          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            rows={3}
            placeholder="Enter source text..."
            className="w-full text-xs sm:text-sm bg-transparent border-none p-0 resize-none text-slate-900 dark:text-white focus:outline-none leading-relaxed"
          />
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]">
          <span className="text-xs font-semibold text-[#22D3EE] block mb-2">
            TRANSLATED TEXT ({targetLanguage.toUpperCase()})
          </span>
          <textarea
            value={translatedText}
            onChange={(e) => setTranslatedText(e.target.value)}
            rows={3}
            placeholder="Enter translated text to verify..."
            className="w-full text-xs sm:text-sm bg-transparent border-none p-0 resize-none text-slate-900 dark:text-white focus:outline-none leading-relaxed"
          />
        </div>
      </div>

      {/* Semantic Orbit + Integrity Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Orbit Visualization */}
        <div className="lg:col-span-5 flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Semantic Orbit
            </h3>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
              6 Active Nodes
            </span>
          </div>
          <div className="w-full h-48 flex items-center justify-center">
            <canvas ref={canvasRef} className="w-full h-full block" />
          </div>
          <div className="text-[11px] text-slate-400 text-center mt-2">
            Nodes represent Intent, Tone, Entities, Numbers, Negation, and Formality alignment.
          </div>
        </div>

        {/* Semantic Status & Scores */}
        <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-sm space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Overall Meaning Integrity Status
              </span>
              {analysis && (
                <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                  Fidelity: {analysis.fidelityScore}/100
                </span>
              )}
            </div>

            {/* Status Banner */}
            <div className="mt-2.5">
              {analysis ? (
                <div
                  className={cn(
                    'p-3.5 rounded-xl border flex items-center gap-3',
                    analysis.integrityStatus === 'preserved'
                      ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
                      : analysis.integrityStatus === 'nuance_change'
                      ? 'border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200'
                      : 'border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200'
                  )}
                >
                  {analysis.integrityStatus === 'preserved' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  )}
                  <div>
                    <div className="font-semibold text-xs sm:text-sm capitalize">
                      {analysis.integrityStatus === 'preserved'
                        ? 'Meaning Preserved'
                        : analysis.integrityStatus === 'nuance_change'
                        ? 'Potential Nuance Change Detected'
                        : 'Important Meaning Changed'}
                    </div>
                    <div className="text-[11px] opacity-80 mt-0.5">
                      {analysis.findings[0] || 'Communicative intention and factual alignment verified.'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                  Run semantic analysis to inspect meaning integrity.
                </div>
              )}
            </div>
          </div>

          {/* Dimension Grid */}
          {analysis && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                <span className="text-slate-400 text-[10px]">Intent Alignment</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {analysis.intent.preserved ? 'Preserved' : 'Drifted'}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                <span className="text-slate-400 text-[10px]">Tone Matching</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 capitalize">
                  {analysis.tone.alignment}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                <span className="text-slate-400 text-[10px]">Numbers & Dates</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {analysis.numbersAndDates.preserved ? 'Exact Match' : 'Discrepancy'}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                <span className="text-slate-400 text-[10px]">Logical Negation</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {analysis.negation.preserved ? 'Intact' : 'Inverted'}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                <span className="text-slate-400 text-[10px]">Source Formality</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {analysis.formality.source}/100
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                <span className="text-slate-400 text-[10px]">Target Formality</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {analysis.formality.target}/100
                </p>
              </div>
            </div>
          )}

          {/* Repair Suggestion CTA */}
          {analysis && analysis.integrityStatus !== 'preserved' && (
            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Nuance drift detected. Generate calibrated translation with Meaning Locks?
              </span>
              <Button variant="secondary" size="sm" onClick={handleRepair} disabled={isRepairing}>
                {isRepairing ? 'Repairing...' : 'Repair Translation'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Meaning Lock Rules & Custom Constraints */}
      <Card
        title="Meaning Lock Controls"
        subtitle="Request strict preservation of chosen linguistic dimensions and specific proper nouns"
        headerAction={
          <Badge variant="primary" dot={true}>
            {meaningLocks.filter((l) => l.enabled).length} Constraints Active
          </Badge>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {meaningLocks.map((lock) => (
              <label
                key={lock.id}
                className={cn(
                  'flex items-center justify-between p-3 rounded-xl border transition-colors cursor-pointer',
                  lock.enabled
                    ? 'border-[#5B5FEF]/60 bg-[#5B5FEF]/5 dark:bg-[#7C83FF]/10 text-slate-900 dark:text-white font-medium'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500 opacity-60'
                )}
              >
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <Lock className="w-3.5 h-3.5 text-[#5B5FEF] shrink-0" />
                  <span className="truncate">{lock.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={lock.enabled}
                    onChange={() => toggleLockRule(lock.id)}
                    className="rounded text-[#5B5FEF] focus:ring-0 cursor-pointer"
                  />
                  {lock.dimension === 'custom_term' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeLockRule(lock.id);
                      }}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </label>
            ))}
          </div>

          {/* Add Custom Locked Term */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              placeholder="Add custom brand, entity, or term to lock (e.g. LingoFlow, API, Dr. Smith)..."
              value={newCustomTerm}
              onChange={(e) => setNewCustomTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCustomTerm()}
              className="flex-1 py-1.5 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#080B14] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#5B5FEF]"
            />
            <Button variant="outline" size="sm" onClick={handleAddCustomTerm}>
              <Plus className="w-3.5 h-3.5" />
              Lock Term
            </Button>
          </div>
        </div>
      </Card>

      {/* Repair Translation Side-by-Side Review */}
      {repairRevision && (
        <Card
          title="Repair Translation Review"
          subtitle="Compare original output with calibrated revision enforcing your Meaning Locks"
          headerAction={
            <Badge variant="success" dot={true}>
              Revision Available
            </Badge>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
                <span className="font-semibold text-slate-500 uppercase block mb-1">
                  Current Original
                </span>
                <p className="text-slate-900 dark:text-white text-sm leading-relaxed">
                  {translatedText}
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 uppercase block mb-1">
                  Calibrated Revision (Meaning Locked)
                </span>
                <p className="text-slate-900 dark:text-white text-sm leading-relaxed">
                  {repairRevision}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRepairRevision(null)}
              >
                Keep Original
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setTranslatedText(repairRevision);
                  if (onApplyRevision) onApplyRevision(repairRevision);
                  setRepairRevision(null);
                  runSemanticAnalysis();
                }}
              >
                Use Revision
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
