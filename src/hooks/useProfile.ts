import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";

export interface ProfileData {
  user_id: string;
  email: string;
  phone_personal: string | null;
  phone_empresa: string | null;
  display_name: string | null;
  plan: string;
  entidad: string;
  whatsapp_configured: boolean;
}

const profileCache = new Map<string, { data: ProfileData | null; timestamp: number }>();
const CACHE_DURATION = 10000; // 10 seconds

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(() => {
    if (user) {
      const cached = profileCache.get(user.id);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (showLoading = true) => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      if (showLoading) setLoading(true);
      
      const cached = profileCache.get(user.id);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setProfile(cached.data);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, email, phone_personal, phone_empresa, display_name, plan, entidad, whatsapp_configured')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      
      profileCache.set(user.id, { data, timestamp: Date.now() });
      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refetch = useCallback(() => {
    if (user) {
      profileCache.delete(user.id);
    }
    return fetchProfile(false);
  }, [user, fetchProfile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const needsWhatsAppConfig = !profile?.phone_personal && !profile?.phone_empresa;

  return { profile, loading, refetch, needsWhatsAppConfig };
}
