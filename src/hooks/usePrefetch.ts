import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { prefetch } from './useSWR';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentMonthKey } from '@/lib/date-config';

export function usePrefetch() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    // Prefetch gastos do mês atual
    const mesAtual = getCurrentMonthKey();
    prefetch(`gastos-${user.id}-${mesAtual}`, async () => {
      const [year, month] = mesAtual.split('-').map(Number);
      const lastDay = new Date(year, month, 0);
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;
      
      const { data } = await supabase
        .from('gastos')
        .select('*')
        .eq('user_id', user.id)
        .gte('fecha', startDate)
        .lte('fecha', endDate)
        .order('fecha', { ascending: false });
      return data || [];
    });

    // Prefetch reportes
    prefetch(`reportes-${user.id}`, async () => {
      const { data } = await supabase
        .from('reportes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      return data || [];
    });

    // Prefetch profile
    prefetch(`profile-${user.id}`, async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      return data;
    });

    // Prefetch usuarios
    prefetch(`usuarios-${user.id}`, async () => {
      const { data } = await supabase
        .from('usuarios')
        .select('*')
        .eq('user_id', user.id)
        .single();
      return data;
    });
  }, [user?.id]);
}
