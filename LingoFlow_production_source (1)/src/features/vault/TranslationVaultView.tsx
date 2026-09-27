/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  Folder,
  FolderOpen,
  FileText,
  ExternalLink,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  KeyRound,
  LogOut,
  FolderTree,
} from 'lucide-react';
import {
  googleDriveService,
  DriveSavedFile,
  DriveVaultCategory,
} from '../../services/cloud/GoogleDriveService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../utils/cn';

export function TranslationVaultView() {
  const [isConnected, setIsConnected] = useState(googleDriveService.isConnected);
  const [userInfo, setUserInfo] = useState<{ email?: string; name?: string } | null>(null);
  const [tokenInput, setTokenInput] = useState('');
  const [showTokenModal, setShowTokenModal] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<DriveSavedFile[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<DriveVaultCategory | 'All'>('All');

  const checkStatus = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    if (googleDriveService.isConnected) {
      const res = await googleDriveService.verifyConnection();
      if (res.valid) {
        setIsConnected(true);
        setUserInfo({ email: res.email, name: res.name });
        const list = await googleDriveService.listVaultFiles();
        setFiles(list);
      } else {
        setIsConnected(false);
        setUserInfo(null);
      }
    } else {
      setIsConnected(false);
      setUserInfo(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleConnectToken = async () => {
    if (!tokenInput.trim()) return;
    googleDriveService.setAccessToken(tokenInput.trim());
    setTokenInput('');
    setShowTokenModal(false);
    await checkStatus();
  };

  const handleDisconnect = () => {
    googleDriveService.setAccessToken(null);
    setIsConnected(false);
    setUserInfo(null);
    setFiles([]);
    setStatusMessage('Google Drive disconnected.');
  };

  const categories: DriveVaultCategory[] = ['Study', 'Work', 'Travel', 'Personal', 'Favorites'];

  const filteredFiles = files.filter((f) => {
    if (selectedCategory === 'All') return true;
    return f.folderName.toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Google Drive Translation Vault
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Cloud backup for translation memory, custom lexicons, and bilingual workspace documents.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isConnected ? (
            <Button variant="outline" size="sm" onClick={handleDisconnect} className="text-rose-600">
              <LogOut className="w-3.5 h-3.5" />
              Disconnect Drive
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={() => setShowTokenModal(true)}>
              <KeyRound className="w-3.5 h-3.5" />
              Connect Google Drive
            </Button>
          )}

          <Button variant="secondary" size="sm" onClick={checkStatus} disabled={isLoading}>
            <RotateCw className={cn('w-3.5 h-3.5', isLoading && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Account Connection Status Card */}
      <Card
        title="Google Drive Authentication Status"
        subtitle="Direct OAuth token integration with Google Drive REST API v3"
        headerAction={
          <Badge variant={isConnected ? 'success' : 'neutral'} dot={true}>
            {isConnected ? 'Drive Authenticated' : 'Disconnected'}
          </Badge>
        }
      >
        <div className="space-y-3 text-xs">
          {isConnected ? (
            <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-semibold text-sm">
                    {userInfo?.name || 'Google Account Connected'}
                  </div>
                  <div className="text-[11px] opacity-80">{userInfo?.email || 'Authorized for Drive Vault'}</div>
                </div>
              </div>
              <span className="font-mono text-[10px] uppercase font-semibold">
                Scope: drive.file
              </span>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400">
              <p>
                Google Drive Vault is currently offline. Connect your Google account to automatically synchronize translations to dedicated cloud folders.
              </p>
              <div className="pt-2">
                <Button variant="primary" size="sm" onClick={() => setShowTokenModal(true)}>
                  Connect Account or Enter Token
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Vault Folder Hierarchy */}
      <Card
        title="Translation Vault Folder Hierarchy"
        subtitle="Structured cloud folders maintained under root 'LingoFlow/'"
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
          <button
            type="button"
            onClick={() => setSelectedCategory('All')}
            className={cn(
              'p-3 rounded-xl border text-left transition-colors cursor-pointer',
              selectedCategory === 'All'
                ? 'border-[#5B5FEF] bg-[#5B5FEF]/10 text-[#5B5FEF] dark:text-[#7C83FF] font-semibold'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            )}
          >
            <FolderTree className="w-5 h-5 mb-1.5" />
            <div className="truncate">All Vault Files</div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{files.length} items</div>
          </button>

          {categories.map((cat) => {
            const count = files.filter((f) => f.folderName.toLowerCase() === cat.toLowerCase()).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'p-3 rounded-xl border text-left transition-colors cursor-pointer',
                  isSelected
                    ? 'border-[#5B5FEF] bg-[#5B5FEF]/10 text-[#5B5FEF] dark:text-[#7C83FF] font-semibold'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                )}
              >
                <Folder className="w-5 h-5 mb-1.5 text-amber-500" />
                <div className="truncate">{cat}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">{count} files</div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Cloud Saved Files List */}
      <Card
        title={`Saved Vault Records (${filteredFiles.length})`}
        subtitle="Individual translation records saved with full context & metadata"
      >
        <div className="space-y-3">
          {filteredFiles.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <HardDrive className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>No files saved in this Vault category yet.</p>
              <p className="text-[11px] mt-1 text-slate-500">
                Translations saved via Translation Cockpit with "Save to Drive" will appear here with genuine Google Drive URLs.
              </p>
            </div>
          ) : (
            filteredFiles.map((f) => (
              <div
                key={f.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3 min-w-0 pr-3">
                  <FileText className="w-4 h-4 text-[#5B5FEF] shrink-0" />
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 dark:text-white truncate">
                      {f.name}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                      <span>Folder: {f.folderName}</span>
                      <span aria-hidden="true">·</span>
                      <span>{new Date(f.createdTime).toLocaleString()}</span>
                      {f.sizeBytes && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{f.sizeBytes} bytes</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <a
                  href={f.webViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 shrink-0"
                >
                  <span>Open in Drive</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Connect Token Modal */}
      {showTokenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-[#5B5FEF]" />
                Connect Google Drive Vault
              </h3>
              <button
                type="button"
                onClick={() => setShowTokenModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              LingoFlow connects directly to the Google Drive REST API v3 using OAuth token authentication. Paste your Google OAuth access token or Google Workspace token below:
            </p>

            <textarea
              placeholder="Paste Google OAuth Access Token (Bearer ya29...)..."
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              rows={4}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#080B14] font-mono text-[11px] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#5B5FEF]"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowTokenModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleConnectToken} disabled={!tokenInput.trim()}>
                Verify & Connect
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
