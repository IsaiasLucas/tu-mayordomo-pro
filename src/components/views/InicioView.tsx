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
import { AlertCircle, TrendingUp, TrendingDown, Crown, Calendar, Clock, Phone, Tag, FileText } from "lucide-react";
import { format } from "date-fns";
import { getCurrentDateInSantiago, CHILE_TIMEZONE, formatDisplayInSantiago, monthRangeUTCFromSantiago } from "@/lib/date-config";
import { formatInTimeZone } from "date-fns-tz";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface InicioViewProps {
  onOpenProfileModal: () => void;
  onViewChange: (view: string) => void;
}

interface Movimiento {
  fecha: string;
  created_at?: string;
  descripcion: string;
  monto: number;
  tipo: string;
}

const InicioView = ({ onOpenProfileModal, onViewChange }: InicioViewProps) => {
  const { profile, loading } = useAuth();
  const { items: gastos } = useGastos();
  const [perfilLoaded, setPerfilLoaded] = useState(false);
  const [perfil, setPerfil] = useState<any>(null);
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
  const [showBalance, setShowBalance] = useState(() => {
    const saved = localStorage.getItem("tm_show_balance");
    return saved === null ? true : saved === "true";
  });
  const [selectedMovimiento, setSelectedMovimiento] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

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
      .filter(m => fmtDay((m as any).created_at as string) === fmtDay(hoy))
      .reduce((total, m) => {
        const isIngreso = m.tipo.toLowerCase() === 'ingreso' || m.tipo.toLowerCase() === 'receita';
        return total + (isIngreso ? Number(m.monto) : -Number(m.monto));
      }, 0);

    const saldoAyer = allMovimientos
      .filter(m => fmtDay((m as any).created_at as string) === fmtDay(ayer))
      .reduce((total, m) => {
        const isIngreso = m.tipo.toLowerCase() === 'ingreso' || m.tipo.toLowerCase() === 'receita';
        return total + (isIngreso ? Number(m.monto) : -Number(m.monto));
      }, 0);

    // Se não há saldo ontem mas há hoje
    if (saldoAyer === 0) {
      // Se saldo hoje é negativo (só gastos) = piora de 100%
      if (saldoHoy < 0) return -100;
      // Se saldo hoje é positivo (só ingressos) = melhora de 100%
      if (saldoHoy > 0) return 100;
      return 0;
    }

    // Calcular diferença
    const diferencia = saldoHoy - saldoAyer;
    
    // Se o saldo está piorando (ficando mais negativo ou menos positivo) = negativo
    // Se o saldo está melhorando (ficando menos negativo ou mais positivo) = positivo
    const variacion = Math.round((diferencia / Math.abs(saldoAyer)) * 100);
    
    return variacion;
  };

  const variacionDiaria = calcularVariacionDiaria();

  useEffect(() => {
    const checkUsuarioPhone = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setPerfilLoaded(true);
          return;
        }

        // Check telefono, nombre, tipo_cuenta from usuarios table
        const { data: usuario } = await supabase
          .from('usuarios')
          .select('telefono, nombre, tipo_cuenta')
          .eq('user_id', user.id)
          .maybeSingle();

        setPerfil(usuario || null);
        setPerfilLoaded(true);

        // Check if telefono exists and is not empty
        if (usuario?.telefono && usuario.telefono.trim() !== '') {
          const phoneDigits = usuario.telefono;
          const cachedPhone = localStorage.getItem("tm_phone")?.replace(/\D/g, "");
          
          // Clear cache if phone changed (different user)
          if (cachedPhone && cachedPhone !== phoneDigits) {
            localStorage.removeItem('tm_movimientos_cache');
            localStorage.removeItem('tm_all_movimientos_cache');
            setMovimientos([]);
            setAllMovimientos([]);
          }
          
          setPhone(phoneDigits);
          localStorage.setItem("tm_phone", phoneDigits);
          
          // Initial load
          fetchMovimientos();
          fetchAllMovimientos();
          
          // Setup Realtime subscriptions for recent and all movements
          const recentChannel = supabase
            .channel('inicio-gastos-recent')
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'gastos'
              },
              async (payload) => {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
                
                if ((payload.new as any)?.user_id === user.id || (payload.old as any)?.user_id === user.id) {
                  fetchMovimientosUpdate();
                }
              }
            )
            .subscribe();

          const now = getCurrentDateInSantiago();
          const mes = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
          const { startISO, endISO } = monthRangeUTCFromSantiago(mes);

          const allChannel = supabase
            .channel('inicio-gastos-all')
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'gastos'
              },
              async (payload) => {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
                
                const changeDate = (payload.new as any)?.created_at || (payload.old as any)?.created_at;
                if (changeDate >= startISO && changeDate <= endISO) {
                  if ((payload.new as any)?.user_id === user.id || (payload.old as any)?.user_id === user.id) {
                    fetchAllMovimientosUpdate();
                  }
                }
              }
            )
            .subscribe();
          
          return () => {
            supabase.removeChannel(recentChannel);
            supabase.removeChannel(allChannel);
          };
        } else {
          console.log('No telefono found in usuarios table');
          localStorage.removeItem("tm_phone");
          localStorage.removeItem('tm_movimientos_cache');
          localStorage.removeItem('tm_all_movimientos_cache');
          setMovimientos([]);
          setAllMovimientos([]);
        }
      } catch (error) {
        console.error('Error checking usuario phone:', error);
        setPerfilLoaded(true);
      }
    };

    checkUsuarioPhone();
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

  const fetchMovimientos = async () => {
    setLoadingMovimientos(true);
    try {
      // Get authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: gastos, error } = await supabase
        .from('gastos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      const newMovimientos = gastos || [];
      localStorage.setItem('tm_movimientos_cache', JSON.stringify(newMovimientos));
      setMovimientos(newMovimientos);
    } catch (error) {
      console.error("Error al cargar movimientos:", error);
    } finally {
      setLoadingMovimientos(false);
    }
  };

  const fetchMovimientosUpdate = async () => {
    try {
      // Get authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: gastos, error } = await supabase
        .from('gastos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      const newMovimientos = gastos || [];
      const currentCache = localStorage.getItem('tm_movimientos_cache');
      const newCache = JSON.stringify(newMovimientos);
      if (currentCache !== newCache) {
        localStorage.setItem('tm_movimientos_cache', newCache);
        setMovimientos(newMovimientos);
      }
    } catch (error) {
      console.error("Error al actualizar movimientos:", error);
    }
  };

  const fetchAllMovimientos = async () => {
    try {
      // Get authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const now = getCurrentDateInSantiago();
      const mes = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const { startISO, endISO } = monthRangeUTCFromSantiago(mes);
      
      const { data: gastos, error } = await supabase
        .from('gastos')
        .select('*')
        .eq('user_id', user.id)
.gte('created_at', startISO)
.lte('created_at', endISO)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const items = gastos || [];
      localStorage.setItem('tm_all_movimientos_cache', JSON.stringify(items));
      setAllMovimientos(items);
    } catch (error) {
      console.error("Error al cargar todos los movimientos:", error);
    }
  };

  const fetchAllMovimientosUpdate = async () => {
    try {
      // Get authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const now = getCurrentDateInSantiago();
      const mes = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const { startISO, endISO } = monthRangeUTCFromSantiago(mes);
      
      const { data: gastos, error } = await supabase
        .from('gastos')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startISO)
        .lte('created_at', endISO)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const items = gastos || [];
      const currentCache = localStorage.getItem('tm_all_movimientos_cache');
      const newCache = JSON.stringify(items);
      if (currentCache !== newCache) {
        localStorage.setItem('tm_all_movimientos_cache', newCache);
        setAllMovimientos(items);
      }
    } catch (error) {
      console.error("Error al actualizar todos los movimientos:", error);
    }
  };

const formatMovimientoDate = (dateString: string) => {
  return formatDisplayInSantiago(dateString, "dd/MM HH:mm");
};

  const handleProfileModalClose = async () => {
    // Verificar si ahora hay telefono guardado en usuarios table
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: usuario } = await supabase
        .from('usuarios')
        .select('telefono, nombre, tipo_cuenta')
        .eq('user_id', user.id)
        .maybeSingle();

      setPerfil(usuario || null);

      if (usuario?.telefono && usuario.telefono.trim() !== '') {
        setPhone(usuario.telefono);
        localStorage.setItem("tm_phone", usuario.telefono);
        fetchMovimientos();
        fetchAllMovimientos();
      }
    } catch (error) {
      console.error('Error checking usuario phone:', error);
    }
  };

  const showWhatsappCard = perfilLoaded && (!perfil?.telefono || perfil.telefono.trim() === '');

  // Skeleton loading state
  if (!perfilLoaded) {
    return (
      <main className="px-6 py-6 pb-32 space-y-6">
        <Skeleton className="h-36 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-5">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-56 w-full rounded-2xl" />
      </main>
    );
  }

  // WhatsApp configuration card
  if (showWhatsappCard) {
    return (
      <main className="px-6 py-6 pb-32 space-y-6">
        <Card className="shadow-card rounded-2xl border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Phone className="w-6 h-6" />
              Configura tu WhatsApp
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-base text-muted-foreground">
              Para comenzar a usar Tu Mayordomo, necesitas configurar tu número de WhatsApp
            </p>
            <Button 
              onClick={onOpenProfileModal}
              className="w-full h-12 text-base"
            >
              Completar Perfil
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="px-6 py-6 pb-32 space-y-6">
      {/* Saldo do Mês */}
      <div className="bg-gradient-to-br from-primary to-primary-glow text-primary-foreground rounded-2xl p-7 shadow-card">
        <p className="text-base opacity-75 mb-2">Saldo del Mes</p>
        <p className="text-4xl font-bold truncate">
          {showBalance ? fmtCLP(saldoMes||0) : "••••••"}
        </p>
      </div>

      {!loading && profile?.plan === "free" && (
        <Card className="shadow-card rounded-xl sm:rounded-2xl border-2 border-primary/20">
          <CardContent className="p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:gap-5">
              <div>
                <p className="font-semibold text-base sm:text-lg mb-1.5">Plan Gratuito</p>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Actualiza a Pro para más funciones
                </p>
              </div>
              <Button
                onClick={() => onViewChange("planes")}
                className="w-full bg-gradient-to-r from-primary to-primary-glow h-12 sm:h-13 text-base sm:text-lg touch-manipulation"
              >
                <Crown className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                Ver Planes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && profile?.plan && profile.plan !== "free" && (
        <Card className="shadow-card rounded-xl sm:rounded-2xl border-2 border-primary bg-primary/5">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="bg-primary text-primary-foreground rounded-full p-3 sm:p-4 flex-shrink-0">
                <Crown className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-base sm:text-lg">Plan Activo</p>
                <p className="text-sm sm:text-base text-muted-foreground">
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
        className="fixed right-4 sm:right-5 z-40 group touch-manipulation"
        style={{ bottom: 'calc(env(safe-area-inset-bottom) + 8rem)' }}
        title="Chatear con Tu Mayordomo"
      >
        <div className="relative bg-gradient-to-br from-purple-600 to-blue-600 rounded-full w-16 h-16 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-purple-400 animate-ping opacity-20"></div>
          
          <svg className="relative w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
        </div>
      </a>

      <div className="grid grid-cols-2 gap-4 sm:gap-5">
        <Card className="shadow-card rounded-xl sm:rounded-2xl border-0">
          <CardContent className="p-6 sm:p-7">
            <p className="text-base sm:text-lg text-muted-foreground mb-2.5 sm:mb-3">Ingresos</p>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-600 truncate">{fmtCLP(ingresos)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card rounded-xl sm:rounded-2xl border-0">
          <CardContent className="p-6 sm:p-7">
            <p className="text-base sm:text-lg text-muted-foreground mb-2.5 sm:mb-3">Gastos</p>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-600 truncate">{fmtCLP(egresos)}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card rounded-xl sm:rounded-2xl border-0">
        <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-5">
          <CardTitle className="text-lg sm:text-xl">Transacciones Recientes</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-5">
          {!phone ? (
            <Alert className="bg-yellow-50 border-yellow-200 rounded-lg sm:rounded-xl">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 flex-shrink-0" />
              <AlertDescription className="flex flex-col gap-2 sm:gap-3">
                <span className="text-yellow-900 text-sm sm:text-base leading-tight">
                  Confirma tu WhatsApp para ver transacciones
                </span>
                <Button
                  variant="outline"
                  onClick={onOpenProfileModal}
                  className="w-full h-10 sm:h-11 text-sm sm:text-base touch-manipulation"
                >
                  Añadir ahora
                </Button>
              </AlertDescription>
            </Alert>
          ) : loadingMovimientos ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 sm:p-5 rounded-lg sm:rounded-xl border">
                  <div className="flex-1 space-y-2 sm:space-y-2.5">
                    <Skeleton className="h-4 sm:h-5 w-24 sm:w-28" />
                    <Skeleton className="h-5 sm:h-6 w-36 sm:w-44" />
                  </div>
                  <Skeleton className="h-6 sm:h-7 w-20 sm:w-24" />
                </div>
              ))}
            </div>
          ) : movimientos.length === 0 ? (
            <div className="text-center py-8 sm:py-10 text-muted-foreground text-base sm:text-lg">
              No hay movimientos recientes
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {movimientos.map((mov, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setSelectedMovimiento(mov);
                    setShowDetailsModal(true);
                  }}
                  className="flex items-center justify-between p-4 sm:p-5 rounded-lg sm:rounded-xl border bg-card hover:bg-accent/50 active:bg-accent/70 transition-colors gap-3 sm:gap-4 cursor-pointer touch-manipulation"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-2.5 mb-1.5 sm:mb-2 flex-wrap">
                      <span className={`text-sm sm:text-base px-2 sm:px-2.5 py-1 sm:py-1.5 rounded font-medium ${
                        (mov.tipo.toLowerCase() === "ingreso" || mov.tipo.toLowerCase() === "receita")
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {formatMovimientoDate(((mov as any).created_at ?? mov.fecha) as string)}
                      </span>
                      {(mov.tipo.toLowerCase() === "ingreso" || mov.tipo.toLowerCase() === "receita") ? (
                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-base sm:text-lg font-medium truncate leading-tight">
                      {mov.descripcion}
                    </p>
                  </div>
                  <span className={`font-bold text-lg sm:text-xl flex-shrink-0 ${
                    (mov.tipo.toLowerCase() === "ingreso" || mov.tipo.toLowerCase() === "receita")
                      ? "text-green-600"
                      : "text-red-600"
                  }`}>
                    {(mov.tipo.toLowerCase() === "ingreso" || mov.tipo.toLowerCase() === "receita") ? "+" : "-"}
                    {fmtCLP(Math.abs(Number(mov.monto)))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de detalhes */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-md overflow-hidden p-0">
          {selectedMovimiento && (
            <div className="space-y-0">
              {/* Header com gradiente */}
              <div className={`relative px-6 pt-6 pb-8 ${
                (selectedMovimiento.tipo?.toLowerCase() === "ingreso" || selectedMovimiento.tipo?.toLowerCase() === "receita")
                  ? "bg-gradient-to-br from-green-500 to-emerald-600"
                  : "bg-gradient-to-br from-red-500 to-rose-600"
              }`}>
                <div className="absolute inset-0 bg-black/5"></div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                      {(selectedMovimiento.tipo?.toLowerCase() === "ingreso" || selectedMovimiento.tipo?.toLowerCase() === "receita") ? (
                        <TrendingUp className="w-6 h-6 text-white" />
                      ) : (
                        <TrendingDown className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-white/80 text-sm font-medium">
                        {(selectedMovimiento.tipo?.toLowerCase() === "ingreso" || selectedMovimiento.tipo?.toLowerCase() === "receita") ? "Ingreso" : "Egreso"}
                      </p>
                      <p className="text-white text-3xl font-bold">
                        {(selectedMovimiento.tipo?.toLowerCase() === "ingreso" || selectedMovimiento.tipo?.toLowerCase() === "receita") ? "+" : "-"}
                        {fmtCLP(Math.abs(Number(selectedMovimiento.monto)))}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-white/90">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {formatDisplayInSantiago(selectedMovimiento.created_at || selectedMovimiento.fecha, "dd 'de' MMMM, yyyy")}
                    </span>
                    <span className="mx-1">•</span>
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {formatDisplayInSantiago(selectedMovimiento.created_at || selectedMovimiento.fecha, "HH:mm")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Conteúdo */}
              <div className="px-6 py-6 space-y-4">
                {/* Descripción destaque */}
                <div className="p-4 rounded-xl bg-accent/30 border border-border/50">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Descripción</p>
                      <p className="font-semibold text-base leading-relaxed break-words">
                        {selectedMovimiento.descripcion || "Sin descripción"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Informações adicionais em grid */}
                <div className="grid gap-3">
                  {selectedMovimiento.telefono && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Phone className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground font-medium">Registrado desde</p>
                        <p className="font-medium truncate">{selectedMovimiento.telefono}</p>
                      </div>
                    </div>
                  )}

                  {selectedMovimiento.categoria && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Tag className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground font-medium">Categoría</p>
                        <p className="font-medium truncate">{selectedMovimiento.categoria}</p>
                      </div>
                    </div>
                  )}

                  {selectedMovimiento.subtipo && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Tag className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground font-medium">Subtipo</p>
                        <p className="font-medium truncate">{selectedMovimiento.subtipo}</p>
                      </div>
                    </div>
                  )}

                  {selectedMovimiento.detalles && (
                    <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                      <div className="flex items-start gap-2 mb-2">
                        <FileText className="w-4 h-4 text-primary mt-0.5" />
                        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Detalles adicionales</p>
                      </div>
                      <p className="text-sm leading-relaxed break-words pl-6">{selectedMovimiento.detalles}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer com botão */}
              <div className="px-6 pb-6">
                <Button 
                  onClick={() => setShowDetailsModal(false)}
                  className="w-full h-11 font-medium"
                  size="lg"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default InicioView;
