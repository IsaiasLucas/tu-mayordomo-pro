import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react";

interface HeroOverviewProps {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsGoal: number;
  isPro?: boolean;
}

const HeroOverview = ({ 
  totalBalance, 
  monthlyIncome, 
  monthlyExpenses, 
  savingsGoal,
  isPro = false 
}: HeroOverviewProps) => {
  const netIncome = monthlyIncome - monthlyExpenses;
  const savingsProgress = (netIncome / savingsGoal) * 100;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Main Balance Card */}
      <Card className="bg-gradient-header text-primary-foreground p-8 border-0 shadow-card-hover">
        <div className="text-center space-y-4">
          <div>
            <p className="text-white/80 text-lg">Balance Total</p>
            <h2 className="text-4xl font-bold text-white">
              {formatCurrency(totalBalance)}
            </h2>
          </div>
          {isPro && (
            <Badge className="bg-accent text-accent-foreground px-4 py-2 rounded-full">
              Cuenta PRO
            </Badge>
          )}
        </div>
      </Card>

      {/* Financial Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Monthly Income */}
        <Card className="p-6 shadow-card hover:shadow-card-hover transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm font-medium">
                Ingresos del Mes
              </p>
              <p className="text-2xl font-bold text-success">
                {formatCurrency(monthlyIncome)}
              </p>
            </div>
            <div className="bg-success/10 p-3 rounded-2xl">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
          </div>
        </Card>

        {/* Monthly Expenses */}
        <Card className="p-6 shadow-card hover:shadow-card-hover transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm font-medium">
                Gastos del Mes
              </p>
              <p className="text-2xl font-bold text-destructive">
                {formatCurrency(monthlyExpenses)}
              </p>
            </div>
            <div className="bg-destructive/10 p-3 rounded-2xl">
              <TrendingDown className="h-6 w-6 text-destructive" />
            </div>
          </div>
        </Card>

        {/* Net Income */}
        <Card className="p-6 shadow-card hover:shadow-card-hover transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm font-medium">
                Resultado Neto
              </p>
              <p className={`text-2xl font-bold ${netIncome >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatCurrency(netIncome)}
              </p>
            </div>
            <div className={`p-3 rounded-2xl ${netIncome >= 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
              <DollarSign className={`h-6 w-6 ${netIncome >= 0 ? 'text-success' : 'text-destructive'}`} />
            </div>
          </div>
        </Card>
      </div>

      {/* Savings Goal Progress */}
      <Card className="p-6 shadow-card">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 p-2 rounded-xl">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Meta de Ahorro</h3>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(savingsGoal)} mensuales
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Progreso</p>
              <p className="font-bold text-primary">
                {Math.round(savingsProgress)}%
              </p>
            </div>
          </div>
          
          <div className="w-full bg-muted rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-primary to-primary-glow h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(savingsProgress, 100)}%` }}
            />
          </div>
          
          {savingsProgress >= 100 && (
            <div className="bg-success/10 border border-success/20 rounded-2xl p-4">
              <p className="text-success text-sm font-medium text-center">
                ¡Felicitaciones! Has alcanzado tu meta de ahorro mensual
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default HeroOverview;