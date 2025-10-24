import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, Shield, CheckCircle } from "lucide-react";

export default function ResetPassword() {
  const [loading, setLoading] = useState(true);
  const [validToken, setValidToken] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkRecoveryToken = async () => {
      try {
        // Parse hash params
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const type = hashParams.get('type');
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (type === 'recovery' && accessToken) {
          // Set session with recovery tokens
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });

          if (error) {
            console.error('Session error:', error);
            setValidToken(false);
          } else {
            setValidToken(true);
          }
        } else {
          setValidToken(false);
        }
      } catch (error) {
        console.error('Recovery token error:', error);
        setValidToken(false);
      } finally {
        setLoading(false);
      }
    };

    checkRecoveryToken();
  }, []);

  const handlePasswordReset = async (e: React.FormEvent) => {
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

    setResetLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      // Sign out after password change
      await supabase.auth.signOut();

      setSuccess(true);

      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido cambiada exitosamente",
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.replace("/auth");
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al actualizar la contraseña",
        variant: "destructive",
      });
    } finally {
      setResetLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="auth-page-gradient w-full max-w-full min-h-screen-ios relative overflow-y-auto overflow-x-hidden font-['Inter']" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'var(--gradient-mesh)' }} />
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary-glow/30 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDuration: '4s', filter: 'blur(80px)' }} />
        <div className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-accent/25 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDuration: '6s', animationDelay: '1s', filter: 'blur(100px)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-lilac/20 rounded-full blur-3xl pointer-events-none" style={{ filter: 'blur(120px)' }} />
        
        <div className="min-h-screen-ios flex items-center justify-center px-4 py-6 relative z-10">
          <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 sm:border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page-gradient w-full max-w-full min-h-screen-ios relative overflow-y-auto overflow-x-hidden font-['Inter']" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
      {/* Premium animated mesh background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'var(--gradient-mesh)' }} />
      
      {/* Floating orbs with glow effect */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-primary-glow/30 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDuration: '4s', filter: 'blur(80px)' }} />
      <div className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-accent/25 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDuration: '6s', animationDelay: '1s', filter: 'blur(100px)' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-lilac/20 rounded-full blur-3xl pointer-events-none" style={{ filter: 'blur(120px)' }} />
      
      <div className="min-h-screen-ios flex items-center justify-center px-4 py-6 relative z-10">
        <div className="w-full max-w-md animate-scale-in">
          <div className="bg-white/95 dark:bg-card/95 backdrop-blur-2xl rounded-3xl shadow-glass border border-white/30 p-6 sm:p-8 lg:p-10" style={{ boxShadow: 'var(--shadow-elegant)' }}>
            {success ? (
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    ¡Contraseña actualizada!
                  </h2>
                  <p className="text-muted-foreground">
                    Redirigiendo al inicio de sesión...
                  </p>
                </div>
              </div>
            ) : validToken ? (
              <>
                <div className="mb-6 sm:mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Nueva contraseña
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Ingresa tu nueva contraseña
                  </p>
                </div>

                <form onSubmit={handlePasswordReset} className="space-y-5 sm:space-y-6">
                  <div className="space-y-2 sm:space-y-3">
                    <Label htmlFor="new-password" className="text-sm sm:text-base font-bold text-foreground">
                      Nueva contraseña
                    </Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Mínimo 8 caracteres
                    </p>
                    <div className="relative group">
                      <Input
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Mínimo 8 caracteres"
                        required
                        minLength={8}
                        className="h-12 sm:h-14 px-4 sm:px-5 pr-12 sm:pr-14 text-sm sm:text-base rounded-xl sm:rounded-2xl bg-secondary/40 border-2 border-input/60 focus:border-primary focus:bg-background/60 backdrop-blur-sm transition-all hover:bg-secondary/60 hover:border-primary/50 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-[14px] top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors p-2 touch-manipulation rounded-full hover:bg-secondary/50"
                        style={{ transform: 'translateY(-50%)' }}
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                          <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                      </button>
                    </div>
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
                        placeholder="Repite la contraseña"
                        required
                        minLength={8}
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
                    disabled={resetLoading}
                  >
                    {resetLoading ? (
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 sm:border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        <span className="text-sm sm:text-base">Actualizando...</span>
                      </div>
                    ) : (
                      "Actualizar contraseña"
                    )}
                  </Button>
                </form>

                <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-border/30">
                  <div className="flex items-center justify-center gap-2">
                    <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                    <p className="text-xs sm:text-sm text-center text-muted-foreground font-medium">
                      Protección de nivel bancario
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="text-center space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      Link inválido o expirado
                    </h2>
                    <p className="text-muted-foreground">
                      El enlace de recuperación no es válido o ha expirado. Solicita un nuevo correo de recuperación.
                    </p>
                  </div>

                  <Button 
                    onClick={() => window.location.replace("/auth")}
                    className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl text-base sm:text-lg font-bold shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] touch-manipulation" 
                    style={{ background: 'var(--gradient-header)' }}
                  >
                    Volver al inicio de sesión
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
