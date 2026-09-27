/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IBaseService } from '../../types/service';

export interface BoundingBox {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface OCRBlock {
  readonly text: string;
  readonly confidence: number;
  readonly boundingBox: BoundingBox;
}

export interface OCRResult {
  readonly fullText: string;
  readonly blocks: readonly OCRBlock[];
  readonly detectedLanguage?: string;
  readonly imageWidth: number;
  readonly imageHeight: number;
}

export interface IOCRService extends IBaseService {
  readonly id: 'ocrService';
  extractTextFromImage(imageData: Blob | ImageData | HTMLCanvasElement): Promise<OCRResult>;
  cancelExtraction(): void;
}
