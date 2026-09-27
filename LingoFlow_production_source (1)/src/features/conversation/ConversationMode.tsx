/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  ArrowLeftRight,
  Send,
  Trash2,
  Download,
  RotateCw,
  Sparkles,
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, getLanguageByCode } from '../../config/languages.data';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/cn';

interface ConversationMessage {
  id: string;
  sender: 'person_a' | 'person_b';
  originalText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  timestamp: string;
}

export function ConversationMode() {
  const [personALang, setPersonALang] = useState('en');
  const [personBLang, setPersonBLang] = useState('es');

  const [inputA, setInputA] = useState('');
  const [inputB, setInputB] = useState('');

  const [isTranslatingA, setIsTranslatingA] = useState(false);
  const [isTranslatingB, setIsTranslatingB] = useState(false);

  const [isListeningA, setIsListeningA] = useState(false);
  const [isListeningB, setIsListeningB] = useState(false);

  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const recognitionARef = useRef<any>(null);
  const recognitionBRef = useRef<any>(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Speech Recognition setup for Person A
  const toggleMicA = () => {
    if (typeof window === 'undefined') return;
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListeningA) {
      recognitionARef.current?.stop();
      setIsListeningA(false);
    } else {
      const rec = new SpeechRec();
      rec.lang = getLanguageByCode(personALang)?.bcp47 || 'en-US';
      rec.interimResults = true;
      rec.onresult = (e: any) => {
        let t = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          t += e.results[i][0].transcript;
        }
        setInputA(t);
      };
      rec.onend = () => setIsListeningA(false);
      rec.onerror = () => setIsListeningA(false);
      recognitionARef.current = rec;
      rec.start();
      setIsListeningA(true);
    }
  };

  // Speech Recognition setup for Person B
  const toggleMicB = () => {
    if (typeof window === 'undefined') return;
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListeningB) {
      recognitionBRef.current?.stop();
      setIsListeningB(false);
    } else {
      const rec = new SpeechRec();
      rec.lang = getLanguageByCode(personBLang)?.bcp47 || 'es-ES';
      rec.interimResults = true;
      rec.onresult = (e: any) => {
        let t = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          t += e.results[i][0].transcript;
        }
        setInputB(t);
      };
      rec.onend = () => setIsListeningB(false);
      rec.onerror = () => setIsListeningB(false);
      recognitionBRef.current = rec;
      rec.start();
      setIsListeningB(true);
    }
  };

  // Text to speech playback
  const speak = (text: string, langCode: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = getLanguageByCode(langCode)?.bcp47 || 'en-US';
    window.speechSynthesis.speak(utt);
  };

  // Send from Person A
  const handleSendA = async () => {
    if (!inputA.trim()) return;
    setIsTranslatingA(true);
    const textToSend = inputA;
    setInputA('');

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSend,
          sourceLanguage: personALang,
          targetLanguage: personBLang,
          mode: 'speak',
          context: 'casual',
        }),
      });

      const data = await res.json();
      const newMsg: ConversationMessage = {
        id: Date.now().toString(),
        sender: 'person_a',
        originalText: textToSend,
        translatedText: data.translatedText || textToSend,
        sourceLang: personALang,
        targetLang: personBLang,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, newMsg]);
      speak(newMsg.translatedText, personBLang);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTranslatingA(false);
    }
  };

  // Send from Person B
  const handleSendB = async () => {
    if (!inputB.trim()) return;
    setIsTranslatingB(true);
    const textToSend = inputB;
    setInputB('');

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSend,
          sourceLanguage: personBLang,
          targetLanguage: personALang,
          mode: 'speak',
          context: 'casual',
        }),
      });

      const data = await res.json();
      const newMsg: ConversationMessage = {
        id: Date.now().toString(),
        sender: 'person_b',
        originalText: textToSend,
        translatedText: data.translatedText || textToSend,
        sourceLang: personBLang,
        targetLang: personALang,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, newMsg]);
      speak(newMsg.translatedText, personALang);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTranslatingB(false);
    }
  };

  // Swap participants
  const handleSwap = () => {
    setPersonALang(personBLang);
    setPersonBLang(personALang);
  };

  // Export transcript
  const handleExportTranscript = () => {
    const transcript = messages
      .map(
        (m) =>
          `[${m.timestamp}] ${m.sender === 'person_a' ? 'Speaker 1' : 'Speaker 2'} (${m.sourceLang}): ${m.originalText}\n -> Translation (${m.targetLang}): ${m.translatedText}\n`
      )
      .join('\n');

    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LingoFlow_Conversation_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const personAData = getLanguageByCode(personALang);
  const personBData = getLanguageByCode(personBLang);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[500px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm overflow-hidden">
      {/* Conversation Top Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#5B5FEF]" />
            <select
              value={personALang}
              onChange={(e) => setPersonALang(e.target.value)}
              aria-label="Speaker 1 Language"
              className="text-xs font-semibold py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827] text-slate-900 dark:text-white cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  Speaker 1: {l.name} ({l.nativeName})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleSwap}
            className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
            title="Swap Languages"
            aria-label="Swap Languages"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#22D3EE]" />
            <select
              value={personBLang}
              onChange={(e) => setPersonBLang(e.target.value)}
              aria-label="Speaker 2 Language"
              className="text-xs font-semibold py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827] text-slate-900 dark:text-white cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  Speaker 2: {l.name} ({l.nativeName})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <>
              <button
                type="button"
                onClick={handleExportTranscript}
                className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg cursor-pointer"
                title="Export Transcript (.txt)"
                aria-label="Export Transcript (.txt)"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setMessages([])}
                className="p-1.5 text-slate-500 hover:text-rose-500 rounded-lg cursor-pointer"
                title="Clear Conversation"
                aria-label="Clear Conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Messages Feed View */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="w-12 h-12 rounded-2xl bg-[#5B5FEF]/10 text-[#5B5FEF] flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
              Two-Person Multilingual Conversation
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Speaker 1 and Speaker 2 can speak or type in their respective languages. Each utterance is translated and spoken in real time.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isA = msg.sender === 'person_a';
            return (
              <div
                key={msg.id}
                className={cn('flex flex-col max-w-[85%] sm:max-w-[70%]', isA ? 'self-start' : 'self-end ml-auto items-end')}
              >
                <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-1 px-1">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">
                    {isA ? `Speaker 1 (${personAData?.name})` : `Speaker 2 (${personBData?.name})`}
                  </span>
                  <span>·</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div
                  className={cn(
                    'p-3.5 rounded-2xl shadow-xs space-y-1.5',
                    isA
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-tl-sm'
                      : 'bg-[#5B5FEF] text-white rounded-tr-sm'
                  )}
                >
                  <p className="text-xs opacity-75 italic">{msg.originalText}</p>
                  <div className="flex items-center justify-between gap-3 pt-1 border-t border-black/10 dark:border-white/10">
                    <p className="text-sm font-medium leading-snug">{msg.translatedText}</p>
                    <button
                      type="button"
                      onClick={() => speak(msg.translatedText, msg.targetLang)}
                      className="p-1 rounded opacity-80 hover:opacity-100 cursor-pointer"
                      title="Listen"
                      aria-label="Listen to translated speech"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Dual Input Docks */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
        {/* Speaker 1 Dock */}
        <div className="p-3 flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMicA}
            className={cn(
              'p-2 rounded-xl transition-colors cursor-pointer shrink-0',
              isListeningA
                ? 'bg-rose-500 text-white animate-pulse'
                : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'
            )}
            title="Speaker 1 Mic"
            aria-label="Speaker 1 Mic"
          >
            {isListeningA ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <input
            type="text"
            placeholder={`Speaker 1 (${personAData?.name}): Speak or type...`}
            value={inputA}
            onChange={(e) => setInputA(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendA()}
            className="flex-1 py-1.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#5B5FEF]"
          />
          <Button
            variant="primary"
            size="sm"
            disabled={!inputA.trim() || isTranslatingA}
            onClick={handleSendA}
          >
            {isTranslatingA ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </Button>
        </div>

        {/* Speaker 2 Dock */}
        <div className="p-3 flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMicB}
            className={cn(
              'p-2 rounded-xl transition-colors cursor-pointer shrink-0',
              isListeningB
                ? 'bg-rose-500 text-white animate-pulse'
                : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'
            )}
            title="Speaker 2 Mic"
            aria-label="Speaker 2 Mic"
          >
            {isListeningB ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <input
            type="text"
            placeholder={`Speaker 2 (${personBData?.name}): Speak or type...`}
            value={inputB}
            onChange={(e) => setInputB(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendB()}
            className="flex-1 py-1.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#22D3EE]"
          />
          <Button
            variant="secondary"
            size="sm"
            disabled={!inputB.trim() || isTranslatingB}
            onClick={handleSendB}
            className="bg-[#22D3EE] text-slate-900 hover:bg-cyan-400"
          >
            {isTranslatingB ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
