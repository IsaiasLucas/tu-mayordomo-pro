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
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [viewingFactura, setViewingFactura] = useState<{ url: string; nombre: string } | null>(null);

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

  const handleDownloadFile = async (url: string, nombre: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = nombre;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      toast({
        title: "Descarga iniciada",
        description: "El archivo se está descargando",
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Error",
        description: "No se pudo descargar el archivo",
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

      {/* Dialog de subida */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-[520px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-br from-primary/5 via-accent/5 to-transparent">
            <DialogTitle className="text-xl flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
                <Upload className="h-5 w-5 text-primary" />
              </div>
              Subir Documento
            </DialogTitle>
            <DialogDescription className="text-xs">
              Las imágenes se comprimirán automáticamente para optimizar el almacenamiento
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 px-6">
            <div className="space-y-5 py-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Tipo de Documento
                </Label>
                <Select value={tipo} onValueChange={(v: any) => setTipo(v)}>
                  <SelectTrigger className="h-12 border-border/50 hover:border-primary/50 bg-card hover:bg-primary/5 transition-all">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="factura">
                      <div className="flex items-center gap-3 py-1">
                        <div className="p-1.5 rounded-md bg-primary/10">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <span>Factura</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="boleta">
                      <div className="flex items-center gap-3 py-1">
                        <div className="p-1.5 rounded-md bg-accent/10">
                          <FileCheck className="h-4 w-4 text-accent" />
                        </div>
                        <span>Boleta</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="transferencia">
                      <div className="flex items-center gap-3 py-1">
                        <div className="p-1.5 rounded-md bg-success/10">
                          <FileText className="h-4 w-4 text-success" />
                        </div>
                        <span>Transferencia</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-primary" />
                  Archivo (PDF o Imagen)
                </Label>
                <div className="relative">
                  <Input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload-input"
                  />
                  <label
                    htmlFor="file-upload-input"
                    className="flex flex-col items-center justify-center gap-3 h-32 border-2 border-dashed border-border/50 rounded-xl cursor-pointer hover:border-primary/50 hover:bg-gradient-to-br hover:from-primary/5 hover:to-accent/5 transition-all duration-200 group"
                  >
                    {selectedFile ? (
                      <div className="flex items-center gap-3 text-sm px-4">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
                          <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-foreground line-clamp-1">{selectedFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <div className="p-3 rounded-full bg-muted/50 group-hover:bg-primary/10 transition-colors">
                          <Upload className="w-7 h-7 group-hover:text-primary transition-colors" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium">Haz clic para seleccionar</p>
                          <p className="text-xs text-muted-foreground/70">o arrastra el archivo aquí</p>
                        </div>
                      </div>
                    )}
                  </label>
                </div>
                
                {filePreview && (
                  <div className="mt-3 relative group">
                    <div className="relative rounded-xl overflow-hidden border-2 border-border/50 shadow-lg">
                      <img 
                        src={filePreview} 
                        alt="Preview" 
                        className="w-full h-56 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="absolute bottom-3 left-3 right-3">
                          <p className="text-white text-xs font-medium">Vista previa del documento</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Fecha del Documento
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-12 justify-start text-left font-normal border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all"
                    >
                      <Calendar className="mr-2 h-4 w-4 text-primary" />
                      {format(fechaDocumento, "dd/MM/yyyy", { locale: es })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-popover" align="start">
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Monto (opcional)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                    <Input
                      type="number"
                      placeholder="0"
                      value={monto}
                      onChange={(e) => setMonto(e.target.value)}
                      className="h-12 pl-7 border-border/50 hover:border-primary/50 bg-card hover:bg-primary/5 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Categoría (opcional)</Label>
                  <Input
                    placeholder="Ej: Supermercado"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    className="h-12 border-border/50 hover:border-primary/50 bg-card hover:bg-primary/5 transition-all"
                  />
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="flex gap-3 p-6 border-t bg-gradient-to-br from-card to-background">
            <Button
              variant="outline"
              onClick={() => {
                setShowUploadDialog(false);
                setSelectedFile(null);
                setFilePreview(null);
                setMonto('');
                setDescripcion('');
              }}
              className="flex-1 h-12 hover:bg-muted"
              disabled={uploading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="flex-1 h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <FileCheck className="mr-2 h-4 w-4" />
                  Guardar
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de visualización de factura */}
      <Dialog open={!!viewingFactura} onOpenChange={() => setViewingFactura(null)}>
        <DialogContent className="sm:max-w-[90vw] sm:max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>{viewingFactura?.nombre}</DialogTitle>
            <DialogDescription>
              Click fuera de la imagen para cerrar
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 pt-4">
            {viewingFactura?.url.match(/\.(jpg|jpeg|png|webp)$/i) ? (
              <img 
                src={viewingFactura.url} 
                alt={viewingFactura.nombre}
                className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-12 bg-muted rounded-lg">
                <FileText className="h-24 w-24 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">{viewingFactura?.nombre}</p>
                <Button
                  onClick={() => viewingFactura && window.open(viewingFactura.url, '_blank')}
                  className="mt-4"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Abrir archivo
                </Button>
              </div>
            )}
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
