import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus,
  ArrowUpRight,
  Filter,
  Search,
  ShoppingCart,
  Car,
  Home,
  Utensils,
  Heart,
  Gamepad2
} from "lucide-react";

interface GastosViewProps {
  isPro: boolean;
}

const formatCLP = (amount: number) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(amount);
};

const categoryIcons = {
  "Alimentación": ShoppingCart,
  "Transporte": Car,
  "Vivienda": Home,
  "Entretenimiento": Gamepad2,
  "Salud": Heart,
  "Restaurantes": Utensils,
};

const GastosView = ({ isPro }: GastosViewProps) => {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");

  const monthlyExpenses = 1245670;
  const dailyAverage = 41522;

  const categories = [
    { name: "Alimentación", amount: 385420, percentage: 31, transactions: 24 },
    { name: "Transporte", amount: 245680, percentage: 20, transactions: 18 },
    { name: "Vivienda", amount: 180000, percentage: 14, transactions: 3 },
    { name: "Entretenimiento", amount: 156890, percentage: 13, transactions: 12 },
    { name: "Salud", amount: 125430, percentage: 10, transactions: 8 },
    { name: "Restaurantes", amount: 152250, percentage: 12, transactions: 15 },
  ];

  const expenses = [
    { id: 1, description: "Supermercado Jumbo", amount: 45670, date: "29 Sep", category: "Alimentación", time: "14:30" },
    { id: 2, description: "Uber Centro-Casa", amount: 8500, date: "28 Sep", category: "Transporte", time: "18:45" },
    { id: 3, description: "Farmacia Cruz Verde", amount: 18950, date: "27 Sep", category: "Salud", time: "11:20" },
    { id: 4, description: "Café con María", amount: 12400, date: "27 Sep", category: "Restaurantes", time: "16:15" },
    { id: 5, description: "Netflix Mensual", amount: 8990, date: "25 Sep", category: "Entretenimiento", time: "09:00" },
    { id: 6, description: "Bencina Shell", amount: 35000, date: "24 Sep", category: "Transporte", time: "08:30" },
    { id: 7, description: "Almuerzo Trabajo", amount: 8900, date: "23 Sep", category: "Restaurantes", time: "13:00" },
    { id: 8, description: "Supermercado Santa Isabel", amount: 23450, date: "22 Sep", category: "Alimentación", time: "19:20" },
  ];

  const filteredExpenses = expenses.filter(expense => {
    const matchesCategory = selectedCategory === "Todos" || expense.category === selectedCategory;
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-header text-white shadow-card-hover rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Gastos de Septiembre</h2>
            <ArrowUpRight className="h-5 w-5" />
          </div>
          <p className="text-3xl font-bold mb-1">{formatCLP(monthlyExpenses)}</p>
          <p className="text-white/80">Promedio diario: {formatCLP(dailyAverage)}</p>
        </Card>

        <Card className="bg-gradient-card shadow-card rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Acciones Rápidas</h3>
            {isPro && (
              <Badge className="bg-accent text-accent-foreground px-2 py-1 rounded-full text-xs">
                PRO
              </Badge>
            )}
          </div>
          <div className="space-y-3">
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl py-3">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Gasto
            </Button>
            <Button variant="outline" className="w-full rounded-2xl py-3">
              <Filter className="h-4 w-4 mr-2" />
              Filtros Avanzados
            </Button>
          </div>
        </Card>
      </div>

      {/* Categories Overview */}
      <Card className="bg-gradient-card shadow-card rounded-3xl p-6">
        <h3 className="text-lg font-semibold mb-6">Gastos por Categoría</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((category) => {
            const IconComponent = categoryIcons[category.name as keyof typeof categoryIcons] || ShoppingCart;
            return (
              <div 
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className="cursor-pointer p-4 rounded-2xl hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="bg-primary/10 p-2 rounded-xl">
                    <IconComponent className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium">{category.name}</span>
                </div>
                <p className="text-lg font-bold text-card-foreground">{formatCLP(category.amount)}</p>
                <div className="flex items-center justify-between text-sm text-muted-foreground mt-1">
                  <span>{category.percentage}% del total</span>
                  <span>{category.transactions} transacciones</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Expenses List */}
      <Card className="bg-gradient-card shadow-card rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Lista de Gastos</h3>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar gastos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:outline-none"
            >
              <option value="Todos">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat.name} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="space-y-3">
          {filteredExpenses.map((expense) => {
            const IconComponent = categoryIcons[expense.category as keyof typeof categoryIcons] || ShoppingCart;
            return (
              <div key={expense.id} className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-2xl transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="bg-destructive/10 p-2 rounded-xl">
                    <IconComponent className="h-4 w-4 text-destructive" />
                  </div>
                  <div>
                    <p className="font-medium">{expense.description}</p>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>{expense.date}</span>
                      <span>•</span>
                      <span>{expense.time}</span>
                      <span>•</span>
                      <Badge variant="outline" className="text-xs px-2 py-0 rounded-full">
                        {expense.category}
                      </Badge>
                    </div>
                  </div>
                </div>
                <p className="font-semibold text-destructive text-lg">
                  -{formatCLP(expense.amount)}
                </p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default GastosView;