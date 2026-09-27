/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IBaseService } from '../../types/service';

export interface TranslationRequest {
  readonly text: string;
  readonly sourceLanguage: string;
  readonly targetLanguage: string;
  readonly contextPrompt?: string;
  readonly formality?: 'neutral' | 'formal' | 'informal';
}

export interface TranslationResponse {
  readonly translatedText: string;
  readonly detectedSourceLanguage?: string;
  readonly alternatives: readonly string[];
  readonly latencyMs: number;
}

export interface ITranslationService extends IBaseService {
  readonly id: 'translationService';
  translate(request: TranslationRequest): Promise<TranslationResponse>;
  detectLanguage(text: string): Promise<string>;
  getSupportedLanguages(): Promise<readonly string[]>;
}
