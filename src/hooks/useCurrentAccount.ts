import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

const CURRENT_ACCOUNT_KEY = "tm_current_account";

export interface Account {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
}

export function useCurrentAccount() {
  const { user } = useAuth();
  const [currentAccountId, setCurrentAccountId] = useState<string | null>(() => {
    return localStorage.getItem(CURRENT_ACCOUNT_KEY);
  });
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAccounts();
    }
  }, [user]);

  const loadAccounts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setAccounts(data || []);

      // Se não há contas, criar "Principal" automaticamente
      if (!data || data.length === 0) {
        await createDefaultAccount();
      } else {
        // Se há contas mas nenhuma selecionada, selecionar a primeira
        const storedAccountId = localStorage.getItem(CURRENT_ACCOUNT_KEY);
        if (!storedAccountId || !data.find(acc => acc.id === storedAccountId)) {
          switchToAccount(data[0].id);
        }
      }
    } catch (error) {
      console.error("Error loading accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultAccount = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("accounts")
        .insert({
          user_id: user.id,
          name: "Principal",
          email: user.email,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setAccounts([data]);
        switchToAccount(data.id);
      }
    } catch (error) {
      console.error("Error creating default account:", error);
    }
  };

  const switchToAccount = (accountId: string) => {
    localStorage.setItem(CURRENT_ACCOUNT_KEY, accountId);
    setCurrentAccountId(accountId);
  };

  const addAccount = async (name: string, email?: string, phone?: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("accounts")
        .insert({
          user_id: user.id,
          name,
          email,
          phone,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        // Se tem telefone, adicionar também em usuarios
        if (phone && phone.trim() !== '') {
          const phoneDigits = phone.replace(/\D/g, "");
          
          // Verificar se já existe em usuarios
          const { data: existingUsuario } = await supabase
            .from("usuarios")
            .select("*")
            .eq("telefono", phoneDigits)
            .maybeSingle();

          if (!existingUsuario) {
            // Criar registro em usuarios
            await supabase
              .from("usuarios")
              .insert({
                telefono: phoneDigits,
                plan: "free",
                reporte_semanal: true,
                reporte_mensual: true,
              });
          }

          // Atualizar profiles com o novo telefone se for o primeiro
          const { data: profile } = await supabase
            .from("profiles")
            .select("phone_personal, phone_empresa")
            .eq("user_id", user.id)
            .maybeSingle();

          if (profile && !profile.phone_personal && !profile.phone_empresa) {
            await supabase
              .from("profiles")
              .update({ phone_personal: phone })
              .eq("user_id", user.id);
          }
        }

        setAccounts(prev => [data, ...prev]);
        switchToAccount(data.id);
        return data;
      }
    } catch (error) {
      console.error("Error adding account:", error);
      return null;
    }
  };

  const deleteAccount = async (accountId: string) => {
    try {
      const { error } = await supabase
        .from("accounts")
        .delete()
        .eq("id", accountId);

      if (error) throw error;

      setAccounts(prev => prev.filter(acc => acc.id !== accountId));

      // Se era a conta atual, trocar para outra
      if (currentAccountId === accountId) {
        const remaining = accounts.filter(acc => acc.id !== accountId);
        if (remaining.length > 0) {
          switchToAccount(remaining[0].id);
        } else {
          // Criar nova conta "Principal" se não sobrou nenhuma
          await createDefaultAccount();
        }
      }
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  const currentAccount = accounts.find(acc => acc.id === currentAccountId);

  return {
    currentAccountId,
    currentAccount,
    accounts,
    loading,
    switchToAccount,
    addAccount,
    deleteAccount,
    refreshAccounts: loadAccounts,
  };
}
