import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Check, Sparkles, Zap, GraduationCap, MessageCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

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
  features: PlanFeature[];
  iconName: string;
  popular?: boolean;
  gradient: string;
}

export default function PlanesView() {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans: Plan[] = [
    {
      id: "free",
      name: "Gratuito",
      description: "Para começar",
      price: 0,
      period: "sempre",
      iconName: "message",
      gradient: "from-gray-100 to-gray-200",
      features: [
        { text: "30 mensagens/mês", included: true },
        { text: "Relatórios básicos", included: true },
        { text: "Análise de gastos", included: true },
        { text: "Mensagens ilimitadas", included: false },
        { text: "Relatórios detalhados", included: false },
      ],
    },
    {
      id: "mensal",
      name: "Pro Mensal",
      description: "Uso sem limites",
      price: 3000,
      period: "mês",
      iconName: "zap",
      popular: true,
      gradient: "from-purple-100 to-purple-200",
      features: [
        { text: "Mensagens ilimitadas", included: true },
        { text: "Relatórios detalhados", included: true },
        { text: "Análise avançada", included: true },
        { text: "Exportar dados", included: true },
        { text: "Suporte prioritário", included: true },
      ],
    },
    {
      id: "anual",
      name: "Pro Anual",
      description: "Economize $11.000",
      price: 25000,
      period: "ano",
      iconName: "sparkles",
      gradient: "from-blue-100 to-blue-200",
      features: [
        { text: "Tudo do Pro Mensal", included: true },
        { text: "~$2.083/mês (30% off)", included: true },
        { text: "Backup automático", included: true },
        { text: "Suporte prioritário", included: true },
      ],
    },
    {
      id: "estudante",
      name: "Estudante",
      description: "50% de desconto",
      price: 1500,
      period: "mês",
      iconName: "graduation",
      gradient: "from-green-100 to-green-200",
      features: [
        { text: "Mensagens ilimitadas", included: true },
        { text: "Relatórios detalhados", included: true },
        { text: "Análise avançada", included: true },
        { text: "Requer comprovante", included: true },
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

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    
    setTimeout(() => {
      const plan = plans.find(p => p.id === planId);
      
      if (planId === "free") {
        toast({
          title: "Plano Gratuito",
          description: "Você já tem acesso ao plano gratuito!",
        });
      } else if (planId === "estudante") {
        toast({
          title: "Verificação Necessária",
          description: "Envie seu comprovante de estudante para ativar este plano.",
        });
      } else {
        toast({
          title: `Plano ${plan?.name}`,
          description: `${plan?.price?.toLocaleString('es-CL')} CLP/${plan?.period}. Pagamento em breve.`,
        });
      }
      
      setSelectedPlan(null);
    }, 400);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 p-4 pb-20">
      {/* Header */}
      <div className="text-center mb-10 pt-4 animate-fade-in">
        <div className="inline-flex items-center gap-2 mb-3 bg-white px-4 py-2 rounded-full shadow-sm">
          <Sparkles className="h-5 w-5 text-purple-600 animate-pulse" />
          <span className="text-sm font-semibold text-gray-700">Planos Simples</span>
        </div>
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
          Escolha seu Plano
        </h1>
        <p className="text-gray-600">
          Comece grátis. Atualize quando precisar.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {plans.map((plan, index) => {
          const Icon = getIcon(plan.iconName);
          const isCurrent = profile?.plan === plan.id || (plan.id === "free" && !profile?.plan);
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
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 text-xs font-bold rounded-bl-xl">
                    POPULAR
                  </div>
                )}

                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-50 group-hover:opacity-70 transition-opacity`} />

                <CardHeader className="relative z-10 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="bg-white p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                      <Icon className="h-6 w-6 text-gray-700" />
                    </div>
                    {isCurrent && (
                      <Badge className="bg-green-100 text-green-700 font-semibold">
                        Atual
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-2xl mb-1">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative z-10 pt-0 space-y-4">
                  {/* Price */}
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-baseline gap-1">
                      {plan.price === 0 ? (
                        <span className="text-3xl font-bold text-gray-900">Grátis</span>
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

                  {/* Features */}
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
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={isCurrent && plan.id === "free"}
                  >
                    {isCurrent && plan.id === "free" ? (
                      "Plano Atual"
                    ) : isSelecting ? (
                      <span className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Processando...
                      </span>
                    ) : plan.id === "estudante" ? (
                      "Verificar Estudante"
                    ) : (
                      `Escolher ${plan.name}`
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
              <div className="font-semibold text-gray-900">Sem Contratos</div>
              <div className="text-gray-600">Cancele quando quiser</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl">🔒</div>
              <div className="font-semibold text-gray-900">Dados Seguros</div>
              <div className="text-gray-600">Criptografia total</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl">💬</div>
              <div className="font-semibold text-gray-900">Suporte</div>
              <div className="text-gray-600">Sempre disponível</div>
            </div>
          </div>
        </div>
        
        <p className="text-gray-500 text-sm">
          Pagamentos processados com segurança
        </p>
      </div>
    </main>
  );
}