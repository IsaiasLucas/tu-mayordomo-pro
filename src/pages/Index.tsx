import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import InicioView from "@/components/views/InicioView";
import GastosView from "@/components/views/GastosView";
import ReportesView from "@/components/views/ReportesView";
import PlanesView from "@/components/views/PlanesView";
import PerfilView from "@/components/views/PerfilView";
import CompleteProfileModal from "@/components/CompleteProfileModal";
import InstallPrompt from "@/components/InstallPrompt";
import { ViewTransition } from "@/components/ViewTransition";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const { isAuthenticated, loading: authLoading, profile } = useAuth();
  const [currentView, setCurrentView] = useState("inicio");
  const [userPlan, setUserPlan] = useState("free"); // free, pro, premium
  const [showProfileModal, setShowProfileModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Check if user needs to complete profile after login
  useEffect(() => {
    const checkProfile = async () => {
      if (isAuthenticated && !authLoading && profile) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          // Check if telefono exists in usuarios table
          const { data: usuario } = await supabase
            .from('usuarios')
            .select('telefono')
            .eq('user_id', user.id)
            .maybeSingle();

          // Show modal only if telefono is null or empty
          if (!usuario?.telefono || usuario.telefono.trim() === '') {
            setShowProfileModal(true);
          }
        } catch (error) {
          console.error('Error checking profile:', error);
        }
      }
    };

    checkProfile();
  }, [isAuthenticated, authLoading, profile]);

  // Sync userPlan with profile.plan
  useEffect(() => {
    if (profile?.plan) {
      setUserPlan(profile.plan);
    }
  }, [profile?.plan]);

  if (authLoading) {
    return (
      <div className="w-full bg-background flex items-center justify-center" style={{ height: 'calc(var(--vh, 1vh) * 100)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  const isPro = userPlan === "pro" || userPlan === "mensal" || userPlan === "anual";

  const handleViewChange = (view: string) => {
    setCurrentView(view);
  };

  const handlePlanChange = (planType: string) => {
    setUserPlan(planType);
    toast({
      title: "Plan actualizado",
      description: `Has cambiado al plan ${planType.toUpperCase()}`,
    });
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "inicio":
        return (
          <ViewTransition viewKey="inicio">
            <InicioView onOpenProfileModal={() => setShowProfileModal(true)} onViewChange={handleViewChange} />
          </ViewTransition>
        );
      case "gastos":
        return (
          <ViewTransition viewKey="gastos">
            <GastosView />
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
            <InicioView onOpenProfileModal={() => setShowProfileModal(true)} onViewChange={handleViewChange} />
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
        {renderCurrentView()}
      </main>

      <CompleteProfileModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
      
      <InstallPrompt />
    </div>
  );
};

export default Index;
