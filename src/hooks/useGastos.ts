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

      // Calcular primeiro e último dia do mês corretamente
      const [year, month] = mesKey.split('-').map(Number);
      const firstDay = new Date(year, month - 1, 1);
      const lastDay = new Date(year, month, 0);
      
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;

      console.log('Fetching gastos:', { user_id: user.id, startDate, endDate, page, offset });

      const { data: fetchData, error: fetchError } = await supabase
        .from('gastos')
        .select('*')
        .eq('user_id', user.id)
        .gte('fecha', startDate)
        .lte('fecha', endDate)
        .order('fecha', { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

      if (fetchError) {
        console.error('Error fetching gastos:', fetchError);
        throw fetchError;
      }

      console.log('Gastos fetched:', fetchData?.length, 'items');
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
