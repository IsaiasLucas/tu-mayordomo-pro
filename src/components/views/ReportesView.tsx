import React, { useState, useEffect } from "react";
import { useReportes } from "@/hooks/useReportes";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { es } from "date-fns/locale";
import { CHILE_TIMEZONE, chileDateOptions, formatDisplayInSantiago } from "@/lib/date-config";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download, FileText, Loader2, PieChart, Lock, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

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
  const [totalIngresos, setTotalIngresos] = useState(0);
  const [totalEgresos, setTotalEgresos] = useState(0);
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();
  
  const isPro = profile?.plan === "pro" || profile?.plan === "mensal" || profile?.plan === "anual";

  const COLORS = ['#4F46E5', '#EC4899', '#10B981', '#F59E0B', '#6366F1', '#8B5CF6', '#14B8A6', '#F97316'];

  const fetchMovimientos = async (startDate: Date, endDate: Date): Promise<Movimiento[]> => {
    const phone = profile?.phone_personal || profile?.phone_empresa;
    if (!phone) return [];

    try {
      const phoneDigits = phone.replace(/\D/g, "");
      const startISO = fromZonedTime(`${format(startDate, 'yyyy-MM-dd')}T00:00:00`, CHILE_TIMEZONE).toISOString();
      const endISO = fromZonedTime(`${format(endDate, 'yyyy-MM-dd')}T23:59:59`, CHILE_TIMEZONE).toISOString();
      
      const { data: gastos, error } = await (supabase as any)
        .from('gastos')
        .select('*')
        .eq('telefono', phoneDigits)
        .gte('created_at', startISO)
        .lte('created_at', endISO)
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

  useEffect(() => {
    const loadCurrentMonthData = async () => {
      if (!isPro) return;
      const phone = profile?.phone_personal || profile?.phone_empresa;
      if (!phone) return;
      
      const now = new Date();
      const startDate = startOfMonth(now);
      const endDate = endOfMonth(now);
      
      const movimientos = await fetchMovimientos(startDate, endDate);
      const data = processChartData(movimientos);
      setChartData(data);

      const ingresos = movimientos
        .filter(m => m.tipo.toLowerCase() === "ingreso" || m.tipo.toLowerCase() === "receita")
        .reduce((sum, m) => sum + Number(m.monto || 0), 0);
      
      const egresos = movimientos
        .filter(m => m.tipo.toLowerCase() === "egreso" || m.tipo.toLowerCase() === "despesa" || m.tipo.toLowerCase() === "gasto")
        .reduce((sum, m) => sum + Number(m.monto || 0), 0);

      setTotalIngresos(ingresos);
      setTotalEgresos(egresos);
    };

    loadCurrentMonthData();
  }, [isPro, profile]);

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
        headStyles: { fillColor: [79, 70, 229] },
      });
    }

    // Tabla de movimientos
    autoTable(doc, {
      startY: (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 10 : 130,
      head: [['Fecha', 'Descripción', 'Categoría', 'Tipo', 'Valor']],
body: movimientos.map(m => [
  formatDisplayInSantiago((m as any).created_at, "dd/MM/yyyy HH:mm"),
  m.descripcion,
  m.categoria || '-',
  m.tipo,
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(m.monto)
]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [79, 70, 229] },
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
        // Semana passada
        startDate = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
        endDate = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
        periodo = `${format(startDate, "dd/MM/yyyy")} - ${format(endDate, "dd/MM/yyyy")}`;
      } else if (tipo === "mensual") {
        // Mês passado
        startDate = startOfMonth(subMonths(now, 1));
        endDate = endOfMonth(subMonths(now, 1));
        periodo = format(startDate, "MMMM yyyy", { locale: es });
      } else if (tipo === "semanal_actual") {
        // Semana atual
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        endDate = endOfWeek(now, { weekStartsOn: 1 });
        periodo = `${format(startDate, "dd/MM/yyyy")} - ${format(endDate, "dd/MM/yyyy")}`;
      } else if (tipo === "mensual_actual") {
        // Mês atual
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        periodo = format(now, "MMMM yyyy", { locale: es });
      } else {
        // Personalizado
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

      // Descargar PDF
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

  if (!isPro) {
    return (
      <main className="p-4">
        <Card className="rounded-[24px] shadow-lg border-0">
          <CardContent className="p-8 sm:p-12 text-center">
            <div className="flex justify-center mb-4">
              <Lock className="h-16 w-16 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Recurso Pro</h2>
            <p className="text-muted-foreground mb-6 text-sm sm:text-base">
              Los reportes con análisis detallado y gráficos son exclusivos para usuarios Pro.
            </p>
            <Button size="lg" className="rounded-xl">
              Upgrade a Pro
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="p-4 space-y-4 pb-24">
      {/* Gráficos de Análisis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="rounded-[24px] shadow border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Gastos por Categoría (Mes Actual)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {chartData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Sin datos para mostrar
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <RechartsPieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percentage }) => `${name}: ${percentage.toFixed(0)}%`}
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value)}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[24px] shadow border-0">
          <CardHeader>
            <CardTitle>Gastos por Categoría (Detalle)</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Sin datos para mostrar
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value)}
                  />
                  <Bar dataKey="value" fill="#4F46E5" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resumen Mensual */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-[24px] shadow border-0">
          <CardContent className="p-4 sm:p-6">
            <div className="text-sm text-muted-foreground">Ingresos (Mes Actual)</div>
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(totalIngresos)}
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[24px] shadow border-0">
          <CardContent className="p-4 sm:p-6">
            <div className="text-sm text-muted-foreground">Egresos (Mes Actual)</div>
            <div className="text-xl sm:text-2xl font-bold text-red-600">
              {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(totalEgresos)}
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[24px] shadow border-0">
          <CardContent className="p-4 sm:p-6">
            <div className="text-sm text-muted-foreground">Saldo</div>
            <div className={cn("text-xl sm:text-2xl font-bold", totalIngresos - totalEgresos >= 0 ? "text-green-600" : "text-red-600")}>
              {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(totalIngresos - totalEgresos)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generar Reportes */}
      <Card className="rounded-[24px] shadow border-0">
        <CardHeader>
          <CardTitle>Generar Reportes PDF</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm sm:text-base">
            Genera reportes detallados en PDF con análisis por categoría para enviar a tu contador
          </p>
          
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <Button 
              onClick={() => generar("semanal_actual")} 
              className="rounded-xl flex items-center gap-2"
              disabled={generating !== null}
            >
              {generating === "semanal_actual" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Semana Atual
            </Button>
            <Button 
              onClick={() => generar("mensual_actual")} 
              className="rounded-xl flex items-center gap-2"
              disabled={generating !== null}
            >
              {generating === "mensual_actual" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Mes Atual
            </Button>
            <Button 
              onClick={() => generar("semanal")} 
              className="rounded-xl flex items-center gap-2"
              disabled={generating !== null}
            >
              {generating === "semanal" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Semana Pasada
            </Button>
            <Button 
              onClick={() => generar("mensual")} 
              className="rounded-xl flex items-center gap-2"
              disabled={generating !== null}
            >
              {generating === "mensual" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Mes Pasado
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 items-stretch">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="rounded-xl">
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
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="rounded-xl">
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
                />
              </PopoverContent>
            </Popover>

            <Button 
              onClick={() => generar("custom")} 
              className="rounded-xl flex items-center gap-2"
              disabled={generating !== null || !customStartDate || !customEndDate}
            >
              {generating === "custom" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Generar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Historial de Reportes */}
      <Card className="rounded-[24px] shadow border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Historial de Reportes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Ningún reporte generado aún. Haz clic en los botones de arriba para generar tu primer reporte.
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((r: any) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div>
                    <div className="font-medium capitalize">{r.tipo} · {r.periodo}</div>
                    <div className="text-sm text-muted-foreground">
                      Generado el {new Date(r.created_at).toLocaleString('es-CL', { 
                        ...chileDateOptions,
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    {r.data?.movimientos_count && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {r.data.movimientos_count} movimientos
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}