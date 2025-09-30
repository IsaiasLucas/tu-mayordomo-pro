import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import HeroOverview from "../HeroOverview";
import { useAuth } from "@/hooks/useAuth";
import { useGastos } from "@/hooks/useGastos";
import { fmtCLP } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import CompleteProfileModal from "@/components/CompleteProfileModal";

interface InicioViewProps {
  onOpenProfileModal: () => void;
}

interface Movimiento {
  fecha: string;
  descripcion: string;
  monto: number;
  tipo: string;
}

const InicioView = ({ onOpenProfileModal }: InicioViewProps) => {
  const { profile, loading } = useAuth();
  const { items: gastos } = useGastos();
  const [phone, setPhone] = useState<string | null>(null);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loadingMovimientos, setLoadingMovimientos] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const ingresos = gastos.filter(g=>String(g.tipo).toLowerCase()==="ingreso")
                         .reduce((s,g)=>s+Number(g.valor||0),0);
  const egresos  = gastos.filter(g=>String(g.tipo).toLowerCase()==="egreso")
                         .reduce((s,g)=>s+Number(g.valor||0),0);
  const saldoMes = ingresos - egresos;

  useEffect(() => {
    const storedPhone = localStorage.getItem("tm_phone");
    setPhone(storedPhone);

    if (storedPhone) {
      fetchMovimientos(storedPhone);
    } else {
      // Si no hay phone, mostrar modal automáticamente
      setShowProfileModal(true);
    }
  }, []);

  const fetchMovimientos = async (phoneNumber: string) => {
    setLoadingMovimientos(true);
    try {
      const response = await fetch(
        `https://script.google.com/macros/s/AKfycbyCWcSuxX5X3U3NXFj2MKkA9e_Kk4wHtofRw1mKLI_6_HYHN4siyRRKbXAjdkNULkS1rQ/exec?action=last5&phone=${encodeURIComponent(phoneNumber)}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.ok && data.items && Array.isArray(data.items)) {
          setMovimientos(data.items.slice(0, 5));
        }
      }
    } catch (error) {
      console.error("Error al cargar movimientos:", error);
    } finally {
      setLoadingMovimientos(false);
    }
  };

  const formatMovimientoDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM HH:mm");
    } catch {
      return dateString;
    }
  };

  const handleProfileModalClose = () => {
    // Verificar si ahora hay phone guardado
    const storedPhone = localStorage.getItem("tm_phone");
    setPhone(storedPhone);
    
    if (storedPhone) {
      fetchMovimientos(storedPhone);
    }
    
    setShowProfileModal(false);
  };

  return (
    <main className="p-4 space-y-4">
      <HeroOverview total={saldoMes||0} varPct={16} title="Overview" />

      {!loading && profile?.plan === "free" && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-900 rounded-xl p-3">
          Plano gratuito ativo. 
          <a href="/planes" className="underline ml-2">Fazer upgrade para PRO</a>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-[24px] p-4 shadow">
          <div className="text-sm text-gray-500">Ingresos del mes</div>
          <div className="text-xl font-semibold">{fmtCLP(ingresos)}</div>
        </div>
        <div className="bg-white rounded-[24px] p-4 shadow">
          <div className="text-sm text-gray-500">Gastos del mes</div>
          <div className="text-xl font-semibold">{fmtCLP(egresos)}</div>
        </div>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-xl">Tus últimos movimientos</CardTitle>
        </CardHeader>
        <CardContent>
          {!phone ? (
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="flex items-center justify-between">
                <span className="text-yellow-900">
                  ⚠️ Falta confirmar tu WhatsApp para vincular tu cuenta.
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowProfileModal(true)}
                  className="ml-2"
                >
                  Añadir ahora
                </Button>
              </AlertDescription>
            </Alert>
          ) : loadingMovimientos ? (
            <div className="text-center py-8 text-muted-foreground">
              Cargando movimientos...
            </div>
          ) : movimientos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay movimientos recientes
            </div>
          ) : (
            <div className="space-y-3">
              {movimientos.map((mov, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-muted-foreground">
                        {formatMovimientoDate(mov.fecha)}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          mov.tipo.toLowerCase() === "ingreso" || mov.tipo.toLowerCase() === "receita"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {mov.tipo.toLowerCase() === "ingreso" || mov.tipo.toLowerCase() === "receita" ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {mov.tipo}
                      </span>
                    </div>
                    <p className="font-medium">{mov.descripcion}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">
                      {fmtCLP(mov.monto)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        {phone && movimientos.length > 0 && (
          <CardFooter>
            <Link
              to="/gastos"
              className="flex items-center gap-2 text-primary hover:underline font-medium"
            >
              Ver todos
              <ArrowRight className="w-4 h-4" />
            </Link>
          </CardFooter>
        )}
      </Card>

      <CompleteProfileModal 
        open={showProfileModal}
        onClose={handleProfileModalClose}
      />
    </main>
  );
};

export default InicioView;