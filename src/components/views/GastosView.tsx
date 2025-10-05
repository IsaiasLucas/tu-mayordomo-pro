import { useState, useEffect, useRef } from "react";
import { fmtCLP } from "@/lib/api";
import { CHILE_TIMEZONE, chileDateOptions, formatDisplayInSantiago } from "@/lib/date-config";
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
import CompleteProfileModal from "@/components/CompleteProfileModal";
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

export default function GastosView() {
  const [selectedMonth, setSelectedMonth] = useState<string>(
    format(new Date(), "yyyy-MM")
  );
  const [phone, setPhone] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [data, setData] = useState<MonthData>({ items: [], totalIngresos: 0, totalGastos: 0, saldo: 0 });
  const [loading, setLoading] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const storedPhone = localStorage.getItem("tm_phone");
    setPhone(storedPhone);
    
    // Si no hay phone, mostrar modal
    if (!storedPhone) {
      setShowProfileModal(true);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!initialLoadComplete) {
        setLoading(true);
      }
      try {
        // Get authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const startDate = `${selectedMonth}-01`;
        const endDate = new Date(
          parseInt(selectedMonth.split('-')[0]), 
          parseInt(selectedMonth.split('-')[1]), 
          0
        ).toISOString().split('T')[0];
        
        const { data: gastos, error } = await supabase
          .from('gastos')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', startDate)
          .lte('created_at', `${endDate} 23:59:59`)
          .order('created_at', { ascending: false });

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
        setInitialLoadComplete(true);
      } catch (error) {
        console.error("Error fetching month data:", error);
      } finally {
        if (!initialLoadComplete) {
          setLoading(false);
        }
      }
    };

    // Initial fetch
    fetchData();
    
    // Setup polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    pollingIntervalRef.current = setInterval(() => {
      fetchData();
    }, 5000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
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
  formatDisplayInSantiago((mov as any).created_at || mov.fecha, "dd/MM HH:mm"),
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

  const handleProfileModalClose = () => {
    // Verificar si ahora hay phone guardado
    const storedPhone = localStorage.getItem("tm_phone");
    setPhone(storedPhone);
    setShowProfileModal(false);
  };

  if (!phone) {
    return (
      <>
        <div className="p-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              ⚠️ Falta confirmar tu WhatsApp para vincular tu cuenta.
            </AlertDescription>
          </Alert>
        </div>
        <CompleteProfileModal 
          open={showProfileModal}
          onClose={handleProfileModalClose}
        />
      </>
    );
  }

  const paginatedMovements = (data.items || []).slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil((data.items || []).length / itemsPerPage);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Gastos</h1>
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full sm:w-auto">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border rounded-md w-full sm:w-auto text-base"
          />
          <Button onClick={handleDownloadPDF} className="w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            Descargar PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ingresos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {fmtCLP(data.totalIngresos)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gastos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {fmtCLP(data.totalGastos)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data.saldo >= 0 ? 'text-primary' : 'text-red-600'}`}>
              {fmtCLP(data.saldo)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Movimientos del mes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-base py-4">Fecha</TableHead>
                      <TableHead className="text-base py-4">Descripción</TableHead>
                      <TableHead className="text-base py-4">Tipo</TableHead>
                      <TableHead className="text-right text-base py-4">Monto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <TableRow key={i}>
                        <TableCell className="py-4"><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell className="py-4"><Skeleton className="h-5 w-40" /></TableCell>
                        <TableCell className="py-4"><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell className="text-right py-4"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-base py-4 whitespace-nowrap">Fecha</TableHead>
                      <TableHead className="text-base py-4">Descripción</TableHead>
                      <TableHead className="text-base py-4 whitespace-nowrap">Tipo</TableHead>
                      <TableHead className="text-right text-base py-4 whitespace-nowrap">Monto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedMovements.map((mov) => (
                      <TableRow key={mov.id}>
                        <TableCell className="py-4 whitespace-nowrap text-base">
                          {formatDisplayInSantiago((mov as any).created_at || mov.fecha, "dd/MM HH:mm")}
                        </TableCell>
                        <TableCell className="py-4 text-base">{mov.descripcion}</TableCell>
                        <TableCell className="py-4">
                          <Badge
                            variant={
                              mov.tipo.toLowerCase().includes("ingreso") || 
                              mov.tipo.toLowerCase().includes("receita")
                                ? "default"
                                : "destructive"
                            }
                            className="text-sm whitespace-nowrap"
                          >
                            {mov.tipo}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium py-4 whitespace-nowrap text-base">
                          {fmtCLP(mov.monto)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {paginatedMovements.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Sin movimientos en este mes.
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <span className="px-4 py-2">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
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