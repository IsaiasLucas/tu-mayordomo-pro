import { useState } from "react";
import { useMetas } from "@/hooks/useMetas";
import { fmtCLP } from "@/lib/api";
import { formatChileanNumber, parseChileanNumber } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Plus, Target, Trash2, Crown } from "lucide-react";
import { format } from "date-fns";

interface AhorroViewProps {
  profile: any;
  onViewChange?: (view: string) => void;
}

export default function AhorroView({ profile, onViewChange }: AhorroViewProps) {
  const { metas, loading, createMeta, agregarAhorro, deleteMeta } = useMetas();
  const phone = profile?.phone_personal || profile?.phone_empresa;
  const isPro = profile?.plan && profile.plan !== "free";

  const [dialogOpen, setDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedMetaId, setSelectedMetaId] = useState<string>("");
  const [showLimitAlert, setShowLimitAlert] = useState(false);

  const [nombreMeta, setNombreMeta] = useState("");
  const [montoObjetivo, setMontoObjetivo] = useState("");
  const [fechaLimite, setFechaLimite] = useState("");

  const [montoAgregar, setMontoAgregar] = useState("");

  // Límite de 3 metas para usuarios Free
  const FREE_LIMIT = 3;
  const activeMetas = metas.filter((m) => m.estado !== "completado");
  const canCreateMore = isPro || activeMetas.length < FREE_LIMIT;

  const handleCreateMeta = async () => {
    const monto = parseChileanNumber(montoObjetivo);
    if (!nombreMeta.trim() || isNaN(monto) || monto <= 0) {
      return;
    }

    // Verificar límite para usuarios Free
    if (!canCreateMore) {
      setShowLimitAlert(true);
      setDialogOpen(false);
      return;
    }

    const result = await createMeta(nombreMeta, monto, fechaLimite || undefined);
    if (result.success) {
      setDialogOpen(false);
      setNombreMeta("");
      setMontoObjetivo("");
      setFechaLimite("");
    }
  };

  const handleAgregarAhorro = async () => {
    const monto = parseChileanNumber(montoAgregar);
    if (isNaN(monto) || monto <= 0) {
      return;
    }

    await agregarAhorro(selectedMetaId, monto);
    setAddDialogOpen(false);
    setMontoAgregar("");
    setSelectedMetaId("");
  };

  const calcularPorcentaje = (montoActual: number, montoObjetivo: number) => {
    return Math.min((montoActual / montoObjetivo) * 100, 100);
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
              Necesitas configurar tu número de WhatsApp para usar esta función. Ve a la pestaña Inicio para completar tu perfil.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-5 md:p-7 space-y-4 sm:space-y-5 md:space-y-7 pb-24 sm:pb-28 bg-background">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Metas de Ahorro</h1>
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 md:p-7 space-y-4 sm:space-y-5 md:space-y-7 pb-24 sm:pb-28 bg-background">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Metas de Ahorro</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Crear nueva meta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear nueva meta de ahorro</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre de la meta</Label>
                <Input
                  id="nombre"
                  placeholder="Ej: Vacaciones, Auto nuevo, Casa"
                  value={nombreMeta}
                  onChange={(e) => setNombreMeta(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monto">Monto objetivo</Label>
                <Input
                  id="monto"
                  type="text"
                  inputMode="numeric"
                  placeholder="Ej: 1.000.000"
                  value={montoObjetivo}
                  onChange={(e) => {
                    const formatted = formatChileanNumber(e.target.value);
                    setMontoObjetivo(formatted);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha límite (opcional)</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={fechaLimite}
                  onChange={(e) => setFechaLimite(e.target.value)}
                />
              </div>
              <Button onClick={handleCreateMeta} className="w-full">
                Crear meta
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alert de límite alcanzado para usuarios Free */}
      {showLimitAlert && (
        <Alert className="border-2 border-primary bg-primary/5 animate-fade-in">
          <Crown className="h-5 w-5 text-primary" />
          <AlertDescription className="ml-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex-1">
              <p className="font-semibold text-base mb-1">
                Límite alcanzado: actualiza a Pro para crear metas ilimitadas 🎯
              </p>
              <p className="text-sm text-muted-foreground">
                Has alcanzado el límite de {FREE_LIMIT} metas activas en el plan gratuito.
              </p>
            </div>
            {onViewChange && (
              <Button
                onClick={() => {
                  setShowLimitAlert(false);
                  onViewChange("planes");
                }}
                className="w-full sm:w-auto"
              >
                <Crown className="w-4 h-4 mr-2" />
                Ver Planes
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Indicador de metas disponibles para usuarios Free */}
      {!isPro && (
        <Card className="rounded-xl sm:rounded-2xl border-primary/30 bg-primary/5 animate-fade-in">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                <p className="text-sm font-medium">
                  Metas activas: {activeMetas.length} / {FREE_LIMIT}
                </p>
              </div>
              {activeMetas.length >= FREE_LIMIT && onViewChange && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewChange("planes")}
                  className="text-xs"
                >
                  <Crown className="w-3 h-3 mr-1" />
                  Actualizar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {metas.length === 0 ? (
        <Card className="rounded-xl sm:rounded-2xl animate-fade-in">
          <CardContent className="p-12 text-center">
            <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg text-muted-foreground">
              💡 Aún no tienes metas de ahorro. Empieza a crear la primera y alcanza tus objetivos.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          {metas.map((meta) => {
            const porcentaje = calcularPorcentaje(
              Number(meta.monto_actual),
              Number(meta.monto_objetivo)
            );
            const completada = meta.estado === "completado";

            return (
              <Card
                key={meta.id}
                className={`rounded-xl sm:rounded-2xl animate-fade-in ${
                  completada ? "border-2 border-green-500" : ""
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      <Target className={`w-5 h-5 mt-1 ${completada ? "text-green-600" : "text-primary"}`} />
                      <div>
                        <CardTitle className="text-lg sm:text-xl">{meta.nombre_meta}</CardTitle>
                        {meta.fecha_limite && (
                          <p className="text-sm text-muted-foreground mt-1">
                            📅 {format(new Date(meta.fecha_limite), "dd/MM/yyyy")}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMeta(meta.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">💰 Objetivo</span>
                      <span className="font-medium">{fmtCLP(Number(meta.monto_objetivo))}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">💵 Ahorrado</span>
                      <span className={`font-medium ${completada ? "text-green-600" : ""}`}>
                        {fmtCLP(Number(meta.monto_actual))}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progreso</span>
                      <span>{porcentaje.toFixed(1)}%</span>
                    </div>
                    <Progress
                      value={porcentaje}
                      className={completada ? "[&>div]:bg-green-600" : ""}
                    />
                  </div>

                  {completada ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-600 font-medium text-center">
                        🎉 ¡Felicidades! Has completado esta meta
                      </p>
                    </div>
                  ) : (
                    <Dialog
                      open={addDialogOpen && selectedMetaId === meta.id}
                      onOpenChange={(open) => {
                        setAddDialogOpen(open);
                        if (open) {
                          setSelectedMetaId(meta.id);
                        } else {
                          setSelectedMetaId("");
                          setMontoAgregar("");
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                          <Plus className="w-4 h-4 mr-2" />
                          Agregar ahorro
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Agregar ahorro a "{meta.nombre_meta}"</DialogTitle>
                        </DialogHeader>
                          <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="monto-agregar">¿Cuánto deseas agregar a esta meta?</Label>
                            <Input
                              id="monto-agregar"
                              type="text"
                              inputMode="numeric"
                              placeholder="Ej: 50.000"
                              value={montoAgregar}
                              onChange={(e) => {
                                const formatted = formatChileanNumber(e.target.value);
                                setMontoAgregar(formatted);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleAgregarAhorro();
                                }
                              }}
                            />
                          </div>
                          <Button onClick={handleAgregarAhorro} className="w-full">
                            Agregar
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
