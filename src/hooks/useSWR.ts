import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  isValidating: boolean;
}

const cache = new Map<string, CacheEntry<any>>();
const subscribers = new Map<string, Set<() => void>>();

const STALE_TIME = 30000; // 30s - dados considerados frescos
const CACHE_TIME = 300000; // 5min - tempo que dados ficam em cache

export function useSWR<T>(
  key: string | null,
  fetcher: () => Promise<T>,
  options: {
    revalidateOnMount?: boolean;
    dedupingInterval?: number;
  } = {}
) {
  const { revalidateOnMount = true, dedupingInterval = 2000 } = options;
  
  const [state, setState] = useState<{
    data: T | null;
    error: Error | null;
    isValidating: boolean;
  }>(() => {
    if (!key) return { data: null, error: null, isValidating: false };
    
    const cached = cache.get(key);
    if (cached) {
      return {
        data: cached.data,
        error: null,
        isValidating: cached.isValidating,
      };
    }
    return { data: null, error: null, isValidating: false };
  });

  const lastFetchRef = useRef<number>(0);
  const mountedRef = useRef(true);

  const revalidate = useCallback(async (force = false) => {
    if (!key) return;

    const now = Date.now();
    const cached = cache.get(key);

    // Deduplicação: não buscar se já buscou recentemente
    if (!force && now - lastFetchRef.current < dedupingInterval) {
      return;
    }

    // Se tem cache fresco e não é forçado, retorna cache
    if (!force && cached && now - cached.timestamp < STALE_TIME) {
      return;
    }

    // Marca como validando
    if (cached) {
      cached.isValidating = true;
      cache.set(key, cached);
    }

    if (mountedRef.current) {
      setState(prev => ({ ...prev, isValidating: true }));
    }

    lastFetchRef.current = now;

    try {
      const data = await fetcher();
      
      if (!mountedRef.current) return;

      cache.set(key, {
        data,
        timestamp: Date.now(),
        isValidating: false,
      });

      setState({ data, error: null, isValidating: false });
      
      // Notifica subscribers
      subscribers.get(key)?.forEach(cb => cb());

      // Auto-limpa cache antigo
      setTimeout(() => {
        const entry = cache.get(key);
        if (entry && Date.now() - entry.timestamp > CACHE_TIME) {
          cache.delete(key);
        }
      }, CACHE_TIME);
    } catch (error) {
      if (!mountedRef.current) return;
      
      setState(prev => ({
        ...prev,
        error: error as Error,
        isValidating: false,
      }));

      const cached = cache.get(key);
      if (cached) {
        cached.isValidating = false;
        cache.set(key, cached);
      }
    }
  }, [key, fetcher, dedupingInterval]);

  // Subscribe para mudanças no cache
  useEffect(() => {
    if (!key) return;

    const handleCacheUpdate = () => {
      const cached = cache.get(key);
      if (cached && mountedRef.current) {
        setState({
          data: cached.data,
          error: null,
          isValidating: cached.isValidating,
        });
      }
    };

    if (!subscribers.has(key)) {
      subscribers.set(key, new Set());
    }
    subscribers.get(key)!.add(handleCacheUpdate);

    return () => {
      subscribers.get(key)?.delete(handleCacheUpdate);
      if (subscribers.get(key)?.size === 0) {
        subscribers.delete(key);
      }
    };
  }, [key]);

  // Fetch inicial ou revalidação
  useEffect(() => {
    if (!key) return;

    const cached = cache.get(key);
    const now = Date.now();
    
    // Se tem cache e é fresco, usa cache
    if (cached && now - cached.timestamp < STALE_TIME) {
      if (mountedRef.current) {
        setState({
          data: cached.data,
          error: null,
          isValidating: false,
        });
      }
      // Revalida em background se configurado
      if (revalidateOnMount) {
        setTimeout(() => revalidate(), 0);
      }
    } else {
      // Sem cache ou stale: busca imediatamente
      revalidate();
    }
  }, [key, revalidateOnMount, revalidate]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    data: state.data,
    error: state.error,
    isValidating: state.isValidating,
    revalidate: () => revalidate(true),
    mutate: (data: T) => {
      if (!key) return;
      cache.set(key, {
        data,
        timestamp: Date.now(),
        isValidating: false,
      });
      setState({ data, error: null, isValidating: false });
      subscribers.get(key)?.forEach(cb => cb());
    },
  };
}

// Helper para prefetch
export function prefetch<T>(key: string, fetcher: () => Promise<T>) {
  const cached = cache.get(key);
  const now = Date.now();
  
  // Só prefetch se não tem cache ou está stale
  if (!cached || now - cached.timestamp > STALE_TIME) {
    fetcher().then(data => {
      cache.set(key, {
        data,
        timestamp: Date.now(),
        isValidating: false,
      });
    }).catch(() => {
      // Silencioso em prefetch
    });
  }
}

// Helper para limpar cache
export function clearCache(key?: string) {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}
