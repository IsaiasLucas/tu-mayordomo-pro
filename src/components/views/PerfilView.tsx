import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User,
  Crown,
  Settings,
  Shield,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Edit3,
  LogOut,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Receipt,
  PiggyBank,
  Camera,
  Upload
} from "lucide-react";

const PerfilView = () => {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const [showBalance, setShowBalance] = useState(() => {
    const saved = localStorage.getItem("tm_show_balance");
    return saved === null ? true : saved === "true";
  });
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCancelPlanDialog, setShowCancelPlanDialog] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [cancellingPlan, setCancellingPlan] = useState(false);
  const [editName, setEditName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const isPro = profile?.plan === 'pro' || profile?.plan === 'premium';
  

  const userProfile = {
    name: profile?.display_name || user?.user_metadata?.nombre || user?.email?.split('@')[0] || "Usuario",
    email: user?.email || "",
    phone: profile?.phone_personal || user?.user_metadata?.telefone || "No registrado",
    location: "Chile",
    joinDate: new Date(user?.created_at || new Date()).toLocaleDateString('es-CL', { 
      year: 'numeric', 
      month: 'long' 
    }),
    planType: profile?.plan || "free",
    totalTransactions: 0,
    monthsActive: Math.ceil((new Date().getTime() - new Date(user?.created_at || new Date()).getTime()) / (1000 * 60 * 60 * 24 * 30))
  };

  if (!user) {
    return <div className="p-4">Cargando perfil...</div>;
  }

  const formatCLP = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);
  };


  const handleExportData = async () => {
    try {
      const dataToExport = {
        profile: profile,
        user: {
          email: user?.email,
          created_at: user?.created_at,
        },
        exported_at: new Date().toISOString(),
      };
      
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mis-datos-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Datos exportados",
        description: "Tus datos fueron exportados con éxito.",
      });
    } catch (error) {
      toast({
        title: "Error al exportar",
        description: "No fue posible exportar tus datos. Intenta nuevamente.",
        variant: "destructive",
      });
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast({
        title: "Contraseña inválida",
        description: "La contraseña debe tener al menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Contraseña cambiada",
        description: "Tu contraseña fue actualizada con éxito.",
      });
      setShowPasswordDialog(false);
      setNewPassword("");
    } catch (error: any) {
      toast({
        title: "Error al cambiar contraseña",
        description: error.message || "Intenta nuevamente más tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPlan = async () => {
    setCancellingPlan(true);
    try {
      const { data, error } = await supabase.functions.invoke("cancel-subscription");
      
      if (error) throw error;
      
      if (data?.success) {
        toast({
          title: "Plano Cancelado",
          description: "Seu plano PRO permanecerá ativo até o final do período. Depois, você retornará ao plano Gratuito.",
        });
        setShowCancelPlanDialog(false);
      }
    } catch (error: any) {
      console.error("Error cancelling plan:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível cancelar o plano.",
        variant: "destructive",
      });
    } finally {
      setCancellingPlan(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      // Ensure we have a fresh session/token
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        // No valid session: force sign out and redirect
        await supabase.auth.signOut();
        window.location.replace('/auth');
        return;
      }

      // Call edge function to delete user completely
      const { error } = await supabase.functions.invoke('delete-user', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (error) throw error;

      toast({
        title: "Cuenta eliminada",
        description: "Tu cuenta fue eliminada con éxito.",
      });

      // Always sign out and redirect after deletion
      // Clear all localStorage data
      localStorage.removeItem('tm_phone');
      localStorage.removeItem('tm_nombre');
      
      await supabase.auth.signOut();
      window.location.replace('/auth');
    } catch (error: any) {
      // On any error, ensure user is signed out and moved to login
      console.error('Delete account error:', error);
      toast({
        title: "Error al eliminar cuenta",
        description: error?.message || "Intenta nuevamente más tarde.",
        variant: "destructive",
      });
      // Clear all localStorage data
      localStorage.removeItem('tm_phone');
      localStorage.removeItem('tm_nombre');
      
      await supabase.auth.signOut();
      window.location.replace('/auth');
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const handleEditProfile = () => {
    setEditName(userProfile.name);
    setAvatarUrl(profile?.avatar_url || null);
    setShowEditDialog(true);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        toast({
          title: "Ningún archivo seleccionado",
          variant: "destructive",
        });
        return;
      }

      const file = event.target.files[0];
      
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Archivo inválido",
          description: "Por favor, selecciona una imagen.",
          variant: "destructive",
        });
        return;
      }

      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Archivo muy grande",
          description: "La imagen debe tener máximo 5MB.",
          variant: "destructive",
        });
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `avatar.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      console.log('Iniciando upload...', filePath);

      // Remove avatar antigo se existir
      if (profile?.avatar_url) {
        try {
          const oldPath = profile.avatar_url.split('/').slice(-2).join('/');
          await supabase.storage.from('avatars').remove([oldPath]);
        } catch (e) {
          console.log('Erro ao remover foto antiga (ignorado):', e);
        }
      }

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { 
          upsert: true,
          contentType: file.type 
        });

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        throw uploadError;
      }

      console.log('Upload concluído:', uploadData);

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      console.log('URL pública:', publicUrl);

      setAvatarUrl(publicUrl);

      toast({
        title: "Foto carregada",
        description: "Sua foto foi carregada com sucesso.",
      });
    } catch (error: any) {
      console.error('Erro completo:', error);
      toast({
        title: "Erro ao carregar foto",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);

      console.log('Salvando perfil...', {
        user_id: user?.id,
        display_name: editName,
        avatar_url: avatarUrl
      });

      const { error, data } = await supabase
        .from('profiles')
        .update({
          display_name: editName,
          avatar_url: avatarUrl,
        })
        .eq('user_id', user?.id)
        .select();

      if (error) {
        console.error('Erro ao atualizar:', error);
        throw error;
      }

      console.log('Perfil atualizado:', data);

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });

      setShowEditDialog(false);
      
      // Aguardar um pouco antes de recarregar
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error: any) {
      console.error('Erro completo ao salvar:', error);
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: "Meses activo", value: userProfile.monthsActive, icon: Calendar },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Profile Header */}
      <Card className="bg-gradient-to-br from-purple-600 via-purple-500 to-blue-600 text-white shadow-2xl rounded-3xl overflow-hidden">
        {/* Header Content */}
        <div className="p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
            {/* Profile Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 flex-1 min-w-0">
              <div className="relative group">
                <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-4 border-white/30 shadow-xl transition-transform group-hover:scale-105">
                  <AvatarImage src={profile?.avatar_url || undefined} className="object-cover" />
                  <AvatarFallback className="bg-white/20 text-white text-3xl backdrop-blur">
                    {userProfile.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <button 
                  onClick={handleEditProfile}
                  className="absolute -bottom-2 -right-2 bg-white text-purple-600 p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
                  aria-label="Editar foto"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold truncate">{userProfile.name}</h1>
                  {isPro && (
                    <Badge className="bg-yellow-400 text-black px-3 py-1 rounded-full font-semibold w-fit mx-auto sm:mx-0 animate-pulse shadow-lg">
                      <Crown className="h-3 w-3 mr-1" />
                      PRO
                    </Badge>
                  )}
                </div>
                <p className="text-white/90 text-base sm:text-lg mb-3 truncate">{userProfile.email}</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-white/80">
                  <span className="flex items-center justify-center sm:justify-start gap-1.5">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{userProfile.phone}</span>
                  </span>
                  <span className="hidden sm:inline text-white/50">•</span>
                  <span className="flex items-center justify-center sm:justify-start gap-1.5">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    {userProfile.location}
                  </span>
                  <span className="hidden sm:inline text-white/50">•</span>
                  <span className="flex items-center justify-center sm:justify-start gap-1.5">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    {userProfile.joinDate}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Edit Button */}
            <Button 
              variant="ghost" 
              className="text-white hover:bg-white/20 rounded-2xl px-6 py-3 border-2 border-white/30 hover:border-white/50 transition-all hover:scale-105 shadow-lg backdrop-blur-sm w-full sm:w-auto"
              onClick={handleEditProfile}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Editar Perfil
            </Button>
          </div>
          
          {/* Stats - Single Card */}
          <div className="flex justify-center sm:justify-start">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div 
                  key={index} 
                  className="bg-white/15 backdrop-blur-md rounded-2xl p-5 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-xl group w-full max-w-xs"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-white/20 p-2 rounded-xl group-hover:bg-white/30 transition-colors">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium text-white/90">{stat.label}</span>
                  </div>
                  <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Bottom Gradient Accent */}
        <div className="h-2 bg-gradient-to-r from-yellow-400 via-purple-400 to-blue-400"></div>
      </Card>

      {/* Account Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white shadow-sm rounded-3xl p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Configuración de la Cuenta
          </h3>
          
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h4 className="font-medium">Mostrar saldo al inicio</h4>
                <p className="text-sm text-gray-600">Controla la visibilidad de tu saldo principal</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const newValue = !showBalance;
                  setShowBalance(newValue);
                  localStorage.setItem("tm_show_balance", String(newValue));
                  toast({
                    title: newValue ? "Saldo visible" : "Saldo oculto",
                    description: newValue ? "El saldo será mostrado en la pantalla inicial." : "El saldo será ocultado en la pantalla inicial.",
                  });
                }}
                className="rounded-xl"
              >
                {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-4">Información Personal</h4>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors gap-2">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span>Email</span>
                  </div>
                  <span className="text-gray-600 break-all">{userProfile.email}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors gap-2">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span>Teléfono</span>
                  </div>
                  <span className="text-gray-600">{userProfile.phone}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors gap-2">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span>Miembro desde</span>
                  </div>
                  <span className="text-gray-600">{userProfile.joinDate}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-white shadow-sm rounded-3xl p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Seguridad y Datos
          </h3>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium">Gestión de Datos</h4>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  onClick={handleExportData}
                  className="w-full rounded-2xl py-3 justify-start"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar mis datos
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowPasswordDialog(true)}
                  className="w-full rounded-2xl py-3 justify-start"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Cambiar contraseña
                </Button>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-4">Acciones de la Cuenta</h4>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteDialog(true)}
                  className="w-full rounded-2xl py-3 justify-start text-red-600 border-red-300 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar cuenta
                </Button>
                <Button 
                  variant="outline" 
                  onClick={signOut}
                  className="w-full rounded-2xl py-3 justify-start"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Salir
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>


      {/* Plan Information */}
      <Card className="bg-white shadow-sm rounded-3xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Tu Plan Actual</h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <Badge className={`px-3 py-1 rounded-full font-semibold w-fit ${
                isPro 
                  ? 'bg-yellow-500 text-black' 
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {isPro && <Crown className="h-3 w-3 mr-1" />}
                {userProfile.planType.toUpperCase()}
              </Badge>
              {isPro ? (
                <p className="text-gray-600">Acceso completo a todas las funcionalidades</p>
              ) : (
                <p className="text-gray-600">Funcionalidades básicas disponibles</p>
              )}
            </div>
          </div>
          {isPro && (
            <Button 
              onClick={() => setShowCancelPlanDialog(true)}
              variant="destructive"
              className="rounded-2xl px-6 w-full sm:w-auto"
            >
              Cancelar Plan
            </Button>
          )}
        </div>
      </Card>

      {/* Cancel Plan Dialog */}
      <AlertDialog open={showCancelPlanDialog} onOpenChange={setShowCancelPlanDialog}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar Plan PRO?</AlertDialogTitle>
            <AlertDialogDescription>
              Tu plan PRO permanecerá activo hasta el final del período de 30 días. 
              Después de ese período, volverás automáticamente al plan Gratuito.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="rounded-xl">No, mantener</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancelPlan}
              disabled={cancellingPlan}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancellingPlan ? "Cancelando..." : "Sí, cancelar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Password Change Dialog */}
      <AlertDialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Cambiar Contraseña</AlertDialogTitle>
            <AlertDialogDescription>
              Ingresa tu nueva contraseña. Debe tener al menos 6 caracteres.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            type="password"
            placeholder="Nueva contraseña"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="rounded-xl"
          />
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleChangePassword}
              disabled={loading}
              className="rounded-xl"
            >
              {loading ? "Cambiando..." : "Cambiar Contraseña"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Account Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Cuenta</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro? Esta acción no se puede deshacer. Todos tus datos serán eliminados permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAccount}
              disabled={loading}
              className="rounded-xl bg-red-600 hover:bg-red-700"
            >
              {loading ? "Eliminando..." : "Eliminar Cuenta"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-[90vw] sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
            <DialogDescription>
              Actualiza tu información personal y foto de perfil.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-32 w-32 border-4 border-gray-200">
                <AvatarImage src={avatarUrl || profile?.avatar_url || undefined} className="object-cover" />
                <AvatarFallback className="text-3xl bg-purple-100 text-purple-600">
                  {editName.charAt(0).toUpperCase() || userProfile.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <Label 
                htmlFor="avatar-upload" 
                className="cursor-pointer inline-flex items-center justify-center rounded-xl bg-purple-600 text-white px-4 py-2 hover:bg-purple-700 transition-colors"
              >
                {uploading ? (
                  "Carregando..."
                ) : (
                  <>
                    <Camera className="h-4 w-4 mr-2" />
                    Alterar Foto
                  </>
                )}
              </Label>
              <Input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploading}
                className="hidden"
              />
            </div>

            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Seu nome"
                className="rounded-xl"
              />
            </div>

            {/* Phone (disabled) */}
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={userProfile.phone}
                disabled
                className="rounded-xl bg-gray-100 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500">
                O telefone não pode ser alterado pois está vinculado à sua conta.
              </p>
            </div>

            {/* Email (disabled) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={userProfile.email}
                disabled
                className="rounded-xl bg-gray-100 cursor-not-allowed"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveProfile}
              disabled={loading || uploading}
              className="rounded-xl bg-purple-600 hover:bg-purple-700"
            >
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PerfilView;