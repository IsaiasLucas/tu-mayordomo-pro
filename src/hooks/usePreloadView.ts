import { useEffect } from 'react';
import { prefetch } from './useSWR';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentMonthKey } from '@/lib/date-config';

/**
 * Hook para pré-carregar recursos de uma view antes dela ser exibida
 * Isso melhora a percepção de velocidade ao trocar de abas
 */
export const usePreloadView = (viewName: string) => {
  useEffect(() => {
    // Pré-carregar imagens ou recursos específicos da view
    if (viewName === 'reportes') {
      // Aqui poderia pré-carregar gráficos, ícones, etc
      const img = new Image();
      img.src = '/icon-512.png'; // Exemplo
    }
  }, [viewName]);
};

/**
 * Background prefetch all data for seamless tab switching
 * Preloads gastos and reportes data in the background
 */
export const usePreloadAllData = (userId: string | undefined) => {
  useEffect(() => {
    if (!userId) return;

    const preloadAllData = async () => {
      const mesKey = getCurrentMonthKey();
      
      // Prefetch all gastos for the user (global cache for all views)
      prefetch(`gastos-all-${userId}`, async () => {
        const { data } = await supabase
          .from('gastos')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        return data || [];
      });
      
      // Prefetch gastos (current month) for faster first paint when filtering by month
      prefetch(`gastos-${userId}-${mesKey}`, async () => {
        const [year, month] = mesKey.split('-').map(Number);
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

        const { data } = await supabase
          .from('gastos')
          .select('*')
          .eq('user_id', userId)
          .gte('fecha', startDate)
          .lte('fecha', endDate)
          .order('created_at', { ascending: false });

        return data || [];
      });

      // Prefetch reportes
      prefetch(`reportes-${userId}`, async () => {
        const { data } = await supabase
          .from('reportes')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        return data || [];
      });

      // Prefetch metas
      prefetch(`metas-${userId}`, async () => {
        const { data } = await supabase
          .from('metas')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        return data || [];
      });
    };

    // Initial prefetch after a short delay
    const timeoutId = setTimeout(preloadAllData, 500);

    return () => clearTimeout(timeoutId);
  }, [userId]);
};
