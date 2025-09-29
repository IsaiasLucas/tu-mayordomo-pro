import { useEffect, useState } from "react";
import { getJSON, getTel } from "@/lib/api";

export function useGastos(mes?: string) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const d = new Date();
    const ym = mes || `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const tel = getTel(); if (!tel) return;
    getJSON(`/gastos?tel=${tel}&mes=${ym}`)
      .then(setItems)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [mes]);

  return { items, loading, error };
}