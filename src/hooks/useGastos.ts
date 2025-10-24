import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { monthRangeUTCFromSantiago } from "@/lib/date-config";

// Cache simples para gastos
const gastosCache = new Map<string, { data: any[], timestamp: number }>();
const CACHE_DURATION = 30000; // 30 segundos

export function useGastos(mes?: string) {
  const [items, setItems] = useState<any[]>(() => {
    const d = new Date();
    const ym = mes || `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const cached = gastosCache.get(ym);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return [];
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchGastos = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const d = new Date();
      const ym = mes || `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      
      // Verificar cache primeiro
      const cached = gastosCache.get(ym);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setItems(cached.data);
        setLoading(false);
        return;
      }
      
      // Buscar gastos del mes específico SIEMPRE por user_id
      const { data, error: fetchError } = await supabase
        .from('gastos')
        .select('*')
        .eq('user_id', user.id)
        .gte('fecha', ym + '-01')
        .lte('fecha', ym + '-31')
        .order('fecha', { ascending: false });

      if (fetchError) throw fetchError;
      
      const gastos = data || [];
      
      // Salvar no cache
      gastosCache.set(ym, { data: gastos, timestamp: Date.now() });
      setItems(gastos);
    } catch (err) {
      console.error('Error fetching gastos:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [mes]);

  useEffect(() => {
    fetchGastos();
  }, [fetchGastos]);

  return { items, loading, error, refetch: fetchGastos };
}