import { useState, useRef } from "react";
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
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Plus, Trash2, Camera } from "lucide-react";
import { useCurrentAccount } from "@/hooks/useCurrentAccount";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function AccountSwitcher() {
  const { currentAccountId, accounts, switchToAccount, addAccount, deleteAccount } = useCurrentAccount();
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountEmail, setNewAccountEmail] = useState("");
  const [newAccountPhone, setNewAccountPhone] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "La imagen debe ser menor a 2MB",
          variant: "destructive",
        });
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (accountId: string): Promise<string | null> => {
    if (!avatarFile) return null;

    try {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${accountId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('account-avatars')
        .upload(filePath, avatarFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('account-avatars')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      return null;
    }
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

    if (newAccountPhone.trim()) {
      const phoneDigits = newAccountPhone.replace(/\D/g, "");
      if (phoneDigits.length < 8) {
        toast({
          title: "Error",
          description: "El teléfono debe tener al menos 8 dígitos",
          variant: "destructive",
        });
        return;
      }
    }

    if (newAccountEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newAccountEmail.trim())) {
        toast({
          title: "Error",
          description: "Email inválido",
          variant: "destructive",
        });
        return;
      }
    }

    const result = await addAccount(
      newAccountName.trim(),
      newAccountEmail.trim() || undefined,
      newAccountPhone.trim() || undefined
    );

    if (result) {
      // Upload avatar se fornecido
      if (avatarFile) {
        const avatarUrl = await uploadAvatar(result.id);
        if (avatarUrl) {
          await supabase
            .from("accounts")
            .update({ avatar_url: avatarUrl })
            .eq("id", result.id);
        }
      }

      toast({
        title: "Cuenta creada",
        description: `Cuenta "${newAccountName}" creada exitosamente`,
      });
      setDialogOpen(false);
      setNewAccountName("");
      setNewAccountEmail("");
      setNewAccountPhone("");
      setAvatarFile(null);
      setAvatarPreview("");
      setOpen(false);
      
      setTimeout(() => window.location.reload(), 150);
    } else {
      toast({
        title: "Error",
        description: "No fue posible crear la cuenta",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!accountToDelete) return;

    await deleteAccount(accountToDelete);
    
    toast({
      title: "Cuenta eliminada",
      description: "La cuenta fue eliminada exitosamente",
    });
    
    setDeleteDialogOpen(false);
    setAccountToDelete(null);
    
    // Recargar página para actualizar queries
    setTimeout(() => window.location.reload(), 150);
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
              <div
                key={account.id}
                className={`
                  flex items-center gap-2 px-3 py-3 rounded-xl
                  ${isActive ? "bg-primary/5 border border-primary/20" : "hover:bg-muted/50"}
                `}
              >
                <div 
                  className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                  onClick={() => handleSwitchAccount(account.id)}
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
                </div>

                {accounts.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAccountToDelete(account.id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
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
            <DialogDescription>
              Crea una nueva cuenta para organizar diferentes números de teléfono y gastos separadamente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Foto de perfil (opcional)</Label>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={avatarPreview} />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    {newAccountName ? newAccountName.charAt(0).toUpperCase() : "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2"
                  >
                    <Camera className="h-4 w-4" />
                    Seleccionar imagen
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Máximo 2MB
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                placeholder="Ej: Trabajo, Personal, etc."
                value={newAccountName}
                onChange={(e) => setNewAccountName(e.target.value)}
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono (opcional)</Label>
              <Input
                id="phone"
                placeholder="+56912345678"
                value={newAccountPhone}
                onChange={(e) => setNewAccountPhone(e.target.value)}
                maxLength={20}
              />
              <p className="text-xs text-muted-foreground">
                Los gastos de este número aparecerán en esta cuenta
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email (opcional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={newAccountEmail}
                onChange={(e) => setNewAccountEmail(e.target.value)}
                maxLength={255}
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cuenta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la cuenta y todos sus datos asociados (gastos, reportes, etc.). Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAccountToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-destructive hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
