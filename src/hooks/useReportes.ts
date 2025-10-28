import { useState, useEffect } from "react";
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

  // Set up realtime subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('reportes-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reportes',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('Reportes atualizado em tempo real');
          revalidate();
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