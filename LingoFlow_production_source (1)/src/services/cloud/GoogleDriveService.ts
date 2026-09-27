/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DriveFolder {
  id: string;
  name: string;
  parentId?: string;
  webViewLink?: string;
}

export interface DriveSavedFile {
  id: string;
  name: string;
  folderName: string;
  webViewLink: string;
  createdTime: string;
  sizeBytes?: number;
}

export interface DriveVaultRecord {
  sourceLanguage: string;
  targetLanguage: string;
  originalText: string;
  translatedText: string;
  context: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export type DriveVaultCategory = 'Study' | 'Work' | 'Travel' | 'Personal' | 'Favorites';

export class GoogleDriveService {
  private accessToken: string | null = null;
  private rootFolderId: string | null = null;
  private folderCache: Map<string, string> = new Map();

  /**
   * Set or restore OAuth access token
   */
  public setAccessToken(token: string | null): void {
    this.accessToken = token;
    if (!token) {
      this.rootFolderId = null;
      this.folderCache.clear();
    }
  }

  public get isConnected(): boolean {
    return Boolean(this.accessToken);
  }

  public get token(): string | null {
    return this.accessToken;
  }

  /**
   * Verifies token and retrieves user info
   */
  public async verifyConnection(): Promise<{ email?: string; name?: string; valid: boolean }> {
    if (!this.accessToken) return { valid: false };

    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      });

      if (!res.ok) {
        if (res.status === 401) {
          this.setAccessToken(null);
        }
        return { valid: false };
      }

      const info = await res.json();
      return { email: info.email, name: info.name, valid: true };
    } catch {
      return { valid: false };
    }
  }

  /**
   * Finds or creates a folder on Google Drive
   */
  private async findOrCreateFolder(name: string, parentId?: string): Promise<string> {
    if (!this.accessToken) throw new Error('Google Drive is not authenticated.');

    const cacheKey = `${parentId || 'root'}:${name}`;
    if (this.folderCache.has(cacheKey)) {
      return this.folderCache.get(cacheKey)!;
    }

    // Query existing folder
    let query = `name = '${name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
    if (parentId) {
      query += ` and '${parentId}' in parents`;
    } else {
      query += ` and 'root' in parents`;
    }

    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id, name, webViewLink)`;
    const searchRes = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });

    if (!searchRes.ok) {
      if (searchRes.status === 401) throw new Error('Google Drive authorization expired. Please reconnect.');
      if (searchRes.status === 403) throw new Error('Google Drive storage quota exceeded or permission denied.');
      throw new Error(`Drive folder query failed (HTTP ${searchRes.status})`);
    }

    const searchData = await searchRes.json();
    if (searchData.files && searchData.files.length > 0) {
      const folderId = searchData.files[0].id;
      this.folderCache.set(cacheKey, folderId);
      return folderId;
    }

    // Create folder if not found
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentId ? [parentId] : undefined,
      }),
    });

    if (!createRes.ok) {
      throw new Error(`Failed to create Google Drive folder: ${name}`);
    }

    const createdData = await createRes.json();
    this.folderCache.set(cacheKey, createdData.id);
    return createdData.id;
  }

  /**
   * Initializes LingoFlow Root and standard Vault subfolders
   */
  public async ensureVaultStructure(): Promise<{ rootId: string; subfolders: Record<string, string> }> {
    const rootId = await this.findOrCreateFolder('LingoFlow');
    this.rootFolderId = rootId;

    const subfolders: Record<string, string> = {};
    const categories: DriveVaultCategory[] = ['Study', 'Work', 'Travel', 'Personal', 'Favorites'];

    for (const cat of categories) {
      const subId = await this.findOrCreateFolder(cat, rootId);
      subfolders[cat] = subId;
    }

    return { rootId, subfolders };
  }

  /**
   * Saves a real translation record to a specific Vault folder
   */
  public async saveTranslationToVault(
    record: DriveVaultRecord,
    category: DriveVaultCategory = 'Personal'
  ): Promise<DriveSavedFile> {
    if (!this.accessToken) {
      throw new Error('Google Drive is not authenticated. Please connect your Google account in Vault.');
    }

    await this.ensureVaultStructure();
    const folderId = await this.findOrCreateFolder(category, this.rootFolderId!);

    const cleanDate = new Date().toISOString().replace(/[:.]/g, '-');
    const safeSnippet = record.originalText.slice(0, 20).replace(/[^a-zA-Z0-9\s]/g, '').trim();
    const fileName = `LingoFlow_${category}_${record.sourceLanguage}-${record.targetLanguage}_${cleanDate}.json`;

    const fileContent = JSON.stringify(
      {
        application: 'LingoFlow Multilingual Translation Workspace',
        vaultCategory: category,
        version: '0.1.0',
        ...record,
      },
      null,
      2
    );

    // Multipart upload
    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const metadata = {
      name: fileName,
      mimeType: 'application/json',
      parents: [folderId],
      description: `LingoFlow translation: ${record.sourceLanguage} to ${record.targetLanguage} (${category})`,
    };

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      fileContent +
      closeDelimiter;

    const uploadRes = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,size',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
      }
    );

    if (!uploadRes.ok) {
      if (uploadRes.status === 401) throw new Error('Authorization expired. Please re-authenticate Google Drive.');
      if (uploadRes.status === 403) throw new Error('Google Drive quota limit or insufficient permission.');
      throw new Error(`Google Drive upload failed with status ${uploadRes.status}`);
    }

    const data = await uploadRes.json();

    return {
      id: data.id,
      name: data.name,
      folderName: category,
      webViewLink: data.webViewLink || `https://drive.google.com/file/d/${data.id}/view`,
      createdTime: new Date().toISOString(),
      sizeBytes: Number(data.size || fileContent.length),
    };
  }

  /**
   * Lists files saved inside the LingoFlow vault
   */
  public async listVaultFiles(): Promise<DriveSavedFile[]> {
    if (!this.accessToken) return [];

    try {
      const { rootId } = await this.ensureVaultStructure();
      const query = `'${rootId}' in parents or mimeType != 'application/vnd.google-apps.folder' and trashed = false`;
      const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
        `trashed = false and name contains 'LingoFlow_'`
      )}&fields=files(id, name, webViewLink, createdTime, size)&orderBy=createdTime desc&pageSize=50`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      });

      if (!res.ok) return [];

      const data = await res.json();
      return (data.files || []).map((f: { id: string; name: string; webViewLink?: string; createdTime: string; size?: string }) => ({
        id: f.id,
        name: f.name,
        folderName: f.name.split('_')[1] || 'Vault',
        webViewLink: f.webViewLink || `https://drive.google.com/file/d/${f.id}/view`,
        createdTime: f.createdTime,
        sizeBytes: Number(f.size || 0),
      }));
    } catch {
      return [];
    }
  }
}

export const googleDriveService = new GoogleDriveService();
