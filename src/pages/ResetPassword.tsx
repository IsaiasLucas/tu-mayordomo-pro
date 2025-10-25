import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, Shield, Check } from "lucide-react";

export default function ResetPassword() {
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Verificar si hay un token en la URL
    const access_token = searchParams.get('access_token');
    const type = searchParams.get('type');
    
    if (!access_token || type !== 'recovery') {
      toast({
        title: "Error",
        description: "Link de recuperación inválido o expirado",
        variant: "destructive",
      });
      navigate("/auth");
    }
  }, [searchParams, navigate]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 8 caracteres",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
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
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido cambiada exitosamente",
      });

      // Redirigir al inicio después de 2 segundos
      setTimeout(() => {
        navigate("/inicio");
      }, 2000);

    } catch (error: any) {
      console.error('Reset password error:', error);
      toast({
        title: "Error",
        description: error.message || "Error al cambiar la contraseña. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full relative overflow-y-auto overflow-x-hidden font-['Inter']" style={{ 
      minHeight: '100dvh', 
      background: 'var(--gradient-hero)',
      paddingTop: 'env(safe-area-inset-top)',
      paddingBottom: 'env(safe-area-inset-bottom)'
    }}>
      {/* Premium animated mesh background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'var(--gradient-mesh)' }} />
      
      {/* Floating orbs with glow effect */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-primary-glow/30 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDuration: '4s', filter: 'blur(80px)' }} />
      <div className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-accent/25 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDuration: '6s', animationDelay: '1s', filter: 'blur(100px)' }} />
      
      <div className="flex items-center justify-center px-4 py-4 sm:py-6 lg:p-12 relative z-10" style={{ minHeight: 'calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom))' }}>
        <div className="w-full max-w-md">
          <div className="bg-white/95 dark:bg-card/95 backdrop-blur-2xl rounded-3xl shadow-glass border border-white/30 p-6 sm:p-8 lg:p-10" style={{ boxShadow: 'var(--shadow-elegant)' }}>
            <div className="mb-6 sm:mb-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Nueva contraseña
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Ingresa tu nueva contraseña segura
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-5 sm:space-y-6">
              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="new-password" className="text-sm sm:text-base font-bold text-foreground">
                  Nueva contraseña
                </Label>
                <div className="relative group">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    required
                    className="h-12 sm:h-14 px-4 sm:px-5 pr-12 sm:pr-14 text-sm sm:text-base rounded-xl sm:rounded-2xl bg-secondary/40 border-2 border-input/60 focus:border-primary focus:bg-background/60 backdrop-blur-sm transition-all hover:bg-secondary/60 hover:border-primary/50 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-[14px] top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors p-2 touch-manipulation rounded-full hover:bg-secondary/50"
                    style={{ transform: 'translateY(-50%)' }}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  La contraseña debe contener letras y números
                </p>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="confirm-password" className="text-sm sm:text-base font-bold text-foreground">
                  Confirmar contraseña
                </Label>
                <div className="relative group">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite tu contraseña"
                    required
                    className="h-12 sm:h-14 px-4 sm:px-5 pr-12 sm:pr-14 text-sm sm:text-base rounded-xl sm:rounded-2xl bg-secondary/40 border-2 border-input/60 focus:border-primary focus:bg-background/60 backdrop-blur-sm transition-all hover:bg-secondary/60 hover:border-primary/50 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-[14px] top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors p-2 touch-manipulation rounded-full hover:bg-secondary/50"
                    style={{ transform: 'translateY(-50%)' }}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl text-base sm:text-lg font-bold shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] touch-manipulation" 
                style={{ background: 'var(--gradient-header)' }}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 sm:border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="text-sm sm:text-base">Actualizando...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    <span>Cambiar contraseña</span>
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-border/30">
              <div className="flex items-center justify-center gap-2">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                <p className="text-xs sm:text-sm text-center text-muted-foreground font-medium">
                  Conexión segura y encriptada
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
