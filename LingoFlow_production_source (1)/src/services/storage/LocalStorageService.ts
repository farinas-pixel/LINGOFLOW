/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IStorageService, StorageQuotaInfo } from '../contracts/storageService';
import { safeLocalStorage } from '../../utils/storage';

export class LocalStorageService implements IStorageService {
  public readonly id = 'storageService' as const;
  public readonly name = 'Local Storage Foundation Service';
  private _isInitialized = false;
  private readonly prefix = 'lingoflow:';

  public get isInitialized(): boolean {
    return this._isInitialized;
  }

  public async initialize(): Promise<void> {
    // Validate storage readiness
    safeLocalStorage.isAvailable();
    this._isInitialized = true;
  }

  public async dispose(): Promise<void> {
    this._isInitialized = false;
  }

  public async get<T>(key: string): Promise<T | null> {
    const raw = safeLocalStorage.getItem(this.prefix + key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  public async set<T>(key: string, value: T): Promise<void> {
    const serialized = JSON.stringify(value);
    safeLocalStorage.setItem(this.prefix + key, serialized);
  }

  public async remove(key: string): Promise<void> {
    safeLocalStorage.removeItem(this.prefix + key);
  }

  public async clear(filterPrefix?: string): Promise<void> {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const fullPrefix = this.prefix + (filterPrefix || '');
    const toRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(fullPrefix)) {
        toRemove.push(k);
      }
    }
    toRemove.forEach((k) => safeLocalStorage.removeItem(k));
  }

  public async keys(filterPrefix?: string): Promise<readonly string[]> {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const fullPrefix = this.prefix + (filterPrefix || '');
    const matched: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(fullPrefix)) {
        matched.push(k.slice(this.prefix.length));
      }
    }
    return matched;
  }

  public async getQuota(): Promise<StorageQuotaInfo> {
    if (typeof navigator !== 'undefined' && 'storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const est = await navigator.storage.estimate();
        return {
          usedBytes: est.usage ?? 0,
          quotaLimitBytes: est.quota ?? 0,
          availableBytes: (est.quota ?? 0) - (est.usage ?? 0),
        };
      } catch {
        // Fallback
      }
    }

    // Rough client calculation based on localStorage size
    let used = 0;
    if (typeof window !== 'undefined' && window.localStorage) {
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k) {
          used += (k.length + (window.localStorage.getItem(k)?.length || 0)) * 2;
        }
      }
    }

    return {
      usedBytes: used,
    };
  }
}

export const defaultStorageService = new LocalStorageService();
