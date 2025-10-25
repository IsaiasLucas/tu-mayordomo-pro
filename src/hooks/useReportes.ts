import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useSWR } from "./useSWR";

export function useReportes() {
  const { user } = useAuth();

  const { data, error, isValidating, isRevalidating, revalidate } = useSWR(
    user?.id ? `reportes-${user.id}` : null,
    async () => {
      if (!user?.id) return [];

      const { data: fetchData, error: fetchError } = await supabase
        .from('reportes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      return fetchData || [];
    },
    { revalidateOnMount: true, revalidateOnFocus: true }
  );

  return {
    items: data || [],
    loading: isValidating && !data, // Só mostra loading se não tem dados
    isRevalidating, // Novo: indica atualização em background
    error,
    refetch: revalidate,
  };
}