import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFacturas } from "@/hooks/useFacturas";
import { generateFacturasPDF } from "@/lib/pdfGenerator";
import { toast } from "@/hooks/use-toast";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { 
  FileText, 
  Download, 
  Trash2, 
  Image as ImageIcon, 
  FileCheck, 
  Calendar,
  Filter,
  Loader2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function FacturasBoletasSection() {
  const { facturas, loading, deleteFactura } = useFacturas();
  const [filterPeriod, setFilterPeriod] = useState<'week' | 'month' | 'custom'>('month');
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [facturaToDelete, setFacturaToDelete] = useState<{ id: string; url: string } | null>(null);
  const [viewingFactura, setViewingFactura] = useState<{ url: string; nombre: string } | null>(null);

  const getFilteredFacturas = () => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    if (filterPeriod === 'week') {
      startDate = startOfWeek(now, { weekStartsOn: 1 });
      endDate = endOfWeek(now, { weekStartsOn: 1 });
    } else if (filterPeriod === 'month') {
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
    } else if (filterPeriod === 'custom' && customStartDate && customEndDate) {
      startDate = customStartDate;
      endDate = customEndDate;
    } else {
      return facturas;
    }

    return facturas.filter(f => {
      const fechaDoc = new Date(f.fecha_documento);
      return fechaDoc >= startDate && fechaDoc <= endDate;
    });
  };

  const handleDownloadPDF = async () => {
    const filtered = getFilteredFacturas();
    
    if (filtered.length === 0) {
      toast({
        title: "Sin facturas",
        description: "No hay facturas en el período seleccionado",
        variant: "destructive",
      });
      return;
    }

    setGeneratingPDF(true);
    try {
      const now = new Date();
      let startDate: Date;
      let endDate: Date;

      if (filterPeriod === 'week') {
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        endDate = endOfWeek(now, { weekStartsOn: 1 });
      } else if (filterPeriod === 'month') {
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
      } else if (filterPeriod === 'custom' && customStartDate && customEndDate) {
        startDate = customStartDate;
        endDate = customEndDate;
      } else {
        startDate = new Date(2020, 0, 1);
        endDate = now;
      }

      await generateFacturasPDF(filtered, { desde: startDate, hasta: endDate });
      
      toast({
        title: "PDF generado",
        description: "El archivo se ha descargado correctamente",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el PDF",
        variant: "destructive",
      });
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleDownloadFile = (url: string, nombre: string) => {
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = nombre;
      link.target = '_blank';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download iniciado",
        description: "O arquivo está sendo baixado",
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Erro",
        description: "Não foi possível baixar o arquivo",
        variant: "destructive",
      });
    }
  };

  const filteredFacturas = getFilteredFacturas();
  const totalMonto = filteredFacturas.reduce((sum, f) => sum + (f.monto || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="shadow-card border-0 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Facturas y Boletas</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Gestiona y organiza tus comprobantes
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filtros y acciones */}
      <Card className="shadow-card border-0">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Filtrar por período:</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={filterPeriod === 'week' ? 'default' : 'outline'}
                onClick={() => setFilterPeriod('week')}
                className="h-10"
              >
                Esta Semana
              </Button>
              <Button
                variant={filterPeriod === 'month' ? 'default' : 'outline'}
                onClick={() => setFilterPeriod('month')}
                className="h-10"
              >
                Este Mes
              </Button>
              <Button
                variant={filterPeriod === 'custom' ? 'default' : 'outline'}
                onClick={() => setFilterPeriod('custom')}
                className="h-10"
              >
                Personalizado
              </Button>
            </div>

            {filterPeriod === 'custom' && (
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      {customStartDate ? format(customStartDate, "dd/MM/yyyy") : "Desde"}
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
                      {customEndDate ? format(customEndDate, "dd/MM/yyyy") : "Hasta"}
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

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {filteredFacturas.length} documentos • Monto total: ${totalMonto.toLocaleString('es-CL')}
              </div>
              <Button
                onClick={handleDownloadPDF}
                disabled={filteredFacturas.length === 0 || generatingPDF}
                variant="outline"
                className="h-10"
              >
                {generatingPDF ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Descargar PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Galería de facturas */}
      {loading ? (
        <Card className="shadow-card border-0">
          <CardContent className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground mt-4">Cargando facturas...</p>
          </CardContent>
        </Card>
      ) : filteredFacturas.length === 0 ? (
        <Card className="shadow-card border-0">
          <CardContent className="p-12 text-center">
            <div className="p-6 rounded-full bg-muted/50 w-fit mx-auto mb-4">
              <FileCheck className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No hay facturas</h3>
            <p className="text-muted-foreground">
              No se encontraron facturas en el período seleccionado
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFacturas.map((factura) => (
            <Card key={factura.id} className="shadow-card border-0 hover:shadow-card-hover transition-all duration-200">
              <CardContent className="p-4">
                {factura.archivo_url ? (
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-muted">
                    <img 
                      src={factura.archivo_url} 
                      alt={factura.archivo_nombre}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.innerHTML = '<div class="w-full h-full flex flex-col items-center justify-center text-muted-foreground"><p class="text-sm">Sem imagem disponível 📄</p></div>';
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="aspect-video rounded-xl bg-muted flex flex-col items-center justify-center mb-3">
                    <p className="text-sm text-muted-foreground">Sem imagem disponível 📄</p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-sm line-clamp-1">{factura.archivo_nombre}</h4>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium whitespace-nowrap">
                      {factura.tipo.charAt(0).toUpperCase() + factura.tipo.slice(1)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(factura.fecha_documento), "dd MMM yyyy", { locale: es })}
                  </div>
                  
                  {factura.monto && (
                    <div className="text-lg font-bold text-primary">
                      ${factura.monto.toLocaleString('es-CL')}
                    </div>
                  )}
                  
                  {factura.descripcion && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {factura.descripcion}
                    </p>
                  )}
                  
                  <div className="pt-2 border-t flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-9"
                      onClick={() => setViewingFactura({ url: factura.archivo_url, nombre: factura.archivo_nombre })}
                    >
                      <ImageIcon className="h-3 w-3 mr-1" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9"
                      onClick={() => handleDownloadFile(factura.archivo_url, factura.archivo_nombre)}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9"
                      onClick={() => setFacturaToDelete({ id: factura.id, url: factura.archivo_url })}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog de visualización de factura */}
      <AlertDialog open={!!viewingFactura} onOpenChange={() => setViewingFactura(null)}>
        <AlertDialogContent className="max-w-[90vw]">
          <AlertDialogHeader>
            <AlertDialogTitle>{viewingFactura?.nombre}</AlertDialogTitle>
            <AlertDialogDescription>
              Visualización del documento
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="p-4">
            {viewingFactura?.url ? (
              <img 
                src={viewingFactura.url} 
                alt={viewingFactura.nombre}
                className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                onError={(e) => {
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.innerHTML = '<div class="flex flex-col items-center justify-center p-12 bg-muted rounded-lg"><p class="text-lg text-muted-foreground">Sem imagem disponível 📄</p></div>';
                  }
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-12 bg-muted rounded-lg">
                <p className="text-lg text-muted-foreground">Sem imagem disponível 📄</p>
              </div>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cerrar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de confirmación de eliminación */}
      <AlertDialog open={!!facturaToDelete} onOpenChange={() => setFacturaToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar factura?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El archivo se eliminará permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (facturaToDelete) {
                  await deleteFactura(facturaToDelete.id, facturaToDelete.url);
                  setFacturaToDelete(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
