import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";

// Cache simples para reportes
const reportesCache = new Map<string, { data: any[], timestamp: number }>();
const CACHE_DURATION = 30000; // 30 segundos

export function useReportes() {
  const { user, profile } = useAuth();
  const [items, setItems] = useState<any[]>(() => {
    if (user) {
      const cached = reportesCache.get(user.id);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }
    }
    return [];
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchReportes = useCallback(async () => {
    if (!user || !profile?.phone_personal) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Verificar cache primeiro
      const cached = reportesCache.get(user.id);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setItems(cached.data);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('reportes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const reportes = data || [];
      // Salvar no cache
      reportesCache.set(user.id, { data: reportes, timestamp: Date.now() });
      setItems(reportes);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user, profile]);

  useEffect(() => {
    fetchReportes();
  }, [fetchReportes]);

  return { items, loading, error, refetch: fetchReportes };
}