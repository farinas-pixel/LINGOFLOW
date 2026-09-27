/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IBaseService } from '../../types/service';

export interface SpeechRecognitionOptions {
  readonly language: string;
  readonly continuous: boolean;
  readonly interimResults: boolean;
}

export interface SpeechSynthesisOptions {
  readonly text: string;
  readonly language: string;
  readonly rate?: number;
  readonly pitch?: number;
}

export interface ISpeechService extends IBaseService {
  readonly id: 'speechService';
  readonly isListening: boolean;
  readonly isSpeaking: boolean;
  startRecognition(options: SpeechRecognitionOptions, onResult: (text: string, isFinal: boolean) => void): Promise<void>;
  stopRecognition(): Promise<void>;
  speak(options: SpeechSynthesisOptions): Promise<void>;
  stopSpeaking(): void;
}
