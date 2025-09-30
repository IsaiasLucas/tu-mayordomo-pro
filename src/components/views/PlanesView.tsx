import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Check, Sparkles, Zap, GraduationCap, MessageCircle, Loader2, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { StudentVerificationDialog } from "@/components/StudentVerificationDialog";

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  period: string;
  priceId: string;
  features: PlanFeature[];
  iconName: string;
  popular?: boolean;
  gradient: string;
}

export default function PlanesView() {
  const { toast } = useToast();
  const { profile, user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showStudentDialog, setShowStudentDialog] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState<{ priceId: string; planId: string } | null>(null);
  const [checkingSubscription, setCheckingSubscription] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);

  const plans: Plan[] = [
    {
      id: "free",
      name: "Gratuito",
      description: "Pa' empezar",
      price: 0,
      period: "siempre",
      priceId: "",
      iconName: "message",
      gradient: "from-gray-100 to-gray-200",
      features: [
        { text: "30 mensajes/mes", included: true },
        { text: "Reportes básicos", included: true },
        { text: "Análisis de gastos", included: true },
        { text: "Mensajes ilimitados", included: false },
        { text: "Reportes detallados", included: false },
      ],
    },
    {
      id: "mensal",
      name: "Pro Mensual",
      description: "Uso sin límites",
      price: 3000,
      period: "mes",
      priceId: "price_1SDBEqCGNOUldBA3Fh0quBIN",
      iconName: "zap",
      popular: true,
      gradient: "from-purple-100 to-purple-200",
      features: [
        { text: "Mensajes ilimitados", included: true },
        { text: "Reportes detallados", included: true },
        { text: "Análisis avanzado", included: true },
        { text: "Exportar datos", included: true },
        { text: "Soporte prioritario", included: true },
      ],
    },
    {
      id: "anual",
      name: "Pro Anual",
      description: "Ahorra $11.000",
      price: 25000,
      period: "año",
      priceId: "price_1SDBGGCGNOUldBA3YXBfTYl4",
      iconName: "sparkles",
      gradient: "from-blue-100 to-blue-200",
      features: [
        { text: "Todo del Pro Mensual", included: true },
        { text: "~$2.083/mes (30% off)", included: true },
        { text: "Backup automático", included: true },
        { text: "Soporte prioritario", included: true },
      ],
    },
    {
      id: "estudante",
      name: "Estudiante",
      description: "50% de descuento",
      price: 1500,
      period: "mes",
      priceId: "price_1SDBGGCGNOUldBA3fdub9gbE",
      iconName: "graduation",
      gradient: "from-green-100 to-green-200",
      features: [
        { text: "Mensajes ilimitados", included: true },
        { text: "Reportes detallados", included: true },
        { text: "Análisis avanzado", included: true },
        { text: "Requiere email .edu", included: true },
      ],
    },
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "message":
        return MessageCircle;
      case "zap":
        return Zap;
      case "sparkles":
        return Sparkles;
      case "graduation":
        return GraduationCap;
      default:
        return MessageCircle;
    }
  };

  // Check subscription status on mount
  useEffect(() => {
    checkSubscription();
  }, [user]);

  const checkSubscription = async () => {
    if (!user) return;
    
    setCheckingSubscription(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      
      if (error) {
        console.error("Error checking subscription:", error);
        return;
      }

      if (data.subscribed) {
        console.log("Subscription active:", data.plan);
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
    } finally {
      setCheckingSubscription(false);
    }
  };

  const handleManageSubscription = async () => {
    setLoadingPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      console.error("Error opening customer portal:", error);
      toast({
        title: "Error",
        description: "No se pudo abrir el portal de administración.",
        variant: "destructive",
      });
    } finally {
      setLoadingPortal(false);
    }
  };

  const handleSelectPlan = async (planId: string, priceId: string) => {
    if (planId === "free") {
      toast({
        title: "Plan Gratuito",
        description: "¡Ya tienes acceso al plan gratuito!",
      });
      return;
    }

    // Student plan requires verification
    if (planId === "estudante") {
      if (!profile?.student_verified) {
        setPendingCheckout({ priceId, planId });
        setShowStudentDialog(true);
        return;
      }
    }

    // Proceed with checkout
    await createCheckout(priceId, planId);
  };

  const handleStudentVerified = async () => {
    if (pendingCheckout) {
      await createCheckout(pendingCheckout.priceId, pendingCheckout.planId);
      setPendingCheckout(null);
    }
  };

  const createCheckout = async (priceId: string, planId: string) => {
    setSelectedPlan(planId);
    
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId, planId },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        
        toast({
          title: "Redirecionando...",
          description: "Você será levado para a página de pagamento do Stripe.",
        });
      }
    } catch (error: any) {
      console.error("Error creating checkout:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar a sessão de pagamento.",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => setSelectedPlan(null), 1000);
    }
  };

  const currentPlan = profile?.plan || "free";
  const hasActivePlan = currentPlan !== "free";

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 p-4 pb-20">
      {/* Header */}
      <div className="text-center mb-10 pt-4 animate-fade-in">
        <div className="inline-flex items-center gap-2 mb-3 bg-white px-4 py-2 rounded-full shadow-sm">
          <Sparkles className="h-5 w-5 text-purple-600 animate-pulse" />
          <span className="text-sm font-semibold text-gray-700">Planes Simples</span>
        </div>
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
          Elige tu Plan
        </h1>
        <p className="text-gray-600 mb-4">
          Empieza gratis. Actualiza cuando quieras.
        </p>
        
        {hasActivePlan && (
          <Button
            variant="outline"
            onClick={handleManageSubscription}
            disabled={loadingPortal}
            className="rounded-xl"
          >
            {loadingPortal ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Cargando...
              </>
            ) : (
              <>
                <Settings className="h-4 w-4 mr-2" />
                Administrar Suscripción
              </>
            )}
          </Button>
        )}
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {plans.map((plan, index) => {
          const Icon = getIcon(plan.iconName);
          const isCurrent = currentPlan === plan.id;
          const isSelecting = selectedPlan === plan.id;

          return (
            <div
              key={plan.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Card
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group ${
                  plan.popular ? "ring-2 ring-purple-500" : ""
                } ${isSelecting ? "scale-95" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 text-xs font-bold rounded-bl-xl">
                    POPULAR
                  </div>
                )}

                <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-50 group-hover:opacity-70 transition-opacity`} />

                <CardHeader className="relative z-10 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="bg-white p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                      <Icon className="h-6 w-6 text-gray-700" />
                    </div>
                    {isCurrent && (
                      <Badge className="bg-green-100 text-green-700 font-semibold">
                        Actual
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-2xl mb-1">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative z-10 pt-0 space-y-4">
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-baseline gap-1">
                      {plan.price === 0 ? (
                        <span className="text-3xl font-bold text-gray-900">Gratis</span>
                      ) : (
                        <>
                          <span className="text-sm text-gray-500">$</span>
                          <span className="text-3xl font-bold text-gray-900">
                            {plan.price.toLocaleString('es-CL')}
                          </span>
                          <span className="text-gray-500 text-sm">/{plan.period}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-2.5">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <div className={`mt-0.5 rounded-full p-0.5 ${
                          feature.included ? "bg-green-100" : "bg-gray-100"
                        }`}>
                          <Check
                            className={`h-3.5 w-3.5 ${
                              feature.included ? "text-green-600" : "text-gray-300"
                            }`}
                          />
                        </div>
                        <span className={feature.included ? "text-gray-700" : "text-gray-400"}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="relative z-10 pt-4">
                  <Button
                    variant={plan.popular ? "default" : "outline"}
                    className="w-full rounded-xl font-semibold transition-all group-hover:scale-105"
                    onClick={() => handleSelectPlan(plan.id, plan.priceId)}
                    disabled={isCurrent || isSelecting}
                  >
                    {isCurrent ? (
                      "Plan Actual"
                    ) : isSelecting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Procesando...
                      </span>
                    ) : (
                      `Elegir ${plan.name}`
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Bottom Info */}
      <div className="mt-12 text-center space-y-6 animate-fade-in max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="space-y-1">
              <div className="text-2xl">✨</div>
              <div className="font-semibold text-gray-900">Sin Contratos</div>
              <div className="text-gray-600">Cancela cuando quieras</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl">🔒</div>
              <div className="font-semibold text-gray-900">Datos Seguros</div>
              <div className="text-gray-600">Encriptación total</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl">💬</div>
              <div className="font-semibold text-gray-900">Soporte</div>
              <div className="text-gray-600">Siempre disponible</div>
            </div>
          </div>
        </div>
        
        <p className="text-gray-500 text-sm">
          Pagos procesados de forma segura vía Stripe
        </p>
      </div>

      <StudentVerificationDialog
        open={showStudentDialog}
        onOpenChange={setShowStudentDialog}
        onVerified={handleStudentVerified}
      />
    </main>
  );
}