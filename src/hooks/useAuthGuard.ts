import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';

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
  const { isAuthenticated, loading, profile, isPro } = useAuth();
  
  const [state, setState] = useState<AuthGuardState>({
    isHydrating: true,
    isAuthorized: false,
    isAuthenticated: false,
    isPro: false,
    profile: null,
  });

  useEffect(() => {
    const isHydrating = loading;
    const isAuthorized = !isHydrating && isAuthenticated;

    setState({
      isHydrating,
      isAuthorized,
      isAuthenticated,
      isPro,
      profile,
    });
  }, [loading, isAuthenticated, isPro, profile]);

  return state;
};
