import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { syncUserProfile } from "@/lib/syncUserProfile";
import { cacheService } from "@/lib/cacheService";
import { prefetch } from "./useSWR";
import { getCurrentMonthKey } from "@/lib/date-config";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    // Listen for auth changes FIRST to avoid missing events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      // Configurar userId no cache service
      cacheService.setUserId(session?.user?.id || null);

      if (session?.user) {
        // Defer sync and profile fetch to avoid deadlocks
        setTimeout(async () => {
          await performSync();
          await fetchProfile(session.user!.id);
          
          // Prefetch dados críticos após SIGNED_IN
          if (event === 'SIGNED_IN') {
            performPrefetch(session.user!.id);
          }
          
          // Redirigir a home si estamos en callback o auth
          if (window.location.pathname === '/auth/callback' || window.location.pathname === '/auth') {
            window.location.replace('/inicio');
          }
        }, 0);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    // Then get the initial session (boot con sesión válida)
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Configurar userId no cache service
      cacheService.setUserId(session?.user?.id || null);
      
      if (session?.user) {
        await performSync();
        await fetchProfile(session.user.id);
        // Prefetch no boot
        performPrefetch(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const performSync = async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      await syncUserProfile();
    } catch (error) {
      console.error('Error syncing profile:', error);
    } finally {
      setSyncing(false);
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
        
        // Check subscription status only - removed sync from sheets
        setTimeout(() => {
          checkSubscriptionStatus();
        }, 0);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkSubscriptionStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await supabase.functions.invoke("check-subscription", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      // Refresh profile after check
      if (session.user) {
        const { data: updatedProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();
        
        if (updatedProfile) {
          setProfile(updatedProfile);
        }
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const signOut = async () => {
    // Clear all localStorage and sessionStorage data on logout
    localStorage.removeItem('tm_phone');
    localStorage.removeItem('tm_nombre');
    localStorage.removeItem('tm_movimientos_cache');
    localStorage.removeItem('tm_all_movimientos_cache');
    localStorage.removeItem('tm_show_balance');
    localStorage.removeItem('telefono'); // Remove old phone storage
    sessionStorage.removeItem('profilePopupShown');
    
    // Clear profile cache
    const { clearProfileCache } = await import('@/hooks/useProfile');
    clearProfileCache();
    
    // Limpar cache persistente
    await cacheService.clearAll();
    
    await supabase.auth.signOut();
  };

  // Função para fazer prefetch dos dados críticos
  const performPrefetch = async (userId: string) => {
    const mesAtual = getCurrentMonthKey();
    
    // Prefetch gastos do mês atual
    prefetch(`gastos-${userId}-${mesAtual}`, async () => {
      const [year, month] = mesAtual.split('-').map(Number);
      const lastDay = new Date(year, month, 0);
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;
      
      const { data } = await supabase
        .from('gastos')
        .select('*')
        .eq('user_id', userId)
        .gte('fecha', startDate)
        .lte('fecha', endDate)
        .order('fecha', { ascending: false });
      return data || [];
    });
    
    // Prefetch reportes
    prefetch(`reportes-${userId}`, async () => {
      const { data } = await supabase
        .from('reportes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);
      return data || [];
    });
    
    // Prefetch profile
    prefetch(`perfil-${userId}`, async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      return data;
    });
  };

  return {
    user,
    session,
    profile,
    loading,
    signOut,
    isAuthenticated: !!session,
    syncProfile: performSync
  };
};