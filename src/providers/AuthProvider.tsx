import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface ProfileData {
  telefono: string | null;
  profile_complete: boolean;
  plan: string;
  user_id: string;
  phone_personal: string | null;
  phone_empresa: string | null;
  display_name: string | null;
  entidad: string;
  usuario_profile_complete: boolean;
  email: string | null;
  whatsapp_configured: boolean;
  created_at: string | null;
  updated_at: string | null;
  avatar_url: string | null;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: ProfileData | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isAuthenticated: boolean;
  isPro: boolean;
  hasPhone: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string): Promise<ProfileData | null> => {
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
      );
      
      const fetchPromise = Promise.all([
        supabase
          .from('profiles')
          .select('user_id, plan, profile_complete, phone_personal, phone_empresa, display_name, entidad, whatsapp_configured, created_at, updated_at, avatar_url, email')
          .eq('user_id', userId)
          .maybeSingle(),
        supabase
          .from('usuarios')
          .select('telefono, profile_complete')
          .eq('user_id', userId)
          .maybeSingle()
      ]);
      
      const [profileResult, usuarioResult] = await Promise.race([
        fetchPromise,
        timeoutPromise
      ]) as any;

      if (profileResult.error && profileResult.error.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileResult.error);
        return null;
      }

      const profileData = profileResult.data;
      const usuarioData = usuarioResult.data;

      return {
        telefono: usuarioData?.telefono || null,
        profile_complete: profileData?.profile_complete || false,
        plan: profileData?.plan || 'free',
        user_id: userId,
        phone_personal: profileData?.phone_personal || null,
        phone_empresa: profileData?.phone_empresa || null,
        display_name: profileData?.display_name || null,
        entidad: profileData?.entidad || 'personal',
        usuario_profile_complete: usuarioData?.profile_complete || false,
        email: profileData?.email || null,
        whatsapp_configured: profileData?.whatsapp_configured || false,
        created_at: profileData?.created_at || null,
        updated_at: profileData?.updated_at || null,
        avatar_url: profileData?.avatar_url || null,
      };
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  const checkSubscriptionStatus = async () => {
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Session timeout')), 5000)
      );
      
      const sessionPromise = supabase.auth.getSession();
      const { data: { session }, error: sessionError } = await Promise.race([
        sessionPromise, 
        timeoutPromise
      ]) as any;
      
      if (sessionError || !session) return;

      const checkTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Subscription check timeout')), 10000)
      );
      
      const checkPromise = supabase.functions.invoke("check-subscription", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      await Promise.race([checkPromise, checkTimeout]);
      
      if (session.user) {
        const updatedProfile = await fetchProfile(session.user.id);
        if (updatedProfile) {
          setProfile(updatedProfile);
        }
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      const updatedProfile = await fetchProfile(user.id);
      setProfile(updatedProfile);
    }
  };

  useEffect(() => {
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Clear all caches when user changes (login/logout/switch account)
      const previousUserId = localStorage.getItem('tm_current_user_id');
      const currentUserId = session?.user?.id || null;
      
      if (previousUserId !== currentUserId) {
        // User changed - clear all cached data
        console.log('[AuthProvider] User changed, clearing caches');
        localStorage.removeItem('tm_phone');
        localStorage.removeItem('tm_nombre');
        localStorage.removeItem('tm_movimientos_cache');
        localStorage.removeItem('tm_all_movimientos_cache');
        localStorage.removeItem('tm_show_balance');
        sessionStorage.removeItem('profilePopupShown');
        
        // Update current user id
        if (currentUserId) {
          localStorage.setItem('tm_current_user_id', currentUserId);
        } else {
          localStorage.removeItem('tm_current_user_id');
        }
      }

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        setTimeout(() => {
          fetchProfile(session.user!.id).then(profileData => {
            setProfile(profileData);
            if (profileData) {
              setTimeout(() => checkSubscriptionStatus(), 0);
            }
            setLoading(false);
          });
        }, 0);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      // Check if this is a different user than cached
      const previousUserId = localStorage.getItem('tm_current_user_id');
      const currentUserId = session?.user?.id || null;
      
      if (previousUserId && currentUserId && previousUserId !== currentUserId) {
        // Different user logged in - clear caches
        console.log('[AuthProvider] Different user detected on load, clearing caches');
        localStorage.removeItem('tm_phone');
        localStorage.removeItem('tm_nome');
        localStorage.removeItem('tm_movimientos_cache');
        localStorage.removeItem('tm_all_movimientos_cache');
        sessionStorage.removeItem('profilePopupShown');
      }
      
      if (currentUserId) {
        localStorage.setItem('tm_current_user_id', currentUserId);
      }

      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).then(profileData => {
          setProfile(profileData);
          if (profileData) {
            setTimeout(() => checkSubscriptionStatus(), 0);
          }
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      // Clear ALL user-specific data
      localStorage.removeItem('tm_phone');
      localStorage.removeItem('tm_nombre');
      localStorage.removeItem('tm_movimientos_cache');
      localStorage.removeItem('tm_all_movimientos_cache');
      localStorage.removeItem('tm_show_balance');
      localStorage.removeItem('app.activeTab');
      localStorage.removeItem('tm_current_user_id');
      sessionStorage.removeItem('profilePopupShown');
      
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  const isPro = profile?.plan === 'pro' || profile?.plan === 'mensal' || profile?.plan === 'anual';
  const hasPhone = !!profile?.telefono && profile.telefono.trim() !== '';

  const value: AuthContextValue = {
    user,
    session,
    profile,
    loading,
    signOut,
    refreshProfile,
    isAuthenticated: !!session,
    isPro,
    hasPhone
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
