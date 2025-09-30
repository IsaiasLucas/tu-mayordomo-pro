import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, Plus, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface StoredAccount {
  user_id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  access_token: string;
  refresh_token: string;
}

export default function AccountSwitcher() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<StoredAccount[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    // Save current account when user or profile changes
    if (user && profile) {
      saveCurrentAccount();
    }
  }, [user, profile]);

  const loadAccounts = () => {
    try {
      const stored = localStorage.getItem("tm_accounts");
      if (stored) {
        setAccounts(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading accounts:", error);
    }
  };

  const saveCurrentAccount = async () => {
    if (!user || !profile) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const currentAccount: StoredAccount = {
        user_id: user.id,
        email: user.email || "",
        display_name: profile.display_name || user.email?.split('@')[0] || "Usuario",
        avatar_url: profile.avatar_url || null,
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      };

      const stored = localStorage.getItem("tm_accounts");
      let existingAccounts: StoredAccount[] = stored ? JSON.parse(stored) : [];

      // Update or add current account
      const index = existingAccounts.findIndex(acc => acc.user_id === user.id);
      if (index >= 0) {
        existingAccounts[index] = currentAccount;
      } else {
        existingAccounts.push(currentAccount);
      }

      localStorage.setItem("tm_accounts", JSON.stringify(existingAccounts));
      setAccounts(existingAccounts);
    } catch (error) {
      console.error("Error saving account:", error);
    }
  };

  const switchAccount = async (account: StoredAccount) => {
    if (account.user_id === user?.id) {
      setOpen(false);
      return;
    }

    setOpen(false);

    try {
      // Clear all localStorage data from previous account
      localStorage.removeItem('tm_phone');
      localStorage.removeItem('tm_nombre');

      // 1) Try to set session directly with stored tokens (fast path)
      let setErr = null as any;
      try {
        const { error } = await supabase.auth.setSession({
          access_token: account.access_token,
          refresh_token: account.refresh_token,
        });
        setErr = error;
      } catch (e) {
        setErr = e;
      }

      if (setErr) {
        // 2) Fallback: try to refresh using refresh_token only
        const { data, error } = await supabase.auth.refreshSession({
          refresh_token: account.refresh_token,
        });

        if (error || !data.session) {
          console.error('Failed to switch/refresh session:', setErr || error);
          // Keep the account but notify the user – they can re-login later
          toast({
            title: "Sessão expirada",
            description: `Não foi possível alternar para ${account.display_name}. Tente novamente mais tarde.`,
            variant: "destructive",
          });
          return;
        }

        // Update stored tokens after successful refresh
        const updatedAccount: StoredAccount = {
          ...account,
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        };
        const stored = localStorage.getItem("tm_accounts");
        let existingAccounts: StoredAccount[] = stored ? JSON.parse(stored) : [];
        const idx = existingAccounts.findIndex(acc => acc.user_id === account.user_id);
        if (idx >= 0) {
          existingAccounts[idx] = updatedAccount;
          localStorage.setItem("tm_accounts", JSON.stringify(existingAccounts));
        }
      }

      console.log(`Switched to account: ${account.display_name} (${account.email})`);
      toast({ title: "Conta alternada", description: `Agora você está usando ${account.display_name}` });
      setTimeout(() => window.location.reload(), 150);
    } catch (error) {
      console.error("Error switching account:", error);
      toast({ title: "Erro ao alternar conta", description: "Não foi possível trocar de conta.", variant: "destructive" });
    }
  };

  const removeAccount = (userId: string) => {
    const updated = accounts.filter(acc => acc.user_id !== userId);
    localStorage.setItem("tm_accounts", JSON.stringify(updated));
    setAccounts(updated);
  };

  const addNewAccount = async () => {
    // Save current session before switching
    await saveCurrentAccount();
    
    // Sign out and redirect to auth
    await supabase.auth.signOut();
    navigate("/auth");
    setOpen(false);
  };

  const currentAvatar = profile?.avatar_url;
  const currentName = profile?.display_name || user?.email?.split('@')[0] || "U";

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full ring-2 ring-primary/10 hover:ring-primary/30 transition-all"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={currentAvatar || undefined} alt={currentName} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {currentName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[280px] p-2 bg-background/95 backdrop-blur-lg border shadow-2xl rounded-2xl"
      >
        <div className="px-2 py-3 text-sm font-semibold text-muted-foreground">
          Contas
        </div>

        {accounts.map((account) => {
          const isActive = account.user_id === user?.id;
          return (
            <DropdownMenuItem
              key={account.user_id}
              onClick={() => switchAccount(account)}
              className={`
                flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer
                ${isActive ? "bg-primary/5 border border-primary/20" : "hover:bg-muted/50"}
              `}
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src={account.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {account.display_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {account.display_name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {account.email}
                </p>
              </div>

              {isActive && (
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
              )}
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator className="my-2" />

        <DropdownMenuItem
          onClick={addNewAccount}
          className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer hover:bg-primary/10 text-primary font-medium"
        >
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
            <Plus className="h-5 w-5" />
          </div>
          <span>Adicionar nova conta</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
