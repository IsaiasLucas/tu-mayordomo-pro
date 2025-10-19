import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useFacturas } from "@/hooks/useFacturas";
import { compressImage, validateFile } from "@/lib/imageCompression";
import { generateFacturasPDF } from "@/lib/pdfGenerator";
import { toast } from "@/hooks/use-toast";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { 
  Upload, 
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
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
  const { facturas, loading, uploadFactura, deleteFactura } = useFacturas();
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [tipo, setTipo] = useState<'factura' | 'boleta' | 'transferencia'>('factura');
  const [fechaDocumento, setFechaDocumento] = useState<Date>(new Date());
  const [monto, setMonto] = useState<string>('');
  const [descripcion, setDescripcion] = useState<string>('');
  const [filterPeriod, setFilterPeriod] = useState<'week' | 'month' | 'custom'>('month');
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [facturaToDelete, setFacturaToDelete] = useState<{ id: string; url: string } | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.valid) {
      toast({
        title: "Archivo no válido",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    try {
      // Comprimir si es imagen
      const processedFile = file.type.startsWith('image/') 
        ? await compressImage(file)
        : file;

      setSelectedFile(processedFile);

      // Generar preview
      if (processedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(processedFile);
      } else {
        setFilePreview(null);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Error",
        description: "No se pudo procesar el archivo",
        variant: "destructive",
      });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Selecciona un archivo",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      await uploadFactura(
        selectedFile,
        tipo,
        fechaDocumento,
        monto ? parseFloat(monto) : undefined,
        descripcion || undefined
      );
      
      // Reset form
      setSelectedFile(null);
      setFilePreview(null);
      setMonto('');
      setDescripcion('');
      setShowUploadDialog(false);
    } catch (error) {
      // Error ya manejado en el hook
    } finally {
      setUploading(false);
    }
  };

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

  const filteredFacturas = getFilteredFacturas();
  const totalMonto = filteredFacturas.reduce((sum, f) => sum + (f.monto || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="shadow-card border-0 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <div className="flex items-center justify-between">
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
            <Button 
              onClick={() => setShowUploadDialog(true)}
              className="h-11 px-6 shadow-elegant"
            >
              <Upload className="h-4 w-4 mr-2" />
              Subir Archivo
            </Button>
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
              Sube tu primera factura o boleta para comenzar
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFacturas.map((factura) => (
            <Card key={factura.id} className="shadow-card border-0 hover:shadow-card-hover transition-all duration-200">
              <CardContent className="p-4">
                {factura.archivo_url.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-muted">
                    <img 
                      src={factura.archivo_url} 
                      alt={factura.archivo_nombre}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-3">
                    <FileText className="h-16 w-16 text-primary" />
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
                      onClick={() => window.open(factura.archivo_url, '_blank')}
                    >
                      <ImageIcon className="h-3 w-3 mr-1" />
                      Ver
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

      {/* Dialog de subida */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Subir Factura o Boleta</DialogTitle>
            <DialogDescription>
              Los archivos de imagen se comprimirán automáticamente para optimizar el almacenamiento
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tipo de Documento</Label>
              <Select value={tipo} onValueChange={(v: any) => setTipo(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="factura">Factura</SelectItem>
                  <SelectItem value="boleta">Boleta</SelectItem>
                  <SelectItem value="transferencia">Comprobante de Transferencia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Archivo (Imagen o PDF)</Label>
              <Input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              {selectedFile && (
                <p className="text-xs text-muted-foreground">
                  {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>

            {filePreview && (
              <div className="aspect-video rounded-xl overflow-hidden bg-muted">
                <img src={filePreview} alt="Preview" className="w-full h-full object-contain" />
              </div>
            )}

            <div className="space-y-2">
              <Label>Fecha del Documento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    {format(fechaDocumento, "dd/MM/yyyy", { locale: es })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={fechaDocumento}
                    onSelect={(date) => date && setFechaDocumento(date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Monto (opcional)</Label>
              <Input
                type="number"
                placeholder="0"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Descripción (opcional)</Label>
              <Textarea
                placeholder="Ej: Compra de materiales de oficina..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowUploadDialog(false)}
              disabled={uploading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Subir
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
