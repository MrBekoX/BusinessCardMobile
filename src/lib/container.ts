/**
 * Dependency Injection Container
 * Service locator pattern implementation
 */

type ServiceFactory<T> = () => T;

class ServiceContainer {
  private static instance: ServiceContainer;
  private services: Map<string, unknown> = new Map();
  private factories: Map<string, ServiceFactory<unknown>> = new Map();

  private constructor() {}

  static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  register<T>(key: string, service: T): void {
    this.services.set(key, service);
  }

  registerFactory<T>(key: string, factory: ServiceFactory<T>): void {
    this.factories.set(key, factory);
  }

  resolve<T>(key: string): T {
    // Öncelikle kayıtlı servisi kontrol et
    if (this.services.has(key)) {
      return this.services.get(key) as T;
    }

    // Factory varsa çalıştır ve kaydet
    if (this.factories.has(key)) {
      const factory = this.factories.get(key) as ServiceFactory<T>;
      const service = factory();
      this.services.set(key, service);
      return service;
    }

    throw new Error(`Service not found: ${key}`);
  }

  has(key: string): boolean {
    return this.services.has(key) || this.factories.has(key);
  }

  clear(): void {
    this.services.clear();
    this.factories.clear();
  }
}

export const container = ServiceContainer.getInstance();

// Service keys
export const SERVICE_KEYS = {
  CARD_SERVICE: 'cardService',
  COLLECTION_SERVICE: 'collectionService',
  AUTH_SERVICE: 'authService',
  PROFILE_SERVICE: 'profileService',
  QR_SERVICE: 'qrService',
  SHARE_SERVICE: 'shareService',
  OFFLINE_SERVICE: 'offlineService',
  LOGGER: 'logger',
  SECURE_STORAGE: 'secureStorage',
  RATE_LIMITER: 'rateLimiter',
} as const;

export type ServiceKey = typeof SERVICE_KEYS[keyof typeof SERVICE_KEYS];

export default container;
