import { useState, useEffect } from "react";
import { fmtCLP } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import CompleteProfileModal from "@/components/CompleteProfileModal";

interface Movement {
  id: string;
  fecha: string;
  descripcion: string;
  tipo: string;
  monto: number;
}

interface MonthData {
  movements: Movement[];
  totals: {
    ingresos: number;
    gastos: number;
    saldo: number;
  };
}

export default function GastosView() {
  const [selectedMonth, setSelectedMonth] = useState<string>(
    format(new Date(), "yyyy-MM")
  );
  const [phone, setPhone] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [data, setData] = useState<MonthData>({ movements: [], totals: { ingresos: 0, gastos: 0, saldo: 0 } });
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    const storedPhone = localStorage.getItem("tm_phone");
    setPhone(storedPhone);
    
    // Si no hay phone, mostrar modal
    if (!storedPhone) {
      setShowProfileModal(true);
    }
  }, []);

  useEffect(() => {
    if (!phone) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const url = `https://script.google.com/macros/s/AKfycbxyXBVTvevLlh59jTps_0lH9FCArcKrumWdu3_h0B1P_QNzG-etIan-g-_1SlatTYRaNQ/exec?action=month&phone=${encodeURIComponent(phone)}&ym=${selectedMonth}`;
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.ok) {
          setData(result);
        }
      } catch (error) {
        console.error("Error fetching month data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [phone, selectedMonth]);

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
    doc.text(`Ingresos: ${fmtCLP(data.totals.ingresos)}`, 20, 55);
    doc.text(`Gastos: ${fmtCLP(data.totals.gastos)}`, 20, 62);
    doc.text(`Saldo: ${fmtCLP(data.totals.saldo)}`, 20, 69);
    
    // Tabla de movimientos
    const tableData = data.movements.map(mov => [
      format(new Date(mov.fecha), "dd/MM HH:mm"),
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
    doc.text(
      `Generado automáticamente el ${format(new Date(), "dd/MM/yyyy HH:mm")}`,
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

  const paginatedMovements = data.movements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(data.movements.length / itemsPerPage);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Gastos</h1>
        <div className="flex gap-3 items-center">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />
          <Button onClick={handleDownloadPDF}>
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
              {fmtCLP(data.totals.ingresos)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gastos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {fmtCLP(data.totals.gastos)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data.totals.saldo >= 0 ? 'text-primary' : 'text-red-600'}`}>
              {fmtCLP(data.totals.saldo)}
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
            <div className="text-center py-8">Cargando...</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedMovements.map((mov) => (
                    <TableRow key={mov.id}>
                      <TableCell>
                        {format(new Date(mov.fecha), "dd/MM HH:mm")}
                      </TableCell>
                      <TableCell>{mov.descripcion}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            mov.tipo.toLowerCase().includes("ingreso") || 
                            mov.tipo.toLowerCase().includes("receita")
                              ? "default"
                              : "destructive"
                          }
                        >
                          {mov.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {fmtCLP(mov.monto)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

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