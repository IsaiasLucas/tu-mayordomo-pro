import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { getCurrentDateInSantiago } from "@/lib/date-config";

export interface Movimiento {
  id: string;
  fecha: string;
  created_at: string;
  descripcion: string;
  monto: number;
  tipo: string;
  categoria: string;
  subtipo?: string;
  detalles?: string;
}

const movimientosCache = new Map<string, { data: Movimiento[]; timestamp: number }>();
const CACHE_DURATION = 5000; // 5 seconds

export function useMovimientos() {
  const { user } = useAuth();
  const [movimientos, setMovimientos] = useState<Movimiento[]>(() => {
    if (user) {
      const now = getCurrentDateInSantiago();
      const mes = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const cacheKey = `${user.id}-${mes}`;
      const cached = movimientosCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }
    }
    return [];
  });
  const [loading, setLoading] = useState(true);

  const fetchMovimientos = useCallback(async (showLoading = true) => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      if (showLoading) setLoading(true);
      
      const now = getCurrentDateInSantiago();
      const mes = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const cacheKey = `${user.id}-${mes}`;
      
      const cached = movimientosCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setMovimientos(cached.data);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('gastos')
        .select('*')
        .eq('user_id', user.id)
        .gte('fecha', `${mes}-01`)
        .lte('fecha', `${mes}-31`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const items = data || [];
      movimientosCache.set(cacheKey, { data: items, timestamp: Date.now() });
      setMovimientos(items);
    } catch (err) {
      console.error('Error fetching movimientos:', err);
      setMovimientos([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refetch = useCallback(() => {
    if (user) {
      const now = getCurrentDateInSantiago();
      const mes = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const cacheKey = `${user.id}-${mes}`;
      movimientosCache.delete(cacheKey);
    }
    return fetchMovimientos(false);
  }, [user, fetchMovimientos]);

  useEffect(() => {
    fetchMovimientos();

    // Setup realtime subscription
    const channel = supabase
      .channel('movimientos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'gastos'
        },
        (payload) => {
          if ((payload.new as any)?.user_id === user?.id || (payload.old as any)?.user_id === user?.id) {
            refetch();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMovimientos, refetch, user]);

  // Calculate totals
  const ingresos = movimientos
    .filter(m => m.tipo.toLowerCase() === "ingreso" || m.tipo.toLowerCase() === "receita")
    .reduce((sum, m) => sum + Number(m.monto || 0), 0);
  
  const egresos = movimientos
    .filter(m => m.tipo.toLowerCase() === "egreso" || m.tipo.toLowerCase() === "despesa" || m.tipo.toLowerCase() === "gasto")
    .reduce((sum, m) => sum + Number(m.monto || 0), 0);
  
  const saldo = ingresos - egresos;

  return { movimientos, loading, refetch, ingresos, egresos, saldo };
}
