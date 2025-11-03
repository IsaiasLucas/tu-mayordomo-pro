import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useSWR } from "./useSWR";

export function useReportes() {
  const { user } = useAuth();

  const { data, error, isValidating, isRevalidating, revalidate, mutate } = useSWR(
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
      .channel(`reportes-realtime-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reportes',
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

  return {
    items: data || [],
    loading: isValidating && !data,
    isRevalidating,
    error,
    refetch: revalidate,
  };
}