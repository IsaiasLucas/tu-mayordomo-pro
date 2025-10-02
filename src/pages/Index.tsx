import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import InicioView from "@/components/views/InicioView";
import GastosView from "@/components/views/GastosView";
import ReportesView from "@/components/views/ReportesView";
import PlanesView from "@/components/views/PlanesView";
import PerfilView from "@/components/views/PerfilView";
import CompleteProfileModal from "@/components/CompleteProfileModal";

import InstallPrompt from "@/components/InstallPrompt";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const { isAuthenticated, loading: authLoading, profile } = useAuth();
  const [currentView, setCurrentView] = useState("inicio");
  const [userPlan, setUserPlan] = useState("free"); // free, pro, premium
  const [phoneFilter, setPhoneFilter] = useState("");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Check if user needs to complete profile after login
  useEffect(() => {
    if (isAuthenticated && !authLoading && profile) {
      // Check if phone exists in Supabase profile OR if WhatsApp has been configured
      const phoneFromProfile = profile?.phone_personal || profile?.phone_empresa;
      const hasValidPhone = phoneFromProfile && phoneFromProfile.trim() !== '';
      const isWhatsAppConfigured = profile?.whatsapp_configured === true;
      
      // Only show modal if user doesn't have a phone AND hasn't configured WhatsApp
      if (!hasValidPhone && !isWhatsAppConfigured) {
        setShowProfileModal(true);
      }
    }
  }, [isAuthenticated, authLoading, profile]);

  // Sync userPlan with profile.plan
  useEffect(() => {
    if (profile?.plan) {
      setUserPlan(profile.plan);
    }
  }, [profile?.plan]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
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

  const handlePhoneFilterChange = (phone: string) => {
    setPhoneFilter(phone);
    if (phone) {
      toast({
        title: "Filtro aplicado",
        description: `Mostrando transacciones para ${phone}`,
      });
    }
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
        return <InicioView onOpenProfileModal={() => setShowProfileModal(true)} onViewChange={handleViewChange} />;
      case "gastos":
        return <GastosView />;
      case "reportes":
        return <ReportesView />;
      case "planes":
        return <PlanesView />;
      case "perfil":
        return <PerfilView />;
      default:
        return <InicioView onOpenProfileModal={() => setShowProfileModal(true)} onViewChange={handleViewChange} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">

      <Navigation
        currentView={currentView}
        onViewChange={handleViewChange}
        isPro={isPro}
        phoneFilter={phoneFilter}
        onPhoneFilterChange={handlePhoneFilterChange}
      />
      
      <main className="pb-24">
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
