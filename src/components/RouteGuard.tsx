import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthGuard } from '@/hooks/useAuthGuard';

interface RouteGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  requirePro?: boolean;
  fallbackRoute?: string;
  /**
   * Keep previous view mounted while hydrating (prevents blank screen)
   */
  keepPreviousView?: boolean;
}

/**
 * Route guard that prevents rendering until auth/plan state is resolved
 * Redirects silently without showing intermediate screens
 */
export const RouteGuard = ({
  children,
  requireAuth = true,
  requirePro = false,
  fallbackRoute = '/auth',
  keepPreviousView = true,
}: RouteGuardProps) => {
  const navigate = useNavigate();
  const { isHydrating, isAuthorized, isAuthenticated, isPro } = useAuthGuard();

  useEffect(() => {
    // Don't redirect while hydrating
    if (isHydrating) return;

    // Check authentication
    if (requireAuth && !isAuthenticated) {
      navigate(fallbackRoute, { replace: true });
      return;
    }

    // Check PRO requirement - redirect silently to plans
    if (requirePro && !isPro) {
      navigate('/planes', { replace: true });
      return;
    }
  }, [isHydrating, isAuthorized, isAuthenticated, isPro, requireAuth, requirePro, navigate, fallbackRoute]);

  // While hydrating, either keep previous view or return null (no flash)
  if (isHydrating) {
    return keepPreviousView ? <>{children}</> : null;
  }

  // If not authorized, return null (navigation will handle redirect)
  if (requireAuth && !isAuthorized) {
    return null;
  }

  if (requirePro && !isPro) {
    return null;
  }

  return <>{children}</>;
};
