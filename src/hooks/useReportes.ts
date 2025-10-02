import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useReportes() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const { user, profile } = useAuth();

  useEffect(() => {
    const fetchReportes = async () => {
      if (!user || !profile?.phone_personal) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('reportes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setItems(data || []);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReportes();
  }, [user, profile]);

  return { items, loading, error };
}