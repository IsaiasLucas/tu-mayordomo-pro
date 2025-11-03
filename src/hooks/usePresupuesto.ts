import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export function usePresupuesto(mes: string, totalGastos: number) {
  const { user } = useAuth();
  const [presupuesto, setPresupuesto] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [year, month] = mes.split("-").map(Number);

  // Keep a ref with the latest presupuesto to avoid stale closures
  const presupuestoRef = useRef<any>(null);
  useEffect(() => {
    presupuestoRef.current = presupuesto;
  }, [presupuesto]);

  useEffect(() => {
    if (!user?.id) return;

    const fetchPresupuesto = async () => {
      try {
        const { data, error } = await supabase
          .from("presupuestos")
          .select("*")
          .eq("user_id", user.id)
          .eq("mes", month)
          .eq("anio", year)
          .maybeSingle();

        if (error) throw error;
        setPresupuesto(data);
      } catch (error) {
        console.error("Error fetching presupuesto:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPresupuesto();

    // Set up realtime subscription for presupuestos
    const channel = supabase
      .channel(`presupuesto-realtime-${user.id}-${mes}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'presupuestos',
          filter: `user_id=eq.${user.id}`
        },
        (payload: any) => {
          // Only update if it's for the current month/year
          if (payload.eventType === 'INSERT' && payload.new) {
            if (payload.new.mes === month && payload.new.anio === year) {
              setPresupuesto(payload.new);
            }
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            if (payload.new.mes === month && payload.new.anio === year) {
              setPresupuesto(payload.new);
            }
          } else if (payload.eventType === 'DELETE' && payload.old) {
            if (payload.old.mes === month && payload.old.anio === year) {
              setPresupuesto(null);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, month, year, mes]);

  const savePresupuesto = async (montoTotal: number) => {
    if (!user?.id) return;

    try {
      if (presupuestoRef.current) {
        // Optimistic update
        setPresupuesto({ ...presupuestoRef.current, monto_total: montoTotal });

        const { error } = await supabase
          .from("presupuestos")
          .update({ monto_total: montoTotal })
          .eq("id", presupuestoRef.current.id);

        if (error) throw error;
      } else {
        const newPresupuesto = {
          user_id: user.id,
          monto_total: montoTotal,
          mes: month,
          anio: year,
        };

        // Optimistic update
        setPresupuesto({ ...newPresupuesto, id: 'temp' });

        const { data, error } = await supabase
          .from("presupuestos")
          .insert(newPresupuesto)
          .select()
          .single();

        if (error) throw error;
        setPresupuesto(data);
      }

      toast.success("✅ Presupuesto guardado correctamente");
    } catch (error) {
      console.error("Error saving presupuesto:", error);
      toast.error("Error al guardar el presupuesto");
      // Revert optimistic update on error
      setPresupuesto(presupuestoRef.current);
    }
  };

  const porcentajeGastado = presupuesto
    ? (totalGastos / Number(presupuesto.monto_total)) * 100
    : 0;

  const diasRestantes = () => {
    const hoy = new Date();
    const ultimoDia = new Date(year, month, 0);
    const diff = ultimoDia.getTime() - hoy.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return {
    presupuesto,
    loading,
    porcentajeGastado,
    diasRestantes: diasRestantes(),
    savePresupuesto,
  };
}
