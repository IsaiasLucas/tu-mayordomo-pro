import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useSWR } from "./useSWR";
import { toast } from "sonner";

export function useMetas() {
  const { user } = useAuth();

  const { data, error, isValidating, mutate } = useSWR(
    user?.id ? `metas-${user.id}` : null,
    async () => {
      if (!user?.id) return [];

      const { data: fetchData, error: fetchError } = await supabase
        .from("metas")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("Error fetching metas:", fetchError);
        throw fetchError;
      }

      return fetchData || [];
    },
    { revalidateOnMount: true, revalidateOnFocus: true }
  );

  // Keep a ref with the latest data to avoid stale closures inside realtime handler
  const dataRef = useRef<any[]>([]);
  useEffect(() => {
    dataRef.current = Array.isArray(data) ? (data as any[]) : [];
  }, [data]);

  // Set up realtime subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`metas-realtime-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "metas",
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          const current = dataRef.current;
          if (payload.eventType === "INSERT" && payload.new) {
            const updated = [payload.new, ...current.filter((r: any) => r.id !== payload.new.id)];
            mutate(updated);
          } else if (payload.eventType === "UPDATE" && payload.new) {
            const updated = current.map((r: any) => (r.id === payload.new.id ? payload.new : r));
            mutate(updated);
          } else if (payload.eventType === "DELETE" && payload.old) {
            const updated = current.filter((r: any) => r.id !== payload.old.id);
            mutate(updated);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, mutate]);

  const metas = Array.isArray(data) ? (data as any[]) : [];

  const createMeta = async (
    nombre_meta: string,
    monto_objetivo: number,
    fecha_limite?: string
  ) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase.from("metas").insert({
        user_id: user.id,
        nombre_meta,
        monto_objetivo,
        fecha_limite: fecha_limite || null,
      });

      if (error) throw error;
      toast.success("Meta creada correctamente");
    } catch (error) {
      console.error("Error creating meta:", error);
      toast.error("Error al crear la meta");
    }
  };

  const agregarAhorro = async (metaId: string, monto: number) => {
    if (!user?.id) return;

    try {
      const meta = metas.find((m) => m.id === metaId);
      if (!meta) return;

      const nuevoMonto = Number(meta.monto_actual) + monto;
      const porcentaje = (nuevoMonto / Number(meta.monto_objetivo)) * 100;
      const nuevoEstado = porcentaje >= 100 ? "completado" : "activo";

      const { error } = await supabase
        .from("metas")
        .update({
          monto_actual: nuevoMonto,
          estado: nuevoEstado,
        })
        .eq("id", metaId);

      if (error) throw error;

      if (nuevoEstado === "completado") {
        toast.success(`🎉 ¡Felicidades! Has completado tu meta "${meta.nombre_meta}".`);
      } else {
        toast.success("Ahorro agregado correctamente");
      }
    } catch (error) {
      console.error("Error adding ahorro:", error);
      toast.error("Error al agregar ahorro");
    }
  };

  const deleteMeta = async (metaId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase.from("metas").delete().eq("id", metaId);

      if (error) throw error;
      toast.success("Meta eliminada correctamente");
    } catch (error) {
      console.error("Error deleting meta:", error);
      toast.error("Error al eliminar la meta");
    }
  };

  return {
    metas,
    loading: isValidating && !data,
    error,
    createMeta,
    agregarAhorro,
    deleteMeta,
  };
}
