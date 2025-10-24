import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import Navigation from "@/components/Navigation";
import InicioView from "@/components/views/InicioView";
import GastosView from "@/components/views/GastosView";
import ReportesView from "@/components/views/ReportesView";
import PlanesView from "@/components/views/PlanesView";
import PerfilView from "@/components/views/PerfilView";
import CompleteProfileModal from "@/components/CompleteProfileModal";
import InstallPrompt from "@/components/InstallPrompt";
import { TabKeepAlive } from "@/components/TabKeepAlive";
import { useActiveTab, ActiveTab } from "@/store/appState";
import { useProfile } from "@/hooks/useProfile";

const Index = () => {
  const navigate = useNavigate();
  const { isHydrating, isAuthorized, isAuthenticated, isPro, profile } = useAuthGuard();
  const { activeTab, setActiveTab } = useActiveTab();
  const { refreshProfile } = useProfile();
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  // Keep track of which tabs have been mounted
  const [mountedTabs, setMountedTabs] = useState<Set<ActiveTab>>(new Set(['inicio']));

  // Redirect if not authenticated (only after hydration completes)
  useEffect(() => {
    if (!isHydrating && !isAuthenticated) {
      navigate("/auth", { replace: true });
    }
  }, [isHydrating, isAuthenticated, navigate]);

  // Mount tab when it becomes active
  useEffect(() => {
    if (!isHydrating && isAuthorized) {
      setMountedTabs(prev => new Set(prev).add(activeTab));
    }
    
    // Cleanup scroll lock on tab change
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.position = '';
  }, [activeTab, isHydrating, isAuthorized]);

  // Keep showing previous content while hydrating
  if (isHydrating && !isAuthenticated) {
    return null; // First load, nothing to show
  }

  const handleViewChange = (view: string) => {
    setActiveTab(view as ActiveTab);
  };

  const handleModalClose = async () => {
    setShowProfileModal(false);
    await refreshProfile();
  };

  return (
    <div className="page w-full bg-background" style={{ minHeight: 'calc(var(--vh, 1vh) * 100)' }}>
      <Navigation isPro={isPro} />
      
      <main style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
        {/* Keep all mounted tabs alive to prevent re-mount flicker */}
        {mountedTabs.has('inicio') && (
          <TabKeepAlive tabId="inicio" isActive={activeTab === 'inicio'}>
            <InicioView 
              profile={profile}
              onOpenProfileModal={() => setShowProfileModal(true)} 
              onViewChange={handleViewChange} 
            />
          </TabKeepAlive>
        )}
        
        {mountedTabs.has('gastos') && (
          <TabKeepAlive tabId="gastos" isActive={activeTab === 'gastos'}>
            <GastosView profile={profile} />
          </TabKeepAlive>
        )}
        
        {mountedTabs.has('reportes') && (
          <TabKeepAlive tabId="reportes" isActive={activeTab === 'reportes'}>
            <ReportesView />
          </TabKeepAlive>
        )}
        
        {mountedTabs.has('planes') && (
          <TabKeepAlive tabId="planes" isActive={activeTab === 'planes'}>
            <PlanesView />
          </TabKeepAlive>
        )}
        
        {mountedTabs.has('perfil') && (
          <TabKeepAlive tabId="perfil" isActive={activeTab === 'perfil'}>
            <PerfilView onViewChange={handleViewChange} />
          </TabKeepAlive>
        )}
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
