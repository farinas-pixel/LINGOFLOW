/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ServiceId =
  | 'translationService'
  | 'semanticService'
  | 'googleDriveService'
  | 'speechService'
  | 'ocrService'
  | 'offlineTranslationService'
  | 'storageService'
  | 'syncService';

export type ServiceStatus =
  | 'initialized'
  | 'pending_phase'
  | 'ready'
  | 'unregistered';

export interface ServiceMetadata {
  id: ServiceId;
  name: string;
  category: 'core' | 'ai' | 'cloud' | 'multimodal' | 'persistence';
  description: string;
  isOfflineCapable: boolean;
  phaseScheduled: 'Phase 0 (Foundation)' | 'Phase 1' | 'Phase 2' | 'Phase 3';
  contractDefined: boolean;
  status: ServiceStatus;
  capabilities: readonly string[];
}

export interface IBaseService {
  readonly id: ServiceId;
  readonly name: string;
  readonly isInitialized: boolean;
  initialize(): Promise<void>;
  dispose(): Promise<void>;
}
