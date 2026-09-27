/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeftRight,
  Mic,
  MicOff,
  Volume2,
  Copy,
  Check,
  Star,
  HardDrive,
  RotateCw,
  Sparkles,
  Cloud,
  WifiOff,
  AlertCircle,
  HelpCircle,
  FileText,
  VolumeX,
  Share2,
  Sliders,
  ChevronDown,
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, getLanguageByCode } from '../../config/languages.data';
import { indexedDbService, StoredTranslation } from '../../services/storage/IndexedDbService';
import { offlineTranslationEngine } from '../../services/offline/OfflineTranslationEngine';
import { googleDriveService } from '../../services/cloud/GoogleDriveService';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Kbd } from '../../components/ui/Kbd';
import { cn } from '../../utils/cn';

export type TranslationMode = 'quick' | 'accurate' | 'explain' | 'rewrite' | 'speak';
export type ContextMode =
  | 'general'
  | 'student'
  | 'travel'
  | 'business'
  | 'email'
  | 'social_media'
  | 'formal'
  | 'casual';

interface TranslationCockpitProps {
  sourceLanguage: string;
  targetLanguage: string;
  onSourceChange: (code: string) => void;
  onTargetChange: (code: string) => void;
  onSwap: () => void;
  onOpenSemanticMirror?: (source: string, target: string) => void;
}

export function TranslationCockpit({
  sourceLanguage,
  targetLanguage,
  onSourceChange,
  onTargetChange,
  onSwap,
  onOpenSemanticMirror,
}: TranslationCockpitProps) {
  // Input and Output states
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const [whyThisTranslation, setWhyThisTranslation] = useState<{
    detectedContext?: string;
    toneNuance?: string;
    grammaticalNotes?: string;
    importantPhrases?: Array<{ phrase: string; translated: string; meaning: string }>;
  } | null>(null);

  // Status & CTA states
  const [status, setStatus] = useState<'idle' | 'translating' | 'translated' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOfflineResult, setIsOfflineResult] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  // Workflow modes
  const [mode, setMode] = useState<TranslationMode>('accurate');
  const [context, setContext] = useState<ContextMode>('general');

  // Translation Memory Match banner
  const [memoryMatch, setMemoryMatch] = useState<{ text: string; similarity: number } | null>(null);

  // Audio / Speech states
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Action feedback states
  const [copied, setCopied] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [currentRecordId, setCurrentRecordId] = useState<string | null>(null);
  const [driveSaveStatus, setDriveSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [driveSavedLink, setDriveSavedLink] = useState<string | null>(null);

  // Intelligence panel
  const [intelligenceAction, setIntelligenceAction] = useState<string | null>(null);
  const [intelligenceResult, setIntelligenceResult] = useState<string | null>(null);
  const [intelligenceLoading, setIntelligenceLoading] = useState(false);

  // Check Translation Memory as user pauses typing
  useEffect(() => {
    if (!sourceText || sourceText.length < 3) {
      setMemoryMatch(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const found = await indexedDbService.findMemoryMatch(sourceText, sourceLanguage, targetLanguage);
        if (found) {
          setMemoryMatch({
            text: found.match.translatedText,
            similarity: Math.round(found.similarity * 100),
          });
        } else {
          setMemoryMatch(null);
        }
      } catch {
        // Ignore
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [sourceText, sourceLanguage, targetLanguage]);

  // Real Speech Recognition initialization
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;

      const sourceData = getLanguageByCode(sourceLanguage);
      recognition.lang = sourceData?.bcp47 || 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setSourceText(transcript);
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [sourceLanguage]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        const sourceData = getLanguageByCode(sourceLanguage);
        recognitionRef.current.lang = sourceData?.bcp47 || 'en-US';
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  // Real Text-to-Speech
  const speakText = (text: string, langCode: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const langData = getLanguageByCode(langCode);
    utterance.lang = langData?.bcp47 || 'en-US';

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Real Translation Action
  const handleTranslate = async () => {
    if (!sourceText.trim()) return;

    setStatus('translating');
    setErrorMessage(null);
    setDriveSaveStatus('idle');
    setDriveSavedLink(null);

    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

    // 1. If Online: Attempt Cloud Gemini API
    if (isOnline) {
      try {
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: sourceText,
            sourceLanguage,
            targetLanguage,
            mode,
            context,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          // If server reports API key unavailable, fallback cleanly to offline engine
          if (res.status === 503 || errData.code === 'API_KEY_UNAVAILABLE') {
            return await runOfflineFallback();
          }
          throw new Error(errData.error || `Translation request failed (HTTP ${res.status})`);
        }

        const data = await res.json();
        setTranslatedText(data.translatedText);
        setAlternatives(data.alternatives || []);
        setWhyThisTranslation(data.whyThisTranslation || null);
        setLatencyMs(data.latencyMs || 0);
        setIsOfflineResult(false);
        setStatus('translated');

        // Save to IndexedDB
        const recordId = `tr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        setCurrentRecordId(recordId);
        setIsFavorited(false);

        const record: StoredTranslation = {
          id: recordId,
          sourceText,
          translatedText: data.translatedText,
          sourceLanguage,
          targetLanguage,
          context,
          mode,
          isOffline: false,
          latencyMs: data.latencyMs || 0,
          timestamp: new Date().toISOString(),
          alternatives: data.alternatives,
          whyThisTranslation: data.whyThisTranslation,
        };
        await indexedDbService.saveTranslation(record);
        return;
      } catch (err: unknown) {
        console.warn('Cloud translation failed, attempting offline engine fallback:', err);
        // Fallback to offline engine
        return await runOfflineFallback();
      }
    } else {
      // 2. Offline Mode: Call genuine Offline Translation Engine
      return await runOfflineFallback();
    }
  };

  const runOfflineFallback = async () => {
    try {
      const offlineResult = await offlineTranslationEngine.translateOffline(
        sourceText,
        sourceLanguage,
        targetLanguage
      );

      setTranslatedText(offlineResult.translatedText);
      setAlternatives([]);
      setWhyThisTranslation({
        detectedContext: 'Offline Lexicon & Phrase Engine',
        toneNuance: 'Rule-based direct dictionary lemma translation',
        grammaticalNotes: 'Executed entirely in-browser without internet or cloud APIs.',
      });
      setLatencyMs(offlineResult.latencyMs);
      setIsOfflineResult(true);
      setStatus('translated');

      const recordId = `tr_off_${Date.now()}`;
      setCurrentRecordId(recordId);

      await indexedDbService.saveTranslation({
        id: recordId,
        sourceText,
        translatedText: offlineResult.translatedText,
        sourceLanguage,
        targetLanguage,
        context,
        mode,
        isOffline: true,
        latencyMs: offlineResult.latencyMs,
        timestamp: new Date().toISOString(),
      });
    } catch (offlineErr: any) {
      setStatus('error');
      setErrorMessage(offlineErr.message || 'Offline translation unavailable for this language pair.');
    }
  };

  // Copy Action
  const handleCopy = async () => {
    if (!translatedText) return;
    try {
      await navigator.clipboard.writeText(translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  // Toggle Favorite Action
  const handleToggleFavorite = async () => {
    if (!translatedText || !currentRecordId) return;
    try {
      const record: StoredTranslation = {
        id: currentRecordId,
        sourceText,
        translatedText,
        sourceLanguage,
        targetLanguage,
        context,
        mode,
        isOffline: isOfflineResult,
        latencyMs: latencyMs || 0,
        timestamp: new Date().toISOString(),
      };
      const isFav = await indexedDbService.toggleFavorite(record, context);
      setIsFavorited(isFav);
    } catch {
      // Ignore
    }
  };

  // Save to Google Drive Action
  const handleSaveToDrive = async () => {
    if (!translatedText) return;
    setDriveSaveStatus('saving');
    try {
      if (!googleDriveService.isConnected) {
        // Truthfully notify user to connect Google Drive in Vault tab
        setDriveSaveStatus('error');
        setErrorMessage('Google Drive Vault is not connected. Open the Vault tab to connect your Google account.');
        return;
      }

      const file = await googleDriveService.saveTranslationToVault(
        {
          sourceLanguage,
          targetLanguage,
          originalText: sourceText,
          translatedText,
          context,
          timestamp: new Date().toISOString(),
        },
        'Personal'
      );

      setDriveSaveStatus('saved');
      setDriveSavedLink(file.webViewLink);
    } catch (err: any) {
      setDriveSaveStatus('error');
      setErrorMessage(`Drive save failed: ${err.message}`);
    }
  };

  // Human Writing Workflows
  const [selectedWorkflowCategory, setSelectedWorkflowCategory] = useState<'style' | 'clarity' | 'insights'>('style');
  const [intelligenceNotes, setIntelligenceNotes] = useState<string | null>(null);

  // Real Translation Intelligence action (Supporting all 16 human writing workflows)
  const handleIntelligence = async (action: string) => {
    if (!sourceText) return;
    setIntelligenceAction(action);
    setIntelligenceLoading(true);
    setIntelligenceResult(null);
    setIntelligenceNotes(null);

    try {
      const res = await fetch('/api/intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sourceText,
          translatedText: translatedText || sourceText,
          sourceLanguage,
          targetLanguage,
          action,
        }),
      });

      if (!res.ok) {
        throw new Error('Intelligence request failed');
      }

      const data = await res.json();
      setIntelligenceResult(data.result);
      setIntelligenceNotes(data.notes || null);
    } catch (err: any) {
      setIntelligenceResult(`Intelligence feature unavailable offline or without API key: ${err.message}`);
    } finally {
      setIntelligenceLoading(false);
    }
  };

  const handleApplyWorkflowResult = () => {
    if (intelligenceResult && !intelligenceResult.startsWith('Intelligence feature unavailable')) {
      setTranslatedText(intelligenceResult);
      setStatus('translated');
    }
  };

  const sourceLang = getLanguageByCode(sourceLanguage);
  const targetLang = getLanguageByCode(targetLanguage);

  return (
    <div className="space-y-6">
      {/* Cockpit Mode & Context Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#111827] shadow-xs">
        {/* Translation Mode Selector */}
        <div className="flex items-center gap-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1 hidden sm:inline">
            Mode:
          </span>
          {(['quick', 'accurate', 'explain', 'rewrite', 'speak'] as TranslationMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                'px-2.5 py-1 text-xs font-medium rounded-lg capitalize transition-colors cursor-pointer',
                mode === m
                  ? 'bg-[#5B5FEF] text-white dark:bg-[#7C83FF] dark:text-[#080B14] font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              )}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Context Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">
            Context:
          </span>
          <select
            value={context}
            onChange={(e) => setContext(e.target.value as ContextMode)}
            aria-label="Translation context domain"
            className="text-xs py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#080B14] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#5B5FEF] cursor-pointer"
          >
            <option value="general">General</option>
            <option value="student">Student / Academic</option>
            <option value="travel">Travel / Transit</option>
            <option value="business">Business / Commercial</option>
            <option value="email">Email / Correspondence</option>
            <option value="social_media">Social Media</option>
            <option value="formal">Formal / Legal</option>
            <option value="casual">Casual / Friendly</option>
          </select>
        </div>
      </div>

      {/* Language Header Bar (Source - Swap - Target) */}
      <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-[#080B14]/80 backdrop-blur-md">
        {/* Source Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#5B5FEF] dark:text-[#7C83FF]">SOURCE:</span>
          <select
            value={sourceLanguage}
            onChange={(e) => onSourceChange(e.target.value)}
            aria-label="Source Language"
            className="text-xs font-semibold py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827] text-slate-900 dark:text-white cursor-pointer"
          >
            {SUPPORTED_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name} ({l.nativeName})
              </option>
            ))}
          </select>
        </div>

        {/* Swap Button */}
        <button
          type="button"
          onClick={onSwap}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
          title="Swap Source and Target Languages"
          aria-label="Swap Source and Target Languages"
        >
          <ArrowLeftRight className="w-4 h-4" />
        </button>

        {/* Target Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#22D3EE]">TARGET:</span>
          <select
            value={targetLanguage}
            onChange={(e) => onTargetChange(e.target.value)}
            aria-label="Target Language"
            className="text-xs font-semibold py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827] text-slate-900 dark:text-white cursor-pointer"
          >
            {SUPPORTED_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name} ({l.nativeName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Translation Memory Alert Banner */}
      {memoryMatch && (
        <div className="flex items-center justify-between p-3 rounded-xl border border-cyan-200 dark:border-cyan-900/60 bg-cyan-50/70 dark:bg-cyan-950/30 text-cyan-900 dark:text-cyan-200 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-500 shrink-0" />
            <span>
              <strong>Translation Memory Match ({memoryMatch.similarity}%):</strong> Similar phrase found in local vault.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setTranslatedText(memoryMatch.text);
                setStatus('translated');
                setMemoryMatch(null);
              }}
              className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#22D3EE] text-slate-900 hover:bg-cyan-300 cursor-pointer"
            >
              Use Previous
            </button>
            <button
              type="button"
              onClick={() => setMemoryMatch(null)}
              className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Ignore
            </button>
          </div>
        </div>
      )}

      {/* Dual Panel Translation Workstation (Desktop: 2-column, Mobile: stacked) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Source Text Input Card */}
        <div className="flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-4 shadow-sm min-h-[220px]">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {sourceLang?.name} ({sourceLang?.nativeName})
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px]">{sourceText.length} chars</span>
              {sourceText && (
                <button
                  type="button"
                  onClick={() => {
                    setSourceText('');
                    setTranslatedText('');
                    setStatus('idle');
                  }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="Type, paste text, or use microphone to dictate..."
            rows={6}
            className="flex-1 w-full resize-none border-none bg-transparent p-0 text-sm sm:text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-0 leading-relaxed"
          />

          {/* Source Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 mt-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleListening}
                className={cn(
                  'p-2 rounded-lg transition-colors cursor-pointer',
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
                title={isListening ? 'Listening... click to stop' : 'Dictate with microphone'}
                aria-label="Dictate with microphone"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {sourceText && (
                <button
                  type="button"
                  onClick={() => speakText(sourceText, sourceLanguage)}
                  className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                  title="Listen to source speech"
                  aria-label="Listen to source speech"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Translate CTA */}
            <Button
              variant="primary"
              size="md"
              disabled={!sourceText.trim() || status === 'translating'}
              onClick={handleTranslate}
              className="px-6 shadow-sm"
            >
              {status === 'translating' ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  Translating...
                </>
              ) : status === 'translated' ? (
                <>Translate Again</>
              ) : (
                <>Translate</>
              )}
            </Button>
          </div>
        </div>

        {/* Target Translation Output Card */}
        <div className="flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-4 shadow-sm min-h-[220px]">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {targetLang?.name} ({targetLang?.nativeName})
              </span>
              {status === 'translated' && (
                <Badge variant={isOfflineResult ? 'info' : 'success'} dot={true}>
                  {isOfflineResult ? 'Offline Engine' : 'AI Cloud'}
                </Badge>
              )}
            </div>
            {latencyMs !== null && (
              <span className="font-mono text-[11px] text-slate-400">{latencyMs} ms</span>
            )}
          </div>

          <div className="flex-1 text-sm sm:text-base text-slate-900 dark:text-white leading-relaxed select-text min-h-[120px]">
            {status === 'translating' ? (
              <div className="flex items-center gap-2 text-slate-400 animate-pulse pt-4">
                <Sparkles className="w-4 h-4 text-[#5B5FEF] animate-spin" />
                <span>Translating with context & nuance...</span>
              </div>
            ) : status === 'error' ? (
              <div className="flex items-start gap-2 text-rose-600 dark:text-rose-400 text-xs p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">Translation Notice</div>
                  <div className="mt-0.5">{errorMessage}</div>
                </div>
              </div>
            ) : translatedText ? (
              translatedText
            ) : (
              <span className="text-slate-400">Translation will appear here...</span>
            )}
          </div>

          {/* Alternatives row */}
          {alternatives.length > 0 && (
            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Alternative Phrasings:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {alternatives.map((alt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setTranslatedText(alt)}
                    className="text-xs px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-[#5B5FEF]/10 hover:text-[#5B5FEF] cursor-pointer text-left"
                  >
                    {alt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Target Footer One-Tap Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 mt-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={!translatedText}
                onClick={handleCopy}
                className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer disabled:opacity-30"
                title={copied ? 'Copied to clipboard' : 'Copy translation'}
                aria-label="Copy translation"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>

              <button
                type="button"
                disabled={!translatedText}
                onClick={() => speakText(translatedText, targetLanguage)}
                className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer disabled:opacity-30"
                title="Listen to speech"
                aria-label="Listen to speech"
              >
                <Volume2 className={cn('w-4 h-4', isSpeaking && 'text-[#22D3EE]')} />
              </button>

              <button
                type="button"
                disabled={!translatedText}
                onClick={handleToggleFavorite}
                className={cn(
                  'p-2 rounded-lg cursor-pointer disabled:opacity-30 transition-colors',
                  isFavorited
                    ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
                title={isFavorited ? 'Favorited' : 'Save to Favorites'}
                aria-label="Save to Favorites"
              >
                <Star className={cn('w-4 h-4', isFavorited && 'fill-amber-500')} />
              </button>

              <button
                type="button"
                disabled={!translatedText}
                onClick={handleSaveToDrive}
                className={cn(
                  'p-2 rounded-lg cursor-pointer disabled:opacity-30 transition-colors',
                  driveSaveStatus === 'saved'
                    ? 'text-emerald-500'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
                title={driveSaveStatus === 'saved' ? 'Saved to Drive' : 'Backup to Google Drive Vault'}
                aria-label="Backup to Google Drive Vault"
              >
                <HardDrive className="w-4 h-4" />
              </button>
            </div>

            {/* Inspect in Semantic Mirror */}
            {onOpenSemanticMirror && translatedText && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenSemanticMirror(sourceText, translatedText)}
                className="text-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#5B5FEF]" />
                Semantic Mirror
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Drive Save Feedback Bar */}
      {driveSaveStatus === 'saved' && driveSavedLink && (
        <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-xs">
          <span>✓ Saved record to Google Drive Translation Vault.</span>
          <a
            href={driveSavedLink}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline hover:text-emerald-600"
          >
            Open in Google Drive ↗
          </a>
        </div>
      )}

      {/* Why This Translation Explanations */}
      {whyThisTranslation && (
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111827]/60 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
            <HelpCircle className="w-4 h-4 text-[#5B5FEF]" />
            <span>Why This Translation:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {whyThisTranslation.detectedContext && (
              <div className="p-2.5 rounded-lg bg-white dark:bg-[#080B14] border border-slate-200/60 dark:border-slate-800/60">
                <span className="text-slate-400 font-medium">Context Nuance:</span>
                <p className="text-slate-800 dark:text-slate-200 mt-0.5">
                  {whyThisTranslation.detectedContext}
                </p>
              </div>
            )}
            {whyThisTranslation.toneNuance && (
              <div className="p-2.5 rounded-lg bg-white dark:bg-[#080B14] border border-slate-200/60 dark:border-slate-800/60">
                <span className="text-slate-400 font-medium">Tone Alignment:</span>
                <p className="text-slate-800 dark:text-slate-200 mt-0.5">
                  {whyThisTranslation.toneNuance}
                </p>
              </div>
            )}
          </div>

          {whyThisTranslation.importantPhrases && whyThisTranslation.importantPhrases.length > 0 && (
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Key Phrasing & Idiomatic Choices:
              </span>
              <div className="space-y-1.5 text-xs">
                {whyThisTranslation.importantPhrases.map((phrase, idx) => (
                  <div key={idx} className="flex items-baseline gap-2">
                    <span className="font-semibold text-[#5B5FEF] dark:text-[#7C83FF]">
                      "{phrase.phrase}" → "{phrase.translated}"
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">
                      — {phrase.meaning}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Human Writing Workflows & Translation Intelligence */}
      {sourceText.trim() && (
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#5B5FEF] dark:text-[#7C83FF]" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Human Writing Workflows & Superintelligence
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Faithfully adapts tone, clarity, and register while strictly preserving names, facts, numbers, and dates.
              </p>
            </div>

            {/* Category Toggle */}
            <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              {(
                [
                  { id: 'style', label: 'Tone & Style' },
                  { id: 'clarity', label: 'Clarity & Precision' },
                  { id: 'insights', label: 'Insights & Notes' },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedWorkflowCategory(cat.id)}
                  className={cn(
                    'px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer',
                    selectedWorkflowCategory === cat.id
                      ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-white shadow-xs font-semibold'
                      : 'text-slate-500 hover:text-slate-900'
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Workflow Action Buttons Grid */}
          <div className="flex flex-wrap gap-2">
            {selectedWorkflowCategory === 'style' && (
              <>
                <Button
                  variant={intelligenceAction === 'rewrite_natural' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleIntelligence('rewrite_natural')}
                  disabled={intelligenceLoading}
                  className="text-xs"
                >
                  Rewrite Naturally
                </Button>
                <Button
                  variant={intelligenceAction === 'make_professional' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleIntelligence('make_professional')}
                  disabled={intelligenceLoading}
                  className="text-xs"
                >
                  Make Professional
                </Button>
                <Button
                  variant={intelligenceAction === 'make_casual' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleIntelligence('make_casual')}
                  disabled={intelligenceLoading}
                  className="text-xs"
                >
                  Make Casual
                </Button>
                <Button
                  variant={intelligenceAction === 'make_formal' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleIntelligence('make_formal')}
                  disabled={intelligenceLoading}
                  className="text-xs"
                >
                  Make Formal
                </Button>
                <Button
                  variant={intelligenceAction === 'make_friendly' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleIntelligence('make_friendly')}
                  disabled={intelligenceLoading}
                  className="text-xs"
                >
                  Make Friendly
                </Button>
                <Button
                  variant={intelligenceAction === 'make_academic' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleIntelligence('make_academic')}
                  disabled={intelligenceLoading}
                  className="text-xs"
                >
                  Make Academic
                </Button>
                <Button
                  variant={intelligenceAction === 'make_business' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleIntelligence('make_business')}
                  disabled={intelligenceLoading}
                  className="text-xs"
                >
                  Make Business Ready
                </Button>
                <Button
                  variant={intelligenceAction === 'make_social' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleIntelligence('make_social')}
                  disabled={intelligenceLoading}
                  className="text-xs"
                >
                  Make Social Media Ready
                </Button>
              </>
            )}

            {selectedWorkflowCategory === 'clarity' && (
              <>
                <Button
                  variant={intelligenceAction === 'translate_natural' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleIntelligence('translate_natural')}
                  disabled={intelligenceLoading}
                  className="text-xs"
                >
                  Translate Naturally
                </Button>
                <Button
                  variant={intelligenceAction === 'improve_grammar' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleIntelligence('improve_grammar')}
                  disabled={intelligenceLoading}
                  className="text-xs"
                >
                  Improve Grammar
                </Button>
                <Button
                  variant={intelligenceAction === 'improve_clarity' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleIntelligence('improve_clarity')}
                  disabled={intelligenceLoading}
                  className="text-xs"
                >
                  Improve Clarity
                </Button>
                <Button
                  variant={intelligenceAction === 'simplify' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleIntelligence('simplify')}
                  disabled={intelligenceLoading}
                  className="text-xs"
                >
                  Simplify (Plain Language)
                </Button>
                <Button
                  variant={intelligenceAction === 'make_concise' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleIntelligence('make_concise')}
                  disabled={intelligenceLoading}
                  className="text-xs"
                >
                  Make Concise
                </Button>
                <Button
                  variant={intelligenceAction === 'make_detailed' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleIntelligence('make_detailed')}
                  disabled={intelligenceLoading}
                  className="text-xs"
                >
                  Make Detailed
                </Button>
              </>
            )}

            {selectedWorkflowCategory === 'insights' && (
              <>
                <Button
                  variant={intelligenceAction === 'summarize' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleIntelligence('summarize')}
                  disabled={intelligenceLoading}
                  className="text-xs"
                >
                  Summarize
                </Button>
                <Button
                  variant={intelligenceAction === 'explain' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleIntelligence('explain')}
                  disabled={intelligenceLoading}
                  className="text-xs"
                >
                  Explain Linguistic Choices
                </Button>
                <Button
                  variant={intelligenceAction === 'phrases' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleIntelligence('phrases')}
                  disabled={intelligenceLoading}
                  className="text-xs"
                >
                  Key Phrases & Idioms
                </Button>
              </>
            )}
          </div>

          {/* Loading state */}
          {intelligenceLoading && (
            <div className="text-xs text-slate-500 animate-pulse flex items-center gap-2 pt-2">
              <RotateCw className="w-3.5 h-3.5 animate-spin text-[#5B5FEF]" />
              <span>Analyzing linguistic nuance, tone, and entity preservation...</span>
            </div>
          )}

          {/* Output Card */}
          {intelligenceResult && !intelligenceLoading && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span className="capitalize">Result: {intelligenceAction?.replace(/_/g, ' ')}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(intelligenceResult);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="px-2 py-1 text-[11px] rounded bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    Copy Output
                  </button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleApplyWorkflowResult}
                    className="text-xs py-1 px-2.5"
                  >
                    Apply to Translation
                  </Button>
                </div>
              </div>

              <div className="text-xs sm:text-sm text-slate-900 dark:text-white leading-relaxed whitespace-pre-wrap">
                {intelligenceResult}
              </div>

              {intelligenceNotes && (
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400">
                  <strong>Notes:</strong> {intelligenceNotes}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
