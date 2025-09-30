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
import { AlertCircle, TrendingUp, TrendingDown, MessageCircle, Sparkles } from "lucide-react";
import { format } from "date-fns";

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
  const [allMovimientos, setAllMovimientos] = useState<Movimiento[]>([]);
  const [loadingMovimientos, setLoadingMovimientos] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate from ALL movimientos of the month
  const ingresos = allMovimientos
    .filter(m => m.tipo.toLowerCase() === "ingreso" || m.tipo.toLowerCase() === "receita")
    .reduce((s, m) => s + Number(m.monto || 0), 0);
  
  const egresos = allMovimientos
    .filter(m => m.tipo.toLowerCase() === "egreso" || m.tipo.toLowerCase() === "despesa" || m.tipo.toLowerCase() === "gasto")
    .reduce((s, m) => s + Number(m.monto || 0), 0);
  
  const saldoMes = ingresos - egresos;

  // Calcular variação diária usando todos os movimientos
  const calcularVariacionDiaria = () => {
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);

    const saldoHoy = allMovimientos
      .filter(m => {
        const fechaMov = new Date(m.fecha);
        return fechaMov.toDateString() === hoy.toDateString();
      })
      .reduce((total, m) => {
        const valor = m.tipo.toLowerCase() === "ingreso" || m.tipo.toLowerCase() === "receita" 
          ? m.monto 
          : -m.monto;
        return total + valor;
      }, 0);

    const saldoAyer = allMovimientos
      .filter(m => {
        const fechaMov = new Date(m.fecha);
        return fechaMov.toDateString() === ayer.toDateString();
      })
      .reduce((total, m) => {
        const valor = m.tipo.toLowerCase() === "ingreso" || m.tipo.toLowerCase() === "receita" 
          ? m.monto 
          : -m.monto;
        return total + valor;
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
          setMovimientos(data.items.slice(0, 5));
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
          setMovimientos(data.items.slice(0, 5));
        }
      }
    } catch (error) {
      console.error("Error al actualizar movimientos:", error);
    }
  };

  const fetchAllMovimientos = async (phoneNumber: string) => {
    try {
      const now = new Date();
      const mes = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      const response = await fetch(
        `https://script.google.com/macros/s/AKfycbxeeTtJBWnKJIXHAgXfmGrTym21lpL7cKnFUuTW45leWFVVdP9301aXQnr0sItTnn8vWA/exec?action=month&phone=${encodeURIComponent(phoneNumber)}&mes=${mes}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.ok && data.items && Array.isArray(data.items)) {
          setAllMovimientos(data.items);
        }
      }
    } catch (error) {
      console.error("Error al cargar todos los movimientos:", error);
    }
  };

  const fetchAllMovimientosUpdate = async (phoneNumber: string) => {
    try {
      const now = new Date();
      const mes = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      const response = await fetch(
        `https://script.google.com/macros/s/AKfycbxeeTtJBWnKJIXHAgXfmGrTym21lpL7cKnFUuTW45leWFVVdP9301aXQnr0sItTnn8vWA/exec?action=month&phone=${encodeURIComponent(phoneNumber)}&mes=${mes}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.ok && data.items && Array.isArray(data.items)) {
          setAllMovimientos(data.items);
        }
      }
    } catch (error) {
      console.error("Error al actualizar todos los movimientos:", error);
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
      fetchAllMovimientos(storedPhone);
    }
  };

  return (
    <main className="p-4 space-y-4">
      <HeroOverview total={saldoMes||0} varPct={variacionDiaria} title="Overview" />

      {!loading && profile?.plan === "free" && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">Plan Gratuito Activo</p>
              <p className="text-sm text-gray-600">Actualiza pa' desbloquear mensajes ilimitados</p>
            </div>
            <a 
              href="/planes" 
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-xl font-semibold hover:scale-105 transition-transform"
            >
              Ver Planes
            </a>
          </div>
        </div>
      )}

      {!loading && profile?.plan && profile.plan !== "free" && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900 flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Plan {profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1)} Activo
              </p>
              <p className="text-sm text-gray-600">Tienes acceso completo a todos los recursos</p>
            </div>
            <a 
              href="/planes" 
              className="text-green-700 px-4 py-2 rounded-xl font-semibold hover:bg-green-100 transition-colors"
            >
              Administrar
            </a>
          </div>
        </div>
      )}

      {/* Chatbot WhatsApp Button */}
      <a
        href="https://wa.me/56955264713?text=Enséñame%20a%20usar%20Tu%20Mayordomo%20paso%20a%20paso%20🚀"
        target="_blank"
        rel="noopener noreferrer"
        className="block group"
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-blue-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] animate-fade-in">
          {/* Animated background effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          
          <div className="relative flex items-center gap-4">
            {/* Logo/Icon - Replace with actual logo */}
            <div className="flex-shrink-0 bg-white/20 backdrop-blur-sm rounded-2xl p-4 group-hover:bg-white/30 transition-colors">
              <MessageCircle className="w-10 h-10 text-white" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                <h3 className="text-white font-bold text-lg">Tu Mayordomo AI</h3>
              </div>
              <p className="text-white/90 text-sm font-medium">
                Chatea con nuestro asistente inteligente
              </p>
              <p className="text-white/70 text-xs mt-1">
                Aprende a usar la app paso a paso 🚀
              </p>
            </div>
            
            {/* WhatsApp Icon */}
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-white group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </div>
          </div>
        </div>
      </a>

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
                  onClick={onOpenProfileModal}
                  className="ml-2"
                >
                  Añadir ahora
                </Button>
              </AlertDescription>
            </Alert>
          ) : loadingMovimientos ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-5 w-48" />
                  </div>
                  <Skeleton className="h-6 w-24" />
                </div>
              ))}
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
      </Card>
    </main>
  );
};

export default InicioView;