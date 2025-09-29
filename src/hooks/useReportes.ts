import { useEffect, useState } from "react";
import { getJSON, getTel } from "@/lib/api";

export function useReportes() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const tel = getTel(); if (!tel) return;
    getJSON(`/reportes?tel=${tel}`)
      .then(setItems)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { items, loading, error };
}