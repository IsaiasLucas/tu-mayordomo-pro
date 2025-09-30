import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Check, Sparkles, Zap, GraduationCap, Crown, MessageCircle, Calendar } from "lucide-react";
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
  priceLabel: string;
  features: PlanFeature[];
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
  popular?: boolean;
  gradient: string;
  buttonVariant: "outline" | "default";
}

export default function PlanesView() {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);

  const plans: Plan[] = [
    {
      id: "free",
      name: "Gratuito",
      description: "Perfeito para começar",
      price: 0,
      period: "mês",
      priceLabel: "Grátis",
      icon: MessageCircle,
      badge: "Atual",
      badgeColor: "bg-gray-100 text-gray-800",
      gradient: "from-gray-50 to-gray-100",
      buttonVariant: "outline",
      features: [
        { text: "30 mensagens por mês", included: true },
        { text: "Análise básica de gastos", included: true },
        { text: "Relatórios mensais", included: true },
        { text: "Suporte por email", included: true },
        { text: "Mensagens ilimitadas", included: false },
        { text: "Relatórios personalizados", included: false },
      ],
    },
    {
      id: "mensal",
      name: "Mensal",
      description: "Ideal para uso contínuo",
      price: 3000,
      period: "mês",
      priceLabel: "$3.000",
      icon: Zap,
      popular: true,
      badge: "Mais Popular",
      badgeColor: "bg-purple-100 text-purple-800",
      gradient: "from-purple-50 to-blue-50",
      buttonVariant: "default",
      features: [
        { text: "Mensagens ilimitadas", included: true },
        { text: "Análise avançada de gastos", included: true },
        { text: "Relatórios semanais e mensais", included: true },
        { text: "Alertas personalizados", included: true },
        { text: "Exportação de dados", included: true },
        { text: "Suporte prioritário", included: true },
      ],
    },
    {
      id: "anual",
      name: "Anual",
      description: "Economize 30% ao ano",
      price: 25000,
      period: "ano",
      priceLabel: "$25.000",
      icon: Crown,
      badge: "Melhor Valor",
      badgeColor: "bg-yellow-100 text-yellow-800",
      gradient: "from-yellow-50 to-orange-50",
      buttonVariant: "default",
      features: [
        { text: "Tudo do plano Mensal", included: true },
        { text: "2 meses grátis (economize 30%)", included: true },
        { text: "Backup automático de dados", included: true },
        { text: "Consultoria financeira mensal", included: true },
        { text: "Acesso antecipado a recursos", included: true },
        { text: "Suporte VIP 24/7", included: true },
      ],
    },
    {
      id: "estudante",
      name: "Estudante",
      description: "Desconto especial para estudantes",
      price: 1500,
      period: "mês",
      priceLabel: "$1.500",
      icon: GraduationCap,
      badge: "50% OFF",
      badgeColor: "bg-green-100 text-green-800",
      gradient: "from-green-50 to-teal-50",
      buttonVariant: "default",
      features: [
        { text: "Mensagens ilimitadas", included: true },
        { text: "Análise avançada de gastos", included: true },
        { text: "Relatórios personalizados", included: true },
        { text: "Alertas inteligentes", included: true },
        { text: "Verificação de estudante necessária", included: true },
        { text: "Renovação anual", included: true },
      ],
    },
  ];

  const handleSelectPlan = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    
    if (planId === "free") {
      toast({
        title: "Plano Gratuito",
        description: "Você já está no plano gratuito! Explore os recursos disponíveis.",
      });
      return;
    }

    if (planId === "estudante") {
      toast({
        title: "Verificação Necessária",
        description: "Para ativar o plano estudante, você precisa verificar seu status de estudante. Entre em contato conosco.",
      });
      return;
    }

    toast({
      title: `Plano ${plan?.name} Selecionado`,
      description: `Você selecionou o plano ${plan?.name} por ${plan?.priceLabel}/${plan?.period}. A integração de pagamento será configurada em breve.`,
    });
  };

  return (
    <main className="p-4 pb-8">
      {/* Header */}
      <div className="text-center mb-8 space-y-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="h-6 w-6 text-purple-600" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Escolha seu Plano
          </h1>
          <Sparkles className="h-6 w-6 text-blue-600" />
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Gerencie suas finanças com inteligência. Escolha o plano perfeito para suas necessidades.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isHovered = hoveredPlan === plan.id;
          const isCurrent = profile?.plan === plan.id || (plan.id === "free" && !profile?.plan);

          return (
            <Card
              key={plan.id}
              className={`relative overflow-hidden transition-all duration-300 ${
                isHovered ? "shadow-2xl scale-105" : "shadow-lg"
              } ${plan.popular ? "border-2 border-purple-500" : ""}`}
              onMouseEnter={() => setHoveredPlan(plan.id)}
              onMouseLeave={() => setHoveredPlan(null)}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 text-xs font-bold rounded-bl-lg">
                  MAIS POPULAR
                </div>
              )}

              <CardHeader className={`bg-gradient-to-br ${plan.gradient} pb-6`}>
                <div className="flex items-center justify-between mb-2">
                  <Icon className="h-8 w-8 text-gray-700" />
                  {plan.badge && (
                    <Badge className={`${plan.badgeColor} font-semibold`}>
                      {plan.badge}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-gray-600">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-6 space-y-6">
                {/* Price */}
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.priceLabel}</span>
                    {plan.price > 0 && (
                      <span className="text-gray-500 text-sm">/{plan.period}</span>
                    )}
                  </div>
                  {plan.id === "anual" && (
                    <p className="text-sm text-green-600 font-medium">
                      Equivale a $2.083/mês
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check
                        className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                          feature.included
                            ? "text-green-600"
                            : "text-gray-300"
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          feature.included ? "text-gray-700" : "text-gray-400"
                        }`}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  variant={plan.buttonVariant}
                  className="w-full rounded-xl font-semibold"
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isCurrent && plan.id === "free"}
                >
                  {isCurrent ? (
                    "Plano Atual"
                  ) : plan.id === "estudante" ? (
                    <>
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Verificar Estudante
                    </>
                  ) : (
                    <>
                      Escolher {plan.name}
                      <Sparkles className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Bottom Info */}
      <div className="mt-12 text-center space-y-4">
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 max-w-3xl mx-auto">
          <h3 className="font-semibold text-lg mb-2 flex items-center justify-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            Todos os planos incluem
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm text-gray-700">
            <div>✨ Análise de gastos em tempo real</div>
            <div>📊 Relatórios personalizados</div>
            <div>🔒 Segurança e privacidade garantidas</div>
          </div>
        </div>
        
        <p className="text-gray-500 text-sm">
          Cancele a qualquer momento • Sem taxas ocultas • Suporte em português
        </p>
      </div>
    </main>
  );
}