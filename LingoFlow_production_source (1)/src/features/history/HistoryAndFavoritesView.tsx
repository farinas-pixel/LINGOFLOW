/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  History,
  Star,
  Search,
  Trash2,
  Copy,
  Check,
  Volume2,
  HardDrive,
  BarChart3,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  indexedDbService,
  StoredTranslation,
  StoredFavorite,
} from '../../services/storage/IndexedDbService';
import { getLanguageByCode } from '../../config/languages.data';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../utils/cn';

export function HistoryAndFavoritesView({
  onSelectForCockpit,
}: {
  onSelectForCockpit?: (source: string, target: string, sourceLang: string, targetLang: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<'history' | 'favorites'>('history');
  const [translations, setTranslations] = useState<StoredTranslation[]>([]);
  const [favorites, setFavorites] = useState<StoredFavorite[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<{
    totalTranslations: number;
    totalWords: number;
    offlineCount: number;
    cloudCount: number;
    favoritesCount: number;
    languagePairs: Record<string, number>;
  }>({
    totalTranslations: 0,
    totalWords: 0,
    offlineCount: 0,
    cloudCount: 0,
    favoritesCount: 0,
    languagePairs: {},
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadData = async () => {
    const trList = await indexedDbService.getTranslations(300);
    const favList = await indexedDbService.getFavorites();
    const realStats = await indexedDbService.calculateRealStats();

    setTranslations(trList);
    setFavorites(favList);
    setStats(realStats);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    await indexedDbService.deleteTranslation(id);
    await loadData();
  };

  const handleClearAll = async () => {
    if (confirm('Clear all local translation history? This cannot be undone.')) {
      await indexedDbService.clearHistory();
      await loadData();
    }
  };

  const handleCopy = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (text: string, langCode: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = getLanguageByCode(langCode)?.bcp47 || 'en-US';
    window.speechSynthesis.speak(utt);
  };

  const filteredTranslations = translations.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.sourceText.toLowerCase().includes(q) ||
      t.translatedText.toLowerCase().includes(q) ||
      t.sourceLanguage.toLowerCase().includes(q) ||
      t.targetLanguage.toLowerCase().includes(q)
    );
  });

  const filteredFavorites = favorites.filter((f) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      f.sourceText.toLowerCase().includes(q) ||
      f.translatedText.toLowerCase().includes(q) ||
      f.sourceLanguage.toLowerCase().includes(q) ||
      f.targetLanguage.toLowerCase().includes(q)
    );
  });

  const topPair = Object.entries(stats.languagePairs).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="space-y-6">
      {/* Real Activity Analytics Dashboard */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Workspace Activity & History
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Metrics calculated strictly from verified local IndexedDB activity. Zero fabricated statistics.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Total Translations
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {stats.totalTranslations}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Stored in local IndexedDB</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Words Processed
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {stats.totalWords}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Actual word count sum</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Offline / Cloud Ratio
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {stats.offlineCount} <span className="text-xs font-normal text-slate-400">/</span> {stats.cloudCount}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            {stats.totalTranslations > 0 ? `${Math.round((stats.offlineCount / stats.totalTranslations) * 100)}% offline · ${Math.round((stats.cloudCount / stats.totalTranslations) * 100)}% cloud` : 'No translation activity yet'}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Top Language Route
          </span>
          <div className="text-lg font-bold font-mono text-[#5B5FEF] dark:text-[#7C83FF] mt-1 truncate">
            {topPair ? topPair[0] : 'None yet'}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            {topPair ? `${topPair[1]} translations` : 'Perform a translation'}
          </span>
        </div>
      </div>

      {/* Main Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]">
        <div className="flex items-center p-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer',
              activeTab === 'history'
                ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-900'
            )}
          >
            <History className="w-3.5 h-3.5" />
            History ({translations.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('favorites')}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer',
              activeTab === 'favorites'
                ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-900'
            )}
          >
            <Star className="w-3.5 h-3.5" />
            Favorites ({favorites.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search history & vault..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#080B14] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#5B5FEF] w-48 sm:w-64"
            />
          </div>

          {activeTab === 'history' && translations.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleClearAll} className="text-rose-600">
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* List Feed */}
      <div className="space-y-3">
        {activeTab === 'history' ? (
          filteredTranslations.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
              <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>No translation history recorded yet.</p>
              <p className="text-[11px] mt-1 text-slate-500">
                Translations performed in the Translation Cockpit will be saved here automatically.
              </p>
            </div>
          ) : (
            filteredTranslations.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-xs space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-semibold text-[#5B5FEF] dark:text-[#7C83FF]">
                      {item.sourceLanguage.toUpperCase()}
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className="font-semibold text-[#22D3EE]">
                      {item.targetLanguage.toUpperCase()}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{item.context}</span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{item.mode} mode</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={item.isOffline ? 'info' : 'success'} dot={true}>
                      {item.isOffline ? 'Offline' : 'Cloud'}
                    </Badge>
                    <span>{new Date(item.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300">
                    {item.sourceText}
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white font-medium">
                    {item.translatedText}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopy(item.id, item.translatedText)}
                      className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-md cursor-pointer"
                      title="Copy translated text"
                    >
                      {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSpeak(item.translatedText, item.targetLanguage)}
                      className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-md cursor-pointer"
                      title="Listen to translation"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-md cursor-pointer"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {onSelectForCockpit && (
                    <button
                      type="button"
                      onClick={() =>
                        onSelectForCockpit(
                          item.sourceText,
                          item.translatedText,
                          item.sourceLanguage,
                          item.targetLanguage
                        )
                      }
                      className="text-xs text-[#5B5FEF] dark:text-[#7C83FF] hover:underline cursor-pointer"
                    >
                      Open in Cockpit →
                    </button>
                  )}
                </div>
              </div>
            ))
          )
        ) : filteredFavorites.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
            <Star className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p>No favorites starred yet.</p>
            <p className="text-[11px] mt-1 text-slate-500">
              Click the star icon in Translation Cockpit to save frequent translations here.
            </p>
          </div>
        ) : (
          filteredFavorites.map((fav) => (
            <div
              key={fav.id}
              className="p-4 rounded-xl border border-amber-200/60 dark:border-amber-900/40 bg-white dark:bg-[#111827] shadow-xs space-y-2"
            >
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-2 font-mono">
                  <span className="font-semibold text-amber-500">★ FAVORITE</span>
                  <span aria-hidden="true">·</span>
                  <span>{fav.sourceLanguage.toUpperCase()} → {fav.targetLanguage.toUpperCase()}</span>
                </div>
                <span>{new Date(fav.timestamp).toLocaleDateString()}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300">
                  {fav.sourceText}
                </div>
                <div className="p-2.5 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 text-slate-900 dark:text-white font-medium">
                  {fav.translatedText}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs">
                <button
                  type="button"
                  onClick={() => handleCopy(fav.id, fav.translatedText)}
                  className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-md cursor-pointer"
                >
                  {copiedId === fav.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleSpeak(fav.translatedText, fav.targetLanguage)}
                  className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-md cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
