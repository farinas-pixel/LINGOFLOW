/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ServiceId, ServiceMetadata, IBaseService } from '../../types/service';
import { FUTURE_MODULE_SPECS } from '../../config/app.config';
import { defaultStorageService } from '../storage/LocalStorageService';

export class ServiceRegistry {
  private static instance: ServiceRegistry;
  private readonly services = new Map<ServiceId, IBaseService>();
  private readonly metadataMap = new Map<ServiceId, ServiceMetadata>();

  private constructor() {
    // Populate metadata map from configuration
    FUTURE_MODULE_SPECS.forEach((spec) => {
      this.metadataMap.set(spec.id, { ...spec });
    });

    // Register active foundation service(s)
    this.registerService(defaultStorageService);
  }

  public static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry();
    }
    return ServiceRegistry.instance;
  }

  public registerService(service: IBaseService): void {
    this.services.set(service.id, service);
    const existingMeta = this.metadataMap.get(service.id);
    if (existingMeta) {
      this.metadataMap.set(service.id, {
        ...existingMeta,
        status: service.isInitialized ? 'ready' : 'initialized',
      });
    }
  }

  public getService<T extends IBaseService>(id: ServiceId): T | null {
    const service = this.services.get(id);
    return (service as T) ?? null;
  }

  public getAllMetadata(): readonly ServiceMetadata[] {
    return Array.from(this.metadataMap.values());
  }

  public getMetadata(id: ServiceId): ServiceMetadata | undefined {
    return this.metadataMap.get(id);
  }

  public isServiceRegistered(id: ServiceId): boolean {
    return this.services.has(id);
  }

  public async initializeAll(): Promise<void> {
    for (const service of this.services.values()) {
      if (!service.isInitialized) {
        await service.initialize();
        const meta = this.metadataMap.get(service.id);
        if (meta) {
          this.metadataMap.set(service.id, { ...meta, status: 'ready' });
        }
      }
    }
  }
}

export const serviceRegistry = ServiceRegistry.getInstance();
