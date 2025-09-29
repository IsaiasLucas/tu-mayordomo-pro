import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Crown,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  Target,
  AlertTriangle
} from "lucide-react";

interface ReportesViewProps {
  isPro: boolean;
}

const formatCLP = (amount: number) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(amount);
};

const ReportesView = ({ isPro }: ReportesViewProps) => {
  if (!isPro) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="bg-gradient-card shadow-card-hover rounded-3xl p-12 text-center max-w-md">
          <div className="bg-accent/10 p-6 rounded-3xl w-fit mx-auto mb-6">
            <Crown className="h-12 w-12 text-accent" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Reportes Avanzados</h2>
          <p className="text-muted-foreground mb-8">
            Accede a reportes detallados, análisis de tendencias y exportación de datos con Tu Mayordomo PRO.
          </p>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-2xl px-8 py-3">
            <Crown className="h-4 w-4 mr-2" />
            Actualizar a PRO
          </Button>
        </Card>
      </div>
    );
  }

  const monthlyTrends = [
    { month: "Enero", income: 1650000, expenses: 1420000, savings: 230000 },
    { month: "Febrero", income: 1650000, expenses: 1380000, savings: 270000 },
    { month: "Marzo", income: 1750000, expenses: 1450000, savings: 300000 },
    { month: "Abril", income: 1750000, expenses: 1520000, savings: 230000 },
    { month: "Mayo", income: 1850000, expenses: 1480000, savings: 370000 },
    { month: "Junio", income: 1850000, expenses: 1560000, savings: 290000 },
  ];

  const categoryAnalysis = [
    { category: "Alimentación", budget: 400000, actual: 385420, percentage: 96, status: "good" },
    { category: "Transporte", budget: 200000, actual: 245680, percentage: 123, status: "warning" },
    { category: "Entretenimiento", budget: 150000, actual: 156890, percentage: 105, status: "warning" },
    { category: "Salud", budget: 100000, actual: 125430, percentage: 125, status: "danger" },
  ];

  const insights = [
    {
      type: "success",
      title: "Excelente control en Alimentación",
      description: "Has mantenido los gastos de alimentación 4% bajo presupuesto este mes.",
      icon: Target
    },
    {
      type: "warning", 
      title: "Transporte sobre presupuesto",
      description: "Los gastos de transporte están 23% sobre el presupuesto planificado.",
      icon: AlertTriangle
    },
    {
      type: "info",
      title: "Patrón de ahorro consistente",
      description: "Has ahorrado en promedio $283,333 CLP en los últimos 6 meses.",
      icon: TrendingUp
    }
  ];

  return (
    <div className="space-y-6">
      {/* PRO Header */}
      <Card className="bg-gradient-header text-white shadow-card-hover rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-2xl font-bold">Reportes Avanzados</h2>
              <Badge className="bg-accent text-accent-foreground px-3 py-1 rounded-full font-semibold">
                PRO
              </Badge>
            </div>
            <p className="text-white/80">Análisis detallado de tus finanzas personales</p>
          </div>
          <Button variant="ghost" className="text-white hover:bg-white/20 rounded-2xl">
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-card shadow-card rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-success/10 p-3 rounded-2xl">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Tendencia de Ahorros</h3>
          <p className="text-2xl font-bold text-success">+18.5%</p>
          <p className="text-sm text-muted-foreground">vs mes anterior</p>
        </Card>

        <Card className="bg-gradient-card shadow-card rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-primary/10 p-3 rounded-2xl">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <PieChart className="h-5 w-5 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Cumplimiento Presupuesto</h3>
          <p className="text-2xl font-bold text-primary">87%</p>
          <p className="text-sm text-muted-foreground">3 de 4 categorías</p>
        </Card>

        <Card className="bg-gradient-card shadow-card rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-accent/10 p-3 rounded-2xl">
              <Calendar className="h-5 w-5 text-accent" />
            </div>
            <TrendingDown className="h-5 w-5 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Proyección Anual</h3>
          <p className="text-2xl font-bold text-accent">{formatCLP(3400000)}</p>
          <p className="text-sm text-muted-foreground">ahorro estimado</p>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card className="bg-gradient-card shadow-card rounded-3xl p-6">
        <h3 className="text-lg font-semibold mb-6">Tendencias de los Últimos 6 Meses</h3>
        <div className="space-y-4">
          {monthlyTrends.map((month, index) => (
            <div key={month.month} className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-2xl transition-colors">
              <div className="flex items-center space-x-4">
                <div className="bg-primary/10 p-2 rounded-xl">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{month.month}</p>
                  <p className="text-sm text-muted-foreground">
                    Ahorro: {formatCLP(month.savings)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatCLP(month.income)}</p>
                <p className="text-sm text-destructive">-{formatCLP(month.expenses)}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Budget Analysis */}
      <Card className="bg-gradient-card shadow-card rounded-3xl p-6">
        <h3 className="text-lg font-semibold mb-6">Análisis de Presupuesto</h3>
        <div className="space-y-4">
          {categoryAnalysis.map((item) => (
            <div key={item.category} className="p-4 border border-border rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">{item.category}</h4>
                <Badge 
                  variant={item.status === "good" ? "default" : "destructive"}
                  className="rounded-full"
                >
                  {item.percentage}%
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>Presupuesto: {formatCLP(item.budget)}</span>
                <span>Real: {formatCLP(item.actual)}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    item.status === "good" 
                      ? "bg-success" 
                      : item.status === "warning"
                      ? "bg-yellow-500"
                      : "bg-destructive"
                  }`}
                  style={{ width: `${Math.min(item.percentage, 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Insights */}
      <Card className="bg-gradient-card shadow-card rounded-3xl p-6">
        <h3 className="text-lg font-semibold mb-6">Insights Personalizados</h3>
        <div className="space-y-4">
          {insights.map((insight, index) => {
            const IconComponent = insight.icon;
            return (
              <div key={index} className="flex items-start space-x-4 p-4 hover:bg-muted/50 rounded-2xl transition-colors">
                <div className={`p-2 rounded-xl ${
                  insight.type === "success" 
                    ? "bg-success/10 text-success" 
                    : insight.type === "warning"
                    ? "bg-yellow-500/10 text-yellow-600"
                    : "bg-primary/10 text-primary"
                }`}>
                  <IconComponent className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default ReportesView;