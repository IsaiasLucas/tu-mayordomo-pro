import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';

interface AuthGuardState {
  isHydrating: boolean;
  isAuthorized: boolean;
  isAuthenticated: boolean;
  isPro: boolean;
  profile: any;
}

/**
 * Global auth/plan gate - ensures routes wait for auth/plan state
 * Returns null for isAuthorized until hydration completes
 */
export const useAuthGuard = () => {
  const { isAuthenticated, loading: authLoading, user, session } = useAuth();
  const { profile, loading: profileLoading, isPro } = useProfile();
  
  const [state, setState] = useState<AuthGuardState>({
    isHydrating: true,
    isAuthorized: false,
    isAuthenticated: false,
    isPro: false,
    profile: null,
  });

  useEffect(() => {
    // Only mark as hydrated when both auth AND profile are loaded
    const isHydrating = authLoading || profileLoading;
    const isAuthorized = !isHydrating && isAuthenticated;

    setState({
      isHydrating,
      isAuthorized,
      isAuthenticated,
      isPro,
      profile,
    });
  }, [authLoading, profileLoading, isAuthenticated, isPro, profile]);

  return state;
};
