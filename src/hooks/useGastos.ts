import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useSWR } from "./useSWR";
import { getCurrentMonthKey } from "@/lib/date-config";

export function useGastos(mes?: string) {
  const { user } = useAuth();
  const mesKey = mes || getCurrentMonthKey();

  const { data, error, isValidating, revalidate } = useSWR(
    user?.id ? `gastos-${user.id}-${mesKey}` : null,
    async () => {
      if (!user?.id) return [];

      // Calcular primeiro e último dia do mês corretamente
      const [year, month] = mesKey.split('-').map(Number);
      const firstDay = new Date(year, month - 1, 1);
      const lastDay = new Date(year, month, 0);
      
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;

      console.log('Fetching gastos:', { user_id: user.id, startDate, endDate });

      const { data: fetchData, error: fetchError } = await supabase
        .from('gastos')
        .select('*')
        .eq('user_id', user.id)
        .gte('fecha', startDate)
        .lte('fecha', endDate)
        .order('fecha', { ascending: false });

      if (fetchError) {
        console.error('Error fetching gastos:', fetchError);
        throw fetchError;
      }

      console.log('Gastos fetched:', fetchData?.length, 'items');
      return fetchData || [];
    },
    { revalidateOnMount: true }
  );

  return {
    items: data || [],
    loading: isValidating && !data,
    error,
    refetch: revalidate,
  };
}
