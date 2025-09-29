import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Plus, 
  Search, 
  Filter,
  ArrowUpDown,
  ArrowUpRight,
  ArrowDownRight,
  Calendar
} from "lucide-react";
import { CATEGORIES, getCategoryById } from "@/lib/categories";
import { toast } from "@/hooks/use-toast";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  type: 'income' | 'expense';
}

interface GastosViewProps {
  isPro: boolean;
}

const GastosView = ({ isPro }: GastosViewProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: "1", description: "Supermercado Jumbo", amount: -45670, date: "2024-09-29", category: "alimentacion", type: "expense" },
    { id: "2", description: "Sueldo Empresa", amount: 1850000, date: "2024-09-28", category: "finanzas", type: "income" },
    { id: "3", description: "Farmacia Cruz Verde", amount: -18950, date: "2024-09-27", category: "salud", type: "expense" },
    { id: "4", description: "Uber", amount: -8500, date: "2024-09-26", category: "transporte", type: "expense" },
    { id: "5", description: "Netflix", amount: -8990, date: "2024-09-25", category: "ocio", type: "expense" },
    { id: "6", description: "Arriendo", amount: -350000, date: "2024-09-01", category: "vivienda", type: "expense" },
    { id: "7", description: "Universidad", amount: -120000, date: "2024-09-15", category: "educacion", type: "expense" },
    { id: "8", description: "iPhone 15", amount: -850000, date: "2024-09-20", category: "tecnologia", type: "expense" },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const [newTransaction, setNewTransaction] = useState({
    description: "",
    amount: "",
    category: "",
    type: "expense" as "income" | "expense"
  });

  const formatCLP = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(Math.abs(amount));
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || transaction.category === selectedCategory;
    const matchesType = selectedType === "all" || transaction.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // Gastos por categoría
  const expensesByCategory = CATEGORIES.map(category => {
    const categoryTransactions = transactions.filter(t => 
      t.type === 'expense' && t.category === category.id
    );
    const total = categoryTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const percentage = totalExpenses > 0 ? (total / totalExpenses) * 100 : 0;
    
    return {
      ...category,
      amount: total,
      percentage: Math.round(percentage),
      transactions: categoryTransactions.length
    };
  }).filter(cat => cat.amount > 0);

  const handleAddTransaction = () => {
    if (!newTransaction.description || !newTransaction.amount || !newTransaction.category) {
      toast({
        title: "Campos requeridos",
        description: "Por favor, complete todos los campos",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(newTransaction.amount);
    if (isNaN(amount)) {
      toast({
        title: "Monto inválido",
        description: "Por favor, ingrese un monto válido",
        variant: "destructive"
      });
      return;
    }

    const transaction: Transaction = {
      id: Date.now().toString(),
      description: newTransaction.description,
      amount: newTransaction.type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
      date: new Date().toISOString().split('T')[0],
      category: newTransaction.category,
      type: newTransaction.type
    };

    setTransactions(prev => [transaction, ...prev]);
    setNewTransaction({ description: "", amount: "", category: "", type: "expense" });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Transacción agregada",
      description: `${newTransaction.type === 'income' ? 'Ingreso' : 'Gasto'} registrado correctamente`
    });
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-card shadow-card rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-success/10 p-3 rounded-2xl">
              <ArrowDownRight className="h-5 w-5 text-success" />
            </div>
            <Badge className="bg-success/20 text-success px-3 py-1">Ingresos</Badge>
          </div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Ingresos</h3>
          <p className="text-2xl font-bold text-success">{formatCLP(totalIncome)}</p>
        </Card>

        <Card className="bg-gradient-card shadow-card rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-destructive/10 p-3 rounded-2xl">
              <ArrowUpRight className="h-5 w-5 text-destructive" />
            </div>
            <Badge className="bg-destructive/20 text-destructive px-3 py-1">Gastos</Badge>
          </div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Gastos</h3>
          <p className="text-2xl font-bold text-destructive">{formatCLP(totalExpenses)}</p>
        </Card>
      </div>

      {/* Categories Overview */}
      <Card className="bg-gradient-card shadow-card rounded-3xl p-6">
        <h3 className="text-lg font-semibold mb-6">Gastos por Categoría</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {expensesByCategory.map((category) => {
            const IconComponent = category.icon;
            return (
              <div 
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className="cursor-pointer p-4 rounded-2xl hover:bg-muted/50 transition-colors border border-transparent hover:border-primary/20"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="bg-primary/10 p-2 rounded-xl">
                    <IconComponent className={`h-4 w-4 ${category.color}`} />
                  </div>
                  <span className="font-medium text-sm">{category.name}</span>
                </div>
                <p className="text-lg font-bold text-card-foreground">{formatCLP(category.amount)}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                  <span>{category.percentage}%</span>
                  <span>{category.transactions} transacciones</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Controls */}
      <Card className="bg-gradient-card shadow-card rounded-3xl p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar transacciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48 rounded-xl">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">Todas las categorías</SelectItem>
                {CATEGORIES.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center space-x-2">
                      <category.icon className={`h-4 w-4 ${category.color}`} />
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-40 rounded-xl">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="income">Ingresos</SelectItem>
                <SelectItem value="expense">Gastos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl">
                <Plus className="h-4 w-4 mr-2" />
                Agregar
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-3xl">
              <DialogHeader>
                <DialogTitle>Nueva Transacción</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Input
                    id="description"
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Ej: Supermercado"
                    className="rounded-xl mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="amount">Monto (CLP)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="50000"
                    className="rounded-xl mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <Select value={newTransaction.category} onValueChange={(value) => setNewTransaction(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger className="rounded-xl mt-2">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {CATEGORIES.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center space-x-2">
                            <category.icon className={`h-4 w-4 ${category.color}`} />
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <Select value={newTransaction.type} onValueChange={(value: "income" | "expense") => setNewTransaction(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger className="rounded-xl mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="expense">Gasto</SelectItem>
                      <SelectItem value="income">Ingreso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleAddTransaction} className="w-full rounded-xl">
                  Agregar Transacción
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      {/* Transactions List */}
      <Card className="bg-gradient-card shadow-card rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Transacciones</h3>
          <Badge variant="secondary">{filteredTransactions.length} resultados</Badge>
        </div>

        <div className="space-y-4">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No se encontraron transacciones</p>
            </div>
          ) : (
            filteredTransactions.map((transaction) => {
              const category = getCategoryById(transaction.category);
              const CategoryIcon = category?.icon || Calendar;

              return (
                <div key={transaction.id} className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-2xl transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-xl ${
                      transaction.type === 'income' 
                        ? 'bg-success/10' 
                        : 'bg-destructive/10'
                    }`}>
                      <CategoryIcon className={`h-4 w-4 ${category?.color || 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>{new Date(transaction.date).toLocaleDateString('es-CL')}</span>
                        <span>•</span>
                        <span>{category?.name || 'Sin categoría'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'income' ? 'text-success' : 'text-destructive'
                    }`}>
                      {transaction.type === 'income' ? '+' : ''}{formatCLP(Math.abs(transaction.amount))}
                    </p>
                    <Badge 
                      variant={transaction.type === 'income' ? 'default' : 'secondary'}
                      className="text-xs mt-1"
                    >
                      {transaction.type === 'income' ? 'Ingreso' : 'Gasto'}
                    </Badge>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
};

export default GastosView;