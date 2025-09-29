import { useState } from "react";
import Navigation from "@/components/Navigation";
import InicioView from "@/components/views/InicioView";
import GastosView from "@/components/views/GastosView";
import ReportesView from "@/components/views/ReportesView";
import PlanesView from "@/components/views/PlanesView";
import PerfilView from "@/components/views/PerfilView";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [currentView, setCurrentView] = useState("inicio");
  const [userPlan, setUserPlan] = useState("free"); // free, pro, premium
  const [phoneFilter, setPhoneFilter] = useState("");

  const isPro = userPlan !== "free";

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
        return <InicioView isPro={isPro} />;
      case "gastos":
        return <GastosView isPro={isPro} />;
      case "reportes":
        return <ReportesView isPro={isPro} />;
      case "planes":
        return <PlanesView isPro={isPro} onPlanChange={handlePlanChange} />;
      case "perfil":
        return <PerfilView isPro={isPro} />;
      default:
        return <InicioView isPro={isPro} />;
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
      
      <main className="container mx-auto px-4 py-8">
        {renderCurrentView()}
      </main>
    </div>
  );
};

export default Index;
