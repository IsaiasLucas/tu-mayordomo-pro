import React, { useState, useEffect } from "react";
import { useReportes } from "@/hooks/useReportes";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths } from "date-fns";
import { es } from "date-fns/locale";
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
      const response = await fetch(
        `https://script.google.com/macros/s/AKfycbxeeTtJBWnKJIXHAgXfmGrTym21lpL7cKnFUuTW45leWFVVdP9301aXQnr0sItTnn8vWA/exec?action=month&phone=${encodeURIComponent(phone)}&mes=${format(startDate, 'yyyy-MM')}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.ok && data.items && Array.isArray(data.items)) {
          return data.items.filter((m: Movimiento) => {
            const movDate = new Date(m.fecha);
            return movDate >= startDate && movDate <= endDate;
          });
        }
      }
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
      if (!isPro || !profile?.phone_personal) return;
      
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
    doc.text(`Relatório ${tipo}`, 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text(periodo, 105, 30, { align: "center" });
    doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 105, 37, { align: "center" });

    // Calcular totais
    const ingresos = movimientos
      .filter(m => m.tipo.toLowerCase() === "ingreso" || m.tipo.toLowerCase() === "receita")
      .reduce((sum, m) => sum + Number(m.monto || 0), 0);
    
    const egresos = movimientos
      .filter(m => m.tipo.toLowerCase() === "egreso" || m.tipo.toLowerCase() === "despesa" || m.tipo.toLowerCase() === "gasto")
      .reduce((sum, m) => sum + Number(m.monto || 0), 0);

    const saldo = ingresos - egresos;

    // Resumo
    doc.setFontSize(14);
    doc.text("Resumo Financeiro", 14, 50);
    doc.setFontSize(11);
    doc.text(`Ingresos: ${new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(ingresos)}`, 14, 60);
    doc.text(`Egresos: ${new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(egresos)}`, 14, 67);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Saldo: ${new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(saldo)}`, 14, 77);
    doc.setFont(undefined, 'normal');

    // Análise por categoria
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

    // Tabela de movimentos
    autoTable(doc, {
      startY: (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 10 : 130,
      head: [['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor']],
      body: movimientos.map(m => [
        format(new Date(m.fecha), "dd/MM/yyyy"),
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

  const generar = async (tipo: "semanal" | "mensual" | "custom") => {
    if (!user || !profile?.phone_personal) {
      toast({
        title: "Erro",
        description: "É necessário ter um telefone cadastrado para gerar relatórios.",
        variant: "destructive",
      });
      return;
    }

    if (tipo === "custom" && (!customStartDate || !customEndDate)) {
      toast({
        title: "Erro",
        description: "Selecione as datas de início e fim.",
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
      } else {
        startDate = customStartDate!;
        endDate = customEndDate!;
        periodo = `${format(startDate, "dd/MM/yyyy")} - ${format(endDate, "dd/MM/yyyy")}`;
      }

      const movimientos = await fetchMovimientos(startDate, endDate);

      if (movimientos.length === 0) {
        toast({
          title: "Sem movimentos",
          description: `Não há movimentos no período ${periodo}.`,
          variant: "destructive",
        });
        return;
      }

      const doc = generatePDF(movimientos, tipo === "custom" ? "Personalizado" : tipo, periodo);

      // Salvar no banco de dados
      const { error } = await supabase
        .from('reportes')
        .insert({
          user_id: user.id,
          phone: profile.phone_personal,
          tipo: tipo,
          periodo: periodo,
          data: { movimientos_count: movimientos.length }
        });

      if (error) throw error;

      // Download do PDF
      doc.save(`relatorio-${tipo}-${format(now, "yyyy-MM-dd")}.pdf`);

      toast({
        title: "Relatório gerado",
        description: `Seu relatório foi gerado e baixado com sucesso.`,
      });
    } catch (error: any) {
      console.error('Erro ao gerar relatório:', error);
      toast({
        title: "Erro ao gerar relatório",
        description: error.message || "Tente novamente mais tarde.",
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
          <CardContent className="p-12 text-center">
            <div className="flex justify-center mb-4">
              <Lock className="h-16 w-16 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Recurso Pro</h2>
            <p className="text-muted-foreground mb-6">
              Os relatórios com análise detalhada e gráficos são exclusivos para usuários Pro.
            </p>
            <Button size="lg" className="rounded-xl">
              Upgrade para Pro
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="p-4 space-y-4">
      {/* Gráficos de Análise */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="rounded-[24px] shadow border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Gastos por Categoria (Mês Atual)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Sem dados para mostrar
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage.toFixed(0)}%`}
                    outerRadius={80}
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
            <CardTitle>Gastos por Categoria (Detalle)</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Sem dados para mostrar
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

      {/* Resumo Mensal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-[24px] shadow border-0">
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Ingresos (Mês Atual)</div>
            <div className="text-2xl font-bold text-green-600">
              {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(totalIngresos)}
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[24px] shadow border-0">
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Egresos (Mês Atual)</div>
            <div className="text-2xl font-bold text-red-600">
              {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(totalEgresos)}
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[24px] shadow border-0">
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Saldo</div>
            <div className={cn("text-2xl font-bold", totalIngresos - totalEgresos >= 0 ? "text-green-600" : "text-red-600")}>
              {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(totalIngresos - totalEgresos)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gerar Relatórios */}
      <Card className="rounded-[24px] shadow border-0">
        <CardHeader>
          <CardTitle>Gerar Relatórios PDF</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Gere relatórios detalhados em PDF com análise por categoria para enviar ao seu contador
          </p>
          
          <div className="flex flex-wrap gap-3">
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
              Semana Passada
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
              Mês Passado
            </Button>
            
            <div className="flex gap-2 items-center">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="rounded-xl">
                    <Calendar className="h-4 w-4 mr-2" />
                    {customStartDate ? format(customStartDate, "dd/MM/yyyy") : "Data Início"}
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
                    {customEndDate ? format(customEndDate, "dd/MM/yyyy") : "Data Fim"}
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
                Gerar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Relatórios */}
      <Card className="rounded-[24px] shadow border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Histórico de Relatórios
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum relatório gerado ainda. Clique nos botões acima para gerar seu primeiro relatório.
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
                      Gerado em {format(new Date(r.created_at), "dd/MM/yyyy 'às' HH:mm")}
                    </div>
                    {r.data?.movimientos_count && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {r.data.movimientos_count} movimentos
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