import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useGastos(telefono?: string, mes?: string) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!telefono) {
      setLoading(false);
      return;
    }

    const fetchGastos = async () => {
      try {
        setLoading(true);
        const d = new Date();
        const ym = mes || `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        
        // Buscar gastos del mes específico
        const startDate = `${ym}-01`;
        const endDate = new Date(parseInt(ym.split('-')[0]), parseInt(ym.split('-')[1]), 0).toISOString().split('T')[0];
        
        const { data, error: fetchError } = await (supabase as any)
          .from('gastos')
          .select('*')
          .eq('telefono', telefono)
          .gte('fecha', startDate)
          .lte('fecha', endDate)
          .order('fecha', { ascending: false });

        if (fetchError) throw fetchError;
        setItems(data || []);
      } catch (err) {
        console.error('Error fetching gastos:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGastos();
  }, [telefono, mes]);

  return { items, loading, error };
}