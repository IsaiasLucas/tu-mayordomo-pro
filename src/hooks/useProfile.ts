import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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
}

let cachedProfile: ProfileData | null = null;
let profilePromise: Promise<ProfileData | null> | null = null;

export const useProfile = () => {
  const [profile, setProfile] = useState<ProfileData | null>(cachedProfile);
  const [loading, setLoading] = useState(!cachedProfile);

  useEffect(() => {
    const loadProfile = async () => {
      // If already loading, wait for it
      if (profilePromise) {
        const data = await profilePromise;
        setProfile(data);
        setLoading(false);
        return;
      }

      // Start loading
      profilePromise = fetchProfile();
      const data = await profilePromise;
      cachedProfile = data;
      setProfile(data);
      setLoading(false);
      profilePromise = null;
    };

    if (!cachedProfile) {
      loadProfile();
    }
  }, []);

  const fetchProfile = async (): Promise<ProfileData | null> => {
    try {
      // Add timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('User fetch timeout')), 5000)
      );
      
      const userPromise = supabase.auth.getUser();
      const { data: { user } } = await Promise.race([userPromise, timeoutPromise]) as any;
      
      if (!user) return null;

      // Fetch both profiles and usuarios in parallel with timeout
      const fetchTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile data fetch timeout')), 10000)
      );
      
      const fetchPromise = Promise.all([
        supabase
          .from('profiles')
          .select('user_id, plan, profile_complete, phone_personal, phone_empresa, display_name, entidad')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('usuarios')
          .select('telefono, profile_complete')
          .eq('user_id', user.id)
          .maybeSingle()
      ]);
      
      const [profileResult, usuarioResult] = await Promise.race([
        fetchPromise,
        fetchTimeout
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
        user_id: user.id,
        phone_personal: profileData?.phone_personal || null,
        phone_empresa: profileData?.phone_empresa || null,
        display_name: profileData?.display_name || null,
        entidad: profileData?.entidad || 'personal',
        usuario_profile_complete: usuarioData?.profile_complete || false
      };
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    setLoading(true);
    profilePromise = fetchProfile();
    const data = await profilePromise;
    cachedProfile = data;
    setProfile(data);
    setLoading(false);
    profilePromise = null;
  };

  return {
    profile,
    loading,
    refreshProfile,
    isPro: profile?.plan === 'pro' || profile?.plan === 'mensal' || profile?.plan === 'anual',
    hasPhone: !!profile?.telefono && profile.telefono.trim() !== ''
  };
};

// Clear cache on logout
export const clearProfileCache = () => {
  cachedProfile = null;
  profilePromise = null;
};
