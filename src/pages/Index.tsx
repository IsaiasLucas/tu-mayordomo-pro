import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import Navigation from "@/components/Navigation";
import InicioView from "@/components/views/InicioView";
import GastosView from "@/components/views/GastosView";
import ReportesView from "@/components/views/ReportesView";
import PlanesView from "@/components/views/PlanesView";
import PerfilView from "@/components/views/PerfilView";
import CompleteProfileModal from "@/components/CompleteProfileModal";
import InstallPrompt from "@/components/InstallPrompt";
import { ViewTransition } from "@/components/ViewTransition";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, isPro, refreshProfile } = useProfile();
  const [currentView, setCurrentView] = useState("inicio");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Sync currentView with ?tab= in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    const allowed = ['inicio','gastos','reportes','planes','perfil'];
    if (tab && allowed.includes(tab) && tab !== currentView) {
      setCurrentView(tab);
    }
  }, [location.search]);

  // Show loading skeleton while auth or profile are loading
  if (authLoading || profileLoading) {
    return (
      <div className="w-full bg-background" style={{ minHeight: 'calc(var(--vh, 1vh) * 100)' }}>
        <div className="px-6 py-6 pb-32 space-y-6">
          <Skeleton className="h-36 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
          <div className="grid grid-cols-2 gap-5">
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-56 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  const handleViewChange = (view: string) => {
    // Guard for Reportes - redirect immediately to Planes if not pro
    const target = view === "reportes" && !isPro ? "planes" : view;

    try { console.log('[Index] handleViewChange', { view, target, isPro }); } catch {}

  // Use View Transitions API if available for seamless swaps
  const nav = () => {
    setCurrentView(target);
    try { navigate(`${location.pathname}?tab=${target}`, { replace: true }); } catch {}
  };
  // @ts-ignore - experimental API
  const startVT = (document as any).startViewTransition;
  if (typeof startVT === 'function') {
    startVT(nav);
  } else {
    nav();
  }
  };
  const handleModalClose = async () => {
    setShowProfileModal(false);
    // Refresh profile after modal closes
    await refreshProfile();
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "inicio":
        return (
          <ViewTransition viewKey="inicio">
            <InicioView 
              profile={profile}
              onOpenProfileModal={() => setShowProfileModal(true)} 
              onViewChange={handleViewChange} 
            />
          </ViewTransition>
        );
      case "gastos":
        return (
          <ViewTransition viewKey="gastos">
            <GastosView profile={profile} />
          </ViewTransition>
        );
      case "reportes":
        // This should never render for non-pro due to guard; render Planes when not pro without state changes
        return (
          <ViewTransition viewKey="reportes">
            {isPro ? <ReportesView /> : <PlanesView />}
          </ViewTransition>
        );
      case "planes":
        return (
          <ViewTransition viewKey="planes">
            <PlanesView />
          </ViewTransition>
        );
      case "perfil":
        return (
          <ViewTransition viewKey="perfil">
            <PerfilView onViewChange={handleViewChange} />
          </ViewTransition>
        );
      default:
        return (
          <ViewTransition viewKey="inicio">
            <InicioView 
              profile={profile}
              onOpenProfileModal={() => setShowProfileModal(true)} 
              onViewChange={handleViewChange} 
            />
          </ViewTransition>
        );
    }
  };

  return (
    <div className="w-full bg-background overflow-y-auto overflow-x-hidden" style={{ minHeight: 'calc(var(--vh, 1vh) * 100)' }}>
      <Navigation
        currentView={currentView}
        onViewChange={handleViewChange}
        isPro={isPro}
      />
      
      <main key={currentView} className="pb-24" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
        {renderCurrentView()}
      </main>

      <CompleteProfileModal
        open={showProfileModal}
        onClose={handleModalClose}
      />
      
      <InstallPrompt />
    </div>
  );
};

export default Index;
