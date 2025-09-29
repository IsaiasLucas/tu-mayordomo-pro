import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Crown,
  Check,
  X,
  Star,
  Zap,
  Shield,
  BarChart3,
  Download,
  Phone,
  Users
} from "lucide-react";

interface PlanesViewProps {
  isPro: boolean;
  onPlanChange: (planType: string) => void;
}

const PlanesView = ({ isPro, onPlanChange }: PlanesViewProps) => {
  const plans = [
    {
      id: "free",
      name: "Gratis",
      price: 0,
      period: "Siempre",
      description: "Perfecto para comenzar tu control financiero personal",
      icon: Shield,
      color: "text-muted-foreground",
      bgColor: "bg-muted/10",
      features: [
        { name: "Hasta 50 transacciones/mes", included: true },
        { name: "Categorización básica", included: true },
        { name: "Vista de gastos simple", included: true },
        { name: "Balance general", included: true },
        { name: "Reportes avanzados", included: false },
        { name: "Exportación de datos", included: false },
        { name: "Filtro por teléfono", included: false },
        { name: "Soporte prioritario", included: false },
      ]
    },
    {
      id: "pro",
      name: "PRO",
      price: 4990,
      period: "mensual",
      description: "Control total de tus finanzas con herramientas avanzadas",
      icon: Crown,
      color: "text-accent",
      bgColor: "bg-accent/10",
      popular: true,
      features: [
        { name: "Transacciones ilimitadas", included: true },
        { name: "Categorización inteligente", included: true },
        { name: "Vista de gastos avanzada", included: true },
        { name: "Balance detallado", included: true },
        { name: "Reportes avanzados", included: true },
        { name: "Exportación PDF/Excel", included: true },
        { name: "Filtro por teléfono", included: true },
        { name: "Soporte prioritario", included: true },
      ]
    },
    {
      id: "premium",
      name: "Premium",
      price: 9990,
      period: "mensual", 
      description: "Para familias y usuarios con necesidades empresariales",
      icon: Star,
      color: "text-primary",
      bgColor: "bg-primary/10",
      features: [
        { name: "Todo lo de PRO", included: true },
        { name: "Multi-usuario (hasta 5)", included: true },
        { name: "Presupuestos familiares", included: true },
        { name: "Análisis predictivo", included: true },
        { name: "API personalizada", included: true },
        { name: "Integración n8n avanzada", included: true },
        { name: "Consultoría financiera", included: true },
        { name: "Soporte 24/7", included: true },
      ]
    }
  ];

  const formatCLP = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const currentPlan = isPro ? "pro" : "free";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Elige tu Plan Ideal</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Desde control básico hasta análisis avanzado. Tu Mayordomo se adapta a tus necesidades financieras.
        </p>
      </div>

      {/* Current Plan Status */}
      {currentPlan !== "free" && (
        <Card className="bg-gradient-header text-white shadow-card-hover rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-2xl">
                <Crown className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Plan Actual: {plans.find(p => p.id === currentPlan)?.name}</h3>
                <p className="text-white/80">Tienes acceso a todas las funciones premium</p>
              </div>
            </div>
            <Badge className="bg-accent text-accent-foreground px-4 py-2 rounded-full font-semibold text-sm">
              ACTIVO
            </Badge>
          </div>
        </Card>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const IconComponent = plan.icon;
          const isCurrentPlan = currentPlan === plan.id;
          
          return (
            <Card 
              key={plan.id}
              className={`relative shadow-card hover:shadow-card-hover transition-all duration-300 rounded-3xl p-8 ${
                plan.popular ? 'ring-2 ring-accent shadow-card-hover scale-105' : ''
              } ${isCurrentPlan ? 'bg-gradient-card border-primary' : 'bg-gradient-card'}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-accent text-accent-foreground px-4 py-2 rounded-full font-semibold">
                    <Zap className="h-3 w-3 mr-1" />
                    MÁS POPULAR
                  </Badge>
                </div>
              )}

              <div className="text-center mb-8">
                <div className={`${plan.bgColor} p-4 rounded-3xl w-fit mx-auto mb-4`}>
                  <IconComponent className={`h-8 w-8 ${plan.color}`} />
                </div>
                
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-4">{plan.description}</p>
                
                <div className="mb-6">
                  {plan.price === 0 ? (
                    <div className="text-3xl font-bold">Gratis</div>
                  ) : (
                    <div>
                      <span className="text-4xl font-bold">{formatCLP(plan.price)}</span>
                      <span className="text-muted-foreground">/{plan.period}</span>
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => onPlanChange(plan.id)}
                  disabled={isCurrentPlan}
                  className={`w-full rounded-2xl py-3 font-semibold ${
                    isCurrentPlan 
                      ? 'bg-muted text-muted-foreground cursor-not-allowed'
                      : plan.popular
                      ? 'bg-accent text-accent-foreground hover:bg-accent/90'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  }`}
                >
                  {isCurrentPlan ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Plan Actual
                    </>
                  ) : plan.price === 0 ? (
                    'Cambiar a Gratis'
                  ) : (
                    <>
                      <Crown className="h-4 w-4 mr-2" />
                      Actualizar a {plan.name}
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                  Características incluidas
                </h4>
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className={`p-1 rounded-full ${
                        feature.included 
                          ? 'bg-success/20 text-success' 
                          : 'bg-muted/20 text-muted-foreground'
                      }`}>
                        {feature.included ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                      </div>
                      <span className={`text-sm ${
                        feature.included 
                          ? 'text-card-foreground' 
                          : 'text-muted-foreground'
                      }`}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-card shadow-card rounded-3xl p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-primary/10 p-3 rounded-2xl">
              <Phone className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Integración n8n</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            Conecta Tu Mayordomo con tus herramientas favoritas mediante API REST y flujos automatizados.
          </p>
          <div className="flex items-center text-sm text-muted-foreground">
            <Shield className="h-4 w-4 mr-2" />
            Conexión segura y cifrada
          </div>
        </Card>

        <Card className="bg-gradient-card shadow-card rounded-3xl p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-success/10 p-3 rounded-2xl">
              <Users className="h-5 w-5 text-success" />
            </div>
            <h3 className="text-lg font-semibold">Soporte Premium</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            Atención personalizada para resolver tus dudas y optimizar tu experiencia financiera.
          </p>
          <div className="flex items-center text-sm text-muted-foreground">
            <BarChart3 className="h-4 w-4 mr-2" />
            Consultoría financiera incluida
          </div>
        </Card>
      </div>

      {/* FAQ */}
      <Card className="bg-gradient-card shadow-card rounded-3xl p-6">
        <h3 className="text-lg font-semibold mb-6">Preguntas Frecuentes</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">¿Puedo cambiar de plan en cualquier momento?</h4>
            <p className="text-sm text-muted-foreground">
              Sí, puedes actualizar o degradar tu plan cuando quieras. Los cambios se aplican inmediatamente.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">¿Qué métodos de pago aceptan?</h4>
            <p className="text-sm text-muted-foreground">
              Aceptamos tarjetas de crédito, débito, transferencias bancarias y WebPay en pesos chilenos.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">¿Hay permanencia mínima?</h4>
            <p className="text-sm text-muted-foreground">
              No, nuestros planes son mes a mes. Puedes cancelar cuando quieras sin penalizaciones.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PlanesView;