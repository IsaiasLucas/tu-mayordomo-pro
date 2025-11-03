import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export function usePresupuesto(mes: string, totalGastos: number) {
  const { user } = useAuth();
  const [presupuesto, setPresupuesto] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [year, month] = mes.split("-").map(Number);

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
  }, [user?.id, month, year]);

  const savePresupuesto = async (montoTotal: number) => {
    if (!user?.id) return;

    try {
      if (presupuesto) {
        const { error } = await supabase
          .from("presupuestos")
          .update({ monto_total: montoTotal })
          .eq("id", presupuesto.id);

        if (error) throw error;
        setPresupuesto({ ...presupuesto, monto_total: montoTotal });
      } else {
        const { data, error } = await supabase
          .from("presupuestos")
          .insert({
            user_id: user.id,
            monto_total: montoTotal,
            mes: month,
            anio: year,
          })
          .select()
          .single();

        if (error) throw error;
        setPresupuesto(data);
      }

      toast.success("Presupuesto guardado correctamente");
    } catch (error) {
      console.error("Error saving presupuesto:", error);
      toast.error("Error al guardar el presupuesto");
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
