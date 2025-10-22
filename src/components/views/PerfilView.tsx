import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
  Upload,
  Copy,
  Plus,
  MessageCircle
} from "lucide-react";

interface PerfilViewProps {
  onViewChange?: (view: string) => void;
}

const PerfilView = ({ onViewChange }: PerfilViewProps = {}) => {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
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
  const [invitationCodes, setInvitationCodes] = useState<any[]>([]);
  const [showInvitationCodeDialog, setShowInvitationCodeDialog] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<any>(null);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [showDeleteCodeDialog, setShowDeleteCodeDialog] = useState(false);
  const [codeToDelete, setCodeToDelete] = useState<any>(null);
  const [deletingCode, setDeletingCode] = useState(false);

  const isPro = profile?.plan === 'pro' || profile?.plan === 'premium';
  const isEmpresa = profile?.entidad === 'empresa';
  

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

  useEffect(() => {
    if (isEmpresa && user?.id) {
      fetchInvitationCodes();
    }
  }, [isEmpresa, user?.id]);

  const fetchInvitationCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('invitation_codes')
        .select('*')
        .eq('company_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitationCodes(data || []);
    } catch (error) {
      console.error('Error fetching invitation codes:', error);
    }
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


  const handleSignOut = async () => {
    try {
      setLoading(true);
      await signOut();
      // Use window.location for reliable redirect
      window.location.href = "/auth";
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "No se pudo cerrar sesión. Intenta nuevamente.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      // Filter out sensitive and technical fields from profile
      const filteredProfile = profile ? {
        email: profile.email,
        display_name: profile.display_name,
        phone_personal: profile.phone_personal,
        phone_empresa: profile.phone_empresa,
        plan: profile.plan,
        entidad: profile.entidad,
        whatsapp_configured: profile.whatsapp_configured,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      } : null;

      const dataToExport = {
        profile: filteredProfile,
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
        title: "Error",
        description: error.message || "No fue posible cancelar el plan.",
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

      // Salva imediatamente no perfil para refletir fora do modal
      await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user?.id);

      toast({
        title: "Foto atualizada",
        description: "Sua foto de perfil foi atualizada.",
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

      console.log('Guardando perfil...', {
        user_id: user?.id,
        display_name: editName,
        avatar_url: avatarUrl
      });

      const avatarToSave = avatarUrl ?? profile?.avatar_url ?? null;
      const { error, data } = await supabase
        .from('profiles')
        .update({
          display_name: editName,
          avatar_url: avatarToSave,
        })
        .eq('user_id', user?.id)
        .select();

      if (error) {
        console.error('Error al actualizar:', error);
        throw error;
      }

      console.log('Perfil actualizado:', data);

      toast({
        title: "Perfil actualizado",
        description: "Tu información ha sido actualizada exitosamente.",
      });

      setShowEditDialog(false);
      
      // Esperar un momento antes de recargar
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error: any) {
      console.error('Error completo al guardar:', error);
      toast({
        title: "Error al actualizar perfil",
        description: error.message || "Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvitationCode = async () => {
    setGeneratingCode(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Error",
          description: "Sesión expirada",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('generate-invitation-code', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      setGeneratedCode(data.code);
      setShowInvitationCodeDialog(true);
      await fetchInvitationCodes();

      toast({
        title: "✅ Código generado correctamente",
        description: "Puedes compartirlo con tus empleados.",
      });
    } catch (error: any) {
      console.error('Error generating code:', error);
      toast({
        title: "❌ Error al generar el código",
        description: error.message || "Intenta más tarde.",
        variant: "destructive",
      });
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleDeleteInvitationCode = async () => {
    if (!codeToDelete) return;

    setDeletingCode(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Error",
          description: "Sesión expirada",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.functions.invoke('delete-invitation-code', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: { codeId: codeToDelete.id },
      });

      if (error) throw error;

      await fetchInvitationCodes();
      setShowDeleteCodeDialog(false);
      setCodeToDelete(null);

      toast({
        title: "Código eliminado",
        description: "El código de invitación ha sido eliminado.",
      });
    } catch (error: any) {
      console.error('Error deleting code:', error);
      toast({
        title: "Error al eliminar",
        description: error.message || "Intenta más tarde.",
        variant: "destructive",
      });
    } finally {
      setDeletingCode(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: `${label} copiado al portapapeles.`,
    });
  };

  const stats = [
    { label: "Meses activo", value: userProfile.monthsActive, icon: Calendar },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Profile Header */}
      <Card className="bg-gradient-to-br from-purple-600 via-purple-500 to-blue-600 text-white shadow-xl rounded-2xl overflow-hidden">
        {/* Header Content */}
        <div className="p-4 sm:p-5">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
            {/* Profile Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 flex-1 min-w-0">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-3 border-white/30 shadow-lg ring-2 ring-white/10 transition-transform group-hover:scale-105">
                <AvatarImage src={avatarUrl || profile?.avatar_url || undefined} className="object-cover" />
                <AvatarFallback className="bg-white/20 text-white text-2xl backdrop-blur">
                  {userProfile.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 mb-1">
                  <h1 className="text-xl sm:text-2xl font-bold truncate">{userProfile.name}</h1>
                  {isPro && (
                    <Badge className="bg-yellow-400 text-black px-2 py-0.5 rounded-full font-semibold w-fit mx-auto sm:mx-0 animate-pulse shadow-md text-xs">
                      <Crown className="h-3 w-3 mr-1" />
                      PRO
                    </Badge>
                  )}
                </div>
                <p className="text-white/90 text-sm sm:text-base mb-2 truncate">{userProfile.email}</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-xs sm:text-sm text-white/80">
                  <span className="flex items-center justify-center sm:justify-start gap-1">
                    <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{userProfile.phone}</span>
                  </span>
                  <span className="hidden sm:inline text-white/50">•</span>
                  <span className="flex items-center justify-center sm:justify-start gap-1">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                    {userProfile.location}
                  </span>
                  <span className="hidden sm:inline text-white/50">•</span>
                  <span className="flex items-center justify-center sm:justify-start gap-1">
                    <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                    {userProfile.joinDate}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Edit Button */}
            <Button 
              variant="ghost" 
              className="text-white hover:bg-white/20 rounded-xl px-3 sm:px-4 py-2 text-sm border-2 border-white/30 hover:border-white/50 transition-all hover:scale-105 shadow-md backdrop-blur-sm w-full sm:w-auto touch-manipulation font-semibold"
              onClick={handleEditProfile}
            >
              <Edit3 className="h-4 w-4 mr-1.5" />
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
                  className="bg-white/15 backdrop-blur-md rounded-xl p-3 sm:p-4 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-lg group w-full max-w-xs"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-white/20 p-1.5 rounded-lg group-hover:bg-white/30 transition-colors">
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-white/90">{stat.label}</span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold tracking-tight">{stat.value}</p>
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
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 shadow-lg rounded-3xl p-6 border-2 border-purple-100 dark:border-purple-900/50">
          <h3 className="text-xl font-bold mb-6 flex items-center bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            <Settings className="h-6 w-6 mr-2 text-purple-600 dark:text-purple-400" />
            Configuración de la Cuenta
          </h3>
          
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md border border-purple-100 dark:border-purple-900/30">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl p-2.5 mt-0.5">
                    <Eye className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Mostrar saldo al inicio</h4>
                    <p className="text-sm text-muted-foreground mt-0.5">Controla la visibilidad de tu saldo principal</p>
                  </div>
                </div>
                <Switch
                  checked={showBalance}
                  onCheckedChange={(checked) => {
                    setShowBalance(checked);
                    localStorage.setItem("tm_show_balance", String(checked));
                    toast({
                      title: checked ? "Saldo visible" : "Saldo oculto",
                      description: checked ? "El saldo será mostrado en la pantalla inicial." : "El saldo será ocultado en la pantalla inicial.",
                    });
                  }}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-600 data-[state=checked]:to-blue-600"
                />
              </div>
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
                  className="w-full h-11 sm:h-12 rounded-2xl text-sm sm:text-base font-semibold justify-start touch-manipulation"
                >
                  <Download className="h-4 w-4 mr-2 flex-shrink-0" />
                  Exportar mis datos
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowPasswordDialog(true)}
                  className="w-full h-11 sm:h-12 rounded-2xl text-sm sm:text-base font-semibold justify-start touch-manipulation"
                >
                  <Shield className="h-4 w-4 mr-2 flex-shrink-0" />
                  Cambiar contraseña
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    window.open('https://ig.me/m/tumayordomoapp', '_blank');
                    // When user returns to app, redirect to inicio
                    const handleVisibilityChange = () => {
                      if (!document.hidden && onViewChange) {
                        onViewChange('inicio');
                        document.removeEventListener('visibilitychange', handleVisibilityChange);
                      }
                    };
                    document.addEventListener('visibilitychange', handleVisibilityChange);
                  }}
                  className="w-full h-11 sm:h-12 rounded-2xl text-sm sm:text-base font-semibold justify-start touch-manipulation border-purple-300 hover:bg-purple-50"
                >
                  <MessageCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                  Ayuda
                </Button>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-4">Acciones de la Cuenta</h4>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteDialog(true)}
                  className="w-full h-11 sm:h-12 rounded-2xl text-sm sm:text-base font-semibold justify-start text-red-600 border-red-300 hover:bg-red-50 touch-manipulation"
                >
                  <Trash2 className="h-4 w-4 mr-2 flex-shrink-0" />
                  Eliminar cuenta
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleSignOut}
                  disabled={loading}
                  className="w-full h-11 sm:h-12 rounded-2xl text-sm sm:text-base font-semibold justify-start touch-manipulation"
                >
                  <LogOut className="h-4 w-4 mr-2 flex-shrink-0" />
                  {loading ? "Cerrando sesión..." : "Salir"}
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
              className="rounded-2xl h-11 sm:h-12 text-sm sm:text-base font-semibold px-4 sm:px-6 w-full sm:w-auto touch-manipulation"
            >
              Cancelar Plan
            </Button>
          )}
        </div>
      </Card>

      {/* Invitation Codes - Only for Empresa accounts */}
      {isEmpresa && (
        <Card className="bg-white shadow-sm rounded-3xl p-6">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Códigos de Invitación</h3>
                <p className="text-sm text-gray-600">Genera códigos para invitar empleados a tu empresa</p>
              </div>
              <Button
                onClick={handleGenerateInvitationCode}
                disabled={generatingCode}
                className="rounded-2xl h-11 sm:h-12 text-sm sm:text-base font-semibold px-4 sm:px-6 w-full sm:w-auto bg-purple-600 hover:bg-purple-700 touch-manipulation"
              >
                <Plus className="h-4 w-4 mr-2 flex-shrink-0" />
                {generatingCode ? "Generando..." : "Generar código"}
              </Button>
            </div>

            {invitationCodes.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-gray-700">Códigos activos</h4>
                <div className="space-y-2">
                  {invitationCodes.map((code) => (
                    <div
                      key={code.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl gap-3"
                    >
                      <div className="flex-1">
                        <p className="font-mono font-semibold text-lg text-purple-600">{code.code}</p>
                        <p className="text-xs text-gray-500">
                          Creado: {new Date(code.created_at).toLocaleDateString('es-CL')}
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setCodeToDelete(code);
                          setShowDeleteCodeDialog(true);
                        }}
                        className="rounded-xl w-full sm:w-auto"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

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
            <AlertDialogTitle className="text-red-600 font-bold">⚠️ Eliminar Cuenta</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 text-base">
              <p className="font-semibold text-gray-900">
                ¿Estás completamente seguro de que deseas eliminar tu cuenta?
              </p>
              <p className="text-gray-700">
                Esta acción es <span className="font-bold text-red-600">IRREVERSIBLE</span> y resultará en:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>La eliminación permanente de <strong>todos tus registros de gastos</strong></li>
                <li>La pérdida de <strong>toda tu información personal</strong></li>
                <li>La eliminación completa de tu <strong>base de datos</strong></li>
                <li>La cancelación de tu plan actual</li>
              </ul>
              <p className="text-red-600 font-semibold mt-4">
                No podrás recuperar ninguna información después de confirmar esta acción.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="rounded-xl">No, mantener mi cuenta</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAccount}
              disabled={loading}
              className="rounded-xl bg-red-600 hover:bg-red-700 font-bold"
            >
              {loading ? "Eliminando..." : "Sí, eliminar todo"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Invitation Code Generated Dialog */}
      <Dialog open={showInvitationCodeDialog} onOpenChange={setShowInvitationCodeDialog}>
        <DialogContent className="max-w-[90vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Código de invitación generado</DialogTitle>
            <DialogDescription>
              Comparte este código con tus empleados para que se unan a tu empresa.
            </DialogDescription>
          </DialogHeader>

          {generatedCode && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-purple-50 rounded-xl text-center">
                <p className="text-xs text-gray-600 mb-1">Código de invitación</p>
                <p className="text-2xl font-mono font-bold text-purple-600">{generatedCode.code}</p>
              </div>

              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(generatedCode.code, "Código")}
                  className="w-full rounded-xl"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar código
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const whatsappLink = `https://wa.me/56955264713?text=ALTA%20${generatedCode.code}`;
                    copyToClipboard(whatsappLink, "Link de WhatsApp");
                  }}
                  className="w-full rounded-xl"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Copiar link de invitación (WhatsApp)
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={() => {
                setShowInvitationCodeDialog(false);
                setGeneratedCode(null);
              }}
              className="rounded-xl w-full"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Invitation Code Confirmation Dialog */}
      <AlertDialog open={showDeleteCodeDialog} onOpenChange={setShowDeleteCodeDialog}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar código de invitación?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro? Esto invalidará las invitaciones que ya fueron enviadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteInvitationCode}
              disabled={deletingCode}
              className="rounded-xl bg-red-600 hover:bg-red-700"
            >
              {deletingCode ? "Eliminando..." : "Sí, eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-[90vw] sm:max-w-[550px]">
          <DialogHeader className="text-center pb-2">
            <DialogTitle className="text-2xl font-bold">Editar Perfil</DialogTitle>
            <DialogDescription className="text-base">
              Actualiza tu información personal y foto de perfil.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center">
              {/* Background gradient container */}
              <div className="w-full bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl py-10 px-6 mb-4 flex justify-center items-center">
                <div className="relative group">
                  <Avatar className="h-32 w-32 border-4 border-white/30 shadow-2xl ring-4 ring-white/10 transition-transform group-hover:scale-105">
                    <AvatarImage src={avatarUrl || profile?.avatar_url || undefined} className="object-cover" />
                    <AvatarFallback className="text-4xl bg-white/20 text-white backdrop-blur">
                      {editName.charAt(0).toUpperCase() || userProfile.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <Label 
                    htmlFor="avatar-upload" 
                    className="absolute bottom-1 right-1 cursor-pointer flex items-center justify-center h-8 w-8 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 opacity-95 hover:opacity-100"
                  >
                    {uploading ? (
                      <div className="animate-spin h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full" />
                    ) : (
                      <Camera className="h-4 w-4 text-purple-600" />
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
              </div>
              
              <p className="text-sm text-muted-foreground text-center mb-4">
                Clique no ícone da câmera para alterar sua foto
              </p>
            </div>

            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base font-semibold">Nome</Label>
              <Input
                id="name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Tu nombre"
                className="rounded-xl h-12 text-base"
                autoFocus={false}
                onFocus={(e) => e.target.blur()}
              />
            </div>

            {/* Phone (disabled) */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-base font-semibold">Teléfono</Label>
              <Input
                id="phone"
                value={userProfile.phone}
                disabled
                className="rounded-xl h-12 text-base bg-gray-100 cursor-not-allowed"
                autoFocus={false}
              />
              <p className="text-xs text-muted-foreground">
                El teléfono no puede ser modificado porque está vinculado a tu cuenta.
              </p>
            </div>

            {/* Email (disabled) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-semibold">Email</Label>
              <Input
                id="email"
                value={userProfile.email}
                disabled
                className="rounded-xl h-12 text-base bg-gray-100 cursor-not-allowed"
                autoFocus={false}
              />
            </div>
          </div>

          <DialogFooter className="gap-3 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              className="rounded-xl h-12 text-base flex-1 sm:flex-initial"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveProfile}
              disabled={loading || uploading}
              className="rounded-xl h-12 text-base bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 flex-1 sm:flex-initial"
            >
              {loading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PerfilView;