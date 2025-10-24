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
  const validViews = new Set(["inicio", "gastos", "reportes", "planes", "perfil"]);

  // Debug: Log current view changes
  useEffect(() => {
    console.log('📍 Current view changed to:', currentView);
  }, [currentView]);

  // Sync currentView with URL ?tab= param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && validViews.has(tab) && tab !== currentView) {
      console.log('🔗 Syncing currentView from URL:', tab);
      setCurrentView(tab);
    }
  }, [location.search]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, authLoading, navigate]);

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
    console.log('🔄 handleViewChange called with:', view);
    console.log('Current isPro status:', isPro);
    
    // Guard for Reportes - redirect immediately to Planes if not pro
    const target = view === "reportes" && !isPro ? "planes" : view;
    console.log('Target view after guard:', target);

    // Use View Transitions API if available for seamless swaps
    const nav = () => {
      console.log('Setting currentView to:', target);
      const nextSearch = `?tab=${target}`;
      if (location.search !== nextSearch) {
        navigate({ pathname: location.pathname, search: nextSearch }, { replace: false });
      }
      setCurrentView(target);
    };
    // @ts-ignore - experimental API
    const startVT = (document as any).startViewTransition;
    if (typeof startVT === 'function') {
      console.log('Using View Transition API');
      startVT(nav);
    } else {
      console.log('Fallback: Direct state update');
      nav();
    }
  };
  const handleModalClose = async () => {
    setShowProfileModal(false);
    // Refresh profile after modal closes
    await refreshProfile();
  };

  const renderCurrentView = () => {
    console.log('🎬 renderCurrentView called with currentView:', currentView);
    
    switch (currentView) {
      case "inicio":
        console.log('🏠 Rendering InicioView');
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
        console.log('💰 Rendering GastosView');
        return (
          <ViewTransition viewKey="gastos">
            <GastosView profile={profile} />
          </ViewTransition>
        );
      case "reportes":
        console.log('📊 Rendering ReportesView (isPro:', isPro, ')');
        // This should never render for non-pro due to guard; render Planes when not pro without state changes
        return (
          <ViewTransition viewKey="reportes">
            {isPro ? <ReportesView /> : <PlanesView />}
          </ViewTransition>
        );
      case "planes":
        console.log('👑 Rendering PlanesView');
        return (
          <ViewTransition viewKey="planes">
            <PlanesView />
          </ViewTransition>
        );
      case "perfil":
        console.log('👤 Rendering PerfilView');
        return (
          <ViewTransition viewKey="perfil">
            <PerfilView onViewChange={handleViewChange} />
          </ViewTransition>
        );
      default:
        console.log('❓ Default case, rendering InicioView');
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
      
      <main className="pb-24" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
        <div key={currentView} className="w-full">
          {renderCurrentView()}
        </div>
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
