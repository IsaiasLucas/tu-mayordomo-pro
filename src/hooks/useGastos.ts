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

      // Get user profile to get phone number
      const { data: profile } = await supabase
        .from('profiles')
        .select('phone_personal, phone_empresa')
        .eq('user_id', user.id)
        .maybeSingle();

      const d = new Date();
      const ym = mes || `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      
      // Verificar cache primeiro
      const cached = gastosCache.get(ym);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setItems(cached.data);
        setLoading(false);
        return;
      }
      
      // Buscar gastos del mes específico por user_id
      const { startISO, endISO } = monthRangeUTCFromSantiago(ym);
      
      // Query principal: buscar por user_id
      let query = supabase
        .from('gastos')
        .select('*')
        .eq('user_id', user.id)
        .gte('fecha', ym + '-01')
        .lte('fecha', ym + '-31')
        .order('fecha', { ascending: false });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      
      const gastos = data || [];
      
      // Se tiver telefone e não encontrou gastos, buscar por telefone também
      if (gastos.length === 0 && profile) {
        const phoneToSearch = profile.phone_personal || profile.phone_empresa;
        if (phoneToSearch) {
          const normalizedPhone = phoneToSearch.replace(/[^0-9]/g, '');
          
          // Buscar todos os gastos sem filtro de RLS (via função ou API pública)
          const { data: gastosByPhone } = await supabase
            .from('gastos')
            .select('*')
            .eq('telefono', normalizedPhone)
            .gte('fecha', ym + '-01')
            .lte('fecha', ym + '-31')
            .order('fecha', { ascending: false });
          
          if (gastosByPhone && gastosByPhone.length > 0) {
            // Vincular esses gastos ao user_id
            const gastosIds = gastosByPhone.map(g => g.id);
            await supabase
              .from('gastos')
              .update({ user_id: user.id })
              .in('id', gastosIds);
            
            gastos.push(...gastosByPhone);
          }
        }
      }
      
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