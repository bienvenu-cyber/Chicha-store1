interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiration: number;
}

class CacheManager {
  private cache: Map<string, CacheItem<any>> = new Map();
  private DEFAULT_EXPIRATION = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, expirationTime?: number): void {
    const timestamp = Date.now();
    const expiration = expirationTime || this.DEFAULT_EXPIRATION;

    this.cache.set(key, {
      data,
      timestamp,
      expiration: timestamp + expiration
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) return null;

    if (Date.now() > item.expiration) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) return false;

    if (Date.now() > item.expiration) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }
}

export const cacheManager = new CacheManager();
