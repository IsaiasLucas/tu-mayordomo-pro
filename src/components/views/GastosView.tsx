import { useState, useEffect, useRef } from "react";
import { fmtCLP } from "@/lib/api";
import { CHILE_TIMEZONE, chileDateOptions, formatDatabaseDate, monthRangeUTCFromSantiago } from "@/lib/date-config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { supabase } from "@/integrations/supabase/client";

interface Movement {
  id: string;
  fecha: string;
  created_at?: string;
  descripcion: string;
  tipo: string;
  monto: number;
}

interface MonthData {
  items: Movement[];
  totalIngresos: number;
  totalGastos: number;
  saldo: number;
}

interface GastosViewProps {
  profile: any;
}

export default function GastosView({ profile }: GastosViewProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>(
    format(new Date(), "yyyy-MM")
  );
  const [phone, setPhone] = useState<string | null>(null);
  const [data, setData] = useState<MonthData>({ items: [], totalIngresos: 0, totalGastos: 0, saldo: 0 });
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    const checkUsuarioPhone = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Check telefono from usuarios table
        const { data: usuario } = await supabase
          .from('usuarios')
          .select('telefono')
          .eq('user_id', user.id)
          .maybeSingle();

        if (usuario?.telefono && usuario.telefono.trim() !== '') {
          setPhone(usuario.telefono);
          localStorage.setItem("tm_phone", usuario.telefono);
        }
      } catch (error) {
        console.error('Error checking usuario phone:', error);
      }
    };

    checkUsuarioPhone();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { startISO, endISO } = monthRangeUTCFromSantiago(selectedMonth);
        
        const { data: gastos, error } = await supabase
          .from('gastos')
          .select('*')
          .eq('user_id', user.id)
          .gte('fecha', selectedMonth + '-01')
          .lte('fecha', selectedMonth + '-31')
          .order('fecha', { ascending: false });

        if (error) throw error;

        const items = gastos || [];
        const totalIngresos = items
          .filter((m: any) => m.tipo?.toLowerCase() === "ingreso")
          .reduce((sum: number, m: any) => sum + Number(m.monto || 0), 0);
        
        const totalGastos = items
          .filter((m: any) => m.tipo?.toLowerCase() === "egreso" || m.tipo?.toLowerCase() === "gasto")
          .reduce((sum: number, m: any) => sum + Number(m.monto || 0), 0);

        // Debug temporal para investigar huso horário
        try {
          const sample = (items || []).slice(0, 5).map((m: any) => ({
            id: m.id,
            created_at_raw: m.created_at,
            fecha_raw: m.fecha,
            display_fecha: formatDatabaseDate(m.fecha, "dd/MM HH:mm"),
          }));
          console.log("[DEBUG Gastos] sample times:", sample);
        } catch (e) {
          console.log("[DEBUG Gastos] logging error", e);
        }

        setData({
          items,
          totalIngresos,
          totalGastos,
          saldo: totalIngresos - totalGastos
        });
      } catch (error) {
        console.error("Error fetching month data:", error);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchData();
    
    // Setup Realtime subscription
    const channel = supabase
      .channel('gastos-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'gastos'
        },
        async (payload) => {
          console.log('[Realtime] Change received:', payload);
          
          // Get current user
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;
          
          // Only refetch if the change is for the current user
          if ((payload.new as any)?.user_id === user.id || (payload.old as any)?.user_id === user.id) {
            // Silently refetch data without showing loading state
            try {
              const { data: gastos, error } = await supabase
                .from('gastos')
                .select('*')
                .eq('user_id', user.id)
                .gte('fecha', selectedMonth + '-01')
                .lte('fecha', selectedMonth + '-31')
                .order('fecha', { ascending: false });

              if (error) throw error;

              const items = gastos || [];
              const totalIngresos = items
                .filter((m: any) => m.tipo?.toLowerCase() === "ingreso")
                .reduce((sum: number, m: any) => sum + Number(m.monto || 0), 0);
              
              const totalGastos = items
                .filter((m: any) => m.tipo?.toLowerCase() === "egreso" || m.tipo?.toLowerCase() === "gasto")
                .reduce((sum: number, m: any) => sum + Number(m.monto || 0), 0);

              setData({
                items,
                totalIngresos,
                totalGastos,
                saldo: totalIngresos - totalGastos
              });
            } catch (error) {
              console.error("Error refreshing data:", error);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedMonth]);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Encabezado
    doc.setFontSize(18);
    doc.text("Tu Mayordomo", 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Resumen ${selectedMonth} — ${phone}`, 20, 30);
    
    // Totales
    doc.setFontSize(14);
    doc.text("Totales del mes", 20, 45);
    
    doc.setFontSize(10);
    doc.text(`Ingresos: ${fmtCLP(data.totalIngresos)}`, 20, 55);
    doc.text(`Gastos: ${fmtCLP(data.totalGastos)}`, 20, 62);
    doc.text(`Saldo: ${fmtCLP(data.saldo)}`, 20, 69);
    
    // Tabla de movimientos
const tableData = (data.items || []).map(mov => [
  formatDatabaseDate(mov.created_at || mov.fecha, "dd/MM HH:mm"),
  mov.descripcion,
  mov.tipo,
  fmtCLP(mov.monto)
]);
    
    autoTable(doc, {
      startY: 80,
      head: [["Fecha", "Descripción", "Tipo", "Monto"]],
      body: tableData,
      theme: "grid",
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [100, 100, 100],
        textColor: [255, 255, 255]
      }
    });
    
    // Pie de página
    const finalY = (doc as any).lastAutoTable.finalY || 80;
    doc.setFontSize(8);
    const generatedDate = new Date().toLocaleString('es-CL', chileDateOptions);
    doc.text(
      `Generado automáticamente el ${generatedDate}`,
      20,
      finalY + 15
    );
    
    // Guardar
    const fileName = `resumen-${selectedMonth}-${phone}.pdf`;
    doc.save(fileName);
  };


  if (!phone) {
    return (
      <div className="screen p-6 animate-fade-in" style={{ overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <Card className="shadow-card rounded-2xl border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertCircle className="w-6 h-6" />
              Configura tu WhatsApp
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-base text-muted-foreground">
              Necesitas configurar tu número de WhatsApp para ver tus gastos. Ve a la pestaña Inicio para completar tu perfil.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const paginatedMovements = (data.items || []).slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil((data.items || []).length / itemsPerPage);

  return (
    <div className="screen p-4 sm:p-5 md:p-7 space-y-4 sm:space-y-5 md:space-y-7 animate-fade-in" style={{ 
      overflow: 'auto', 
      WebkitOverflowScrolling: 'touch',
      minHeight: '100dvh'
    }}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-5">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Gastos</h1>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center w-full sm:w-auto">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2.5 border rounded-lg w-full sm:w-auto text-base sm:text-lg h-12 sm:h-13 touch-manipulation"
          />
          <Button onClick={handleDownloadPDF} className="w-full sm:w-auto h-12 sm:h-13 text-base sm:text-lg touch-manipulation">
            <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Descargar PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <Card className="rounded-xl sm:rounded-2xl">
          <CardHeader className="pb-3 px-5 sm:px-7 pt-5 sm:pt-7">
            <CardTitle className="text-sm sm:text-base font-medium text-muted-foreground">Ingresos</CardTitle>
          </CardHeader>
          <CardContent className="px-5 sm:px-7 pb-5 sm:pb-7">
            <div className="text-2xl sm:text-3xl font-bold text-green-600">
              {fmtCLP(data.totalIngresos)}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl sm:rounded-2xl">
          <CardHeader className="pb-3 px-5 sm:px-7 pt-5 sm:pt-7">
            <CardTitle className="text-sm sm:text-base font-medium text-muted-foreground">Gastos</CardTitle>
          </CardHeader>
          <CardContent className="px-5 sm:px-7 pb-5 sm:pb-7">
            <div className="text-2xl sm:text-3xl font-bold text-red-600">
              {fmtCLP(data.totalGastos)}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl sm:rounded-2xl">
          <CardHeader className="pb-3 px-5 sm:px-7 pt-5 sm:pt-7">
            <CardTitle className="text-sm sm:text-base font-medium text-muted-foreground">Saldo</CardTitle>
          </CardHeader>
          <CardContent className="px-5 sm:px-7 pb-5 sm:pb-7">
            <div className={`text-2xl sm:text-3xl font-bold ${data.saldo >= 0 ? 'text-primary' : 'text-red-600'}`}>
              {fmtCLP(data.saldo)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl sm:rounded-2xl">
        <CardHeader className="px-5 sm:px-7">
          <CardTitle className="text-xl sm:text-2xl">Movimientos del mes</CardTitle>
        </CardHeader>
        <CardContent className="px-5 sm:px-7">
          {loading ? (
            <div className="text-center py-8 sm:py-10 text-muted-foreground text-base sm:text-lg">
              Cargando movimientos...
            </div>
          ) : (
            <>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-sm sm:text-base md:text-lg py-4 sm:py-5 whitespace-nowrap">Fecha</TableHead>
                      <TableHead className="text-sm sm:text-base md:text-lg py-4 sm:py-5">Descripción</TableHead>
                      <TableHead className="text-sm sm:text-base md:text-lg py-4 sm:py-5 whitespace-nowrap">Tipo</TableHead>
                      <TableHead className="text-right text-sm sm:text-base md:text-lg py-4 sm:py-5 whitespace-nowrap">Monto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedMovements.map((mov) => (
                      <TableRow key={mov.id}>
        <TableCell className="py-4 sm:py-5 whitespace-nowrap text-sm sm:text-base md:text-lg">
          {formatDatabaseDate(mov.created_at || mov.fecha, "dd/MM HH:mm")}
        </TableCell>
                        <TableCell className="py-4 sm:py-5 text-sm sm:text-base md:text-lg">{mov.descripcion}</TableCell>
                        <TableCell className="py-4 sm:py-5">
                          <Badge
                            variant={
                              mov.tipo.toLowerCase().includes("ingreso") || 
                              mov.tipo.toLowerCase().includes("receita")
                                ? "default"
                                : "destructive"
                            }
                            className="text-sm sm:text-base whitespace-nowrap"
                          >
                            {mov.tipo}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium py-4 sm:py-5 whitespace-nowrap text-sm sm:text-base md:text-lg">
                          {fmtCLP(mov.monto)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {paginatedMovements.length === 0 && (
                <div className="text-center py-6 sm:py-8 text-muted-foreground text-sm sm:text-base">
                  Sin movimientos en este mes.
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-3 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-full sm:w-auto h-10 text-sm sm:text-base touch-manipulation"
                  >
                    Anterior
                  </Button>
                  <span className="px-3 sm:px-4 py-2 text-sm sm:text-base">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-full sm:w-auto h-10 text-sm sm:text-base touch-manipulation"
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}