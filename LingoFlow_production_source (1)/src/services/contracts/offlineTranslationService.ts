/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IBaseService } from '../../types/service';
import { TranslationRequest, TranslationResponse } from './translationService';

export interface OfflineLanguageModelPack {
  readonly languagePair: string;
  readonly modelVersion: string;
  readonly byteSize: number;
  readonly isDownloaded: boolean;
  readonly isLoadedInMemory: boolean;
}

export interface IOfflineTranslationService extends IBaseService {
  readonly id: 'offlineTranslationService';
  readonly isModelLoaded: boolean;
  translateOffline(request: TranslationRequest): Promise<TranslationResponse>;
  getInstalledModelPacks(): Promise<readonly OfflineLanguageModelPack[]>;
  downloadModelPack(pair: string, onProgress?: (percent: number) => void): Promise<boolean>;
  deleteModelPack(pair: string): Promise<boolean>;
}
