import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Plus } from "lucide-react";
import { useCurrentAccount } from "@/hooks/useCurrentAccount";
import { toast } from "@/hooks/use-toast";

export default function AccountSwitcher() {
  const { currentAccountId, accounts, switchToAccount, addAccount } = useCurrentAccount();
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountEmail, setNewAccountEmail] = useState("");
  const [newAccountPhone, setNewAccountPhone] = useState("");

  const handleSwitchAccount = (accountId: string) => {
    if (accountId === currentAccountId) {
      setOpen(false);
      return;
    }

    switchToAccount(accountId);
    setOpen(false);
    toast({
      title: "Cuenta cambiada",
      description: "Los datos se actualizarán automáticamente",
    });
    
    // Recargar página para actualizar queries
    setTimeout(() => window.location.reload(), 150);
  };

  const handleAddAccount = async () => {
    if (!newAccountName.trim()) {
      toast({
        title: "Error",
        description: "El nombre es obligatorio",
        variant: "destructive",
      });
      return;
    }

    const result = await addAccount(
      newAccountName.trim(),
      newAccountEmail.trim() || undefined,
      newAccountPhone.trim() || undefined
    );

    if (result) {
      toast({
        title: "Cuenta creada",
        description: `Cuenta "${newAccountName}" creada exitosamente`,
      });
      setDialogOpen(false);
      setNewAccountName("");
      setNewAccountEmail("");
      setNewAccountPhone("");
      setOpen(false);
      
      // Recargar página para actualizar queries
      setTimeout(() => window.location.reload(), 150);
    } else {
      toast({
        title: "Error",
        description: "No fue posible crear la cuenta",
        variant: "destructive",
      });
    }
  };

  const currentAccount = accounts.find(acc => acc.id === currentAccountId);
  const currentName = currentAccount?.name || "U";
  const currentAvatar = currentAccount?.avatar_url;

  return (
    <>
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
            Cuentas
          </div>

          {accounts.map((account) => {
            const isActive = account.id === currentAccountId;
            return (
              <DropdownMenuItem
                key={account.id}
                onClick={() => handleSwitchAccount(account.id)}
                className={`
                  flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer
                  ${isActive ? "bg-primary/5 border border-primary/20" : "hover:bg-muted/50"}
                `}
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={account.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {account.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {account.name}
                  </p>
                  {account.email && (
                    <p className="text-xs text-muted-foreground truncate">
                      {account.email}
                    </p>
                  )}
                </div>

                {isActive && (
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                )}
              </DropdownMenuItem>
            );
          })}

          <DropdownMenuSeparator className="my-2" />

          <DropdownMenuItem
            onClick={() => {
              setDialogOpen(true);
              setOpen(false);
            }}
            className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer hover:bg-primary/10 text-primary font-medium"
          >
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
              <Plus className="h-5 w-5" />
            </div>
            <span>Agregar nueva cuenta</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar nueva cuenta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                placeholder="Ej: Trabajo, Personal, etc."
                value={newAccountName}
                onChange={(e) => setNewAccountName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email (opcional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={newAccountEmail}
                onChange={(e) => setNewAccountEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono (opcional)</Label>
              <Input
                id="phone"
                placeholder="+56912345678"
                value={newAccountPhone}
                onChange={(e) => setNewAccountPhone(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddAccount}>
              Crear cuenta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
