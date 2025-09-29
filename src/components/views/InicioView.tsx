import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Eye,
  TrendingUp,
  Wallet,
  CreditCard,
  PiggyBank
} from "lucide-react";

interface InicioViewProps {
  isPro: boolean;
}

const formatCLP = (amount: number) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(amount);
};

const InicioView = ({ isPro }: InicioViewProps) => {
  const totalBalance = 2547830;
  const monthlyIncome = 1850000;
  const monthlyExpenses = 1245670;
  const savings = 302160;

  const recentTransactions = [
    { id: 1, description: "Supermercado Jumbo", amount: -45670, date: "Hoy", category: "Alimentación" },
    { id: 2, description: "Sueldo Empresa", amount: 1850000, date: "28 Sep", category: "Ingresos" },
    { id: 3, description: "Farmacia Cruz Verde", amount: -18950, date: "27 Sep", category: "Salud" },
    { id: 4, description: "Uber", amount: -8500, date: "26 Sep", category: "Transporte" },
    { id: 5, description: "Netflix", amount: -8990, date: "25 Sep", category: "Entretenimiento" },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Card - Main Balance */}
      <Card className="bg-gradient-header text-white shadow-card-hover rounded-3xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Resumen General</h2>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/20 rounded-xl">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/20 rounded-xl px-4">
              Mostrar menos
            </Button>
          </div>
        </div>
        
        <div className="flex items-baseline space-x-3 mb-2">
          <span className="text-4xl font-bold">{formatCLP(totalBalance)}</span>
          <div className="flex items-center space-x-1 bg-success/20 text-success-foreground px-3 py-1 rounded-full">
            <TrendingUp className="h-3 w-3" />
            <span className="text-sm font-semibold">12.5%</span>
          </div>
        </div>
        <p className="text-white/80">Balance total disponible</p>
      </Card>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-card shadow-card rounded-3xl p-6 hover:shadow-card-hover transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-success/10 p-3 rounded-2xl">
              <ArrowDownRight className="h-5 w-5 text-success" />
            </div>
            <Wallet className="h-5 w-5 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Ingresos del Mes</h3>
          <p className="text-2xl font-bold text-card-foreground">{formatCLP(monthlyIncome)}</p>
        </Card>

        <Card className="bg-gradient-card shadow-card rounded-3xl p-6 hover:shadow-card-hover transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-destructive/10 p-3 rounded-2xl">
              <ArrowUpRight className="h-5 w-5 text-destructive" />
            </div>
            <CreditCard className="h-5 w-5 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Gastos del Mes</h3>
          <p className="text-2xl font-bold text-card-foreground">{formatCLP(monthlyExpenses)}</p>
        </Card>

        <Card className="bg-gradient-card shadow-card rounded-3xl p-6 hover:shadow-card-hover transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-primary/10 p-3 rounded-2xl">
              <PiggyBank className="h-5 w-5 text-primary" />
            </div>
            {isPro && (
              <Badge className="bg-accent text-accent-foreground px-2 py-0.5 text-xs rounded-full">
                PRO
              </Badge>
            )}
          </div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Ahorros</h3>
          <p className="text-2xl font-bold text-card-foreground">{formatCLP(savings)}</p>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="bg-gradient-card shadow-card rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Transacciones Recientes</h3>
          <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10 rounded-xl">
            Ver todas
          </Button>
        </div>
        
        <div className="space-y-4">
          {recentTransactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-2xl transition-colors">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-xl ${
                  transaction.amount > 0 
                    ? 'bg-success/10 text-success' 
                    : 'bg-destructive/10 text-destructive'
                }`}>
                  {transaction.amount > 0 ? (
                    <ArrowDownRight className="h-4 w-4" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span>{transaction.date}</span>
                    <span>•</span>
                    <span>{transaction.category}</span>
                  </div>
                </div>
              </div>
              <p className={`font-semibold ${
                transaction.amount > 0 ? 'text-success' : 'text-destructive'
              }`}>
                {formatCLP(Math.abs(transaction.amount))}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default InicioView;