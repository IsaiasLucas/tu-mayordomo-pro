import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { useActiveTab, ActiveTab } from "@/store/appState";
const Index = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, refreshProfile } = useProfile();
  const { activeTab, setActiveTab } = useActiveTab();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const navigate = useNavigate();
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Removed URL sync: single source of truth is global app.activeTab

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
    const set = () => setActiveTab(view as ActiveTab);
    // @ts-ignore - experimental API
    const startVT = (document as any).startViewTransition;
    if (typeof startVT === 'function') {
      startVT(set);
    } else {
      set();
    }
  };
  const handleModalClose = async () => {
    setShowProfileModal(false);
    // Refresh profile after modal closes
    await refreshProfile();
  };

  const renderCurrentView = () => {
    switch (activeTab) {
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
        return (
          <ViewTransition viewKey="reportes">
            <ReportesView />
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
      <Navigation />
      
      <main key={activeTab} className="pb-24" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
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
