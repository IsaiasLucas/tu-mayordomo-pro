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
    prefetch(`gastos-${user.id}-${mesAtual}-0`, async () => {
      const { data } = await supabase
        .from('gastos')
        .select('*')
        .eq('user_id', user.id)
        .gte('fecha', mesAtual + '-01')
        .lte('fecha', mesAtual + '-31')
        .order('fecha', { ascending: false })
        .limit(50);
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
