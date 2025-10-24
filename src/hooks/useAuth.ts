import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    // Listen for auth changes FIRST to avoid missing events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Defer any Supabase calls to avoid deadlocks
        setTimeout(() => {
          if (mounted) {
            fetchProfile(session.user!.id);
          }
        }, 0);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    // Then get the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        setProfile(null);
      } else {
        setProfile(data);
        
        // Check subscription status only - removed sync from sheets
        if (data) {
          setTimeout(() => {
            checkSubscriptionStatus().catch(err => {
              console.error('Subscription check failed:', err);
            });
          }, 0);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const checkSubscriptionStatus = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error('Session error:', sessionError);
        return;
      }

      const { error: invokeError } = await supabase.functions.invoke("check-subscription", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (invokeError) {
        console.error('Check subscription error:', invokeError);
        return;
      }
      
      // Refresh profile after check
      if (session.user) {
        const { data: updatedProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();
        
        if (!profileError && updatedProfile) {
          setProfile(updatedProfile);
        }
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      // Don't throw - this is a background operation
    }
  };

  const signOut = async () => {
    try {
      // Clear all localStorage data on logout
      localStorage.removeItem('tm_phone');
      localStorage.removeItem('tm_nombre');
      localStorage.removeItem('tm_movimientos_cache');
      localStorage.removeItem('tm_all_movimientos_cache');
      localStorage.removeItem('tm_show_balance');
      localStorage.removeItem('app.activeTab');
      sessionStorage.removeItem('profilePopupShown');
      
      // Clear profile cache
      const { clearProfileCache } = await import('@/hooks/useProfile');
      clearProfileCache();
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      }
    } catch (error) {
      console.error('Error during sign out:', error);
      // Continue with signout even if there's an error
    }
  };

  return {
    user,
    session,
    profile,
    loading,
    signOut,
    isAuthenticated: !!session
  };
};