/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  FileText,
  Image as ImageIcon,
  RotateCw,
  Download,
  Copy,
  Check,
  AlertCircle,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, getLanguageByCode } from '../../config/languages.data';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../utils/cn';

export function MediaTranslationView() {
  const [activeTab, setActiveTab] = useState<'image' | 'document'>('image');

  // --- Image OCR Translation States ---
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState('image/jpeg');
  const [imageTargetLang, setImageTargetLang] = useState('es');
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<{
    detectedLanguage?: string;
    extractedText: string;
    translatedText: string;
    textBlocks?: Array<{ original: string; translated: string; confidence: number }>;
  } | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);

  // --- Document Translation States ---
  const [documentFile, setDocumentFile] = useState<{ name: string; content: string; type: string } | null>(null);
  const [docTargetLang, setDocTargetLang] = useState('es');
  const [isDocTranslating, setIsDocTranslating] = useState(false);
  const [translatedDocContent, setTranslatedDocContent] = useState<string | null>(null);
  const [docError, setDocError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Image Upload handler
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageMime(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
      setOcrResult(null);
      setOcrError(null);
    };
    reader.readAsDataURL(file);
  };

  // Run Real OCR Translation via server
  const handleRunOcr = async () => {
    if (!imagePreview) return;
    setIsOcrProcessing(true);
    setOcrError(null);

    const targetLangData = getLanguageByCode(imageTargetLang);

    try {
      const res = await fetch('/api/ocr-translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imagePreview,
          mimeType: imageMime,
          targetLanguage: targetLangData?.name || 'Spanish',
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `OCR request failed (HTTP ${res.status})`);
      }

      const data = await res.json();
      setOcrResult(data);
    } catch (err: any) {
      setOcrError(err.message || 'OCR translation service unavailable.');
    } finally {
      setIsOcrProcessing(false);
    }
  };

  // Document Upload handler (.txt, .md, .json, .csv, .html)
  const handleDocumentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedExtensions = ['.txt', '.md', '.json', '.csv', '.html'];
    const hasValidExt = allowedExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!hasValidExt) {
      setDocError('Unsupported format. Genuinely supported formats: .txt, .md, .json, .csv, .html');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setDocumentFile({
        name: file.name,
        content: text,
        type: file.type || 'text/plain',
      });
      setTranslatedDocContent(null);
      setDocError(null);
    };
    reader.readAsText(file);
  };

  // Translate Document
  const handleTranslateDocument = async () => {
    if (!documentFile) return;
    setIsDocTranslating(true);
    setDocError(null);

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: documentFile.content.slice(0, 15000), // First chunk up to 15k characters
          sourceLanguage: 'auto',
          targetLanguage: docTargetLang,
          mode: 'accurate',
          context: 'general',
        }),
      });

      if (!res.ok) {
        throw new Error('Document translation failed');
      }

      const data = await res.json();
      setTranslatedDocContent(data.translatedText);
    } catch (err: any) {
      setDocError(err.message || 'Failed to translate document.');
    } finally {
      setIsDocTranslating(false);
    }
  };

  // Download Translated Document
  const handleDownloadDoc = () => {
    if (!translatedDocContent || !documentFile) return;
    const parts = documentFile.name.split('.');
    const ext = parts.pop() || 'txt';
    const newName = `${parts.join('.')}_translated_${docTargetLang}.${ext}`;

    const blob = new Blob([translatedDocContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = newName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header and Tab Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Multimodal Media & Document Translation
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Genuine optical character recognition (OCR) and structured file translation.
          </p>
        </div>

        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab('image')}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer',
              activeTab === 'image'
                ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Image OCR Translation
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('document')}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer',
              activeTab === 'document'
                ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <FileText className="w-3.5 h-3.5" />
            Document Translation
          </button>
        </div>
      </div>

      {/* Tab 1: Image Translation (OCR) */}
      {activeTab === 'image' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload & Image Viewer */}
            <Card title="Image Source & Visual Capture" subtitle="Upload photo, screenshot, or scan">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      Target Language:
                    </span>
                    <select
                      value={imageTargetLang}
                      onChange={(e) => setImageTargetLang(e.target.value)}
                      aria-label="Image OCR Target Language"
                      className="text-xs py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#080B14] text-slate-900 dark:text-white"
                    >
                      {SUPPORTED_LANGUAGES.map((l) => (
                        <option key={l.code} value={l.code}>
                          {l.name} ({l.nativeName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#5B5FEF] text-white hover:bg-[#4d51dd] cursor-pointer shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="sr-only"
                    />
                  </label>
                </div>

                {/* Preview Box */}
                <div className="relative w-full h-64 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex items-center justify-center overflow-hidden">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Uploaded for OCR"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center p-6 text-slate-400 text-xs">
                      <Camera className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Drop image here or click Upload Image</p>
                      <p className="text-[11px] mt-1 text-slate-500">Supports PNG, JPEG, WEBP</p>
                    </div>
                  )}
                </div>

                {imagePreview && (
                  <Button
                    variant="primary"
                    size="md"
                    fullWidth
                    disabled={isOcrProcessing}
                    onClick={handleRunOcr}
                  >
                    {isOcrProcessing ? (
                      <>
                        <RotateCw className="w-4 h-4 animate-spin" />
                        Extracting & Translating Text...
                      </>
                    ) : (
                      <>Extract Text & Translate</>
                    )}
                  </Button>
                )}
              </div>
            </Card>

            {/* OCR Translation Result */}
            <Card
              title="OCR Extraction & Translation"
              subtitle="Detected source text and translated output"
              headerAction={
                ocrResult && (
                  <Badge variant="success" dot={true}>
                    {ocrResult.detectedLanguage || 'Text Extracted'}
                  </Badge>
                )
              }
            >
              <div className="space-y-4 text-xs">
                {ocrError ? (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold">OCR Notice</div>
                      <div className="mt-0.5">{ocrError}</div>
                    </div>
                  </div>
                ) : ocrResult ? (
                  <div className="space-y-4">
                    {/* Extracted Original */}
                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
                      <span className="font-semibold text-slate-500 uppercase block mb-1">
                        Detected Original ({ocrResult.detectedLanguage || 'Source'}):
                      </span>
                      <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                        {ocrResult.extractedText}
                      </p>
                    </div>

                    {/* Translated Text */}
                    <div className="p-3.5 rounded-xl border border-[#5B5FEF]/30 bg-[#5B5FEF]/5 dark:bg-[#7C83FF]/10">
                      <span className="font-semibold text-[#5B5FEF] dark:text-[#7C83FF] uppercase block mb-1">
                        Translated Text ({getLanguageByCode(imageTargetLang)?.name}):
                      </span>
                      <p className="text-slate-900 dark:text-white text-sm font-medium leading-relaxed whitespace-pre-wrap">
                        {ocrResult.translatedText}
                      </p>
                    </div>

                    {/* Text Blocks if available */}
                    {ocrResult.textBlocks && ocrResult.textBlocks.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] uppercase font-semibold text-slate-400">
                          Detected OCR Text Blocks:
                        </span>
                        {ocrResult.textBlocks.map((blk, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 flex items-baseline justify-between gap-2"
                          >
                            <span className="text-slate-700 dark:text-slate-300">"{blk.original}"</span>
                            <span className="text-[#5B5FEF] dark:text-[#7C83FF] font-medium">
                              "{blk.translated}"
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400">
                    <p>Upload an image and click "Extract Text & Translate".</p>
                    <p className="text-[11px] mt-1 text-slate-500">
                      Real OCR extracts text and translates spatial segments.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Document Translation */}
      {activeTab === 'document' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Document Upload & Preview */}
            <Card
              title="Upload Document"
              subtitle="Genuinely supported: .txt, .md, .json, .csv, .html"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      Target Language:
                    </span>
                    <select
                      value={docTargetLang}
                      onChange={(e) => setDocTargetLang(e.target.value)}
                      aria-label="Document Target Language"
                      className="text-xs py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#080B14] text-slate-900 dark:text-white"
                    >
                      {SUPPORTED_LANGUAGES.map((l) => (
                        <option key={l.code} value={l.code}>
                          {l.name} ({l.nativeName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#5B5FEF] text-white hover:bg-[#4d51dd] cursor-pointer shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Select File</span>
                    <input
                      type="file"
                      accept=".txt,.md,.json,.csv,.html"
                      onChange={handleDocumentSelect}
                      className="sr-only"
                    />
                  </label>
                </div>

                {docError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs">
                    {docError}
                  </div>
                )}

                {documentFile ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                      <span className="font-semibold text-slate-900 dark:text-white truncate">
                        {documentFile.name}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        {documentFile.content.length} chars
                      </span>
                    </div>

                    <div className="h-48 overflow-y-auto p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-xs font-mono text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {documentFile.content.slice(0, 1000)}
                      {documentFile.content.length > 1000 && '\n\n... [Preview truncated for display]'}
                    </div>

                    <Button
                      variant="primary"
                      size="md"
                      fullWidth
                      disabled={isDocTranslating}
                      onClick={handleTranslateDocument}
                    >
                      {isDocTranslating ? (
                        <>
                          <RotateCw className="w-4 h-4 animate-spin" />
                          Translating Document...
                        </>
                      ) : (
                        <>Translate Document</>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400 text-xs border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6">
                    <FileText className="w-8 h-8 opacity-50 mb-2" />
                    <p>Select a .txt, .md, .json, .csv, or .html document.</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Translated Document Result */}
            <Card
              title="Translated Document Preview"
              subtitle="Full document translation ready to download"
              headerAction={
                translatedDocContent && (
                  <Button variant="secondary" size="sm" onClick={handleDownloadDoc}>
                    <Download className="w-3.5 h-3.5" />
                    Download File
                  </Button>
                )
              }
            >
              <div className="space-y-4 text-xs">
                {translatedDocContent ? (
                  <div className="space-y-3">
                    <div className="h-72 overflow-y-auto p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-xs font-mono text-slate-900 dark:text-white leading-relaxed whitespace-pre-wrap">
                      {translatedDocContent}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          await navigator.clipboard.writeText(translatedDocContent);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Copied' : 'Copy All'}
                      </Button>

                      <Button variant="primary" size="sm" onClick={handleDownloadDoc}>
                        <Download className="w-3.5 h-3.5" />
                        Download Translated File
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400">
                    <p>Upload a document and click Translate Document.</p>
                    <p className="text-[11px] mt-1 text-slate-500">
                      The translated file can be reviewed and downloaded with original formatting preserved.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
