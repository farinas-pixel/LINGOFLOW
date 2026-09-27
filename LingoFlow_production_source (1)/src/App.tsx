/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { WorkspaceViewId } from './types/navigation';
import { ThemeProvider } from './hooks/useTheme';
import { AppShell } from './components/layout/AppShell';
import { SplashScreen } from './components/feedback/SplashScreen';

// Feature Views
import { HomeView } from './features/home/HomeView';
import { TranslationCockpit } from './features/translator/TranslationCockpit';
import { WebSearchView } from './features/search/WebSearchView';
import { SemanticMirrorView } from './features/semantic/SemanticMirrorView';
import { ConversationMode } from './features/conversation/ConversationMode';
import { MediaTranslationView } from './features/media/MediaTranslationView';
import { HistoryAndFavoritesView } from './features/history/HistoryAndFavoritesView';
import { LanguageExplorerView } from './features/languages/LanguageExplorerView';
import { TranslationVaultView } from './features/vault/TranslationVaultView';
import { EnhancedSettingsView } from './features/settings/EnhancedSettingsView';
import { ArchitectureExplorer } from './features/workspace/ArchitectureExplorer';
import { ServiceRegistryView } from './features/workspace/ServiceRegistryView';

import { serviceRegistry } from './services/core/ServiceRegistry';

function WorkspaceRoot() {
  const [isReady, setIsReady] = useState(false);
  const [activeView, setActiveView] = useState<WorkspaceViewId>('home');

  // Shared workspace translation context
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('es');

  // Cross-view payloads (e.g. inspecting current cockpit translation in Semantic Mirror)
  const [semanticPayload, setSemanticPayload] = useState<{ sourceText: string; translatedText: string } | null>(null);
  const [semanticFidelityScore, setSemanticFidelityScore] = useState<number | null>(null);
  const [semanticIntegrityStatus, setSemanticIntegrityStatus] = useState<'preserved' | 'nuance_change' | 'meaning_changed' | null>(null);
  const [meaningLockActive, setMeaningLockActive] = useState<boolean>(false);
  const [lockedTermsCount, setLockedTermsCount] = useState<number>(0);

  useEffect(() => {
    // Quick system initialization (IndexedDB and Service Registry)
    const initWorkspace = async () => {
      try {
        await serviceRegistry.initializeAll();
      } catch (err) {
        console.error('LingoFlow initialization error:', err);
      }
    };
    initWorkspace();
  }, []);

  const handleSwapLanguages = () => {
    const temp = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(temp);
  };

  const handleOpenSemanticMirror = (source: string, target: string) => {
    setSemanticPayload({ sourceText: source, translatedText: target });
    setActiveView('semantic');
  };

  const handleSelectFromHistory = (source: string, target: string, sLang: string, tLang: string) => {
    setSourceLanguage(sLang);
    setTargetLanguage(tLang);
    setActiveView('translator');
  };

  return (
    <>
      {!isReady && (
        <SplashScreen onComplete={() => setIsReady(true)} minDurationMs={320} />
      )}

      <AppShell activeView={activeView} onSelectView={setActiveView}>
        {activeView === 'home' && (
          <HomeView
            sourceLanguage={sourceLanguage}
            targetLanguage={targetLanguage}
            onSelectSource={setSourceLanguage}
            onSelectTarget={setTargetLanguage}
            onSwapLanguages={handleSwapLanguages}
            onNavigate={setActiveView}
            semanticFidelityScore={semanticFidelityScore}
            semanticIntegrityStatus={semanticIntegrityStatus}
            meaningLockActive={meaningLockActive}
            lockedTermsCount={lockedTermsCount}
          />
        )}

        {activeView === 'search' && <WebSearchView />}

        {activeView === 'translator' && (
          <TranslationCockpit
            sourceLanguage={sourceLanguage}
            targetLanguage={targetLanguage}
            onSourceChange={setSourceLanguage}
            onTargetChange={setTargetLanguage}
            onSwap={handleSwapLanguages}
            onOpenSemanticMirror={handleOpenSemanticMirror}
          />
        )}

        {activeView === 'semantic' && (
          <SemanticMirrorView
            sourceText={semanticPayload?.sourceText || ''}
            translatedText={semanticPayload?.translatedText || ''}
            sourceLanguage={sourceLanguage}
            targetLanguage={targetLanguage}
            onApplyRevision={(revised) => {
              if (semanticPayload) {
                setSemanticPayload({ ...semanticPayload, translatedText: revised });
              }
            }}
            onUpdateIntegrity={(score, status, count) => {
              setSemanticFidelityScore(score);
              setSemanticIntegrityStatus(status);
              setLockedTermsCount(count);
              setMeaningLockActive(count > 0);
            }}
          />
        )}

        {activeView === 'conversation' && <ConversationMode />}

        {activeView === 'media' && <MediaTranslationView />}

        {activeView === 'history' && (
          <HistoryAndFavoritesView onSelectForCockpit={handleSelectFromHistory} />
        )}

        {activeView === 'languages' && <LanguageExplorerView />}

        {activeView === 'vault' && <TranslationVaultView />}

        {activeView === 'settings' && <EnhancedSettingsView />}

        {activeView === 'architecture' && <ArchitectureExplorer />}

        {activeView === 'services' && <ServiceRegistryView />}
      </AppShell>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <WorkspaceRoot />
    </ThemeProvider>
  );
}
