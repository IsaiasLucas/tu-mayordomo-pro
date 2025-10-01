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
import AccountSwitcher from "@/components/AccountSwitcher";
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
      // Check if phone exists in Supabase profile
      const phoneFromProfile = profile?.phone_personal || profile?.phone_empresa;
      const hasValidPhone = phoneFromProfile && phoneFromProfile.trim() !== '';
      
      if (!hasValidPhone) {
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
        return <InicioView onOpenProfileModal={() => setShowProfileModal(true)} />;
      case "gastos":
        return <GastosView />;
      case "reportes":
        return <ReportesView />;
      case "planes":
        return <PlanesView />;
      case "perfil":
        return <PerfilView />;
      default:
        return <InicioView onOpenProfileModal={() => setShowProfileModal(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header fixo com Account Switcher */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground border-b border-primary-glow/20 shadow-md">
        <div className="container mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold">Tu Mayordomo</h1>
          </div>
          <AccountSwitcher />
        </div>
      </header>

      <Navigation
        currentView={currentView}
        onViewChange={handleViewChange}
        isPro={isPro}
        phoneFilter={phoneFilter}
        onPhoneFilterChange={handlePhoneFilterChange}
      />
      
      <main className="pb-24 pt-16">
        {renderCurrentView()}
      </main>

      <CompleteProfileModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </div>
  );
};

export default Index;
