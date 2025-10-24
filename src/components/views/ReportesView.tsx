import React, { useState, useEffect } from "react";
import { useReportes } from "@/hooks/useReportes";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths, eachDayOfInterval, parseISO } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { es } from "date-fns/locale";
import * as dateConfig from "@/lib/date-config";
const { CHILE_TIMEZONE, chileDateOptions, formatDatabaseDate } = dateConfig;
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download, FileText, Loader2, PieChart, Lock, Calendar, TrendingUp, TrendingDown, Activity, BarChart3, DollarSign, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FacturasBoletasSection from "@/components/FacturasBoletasSection";

interface Movimiento {
  fecha: string;
  monto: number;
  descripcion: string;
  tipo: string;
  categoria: string;
}

export default function ReportesView() {
  const { items, loading } = useReportes();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [generating, setGenerating] = useState<string | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [totalIngresos, setTotalIngresos] = useState(0);
  const [totalEgresos, setTotalEgresos] = useState(0);
  const [totalMovimientos, setTotalMovimientos] = useState(0);
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "lastMonth" | "custom">("month");
  const [recentMovimientos, setRecentMovimientos] = useState<Movimiento[]>([]);
  
  const isPro = profile?.plan === "pro" || profile?.plan === "mensal" || profile?.plan === "anual";

  const COLORS = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#6366F1', '#14B8A6', '#F97316', '#EF4444'];

  const fetchMovimientos = async (startDate: Date, endDate: Date): Promise<Movimiento[]> => {
    const phone = profile?.phone_personal || profile?.phone_empresa;
    if (!phone) return [];

    try {
      const { data: gastos, error } = await supabase
        .from('gastos')
        .select('*')
        .eq('user_id', user!.id)
        .gte('fecha', format(startDate, 'yyyy-MM-dd'))
        .lte('fecha', format(endDate, 'yyyy-MM-dd'))
        .order('created_at', { ascending: false });

      if (error) throw error;
      return gastos || [];
    } catch (error) {
      console.error("Error al cargar movimientos:", error);
    }
    return [];
  };

  const processChartData = (movimientos: Movimiento[]) => {
    const egresos = movimientos.filter(m => 
      m.tipo.toLowerCase() === "egreso" || 
      m.tipo.toLowerCase() === "despesa" || 
      m.tipo.toLowerCase() === "gasto"
    );

    const categorias: { [key: string]: number } = {};
    egresos.forEach(m => {
      const cat = m.categoria || "Sin categoría";
      categorias[cat] = (categorias[cat] || 0) + Number(m.monto || 0);
    });

    const data = Object.entries(categorias).map(([name, value]) => ({
      name,
      value,
      percentage: 0
    }));

    const total = data.reduce((sum, item) => sum + item.value, 0);
    data.forEach(item => {
      item.percentage = total > 0 ? (item.value / total) * 100 : 0;
    });

    return data.sort((a, b) => b.value - a.value);
  };

  const processTimelineData = (movimientos: Movimiento[], startDate: Date, endDate: Date) => {
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const timeline = days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayMovs = movimientos.filter(m => {
        const movDate = format(parseISO(m.fecha), 'yyyy-MM-dd');
        return movDate === dayStr;
      });

      const ingresos = dayMovs
        .filter(m => m.tipo.toLowerCase() === "ingreso" || m.tipo.toLowerCase() === "receita")
        .reduce((sum, m) => sum + Number(m.monto || 0), 0);
      
      const egresos = dayMovs
        .filter(m => m.tipo.toLowerCase() === "egreso" || m.tipo.toLowerCase() === "despesa" || m.tipo.toLowerCase() === "gasto")
        .reduce((sum, m) => sum + Number(m.monto || 0), 0);

      return {
        fecha: format(day, 'dd/MM', { locale: es }),
        ingresos,
        egresos,
        saldo: ingresos - egresos
      };
    });

    return timeline;
  };

  useEffect(() => {
    const loadPeriodData = async () => {
      if (!isPro) return;
      
      const now = new Date();
      let startDate: Date;
      let endDate: Date;

      if (selectedPeriod === "week") {
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        endDate = endOfWeek(now, { weekStartsOn: 1 });
      } else if (selectedPeriod === "month") {
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
      } else if (selectedPeriod === "lastMonth") {
        startDate = startOfMonth(subMonths(now, 1));
        endDate = endOfMonth(subMonths(now, 1));
      } else if (selectedPeriod === "custom" && customStartDate && customEndDate) {
        startDate = customStartDate;
        endDate = customEndDate;
      } else {
        return;
      }
      
      const movimientos = await fetchMovimientos(startDate, endDate);
      const data = processChartData(movimientos);
      setChartData(data);

      const timeline = processTimelineData(movimientos, startDate, endDate);
      setTimelineData(timeline);

      const ingresos = movimientos
        .filter(m => m.tipo.toLowerCase() === "ingreso" || m.tipo.toLowerCase() === "receita")
        .reduce((sum, m) => sum + Number(m.monto || 0), 0);
      
      const egresos = movimientos
        .filter(m => m.tipo.toLowerCase() === "egreso" || m.tipo.toLowerCase() === "despesa" || m.tipo.toLowerCase() === "gasto")
        .reduce((sum, m) => sum + Number(m.monto || 0), 0);

      setTotalIngresos(ingresos);
      setTotalEgresos(egresos);
      setTotalMovimientos(movimientos.length);
      setRecentMovimientos(movimientos.slice(0, 10));
    };

    loadPeriodData();
  }, [isPro, profile, selectedPeriod, customStartDate, customEndDate]);

  const generatePDF = (movimientos: Movimiento[], tipo: string, periodo: string) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text(`Reporte ${tipo}`, 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text(periodo, 105, 30, { align: "center" });
    const currentDate = new Date().toLocaleString('es-CL', chileDateOptions);
    doc.text(`Generado el: ${currentDate}`, 105, 37, { align: "center" });

    // Calcular totales
    const ingresos = movimientos
      .filter(m => m.tipo.toLowerCase() === "ingreso" || m.tipo.toLowerCase() === "receita")
      .reduce((sum, m) => sum + Number(m.monto || 0), 0);
    
    const egresos = movimientos
      .filter(m => m.tipo.toLowerCase() === "egreso" || m.tipo.toLowerCase() === "despesa" || m.tipo.toLowerCase() === "gasto")
      .reduce((sum, m) => sum + Number(m.monto || 0), 0);

    const saldo = ingresos - egresos;

    // Resumen
    doc.setFontSize(14);
    doc.text("Resumen Financiero", 14, 50);
    doc.setFontSize(11);
    doc.text(`Ingresos: ${new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(ingresos)}`, 14, 60);
    doc.text(`Egresos: ${new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(egresos)}`, 14, 67);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Saldo: ${new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(saldo)}`, 14, 77);
    doc.setFont(undefined, 'normal');

    // Análisis por categoría
    const categoryData = processChartData(movimientos);
    if (categoryData.length > 0) {
      doc.setFontSize(14);
      doc.text("Gastos por Categoría", 14, 90);
      
      autoTable(doc, {
        startY: 95,
        head: [['Categoría', 'Valor', '%']],
        body: categoryData.map(c => [
          c.name,
          new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(c.value),
          `${c.percentage.toFixed(1)}%`
        ]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [139, 92, 246] },
      });
    }

    // Tabla de movimientos
    autoTable(doc, {
      startY: (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 10 : 130,
      head: [['Fecha', 'Descripción', 'Categoría', 'Tipo', 'Valor']],
      body: movimientos.map(m => [
        formatDatabaseDate((m as any).created_at || m.fecha, "dd/MM/yyyy HH:mm"),
        m.descripcion,
        m.categoria || '-',
        m.tipo,
        new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(m.monto)
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [139, 92, 246] },
    });

    return doc;
  };

  const generar = async (
    tipo: "semanal" | "mensual" | "custom" | "semanal_actual" | "mensual_actual"
  ) => {
    const phone = profile?.phone_personal || profile?.phone_empresa;
    if (!user || !phone) {
      toast({
        title: "Error",
        description: "Es necesario tener un teléfono registrado para generar reportes.",
        variant: "destructive",
      });
      return;
    }

    if (tipo === "custom" && (!customStartDate || !customEndDate)) {
      toast({
        title: "Error",
        description: "Selecciona las fechas de inicio y fin.",
        variant: "destructive",
      });
      return;
    }

    setGenerating(tipo);

    try {
      const now = new Date();
      let startDate: Date;
      let endDate: Date;
      let periodo: string;

      if (tipo === "semanal") {
        startDate = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
        endDate = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
        periodo = `${format(startDate, "dd/MM/yyyy")} - ${format(endDate, "dd/MM/yyyy")}`;
      } else if (tipo === "mensual") {
        startDate = startOfMonth(subMonths(now, 1));
        endDate = endOfMonth(subMonths(now, 1));
        periodo = format(startDate, "MMMM yyyy", { locale: es });
      } else if (tipo === "semanal_actual") {
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        endDate = endOfWeek(now, { weekStartsOn: 1 });
        periodo = `${format(startDate, "dd/MM/yyyy")} - ${format(endDate, "dd/MM/yyyy")}`;
      } else if (tipo === "mensual_actual") {
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        periodo = format(now, "MMMM yyyy", { locale: es });
      } else {
        startDate = customStartDate!;
        endDate = customEndDate!;
        periodo = `${format(startDate, "dd/MM/yyyy")} - ${format(endDate, "dd/MM/yyyy")}`;
      }

      const tipoDb = tipo.startsWith("semanal") ? "semanal" : tipo.startsWith("mensual") ? "mensual" : "custom";
      const movimientos = await fetchMovimientos(startDate, endDate);

      if (movimientos.length === 0) {
        toast({
          title: "Sin movimientos",
          description: `No hay movimientos en el período ${periodo}.`,
          variant: "destructive",
        });
        return;
      }

      const doc = generatePDF(movimientos, tipo === "custom" ? "Personalizado" : tipo, periodo);

      // Guardar en la base de datos
      const { error } = await supabase
        .from('reportes')
        .insert({
          user_id: user.id,
          phone: phone,
          tipo: tipoDb,
          periodo: periodo,
          data: { movimientos_count: movimientos.length }
        });

      if (error) throw error;

      doc.save(`reporte-${tipo}-${format(now, "yyyy-MM-dd")}.pdf`);

      toast({
        title: "Reporte generado",
        description: `Tu reporte fue generado y descargado con éxito.`,
      });
    } catch (error: any) {
      console.error('Error al generar reporte:', error);
      toast({
        title: "Error al generar reporte",
        description: error.message || "Intenta nuevamente más tarde.",
        variant: "destructive",
      });
    } finally {
      setGenerating(null);
    }
  };

  const fmtCLP = (value: number) => {
    return new Intl.NumberFormat('es-CL', { 
      style: 'currency', 
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  if (!isPro) {
    return (
      <main className="px-4 py-5 animate-fade-in">
        <Card className="shadow-card border-0">
          <CardContent className="p-8 sm:p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="p-6 rounded-full bg-primary/10">
                <Lock className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-3">Reportes Pro</h2>
            <p className="text-muted-foreground mb-6 text-base max-w-md mx-auto">
              Los reportes con análisis detallado, gráficos y exportación PDF son exclusivos para usuarios Pro.
            </p>
            <Button size="lg" className="h-12 px-8">
              Upgrade a Pro
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="px-5 py-6 space-y-7 pb-28 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          Reportes Pro
        </h1>
        <p className="text-lg text-muted-foreground">
          Análisis detallado de tus finanzas y documentos
        </p>
      </div>

      {/* Tabs para organizar las secciones */}
      <Tabs defaultValue="analisis" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-14 mb-7">
          <TabsTrigger value="analisis" className="h-12 text-base data-[state=active]:shadow-elegant">
            <BarChart3 className="h-5 w-5 mr-2" />
            Análisis Financiero
          </TabsTrigger>
          <TabsTrigger value="facturas" className="h-12 text-base data-[state=active]:shadow-elegant">
            <Receipt className="h-5 w-5 mr-2" />
            Facturas y Boletas
          </TabsTrigger>
        </TabsList>

        {/* Tab de Análisis Financiero */}
        <TabsContent value="analisis" className="space-y-6 animate-fade-in">{/* ... keep existing code (filtros, KPIs, gráficos, generar PDFs, movimientos recientes) */}

      {/* Filtros de periodo */}
      <Card className="shadow-card border-0">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Button
                variant={selectedPeriod === "week" ? "default" : "outline"}
                onClick={() => setSelectedPeriod("week")}
                className="h-11 text-xs sm:text-sm px-2"
              >
                Semana Actual
              </Button>
              <Button
                variant={selectedPeriod === "month" ? "default" : "outline"}
                onClick={() => setSelectedPeriod("month")}
                className="h-12 text-sm sm:text-base px-3"
              >
                Mes Actual
              </Button>
              <Button
                variant={selectedPeriod === "lastMonth" ? "default" : "outline"}
                onClick={() => setSelectedPeriod("lastMonth")}
                className="h-12 text-sm sm:text-base px-3"
              >
                Mes Pasado
              </Button>
              <Button
                variant={selectedPeriod === "custom" ? "default" : "outline"}
                onClick={() => setSelectedPeriod("custom")}
                className="h-12 text-sm sm:text-base px-3"
              >
                Personalizado
              </Button>
            </div>

            {selectedPeriod === "custom" && (
              <div className="flex flex-col sm:flex-row gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      {customStartDate ? format(customStartDate, "dd/MM/yyyy") : "Fecha Inicio"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={customStartDate}
                      onSelect={setCustomStartDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      {customEndDate ? format(customEndDate, "dd/MM/yyyy") : "Fecha Fin"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={customEndDate}
                      onSelect={setCustomEndDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Ingresos */}
        <Card className="shadow-card border-0 overflow-hidden animate-fade-in">
          <CardContent className="p-7">
            <div className="flex items-center justify-between mb-4">
              <div className="p-4 rounded-xl bg-green-100 dark:bg-green-900/20">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-base text-muted-foreground font-medium">Ingresos</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 truncate">
                {fmtCLP(totalIngresos)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Egresos */}
        <Card className="shadow-card border-0 overflow-hidden animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardContent className="p-7">
            <div className="flex items-center justify-between mb-4">
              <div className="p-4 rounded-xl bg-red-100 dark:bg-red-900/20">
                <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-base text-muted-foreground font-medium">Egresos</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400 truncate">
                {fmtCLP(totalEgresos)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Saldo */}
        <Card className="shadow-card border-0 overflow-hidden animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <CardContent className="p-7">
            <div className="flex items-center justify-between mb-4">
              <div className={cn(
                "p-3 rounded-xl",
                totalIngresos - totalEgresos >= 0 
                  ? "bg-primary/10" 
                  : "bg-orange-100 dark:bg-orange-900/20"
              )}>
                <DollarSign className={cn(
                  "w-5 h-5",
                  totalIngresos - totalEgresos >= 0 
                    ? "text-primary" 
                    : "text-orange-600 dark:text-orange-400"
                )} />
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-base text-muted-foreground font-medium">Saldo</p>
              <p className={cn(
                "text-3xl font-bold truncate",
                totalIngresos - totalEgresos >= 0 
                  ? "text-primary" 
                  : "text-orange-600 dark:text-orange-400"
              )}>
                {fmtCLP(totalIngresos - totalEgresos)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Movimientos */}
        <Card className="shadow-card border-0 overflow-hidden animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <CardContent className="p-7">
            <div className="flex items-center justify-between mb-4">
              <div className="p-4 rounded-xl bg-blue-100 dark:bg-blue-900/20">
                <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-base text-muted-foreground font-medium">Movimientos</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {totalMovimientos}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
        {/* Donut Chart - Gastos por Categoría */}
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PieChart className="h-5 w-5 text-primary" />
              Gastos por Categoría
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            {chartData.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Sin datos para mostrar</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ percentage }) => `${percentage.toFixed(0)}%`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => fmtCLP(value)}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => <span className="text-sm">{value}</span>}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Categorías - Barras horizontales */}
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
              Top Categorías
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            {chartData.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Sin datos para mostrar</p>
              </div>
            ) : (
              <div className="space-y-4">
                {chartData.slice(0, 5).map((cat, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium truncate flex-1">{cat.name}</span>
                      <span className="text-muted-foreground ml-2">{cat.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${cat.percentage}%`,
                          backgroundColor: COLORS[index % COLORS.length]
                        }}
                      />
                    </div>
                    <p className="text-sm font-semibold" style={{ color: COLORS[index % COLORS.length] }}>
                      {fmtCLP(cat.value)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Timeline Chart */}
      {timelineData.length > 0 && (
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-primary" />
              Evolución Temporal
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEgresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="fecha" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value: number) => fmtCLP(value)}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="ingresos" 
                  stroke="#10B981" 
                  fillOpacity={1} 
                  fill="url(#colorIngresos)"
                  name="Ingresos"
                />
                <Area 
                  type="monotone" 
                  dataKey="egresos" 
                  stroke="#EF4444" 
                  fillOpacity={1} 
                  fill="url(#colorEgresos)"
                  name="Egresos"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Generar PDFs */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Download className="h-5 w-5 text-primary" />
            Generar Reportes PDF
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Descarga reportes detallados en PDF con análisis por categoría
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button 
              onClick={() => generar("semanal_actual")} 
              disabled={generating !== null}
              className="flex items-center justify-center gap-2 h-11 text-xs sm:text-sm px-3"
            >
              {generating === "semanal_actual" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span className="truncate">Semana Actual</span>
            </Button>
            <Button 
              onClick={() => generar("mensual_actual")} 
              disabled={generating !== null}
              className="flex items-center justify-center gap-2 h-11 text-xs sm:text-sm px-3"
            >
              {generating === "mensual_actual" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span className="truncate">Mes Actual</span>
            </Button>
            <Button 
              onClick={() => generar("semanal")} 
              disabled={generating !== null}
              className="flex items-center justify-center gap-2 h-11 text-xs sm:text-sm px-3"
            >
              {generating === "semanal" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span className="truncate">Semana Pasada</span>
            </Button>
            <Button 
              onClick={() => generar("mensual")} 
              disabled={generating !== null}
              className="flex items-center justify-center gap-2 h-11 text-xs sm:text-sm px-3"
            >
              {generating === "mensual" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span className="truncate">Mes Pasado</span>
            </Button>
          </div>

          {selectedPeriod === "custom" && customStartDate && customEndDate && (
            <Button 
              onClick={() => generar("custom")} 
              disabled={generating !== null}
              className="w-full sm:w-auto flex items-center gap-2"
            >
              {generating === "custom" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Generar Reporte Personalizado
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Movimientos recientes */}
      {recentMovimientos.length > 0 && (
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-primary" />
              Movimientos del Periodo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentMovimientos.map((mov, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        "text-xs px-2 py-1 rounded font-medium",
                        (mov.tipo.toLowerCase() === "ingreso" || mov.tipo.toLowerCase() === "receita")
                          ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                      )}>
                        {formatDatabaseDate((mov as any).created_at || mov.fecha, "dd/MM HH:mm")}
                       </span>
                      {mov.categoria && (
                        <span className="text-xs text-muted-foreground">• {mov.categoria}</span>
                      )}
                    </div>
                    <p className="font-medium truncate">{mov.descripcion}</p>
                  </div>
                  <span className={cn(
                    "font-bold text-lg ml-3 flex-shrink-0",
                    (mov.tipo.toLowerCase() === "ingreso" || mov.tipo.toLowerCase() === "receita")
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  )}>
                    {(mov.tipo.toLowerCase() === "ingreso" || mov.tipo.toLowerCase() === "receita") ? "+" : "-"}
                    {fmtCLP(Math.abs(Number(mov.monto)))}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
        </TabsContent>

        {/* Tab de Facturas y Boletas */}
        <TabsContent value="facturas" className="animate-fade-in">
          <FacturasBoletasSection />
        </TabsContent>
      </Tabs>
    </main>
  );
}
