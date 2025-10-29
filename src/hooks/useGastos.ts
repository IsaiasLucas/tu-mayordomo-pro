import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useSWR } from "./useSWR";
import { getCurrentMonthKey } from "@/lib/date-config";

export function useGastos(mes?: string) {
  const { user } = useAuth();
  const mesKey = mes || getCurrentMonthKey();

  const { data, error, isValidating, isRevalidating, revalidate } = useSWR(
    user?.id ? `gastos-${user.id}-${mesKey}` : null,
    async () => {
      if (!user?.id) return [];

      // Calcular primeiro e último dia do mês corretamente
      const [year, month] = mesKey.split('-').map(Number);
      const firstDay = new Date(year, month - 1, 1);
      const lastDay = new Date(year, month, 0);
      
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;

      const { data: fetchData, error: fetchError } = await supabase
        .from('gastos')
        .select('*')
        .eq('user_id', user.id)
        .gte('fecha', startDate)
        .lte('fecha', endDate)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching gastos:', fetchError);
        throw fetchError;
      }

      return fetchData || [];
    },
    { revalidateOnMount: true, revalidateOnFocus: true, revalidateInterval: 15000 }
  );

  // Set up realtime subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('gastos-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'gastos'
        },
        (payload: any) => {
          const affectedUser = payload?.new?.user_id ?? payload?.old?.user_id;
          if (affectedUser === user.id) {
            revalidate();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, revalidate]);

  return {
    items: data || [],
    loading: isValidating && !data,
    isRevalidating,
    error,
    refetch: revalidate,
  };
}
