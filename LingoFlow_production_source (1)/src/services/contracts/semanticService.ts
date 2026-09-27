/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IBaseService } from '../../types/service';

export interface MeaningLockRule {
  readonly term: string;
  readonly strictPreservation: boolean;
  readonly notes?: string;
}

export interface SemanticAnalysisRequest {
  readonly sourceText: string;
  readonly targetText: string;
  readonly lockedTerms: readonly MeaningLockRule[];
}

export interface SemanticAnalysisResult {
  readonly semanticFidelityScore: number;
  readonly toneAlignment: 'exact' | 'acceptable' | 'drift_detected';
  readonly preservedTerms: readonly string[];
  readonly violatedRules: readonly string[];
  readonly contextualNotes: readonly string[];
}

export interface ISemanticService extends IBaseService {
  readonly id: 'semanticService';
  analyzeSemantics(request: SemanticAnalysisRequest): Promise<SemanticAnalysisResult>;
  verifyMeaningLocks(sourceText: string, targetText: string, rules: readonly MeaningLockRule[]): Promise<boolean>;
}
