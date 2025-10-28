import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Factura {
  id: string;
  user_id: string;
  account_id: string | null;
  tipo: 'factura' | 'boleta' | 'transferencia';
  archivo_url: string;
  archivo_nombre: string;
  archivo_tamanio: number | null;
  fecha_documento: string;
  monto: number | null;
  descripcion: string | null;
  created_at: string;
  updated_at: string;
}

export function useFacturas(accountId?: string) {
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFacturas = async () => {
    try {
      // Get authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Only show loading on initial fetch
      if (facturas.length === 0) {
        setLoading(true);
      }

      let query = supabase
        .from('facturas_boletas')
        .select('*')
        .eq('user_id', user.id)
        .order('fecha_documento', { ascending: false });

      if (accountId) {
        query = query.eq('account_id', accountId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setFacturas((data || []) as Factura[]);
    } catch (error: any) {
      console.error('Error fetching facturas:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las facturas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacturas();

    // Set up real-time subscription for new facturas
    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel('facturas-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'facturas_boletas',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Nova factura adicionada:', payload);
            fetchFacturas();
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'facturas_boletas',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Factura deletada:', payload);
            fetchFacturas();
          }
        )
        .subscribe();

      return channel;
    };

    const channelPromise = setupRealtimeSubscription();

    return () => {
      channelPromise.then(channel => {
        if (channel) {
          supabase.removeChannel(channel);
        }
      });
    };
  }, [accountId]);

  const uploadFactura = async (
    file: File,
    tipo: 'factura' | 'boleta' | 'transferencia',
    fechaDocumento: Date,
    monto?: number,
    descripcion?: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('facturas-boletas')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL (bucket is now public)
      const { data: { publicUrl } } = supabase.storage
        .from('facturas-boletas')
        .getPublicUrl(fileName);

      // Insert record in database
      const { error: insertError } = await supabase
        .from('facturas_boletas')
        .insert({
          user_id: user.id,
          account_id: accountId || null,
          tipo,
          archivo_url: publicUrl,
          archivo_nombre: file.name,
          archivo_tamanio: file.size,
          fecha_documento: fechaDocumento.toISOString().split('T')[0],
          monto,
          descripcion,
        });

      if (insertError) throw insertError;

      toast({
        title: "Éxito",
        description: "Factura cargada correctamente",
      });

      await fetchFacturas();
    } catch (error: any) {
      console.error('Error uploading factura:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo cargar la factura",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteFactura = async (id: string, archivoUrl: string) => {
    try {
      // Extract file path from URL (supports public and signed URLs)
      const match = archivoUrl.match(/storage\/v1\/object\/(?:public|sign)\/facturas-boletas\/([^?]+)/);
      const filePath = match ? decodeURIComponent(match[1]) : archivoUrl.split('/').slice(-2).join('/');

      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('facturas-boletas')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete record from database
      const { error: deleteError } = await supabase
        .from('facturas_boletas')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      toast({
        title: "Éxito",
        description: "Factura eliminada correctamente",
      });

      await fetchFacturas();
    } catch (error: any) {
      console.error('Error deleting factura:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la factura",
        variant: "destructive",
      });
    }
  };

  return {
    facturas,
    loading,
    uploadFactura,
    deleteFactura,
    refetch: fetchFacturas,
  };
}
