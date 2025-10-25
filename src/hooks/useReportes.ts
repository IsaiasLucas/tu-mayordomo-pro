import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useSWR } from "./useSWR";

export function useReportes(page = 0) {
  const { user } = useAuth();
  const [hasMore, setHasMore] = useState(true);
  
  const PAGE_SIZE = 20;
  const offset = page * PAGE_SIZE;

  const { data, error, isValidating, revalidate } = useSWR(
    user?.id ? `reportes-${user.id}-${page}` : null,
    async () => {
      if (!user?.id) return [];

      const { data: fetchData, error: fetchError } = await supabase
        .from('reportes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

      if (fetchError) throw fetchError;

      setHasMore((fetchData?.length || 0) === PAGE_SIZE);
      return fetchData || [];
    },
    { revalidateOnMount: true }
  );

  const loadMore = useCallback(() => {
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