import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { syncUserProfile } from "@/lib/syncUserProfile";

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

      if (session?.user) {
        // Defer sync and profile fetch to avoid deadlocks
        setTimeout(async () => {
          await performSync();
          fetchProfile(session.user!.id);
        }, 0);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    // Then get the initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await performSync();
        fetchProfile(session.user.id);
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
    
    await supabase.auth.signOut();
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