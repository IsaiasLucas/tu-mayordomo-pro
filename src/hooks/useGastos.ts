import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useGastos(mes?: string) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchGastos = async () => {
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
        
        // Buscar gastos del mes específico por user_id
        const startDate = `${ym}-01`;
        const endDate = new Date(parseInt(ym.split('-')[0]), parseInt(ym.split('-')[1]), 0).toISOString().split('T')[0];
        
        const { data, error: fetchError } = await supabase
          .from('gastos')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', startDate)
          .lte('created_at', endDate)
          .order('created_at', { ascending: false });

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
  }, [mes]);

  return { items, loading, error };
}