import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useSWR } from "./useSWR";
import { getCurrentMonthKey } from "@/lib/date-config";

export function useGastos(mes?: string, page = 0) {
  const { user } = useAuth();
  const mesKey = mes || getCurrentMonthKey();
  const [hasMore, setHasMore] = useState(true);
  
  const PAGE_SIZE = 50;
  const offset = page * PAGE_SIZE;

  const { data, error, isValidating, revalidate } = useSWR(
    user?.id ? `gastos-${user.id}-${mesKey}-${page}` : null,
    async () => {
      if (!user?.id) return [];

      const ym = mesKey.substring(0, 7);
      const { data: fetchData, error: fetchError } = await supabase
        .from('gastos')
        .select('*')
        .eq('user_id', user.id)
        .gte('fecha', ym + '-01')
        .lte('fecha', ym + '-31')
        .order('fecha', { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

      if (fetchError) throw fetchError;

      setHasMore((fetchData?.length || 0) === PAGE_SIZE);
      return fetchData || [];
    },
    { revalidateOnMount: true }
  );

  const loadMore = useCallback(() => {
    // Retorna próxima página
    return page + 1;
  }, [page]);

  return {
    items: data || [],
    loading: isValidating && !data,
    error,
    refetch: revalidate,
    hasMore,
    loadMore,
  };
}
