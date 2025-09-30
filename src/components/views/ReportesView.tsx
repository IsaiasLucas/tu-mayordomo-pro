import React, { useState } from "react";
import { useReportes } from "@/hooks/useReportes";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download, FileText, Loader2 } from "lucide-react";

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

    // Tabela de movimentos
    autoTable(doc, {
      startY: 85,
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

  const generar = async (tipo: "semanal" | "mensual") => {
    if (!user || !profile?.phone_personal) {
      toast({
        title: "Erro",
        description: "É necessário ter um telefone cadastrado para gerar relatórios.",
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
      } else {
        startDate = startOfMonth(subMonths(now, 1));
        endDate = endOfMonth(subMonths(now, 1));
        periodo = format(startDate, "MMMM yyyy");
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

      const doc = generatePDF(movimientos, tipo, periodo);
      const pdfBlob = doc.output("blob");

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
        description: `Seu relatório ${tipo} foi gerado e baixado com sucesso.`,
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

  return (
    <main className="p-4 space-y-4">
      <div className="bg-white rounded-[24px] p-6 shadow">
        <h2 className="text-2xl font-bold mb-4">Gerar Relatórios</h2>
        <p className="text-gray-600 mb-6">
          Gere relatórios em PDF dos seus movimentos financeiros
        </p>
        
        <div className="flex gap-3">
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
            Relatório Semanal
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
            Relatório Mensal
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-[24px] p-6 shadow">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Histórico de Relatórios
        </h2>
        
        {loading ? (
          <div className="text-center py-8 text-gray-500">Carregando...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
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
                  <div className="text-sm text-gray-500">
                    Gerado em {format(new Date(r.created_at), "dd/MM/yyyy 'às' HH:mm")}
                  </div>
                  {r.data?.movimientos_count && (
                    <div className="text-xs text-gray-400 mt-1">
                      {r.data.movimientos_count} movimentos
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}