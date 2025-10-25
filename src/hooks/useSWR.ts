import { useState, useEffect, useCallback, useRef } from 'react';
import { cacheService } from '@/lib/cacheService';

interface SWROptions {
  revalidateOnMount?: boolean;
  dedupingInterval?: number;
  revalidateOnFocus?: boolean;
}

interface SWRState<T> {
  data: T | null;
  error: Error | null;
  isValidating: boolean;
  isRevalidating: boolean; // Novo: indica revalidação em background
}

// Cache de promises em memória para deduplicação
const promiseCache = new Map<string, Promise<any>>();
const lastFetchTime = new Map<string, number>();

export function useSWR<T>(
  key: string | null,
  fetcher: () => Promise<T>,
  options: SWROptions = {}
): SWRState<T> & { 
  revalidate: () => void; 
  mutate: (data: T) => void;
} {
  const {
    revalidateOnMount = false,
    dedupingInterval = 2000,
    revalidateOnFocus = true
  } = options;

  const [state, setState] = useState<SWRState<T>>({
    data: null,
    error: null,
    isValidating: false,
    isRevalidating: false
  });

  const fetcherRef = useRef(fetcher);
  const isMountedRef = useRef(true);
  const hasLoadedFromCacheRef = useRef(false);

  // Atualizar fetcher ref
  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  // Função para carregar do cache
  const loadFromCache = useCallback(async (cacheKey: string) => {
    if (!key) return null;
    
    // Extrair tipo e userId da key (formato: tipo-userId-...)
    const parts = key.split('-');
    if (parts.length < 2) return null;
    
    const type = parts[0];
    const userId = parts[1];
    const suffix = parts.slice(2).join('-') || undefined;
    
    try {
      const cached = await cacheService.get<T>(type, userId, suffix);
      if (cached && isMountedRef.current) {
        setState(prev => ({ ...prev, data: cached, isValidating: false }));
        hasLoadedFromCacheRef.current = true;
        return cached;
      }
    } catch (error) {
      console.error('Error loading from cache:', error);
    }
    
    return null;
  }, [key]);

  // Função para salvar no cache
  const saveToCache = useCallback(async (data: T) => {
    if (!key) return;
    
    const parts = key.split('-');
    if (parts.length < 2) return;
    
    const type = parts[0];
    const userId = parts[1];
    const suffix = parts.slice(2).join('-') || undefined;
    
    try {
      await cacheService.set(type, userId, data, suffix);
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  }, [key]);

  // Função principal de fetch com revalidação
  const fetchData = useCallback(async (isRevalidation = false) => {
    if (!key) return;

    const now = Date.now();
    const lastFetch = lastFetchTime.get(key);

    // Deduplicação: se já há um fetch recente, reutilizar
    if (lastFetch && now - lastFetch < dedupingInterval) {
      const cachedPromise = promiseCache.get(key);
      if (cachedPromise) {
        return cachedPromise;
      }
    }

    // Atualizar estado de loading
    if (!isMountedRef.current) return;
    
    setState(prev => ({
      ...prev,
      isValidating: !isRevalidation,
      isRevalidating: isRevalidation,
      error: null
    }));

    // Criar nova promise
    const promise = fetcherRef.current()
      .then(async (data) => {
        if (!isMountedRef.current) return;

        // Salvar no cache
        await saveToCache(data);

        setState({
          data,
          error: null,
          isValidating: false,
          isRevalidating: false
        });
        
        return data;
      })
      .catch((error) => {
        if (!isMountedRef.current) return;

        setState(prev => ({
          ...prev,
          error,
          isValidating: false,
          isRevalidating: false
        }));
        
        throw error;
      })
      .finally(() => {
        promiseCache.delete(key);
      });

    // Cachear promise
    promiseCache.set(key, promise);
    lastFetchTime.set(key, now);

    return promise;
  }, [key, dedupingInterval, saveToCache]);

  // Revalidar manualmente
  const revalidate = useCallback(() => {
    fetchData(hasLoadedFromCacheRef.current);
  }, [fetchData]);

  // Mutate: atualizar dados localmente
  const mutate = useCallback((data: T) => {
    setState(prev => ({ ...prev, data }));
    saveToCache(data);
  }, [saveToCache]);

  // Efeito principal: carregar do cache e depois revalidar
  useEffect(() => {
    if (!key) return;

    isMountedRef.current = true;
    hasLoadedFromCacheRef.current = false;

    // 1. Tentar carregar do cache primeiro (offline-first)
    loadFromCache(key).then((cached) => {
      if (!isMountedRef.current) return;
      
      // 2. Revalidar em background se necessário
      if (revalidateOnMount || !cached) {
        fetchData(!!cached);
      }
    });

    return () => {
      isMountedRef.current = false;
    };
  }, [key, loadFromCache, fetchData, revalidateOnMount]);

  // Revalidar ao voltar ao foco
  useEffect(() => {
    if (!revalidateOnFocus || !key) return;

    const handleFocus = () => {
      if (hasLoadedFromCacheRef.current) {
        fetchData(true); // Revalidação em background
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        handleFocus();
      }
    });

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [key, revalidateOnFocus, fetchData]);

  return {
    ...state,
    revalidate,
    mutate
  };
}

// Função auxiliar para prefetch
export async function prefetch<T>(key: string, fetcher: () => Promise<T>): Promise<void> {
  // Extrair tipo e userId
  const parts = key.split('-');
  if (parts.length < 2) return;
  
  const type = parts[0];
  const userId = parts[1];
  const suffix = parts.slice(2).join('-') || undefined;

  try {
    // Verificar se já tem em cache válido
    const hasCache = await cacheService.hasCache(type, userId, suffix);
    if (hasCache) return;

    // Buscar e cachear
    const data = await fetcher();
    await cacheService.set(type, userId, data, suffix);
  } catch (error) {
    console.error('Prefetch error:', error);
  }
}

// Limpar cache específico
export async function clearCache(key?: string): Promise<void> {
  if (!key) {
    await cacheService.clearAll();
    return;
  }

  const parts = key.split('-');
  if (parts.length < 2) return;
  
  const type = parts[0];
  const userId = parts[1];
  const suffix = parts.slice(2).join('-') || undefined;

  // Limpar do cache persistente
  await cacheService.set(type, userId, null as any, suffix);
  
  // Limpar da memória
  promiseCache.delete(key);
  lastFetchTime.delete(key);
}
