import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useSWR } from "./useSWR";
import { getCurrentMonthKey } from "@/lib/date-config";

export function useGastos(mes?: string) {
  const { user } = useAuth();
  const mesKey = mes || getCurrentMonthKey();

  const { data, error, isValidating, isRevalidating, revalidate, mutate } = useSWR(
    user?.id ? `gastos-all-${user.id}` : null,
    async () => {
      if (!user?.id) return [];

      const { data: fetchData, error: fetchError } = await supabase
        .from('gastos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching gastos:', fetchError);
        throw fetchError;
      }

      return fetchData || [];
    },
    { revalidateOnMount: true, revalidateOnFocus: true, revalidateInterval: 15000 }
  );

  // Keep a ref with the latest data to avoid stale closures inside realtime handler
  const dataRef = useRef<any[]>([]);
  useEffect(() => {
    dataRef.current = Array.isArray(data) ? (data as any[]) : [];
  }, [data]);

  // Set up realtime subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`gastos-realtime-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'gastos',
          filter: `user_id=eq.${user.id}`
        },
        (payload: any) => {
          const current = dataRef.current;
          if (payload.eventType === 'INSERT' && payload.new) {
            const updated = [payload.new, ...current.filter((r: any) => r.id !== payload.new.id)];
            mutate(updated);
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            const updated = current.map((r: any) => r.id === payload.new.id ? payload.new : r);
            mutate(updated);
          } else if (payload.eventType === 'DELETE' && payload.old) {
            const updated = current.filter((r: any) => r.id !== payload.old.id);
            mutate(updated);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, mutate]);

  const allItems = Array.isArray(data) ? (data as any[]) : [];
  const itemsForView = mesKey
    ? allItems.filter((m: any) => String(m.fecha ?? '').slice(0, 7) === mesKey)
    : allItems;

  return {
    items: itemsForView,
    loading: isValidating && !data,
    isRevalidating,
    error,
    refetch: revalidate,
  };
}
