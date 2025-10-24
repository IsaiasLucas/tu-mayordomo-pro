import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useProfile } from "@/hooks/useProfile";
import { useMovimientos } from "@/hooks/useMovimientos";
import CardConfigWhatsApp from "@/components/CardConfigWhatsApp";
import EmptyState from "@/components/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { fmtCLP } from "@/lib/api";
import { formatDatabaseDate } from "@/lib/date-config";
import { TrendingUp, TrendingDown, Crown, FileText } from "lucide-react";
import { useState } from "react";

export default function Inicio() {
  const navigate = useNavigate();
  const { isHydrating, isAuthenticated } = useAuthGuard();
  const { profile, loading: profileLoading, needsWhatsAppConfig } = useProfile();
  const { movimientos, loading: movimientosLoading, ingresos, egresos, saldo } = useMovimientos();
  const [showBalance, setShowBalance] = useState(() => {
    const saved = localStorage.getItem("tm_show_balance");
    return saved === null ? true : saved === "true";
  });

  useEffect(() => {
    if (!isHydrating && !isAuthenticated) {
      navigate("/auth", { replace: true });
    }
  }, [isHydrating, isAuthenticated, navigate]);

  if (isHydrating) {
    return null;
  }

  if (profileLoading) {
    return (
      <main className="screen px-6 py-6 space-y-6" style={{ minHeight: '100dvh', overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
        <Skeleton className="h-40 w-full rounded-xl" />
      </main>
    );
  }

  if (needsWhatsAppConfig) {
    return (
      <main className="screen px-6 py-6 space-y-6" style={{ minHeight: '100dvh', overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <CardConfigWhatsApp />
      </main>
    );
  }

  const isPro = profile?.plan === "pro" || profile?.plan === "mensal" || profile?.plan === "anual";
  const recentMovimientos = movimientos.slice(0, 5);

  return (
    <main className="screen px-6 py-6 space-y-6 animate-fade-in" style={{ minHeight: '100dvh', overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
      {/* Saldo del Mes */}
      <div className="bg-gradient-to-br from-primary to-primary-glow text-primary-foreground rounded-2xl p-7 shadow-card">
        <p className="text-base opacity-75 mb-2">Saldo del Mes</p>
        <p className="text-4xl font-bold truncate">
          {showBalance ? fmtCLP(saldo) : "••••••"}
        </p>
      </div>

      {/* Plan Card */}
      {!isPro && (
        <Card className="shadow-card rounded-xl border-2 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <div>
                <p className="font-semibold text-lg mb-1.5">Plan Gratuito</p>
                <p className="text-base text-muted-foreground">
                  Actualiza a Pro para más funciones
                </p>
              </div>
              <Button
                onClick={() => navigate("/planes")}
                className="w-full bg-gradient-to-r from-primary to-primary-glow h-12 text-base"
              >
                <Crown className="w-5 h-5 mr-2" />
                Ver Planes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ingresos y Gastos */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="shadow-card rounded-xl border-0">
          <CardContent className="p-6">
            <p className="text-base text-muted-foreground mb-2.5">Ingresos</p>
            <p className="text-3xl font-bold text-green-600 truncate">{fmtCLP(ingresos)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card rounded-xl border-0">
          <CardContent className="p-6">
            <p className="text-base text-muted-foreground mb-2.5">Gastos</p>
            <p className="text-3xl font-bold text-red-600 truncate">{fmtCLP(egresos)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Movimientos Recientes */}
      <Card className="shadow-card rounded-xl border-0">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Movimientos Recientes</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate("/gastos")}>
              Ver todos
            </Button>
          </div>

          {movimientosLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : recentMovimientos.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Sin movimientos"
              description="Aún no hay movimientos este mes. Envía tu primer gasto por WhatsApp."
            />
          ) : (
            <div className="space-y-3">
              {recentMovimientos.map((mov) => {
                const isIngreso = mov.tipo.toLowerCase() === "ingreso" || mov.tipo.toLowerCase() === "receita";
                return (
                  <div key={mov.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {isIngreso ? (
                        <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-600 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{mov.descripcion}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDatabaseDate(mov.created_at || mov.fecha, "dd/MM HH:mm")}
                        </p>
                      </div>
                    </div>
                    <p className={`font-semibold ${isIngreso ? 'text-green-600' : 'text-red-600'}`}>
                      {fmtCLP(mov.monto)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
