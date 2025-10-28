import { useState } from "react";
import { useGastos } from "@/hooks/useGastos";
import { fmtCLP } from "@/lib/api";
import { chileDateOptions, formatDatabaseDate } from "@/lib/date-config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, AlertCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface GastosViewProps {
  profile: any;
}

export default function GastosView({ profile }: GastosViewProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>(
    format(new Date(), "yyyy-MM")
  );
  
  const { items, loading, isRevalidating } = useGastos(selectedMonth);
  const phone = profile?.phone_personal || profile?.phone_empresa;

  // Calcular totais a partir dos items em cache
  const totalIngresos = items
    .filter((m: any) => m.tipo?.toLowerCase() === "ingreso" || m.tipo?.toLowerCase() === "receita")
    .reduce((sum: number, m: any) => sum + Number(m.monto || 0), 0);
        
  const totalGastos = items
    .filter((m: any) => m.tipo?.toLowerCase() === "egreso" || m.tipo?.toLowerCase() === "gasto" || m.tipo?.toLowerCase() === "despesa")
    .reduce((sum: number, m: any) => sum + Number(m.monto || 0), 0);

  const saldo = totalIngresos - totalGastos;

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Encabezado
    doc.setFontSize(18);
    doc.text("Tu Mayordomo", 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Resumen ${selectedMonth} — ${phone}`, 20, 30);
    
    // Totales
    doc.setFontSize(14);
    doc.text("Totales del mes", 20, 45);
    
    doc.setFontSize(10);
    doc.text(`Ingresos: ${fmtCLP(totalIngresos)}`, 20, 55);
    doc.text(`Gastos: ${fmtCLP(totalGastos)}`, 20, 62);
    doc.text(`Saldo: ${fmtCLP(saldo)}`, 20, 69);
    
    // Tabla de movimientos
    const tableData = items.map(mov => [
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
      <div className="p-6 animate-fade-in">
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

  return (
    <div className="p-4 sm:p-5 md:p-7 space-y-4 sm:space-y-5 md:space-y-7 pb-24 sm:pb-28 bg-background">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-5">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Gastos</h1>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center w-full sm:w-auto">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2.5 border rounded-lg w-full sm:w-auto text-base sm:text-lg h-12 sm:h-13"
          />
          <Button onClick={handleDownloadPDF} className="w-full sm:w-auto h-12 sm:h-13 text-base sm:text-lg">
            <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Descargar PDF
          </Button>
        </div>
      </div>

      {/* Cards de totales - sempre mostrar do cache */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <Card className="rounded-xl sm:rounded-2xl">
          <CardHeader className="pb-3 px-5 sm:px-7 pt-5 sm:pt-7">
            <CardTitle className="text-sm sm:text-base font-medium text-muted-foreground">Ingresos</CardTitle>
          </CardHeader>
          <CardContent className="px-5 sm:px-7 pb-5 sm:pb-7">
            <div className="text-2xl sm:text-3xl font-bold text-green-600">
              {fmtCLP(totalIngresos)}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl sm:rounded-2xl">
          <CardHeader className="pb-3 px-5 sm:px-7 pt-5 sm:pt-7">
            <CardTitle className="text-sm sm:text-base font-medium text-muted-foreground">Gastos</CardTitle>
          </CardHeader>
          <CardContent className="px-5 sm:px-7 pb-5 sm:pb-7">
            <div className="text-2xl sm:text-3xl font-bold text-red-600">
              {fmtCLP(totalGastos)}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl sm:rounded-2xl">
          <CardHeader className="pb-3 px-5 sm:px-7 pt-5 sm:pt-7">
            <CardTitle className="text-sm sm:text-base font-medium text-muted-foreground">Saldo</CardTitle>
          </CardHeader>
          <CardContent className="px-5 sm:px-7 pb-5 sm:pb-7">
            <div className={`text-2xl sm:text-3xl font-bold ${saldo >= 0 ? 'text-primary' : 'text-red-600'}`}>
              {fmtCLP(saldo)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela com indicador de atualização em background */}
      <Card className="rounded-xl sm:rounded-2xl">
        <CardHeader className="px-5 sm:px-7 flex flex-row items-center justify-between">
          <CardTitle className="text-xl sm:text-2xl">Movimientos del mes</CardTitle>
          {isRevalidating && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="hidden sm:inline">Actualizando...</span>
            </div>
          )}
        </CardHeader>
        <CardContent className="px-5 sm:px-7">
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
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      {loading ? 'Cargando...' : 'Sin movimientos en este mes.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((mov: any) => (
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
