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
  const { profile, loading: profileLoading, isPro, refreshProfile } = useProfile();
  const { activeTab, setActiveTab } = useActiveTab();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Cerrar teclado al cambiar de pestaña
  useEffect(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, [activeTab]);

  // Show loading skeleton while auth or profile are loading
  if (authLoading || profileLoading) {
    return (
      <div className="w-full h-full" style={{ 
        minHeight: '-webkit-fill-available',
        background: '#FFFFFF'
      }}>
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
    // Cerrar teclado al cambiar de vista
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setActiveTab(view as ActiveTab);
  };

  const handleModalClose = async () => {
    setShowProfileModal(false);
    await refreshProfile();
  };

  // Keep-alive: renderizar todas views, mostrar/esconder via CSS
  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden" style={{ 
      minHeight: '-webkit-fill-available',
      background: '#FFFFFF'
    }}>
      <Navigation isPro={isPro} />
      
      <main className="pb-24 bg-white" style={{ paddingBottom: 'max(6rem, calc(6rem + env(safe-area-inset-bottom)))' }} onClick={(e) => {
        // Cerrar teclado al tocar fuera de inputs
        const target = e.target as HTMLElement;
        if (!target.closest('input, textarea')) {
          document.activeElement instanceof HTMLElement && document.activeElement.blur();
        }
      }}>
        <ViewTransition isActive={activeTab === 'inicio'}>
          <InicioView 
            profile={profile}
            onOpenProfileModal={() => setShowProfileModal(true)} 
            onViewChange={handleViewChange} 
          />
        </ViewTransition>

        <ViewTransition isActive={activeTab === 'gastos'}>
          <GastosView profile={profile} />
        </ViewTransition>

        <ViewTransition isActive={activeTab === 'reportes'}>
          <ReportesView />
        </ViewTransition>

        <ViewTransition isActive={activeTab === 'planes'}>
          <PlanesView />
        </ViewTransition>

        <ViewTransition isActive={activeTab === 'perfil'}>
          <PerfilView onViewChange={handleViewChange} />
        </ViewTransition>
      </main>

      <CompleteProfileModal
        open={showProfileModal}
        onClose={handleModalClose}
      />
      
      <InstallPrompt />
      <div className="safe-area-fill" />
    </div>
  );
};

export default Index;
