import { useEffect, useState } from "react";
import { getJSON, getTel } from "@/lib/api";

export function useUser() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const tel = getTel();
    if (!tel) return;
    getJSON(`/user?tel=${tel}`)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);
  return { data, loading, error };
}