import localforage from 'localforage';

// TTL de 6 horas em milissegundos
const CACHE_TTL = 6 * 60 * 60 * 1000;

// Configurar localForage para usar IndexedDB
localforage.config({
  driver: localforage.INDEXEDDB,
  name: 'tumayordomo',
  version: 1.0,
  storeName: 'app_cache',
  description: 'Tu Mayordomo cache offline-first'
});

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  userId: string;
  version: string;
}

class CacheService {
  private version = 'v1';
  private currentUserId: string | null = null;

  // Definir o userId atual
  setUserId(userId: string | null) {
    if (this.currentUserId !== userId) {
      // Se mudou o user_id, limpar cache do usuário anterior
      if (this.currentUserId) {
        this.clearUserCache(this.currentUserId);
      }
      this.currentUserId = userId;
    }
  }

  // Gerar chave de cache
  private getCacheKey(type: string, userId: string, suffix?: string): string {
    const key = `${this.version}:${type}:${userId}`;
    return suffix ? `${key}:${suffix}` : key;
  }

  // Verificar se cache é válido (não expirou e é do mesmo usuário)
  private isValidCache<T>(entry: CacheEntry<T> | null, userId: string): boolean {
    if (!entry) return false;
    
    const now = Date.now();
    const isExpired = now - entry.timestamp > CACHE_TTL;
    const isSameUser = entry.userId === userId;
    const isSameVersion = entry.version === this.version;
    
    return !isExpired && isSameUser && isSameVersion;
  }

  // Obter dados do cache
  async get<T>(type: string, userId: string, suffix?: string): Promise<T | null> {
    try {
      const key = this.getCacheKey(type, userId, suffix);
      const entry = await localforage.getItem<CacheEntry<T>>(key);
      
      if (this.isValidCache(entry, userId)) {
        return entry!.data;
      }
      
      // Se cache inválido, remover
      if (entry) {
        await localforage.removeItem(key);
      }
      
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  // Salvar dados no cache
  async set<T>(type: string, userId: string, data: T, suffix?: string): Promise<void> {
    try {
      const key = this.getCacheKey(type, userId, suffix);
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        userId,
        version: this.version
      };
      
      await localforage.setItem(key, entry);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  // Limpar cache de um usuário específico
  async clearUserCache(userId: string): Promise<void> {
    try {
      const keys = await localforage.keys();
      const userPrefix = `${this.version}:`;
      
      const keysToRemove = keys.filter(key => 
        key.startsWith(userPrefix) && key.includes(`:${userId}`)
      );
      
      await Promise.all(keysToRemove.map(key => localforage.removeItem(key)));
      console.log(`Cache cleared for user ${userId}`);
    } catch (error) {
      console.error('Clear user cache error:', error);
    }
  }

  // Limpar todo o cache (logout)
  async clearAll(): Promise<void> {
    try {
      await localforage.clear();
      this.currentUserId = null;
      console.log('All cache cleared');
    } catch (error) {
      console.error('Clear all cache error:', error);
    }
  }

  // Obter múltiplas páginas de uma lista (para paginação)
  async getList<T>(type: string, userId: string, pages: number[]): Promise<T[]> {
    try {
      const results = await Promise.all(
        pages.map(page => this.get<T[]>(type, userId, `page-${page}`))
      );
      
      // Filtrar nulls e mesclar todas as páginas
      return results
        .filter((page): page is T[] => page !== null)
        .flat();
    } catch (error) {
      console.error('Cache getList error:', error);
      return [];
    }
  }

  // Salvar página de uma lista
  async setListPage<T>(type: string, userId: string, page: number, data: T[]): Promise<void> {
    await this.set(type, userId, data, `page-${page}`);
  }

  // Verificar se tem dados em cache (para evitar skeleton)
  async hasCache(type: string, userId: string, suffix?: string): Promise<boolean> {
    const data = await this.get(type, userId, suffix);
    return data !== null;
  }
}

export const cacheService = new CacheService();
