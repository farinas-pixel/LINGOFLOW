/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface StoredTranslation {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  context: string;
  mode: string;
  isOffline: boolean;
  latencyMs: number;
  timestamp: string;
  alternatives?: string[];
  whyThisTranslation?: {
    detectedContext?: string;
    toneNuance?: string;
    grammaticalNotes?: string;
    importantPhrases?: Array<{ phrase: string; translated: string; meaning: string }>;
  };
  isFavorite?: boolean;
}

export interface StoredFavorite {
  id: string;
  translationId: string;
  sourceText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  timestamp: string;
  category?: string;
}

export interface StoredMemoryEntry {
  id: string;
  normalizedSource: string;
  sourceLanguage: string;
  targetLanguage: string;
  translatedText: string;
  usageCount: number;
  lastUsedAt: string;
}

export interface StoredOfflinePack {
  pairId: string; // e.g., 'en-es'
  sourceLanguage: string;
  targetLanguage: string;
  name: string;
  version: string;
  byteSize: number;
  downloadedAt: string;
  entriesCount: number;
  dictionary: Record<string, string>;
  phrases?: Record<string, string>;
}

export interface StoredSyncQueueItem {
  id: string;
  actionType: 'drive_backup' | 'history_sync' | 'memory_update';
  payload: unknown;
  createdAt: string;
  status: 'pending' | 'syncing' | 'failed' | 'completed';
  error?: string;
}

const DB_NAME = 'lingoflow_db';
const DB_VERSION = 1;

export class IndexedDbService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return reject(new Error('IndexedDB not supported in this runtime environment'));
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('translations')) {
          const store = db.createObjectStore('translations', { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('sourceLanguage', 'sourceLanguage', { unique: false });
          store.createIndex('targetLanguage', 'targetLanguage', { unique: false });
        }

        if (!db.objectStoreNames.contains('favorites')) {
          const store = db.createObjectStore('favorites', { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('translationMemory')) {
          const store = db.createObjectStore('translationMemory', { keyPath: 'id' });
          store.createIndex('normalizedSource', 'normalizedSource', { unique: false });
        }

        if (!db.objectStoreNames.contains('offlinePacks')) {
          db.createObjectStore('offlinePacks', { keyPath: 'pairId' });
        }

        if (!db.objectStoreNames.contains('syncQueue')) {
          const store = db.createObjectStore('syncQueue', { keyPath: 'id' });
          store.createIndex('status', 'status', { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  // --- Translations / History ---
  public async saveTranslation(item: StoredTranslation): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['translations', 'translationMemory'], 'readwrite');
      tx.objectStore('translations').put(item);

      // Also upsert translation memory
      const normalized = item.sourceText.trim().toLowerCase();
      const memoryId = `${item.sourceLanguage}-${item.targetLanguage}-${normalized}`;
      const memStore = tx.objectStore('translationMemory');
      const getReq = memStore.get(memoryId);

      getReq.onsuccess = () => {
        const existing = getReq.result as StoredMemoryEntry | undefined;
        const entry: StoredMemoryEntry = {
          id: memoryId,
          normalizedSource: normalized,
          sourceLanguage: item.sourceLanguage,
          targetLanguage: item.targetLanguage,
          translatedText: item.translatedText,
          usageCount: (existing?.usageCount || 0) + 1,
          lastUsedAt: new Date().toISOString(),
        };
        memStore.put(entry);
      };

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  public async getTranslations(limit = 100): Promise<StoredTranslation[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('translations', 'readonly');
      const store = tx.objectStore('translations');
      const index = store.index('timestamp');
      const request = index.openCursor(null, 'prev');
      const results: StoredTranslation[] = [];

      request.onsuccess = (e) => {
        const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor && results.length < limit) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  public async deleteTranslation(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('translations', 'readwrite');
      tx.objectStore('translations').delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  public async clearHistory(): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('translations', 'readwrite');
      tx.objectStore('translations').clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // --- Favorites ---
  public async toggleFavorite(item: StoredTranslation, category = 'General'): Promise<boolean> {
    const db = await this.getDB();
    const favId = `fav_${item.id}`;

    return new Promise((resolve, reject) => {
      const tx = db.transaction(['favorites', 'translations'], 'readwrite');
      const favStore = tx.objectStore('favorites');
      const transStore = tx.objectStore('translations');

      const checkReq = favStore.get(favId);
      checkReq.onsuccess = () => {
        const isFav = Boolean(checkReq.result);
        if (isFav) {
          favStore.delete(favId);
          item.isFavorite = false;
          transStore.put(item);
          tx.oncomplete = () => resolve(false);
        } else {
          const favorite: StoredFavorite = {
            id: favId,
            translationId: item.id,
            sourceText: item.sourceText,
            translatedText: item.translatedText,
            sourceLanguage: item.sourceLanguage,
            targetLanguage: item.targetLanguage,
            timestamp: new Date().toISOString(),
            category,
          };
          favStore.put(favorite);
          item.isFavorite = true;
          transStore.put(item);
          tx.oncomplete = () => resolve(true);
        }
      };
      tx.onerror = () => reject(tx.error);
    });
  }

  public async getFavorites(): Promise<StoredFavorite[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('favorites', 'readonly');
      const store = tx.objectStore('favorites');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // --- Translation Memory Matcher ---
  public async findMemoryMatch(
    sourceText: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<{ match: StoredMemoryEntry; similarity: number } | null> {
    const db = await this.getDB();
    const normalizedInput = sourceText.trim().toLowerCase();
    if (!normalizedInput || normalizedInput.length < 3) return null;

    return new Promise((resolve, reject) => {
      const tx = db.transaction('translationMemory', 'readonly');
      const store = tx.objectStore('translationMemory');
      const request = store.getAll();

      request.onsuccess = () => {
        const entries = request.result as StoredMemoryEntry[];
        let bestMatch: StoredMemoryEntry | null = null;
        let highestSim = 0;

        for (const entry of entries) {
          if (entry.sourceLanguage !== sourceLanguage || entry.targetLanguage !== targetLanguage) {
            continue;
          }

          if (entry.normalizedSource === normalizedInput) {
            return resolve({ match: entry, similarity: 1.0 });
          }

          const sim = calculateStringSimilarity(normalizedInput, entry.normalizedSource);
          if (sim > highestSim && sim >= 0.72) {
            highestSim = sim;
            bestMatch = entry;
          }
        }

        if (bestMatch && highestSim >= 0.72) {
          resolve({ match: bestMatch, similarity: highestSim });
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // --- Offline Packs ---
  public async getOfflinePack(pairId: string): Promise<StoredOfflinePack | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('offlinePacks', 'readonly');
      const request = tx.objectStore('offlinePacks').get(pairId);
      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(request.error);
    });
  }

  public async getAllOfflinePacks(): Promise<StoredOfflinePack[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('offlinePacks', 'readonly');
      const request = tx.objectStore('offlinePacks').getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  public async saveOfflinePack(pack: StoredOfflinePack): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('offlinePacks', 'readwrite');
      tx.objectStore('offlinePacks').put(pack);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  public async deleteOfflinePack(pairId: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('offlinePacks', 'readwrite');
      tx.objectStore('offlinePacks').delete(pairId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // --- Real Stats Calculation ---
  public async calculateRealStats(): Promise<{
    totalTranslations: number;
    totalWords: number;
    offlineCount: number;
    cloudCount: number;
    favoritesCount: number;
    languagePairs: Record<string, number>;
  }> {
    const translations = await this.getTranslations(500);
    const favorites = await this.getFavorites();

    let totalWords = 0;
    let offlineCount = 0;
    let cloudCount = 0;
    const languagePairs: Record<string, number> = {};

    for (const t of translations) {
      const words = t.sourceText.trim().split(/\s+/).filter(Boolean).length;
      totalWords += words;
      if (t.isOffline) {
        offlineCount++;
      } else {
        cloudCount++;
      }

      const pairKey = `${t.sourceLanguage} → ${t.targetLanguage}`;
      languagePairs[pairKey] = (languagePairs[pairKey] || 0) + 1;
    }

    return {
      totalTranslations: translations.length,
      totalWords,
      offlineCount,
      cloudCount,
      favoritesCount: favorites.length,
      languagePairs,
    };
  }
}

// Simple Levenshtein distance based string similarity (0.0 to 1.0)
function calculateStringSimilarity(s1: string, s2: string): number {
  if (s1 === s2) return 1.0;
  if (!s1.length || !s2.length) return 0.0;

  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;

  const lLen = longer.length;
  if (lLen === 0) return 1.0;

  const costs = new Array<number>();
  for (let i = 0; i <= longer.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= shorter.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (longer.charAt(i - 1) !== shorter.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[shorter.length] = lastValue;
  }

  return (lLen - costs[shorter.length]) / lLen;
}

export const indexedDbService = new IndexedDbService();
