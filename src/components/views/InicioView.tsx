import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import HeroOverview from "../HeroOverview";
import { useAuth } from "@/hooks/useAuth";
import { useGastos } from "@/hooks/useGastos";
import { fmtCLP } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, TrendingUp, TrendingDown, Crown } from "lucide-react";
import { format } from "date-fns";
import { getCurrentDateInSantiago, CHILE_TIMEZONE } from "@/lib/date-config";
import { formatInTimeZone } from "date-fns-tz";

interface InicioViewProps {
  onOpenProfileModal: () => void;
  onViewChange: (view: string) => void;
}

interface Movimiento {
  fecha: string;
  descripcion: string;
  monto: number;
  tipo: string;
}

const InicioView = ({ onOpenProfileModal, onViewChange }: InicioViewProps) => {
  const { profile, loading } = useAuth();
  const { items: gastos } = useGastos();
  const [phone, setPhone] = useState<string | null>(null);
  const [movimientos, setMovimientos] = useState<Movimiento[]>(() => {
    const cached = localStorage.getItem('tm_movimientos_cache');
    return cached ? JSON.parse(cached) : [];
  });
  const [allMovimientos, setAllMovimientos] = useState<Movimiento[]>(() => {
    const cached = localStorage.getItem('tm_all_movimientos_cache');
    return cached ? JSON.parse(cached) : [];
  });
  const [loadingMovimientos, setLoadingMovimientos] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [showBalance, setShowBalance] = useState(() => {
    const saved = localStorage.getItem("tm_show_balance");
    return saved === null ? true : saved === "true";
  });

  // Calculate from ALL movimientos of the month
  const ingresos = allMovimientos
    .filter(m => m.tipo.toLowerCase() === "ingreso" || m.tipo.toLowerCase() === "receita")
    .reduce((s, m) => s + Number(m.monto || 0), 0);
  
  const egresos = allMovimientos
    .filter(m => m.tipo.toLowerCase() === "egreso" || m.tipo.toLowerCase() === "despesa" || m.tipo.toLowerCase() === "gasto")
    .reduce((s, m) => s + Number(m.monto || 0), 0);
  
  const saldoMes = ingresos - egresos;

  // Calcular variación diaria usando todos los movimientos en horario de Santiago
  const calcularVariacionDiaria = () => {
    const hoy = getCurrentDateInSantiago();
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);

    const fmtDay = (d: Date | string) => formatInTimeZone(new Date(d), CHILE_TIMEZONE, 'yyyy-MM-dd');

    const saldoHoy = allMovimientos
      .filter(m => fmtDay(m.fecha) === fmtDay(hoy))
      .reduce((total, m) => {
        const isIngreso = m.tipo.toLowerCase() === 'ingreso' || m.tipo.toLowerCase() === 'receita';
        return total + (isIngreso ? Number(m.monto) : -Number(m.monto));
      }, 0);

    const saldoAyer = allMovimientos
      .filter(m => fmtDay(m.fecha) === fmtDay(ayer))
      .reduce((total, m) => {
        const isIngreso = m.tipo.toLowerCase() === 'ingreso' || m.tipo.toLowerCase() === 'receita';
        return total + (isIngreso ? Number(m.monto) : -Number(m.monto));
      }, 0);

    if (saldoAyer === 0) return 0;
    return Math.round(((saldoHoy - saldoAyer) / Math.abs(saldoAyer)) * 100);
  };

  const variacionDiaria = calcularVariacionDiaria();

  useEffect(() => {
    // Check phone from profile (Supabase) first
    const phoneFromProfile = profile?.phone_personal || profile?.phone_empresa;
    
    // Check if phone exists and is not empty
    if (phoneFromProfile && phoneFromProfile.trim() !== '') {
      setPhone(phoneFromProfile);
      localStorage.setItem("tm_phone", phoneFromProfile);
      
      // Initial load
      fetchMovimientos(phoneFromProfile);
      fetchAllMovimientos(phoneFromProfile);
      
      // Setup polling every 5 seconds
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      
      pollingIntervalRef.current = setInterval(() => {
        fetchMovimientosUpdate(phoneFromProfile);
        fetchAllMovimientosUpdate(phoneFromProfile);
      }, 5000);
    } else {
      console.log('No phone found in profile');
      localStorage.removeItem("tm_phone");
    }
    
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [profile]);

  // Listen for changes in showBalance preference
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("tm_show_balance");
      setShowBalance(saved === null ? true : saved === "true");
    };

    window.addEventListener("storage", handleStorageChange);
    
    // Also check on component mount/update
    const checkInterval = setInterval(handleStorageChange, 500);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(checkInterval);
    };
  }, []);

  const fetchMovimientos = async (phoneNumber: string) => {
    if (!initialLoadComplete) {
      setLoadingMovimientos(true);
    }
    try {
      const response = await fetch(
        `https://script.google.com/macros/s/AKfycbxeeTtJBWnKJIXHAgXfmGrTym21lpL7cKnFUuTW45leWFVVdP9301aXQnr0sItTnn8vWA/exec?action=last5&phone=${encodeURIComponent(phoneNumber)}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.ok && data.items && Array.isArray(data.items)) {
          const newMovimientos = data.items.slice(0, 5);
          localStorage.setItem('tm_movimientos_cache', JSON.stringify(newMovimientos));
          setMovimientos(newMovimientos);
          setInitialLoadComplete(true);
        }
      }
    } catch (error) {
      console.error("Error al cargar movimientos:", error);
    } finally {
      if (!initialLoadComplete) {
        setLoadingMovimientos(false);
      }
    }
  };

  const fetchMovimientosUpdate = async (phoneNumber: string) => {
    try {
      const response = await fetch(
        `https://script.google.com/macros/s/AKfycbxeeTtJBWnKJIXHAgXfmGrTym21lpL7cKnFUuTW45leWFVVdP9301aXQnr0sItTnn8vWA/exec?action=last5&phone=${encodeURIComponent(phoneNumber)}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.ok && data.items && Array.isArray(data.items)) {
          const newMovimientos = data.items.slice(0, 5);
          // Só atualiza se houver mudanças
          const currentCache = localStorage.getItem('tm_movimientos_cache');
          const newCache = JSON.stringify(newMovimientos);
          if (currentCache !== newCache) {
            localStorage.setItem('tm_movimientos_cache', newCache);
            setMovimientos(newMovimientos);
          }
        }
      }
    } catch (error) {
      console.error("Error al actualizar movimientos:", error);
    }
  };

  const fetchAllMovimientos = async (phoneNumber: string) => {
    try {
      const now = getCurrentDateInSantiago();
      const mes = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      console.log('📅 Buscando movimientos del mes:', mes, 'Fecha Santiago:', now);
      
      const response = await fetch(
        `https://script.google.com/macros/s/AKfycbxeeTtJBWnKJIXHAgXfmGrTym21lpL7cKnFUuTW45leWFVVdP9301aXQnr0sItTnn8vWA/exec?action=month&phone=${encodeURIComponent(phoneNumber)}&mes=${mes}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.ok && data.items && Array.isArray(data.items)) {
          localStorage.setItem('tm_all_movimientos_cache', JSON.stringify(data.items));
          setAllMovimientos(data.items);
        }
      }
    } catch (error) {
      console.error("Error al cargar todos los movimientos:", error);
    }
  };

  const fetchAllMovimientosUpdate = async (phoneNumber: string) => {
    try {
      const now = getCurrentDateInSantiago();
      const mes = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      const response = await fetch(
        `https://script.google.com/macros/s/AKfycbxeeTtJBWnKJIXHAgXfmGrTym21lpL7cKnFUuTW45leWFVVdP9301aXQnr0sItTnn8vWA/exec?action=month&phone=${encodeURIComponent(phoneNumber)}&mes=${mes}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.ok && data.items && Array.isArray(data.items)) {
          // Só atualiza se houver mudanças
          const currentCache = localStorage.getItem('tm_all_movimientos_cache');
          const newCache = JSON.stringify(data.items);
          if (currentCache !== newCache) {
            localStorage.setItem('tm_all_movimientos_cache', newCache);
            setAllMovimientos(data.items);
          }
        }
      }
    } catch (error) {
      console.error("Error al actualizar todos los movimientos:", error);
    }
  };

  const formatMovimientoDate = (dateString: string) => {
    try {
      return formatInTimeZone(new Date(dateString), CHILE_TIMEZONE, "dd/MM HH:mm");
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
      fetchAllMovimientos(storedPhone);
    }
  };

  return (
    <main className="px-4 py-4 pb-28 space-y-4">
      {/* User Profile Card */}
      <div className="bg-gradient-to-br from-primary to-primary-glow text-primary-foreground rounded-2xl p-4 shadow-card">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold mb-1 truncate">
              {profile?.display_name || profile?.name || 'Usuario'}
            </h1>
            <p className="text-xs opacity-90 truncate">
              {phone || 'Sin teléfono'}
            </p>
          </div>
          {profile?.plan && profile.plan !== "free" && (
            <div className="bg-yellow-500 text-yellow-950 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 flex-shrink-0">
              <Crown className="w-3 h-3" />
              PRO
            </div>
          )}
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5">
          <p className="text-xs opacity-75 mb-1">Saldo del Mes</p>
          <div className="flex items-end justify-between gap-2">
            <p className="text-2xl font-bold truncate">
              {showBalance ? fmtCLP(saldoMes||0) : "••••••"}
            </p>
            {showBalance && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${
                variacionDiaria >= 0 
                  ? "bg-green-500/30 text-green-100" 
                  : "bg-red-500/30 text-red-100"
              }`}>
                {variacionDiaria > 0 ? '+' : ''}{variacionDiaria}%
              </span>
            )}
          </div>
          <p className="text-xs opacity-60 mt-1">
            vs ayer
          </p>
        </div>
      </div>

      {!loading && profile?.plan === "free" && (
        <Card className="shadow-card rounded-2xl border-2 border-primary/20">
          <CardContent className="p-4">
            <div className="flex flex-col gap-3">
              <div>
                <p className="font-semibold text-sm mb-0.5">Plan Gratuito</p>
                <p className="text-xs text-muted-foreground">
                  Actualiza a Pro para más funciones
                </p>
              </div>
              <Button
                onClick={() => onViewChange("planes")}
                className="w-full bg-gradient-to-r from-primary to-primary-glow"
                size="sm"
              >
                <Crown className="w-4 h-4 mr-2" />
                Ver Planes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && profile?.plan && profile.plan !== "free" && (
        <Card className="shadow-card rounded-2xl border-2 border-primary bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary text-primary-foreground rounded-full p-2.5 flex-shrink-0">
                <Crown className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Plan Activo</p>
                <p className="text-xs text-muted-foreground">
                  Todas las funciones Pro
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Floating Chatbot Button */}
      <a
        href="https://wa.me/56955264713?text=Enséñame%20a%20usar%20Tu%20Mayordomo%20paso%20a%20paso%20🚀"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-24 right-4 z-40 group"
        title="Chatear con Tu Mayordomo"
      >
        <div className="relative bg-gradient-to-br from-purple-600 to-blue-600 rounded-full p-3.5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
          <div className="absolute inset-0 rounded-full bg-purple-400 animate-ping opacity-20"></div>
          
          <svg className="relative w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
        </div>
      </a>

      <div className="grid grid-cols-2 gap-3">
        <Card className="shadow-card rounded-2xl border-0">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1.5">Ingresos</p>
            <p className="text-xl font-bold text-green-600 truncate">{fmtCLP(ingresos)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card rounded-2xl border-0">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1.5">Gastos</p>
            <p className="text-xl font-bold text-red-600 truncate">{fmtCLP(egresos)}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card rounded-2xl border-0">
        <CardHeader className="pb-3 px-4">
          <CardTitle className="text-lg">Transacciones Recientes</CardTitle>
        </CardHeader>
        <CardContent className="px-4">
          {!phone ? (
            <Alert className="bg-yellow-50 border-yellow-200 rounded-xl">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="flex flex-col gap-2">
                <span className="text-yellow-900 text-sm">
                  Confirma tu WhatsApp para ver transacciones
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onOpenProfileModal}
                  className="w-full"
                >
                  Añadir ahora
                </Button>
              </AlertDescription>
            </Alert>
          ) : loadingMovimientos ? (
            <div className="space-y-2.5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3.5 rounded-xl border">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </div>
          ) : movimientos.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              No hay movimientos recientes
            </div>
          ) : (
            <div className="space-y-2.5">
              {movimientos.map((mov, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3.5 rounded-xl border bg-card hover:bg-accent/50 transition-colors gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatMovimientoDate(mov.fecha)}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
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
                    <p className="font-medium text-base truncate">{mov.descripcion}</p>
                  </div>
                  <p className="font-semibold text-base whitespace-nowrap flex-shrink-0">
                    {fmtCLP(mov.monto)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default InicioView;
