import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Eye, EyeOff, Sparkles, TrendingUp, Shield, Zap } from "lucide-react";
import fintechHero from "@/assets/fintech-hero.png";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/inicio");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/inicio");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Por favor completa email y contraseña",
        variant: "destructive",
      });
      return;
    }

    if (isSignUp && !phone) {
      toast({
        title: "Error",
        description: "Por favor ingresa tu número de teléfono",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              phone: phone,
              telefone: phone
            }
          }
        });

        // Si el usuario ya existe, intentar hacer login automáticamente
        if (error && error.message === "User already registered") {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (signInError) {
            toast({
              title: "Error",
              description: "Este correo ya está registrado. Verifica tu contraseña.",
              variant: "destructive",
            });
            return;
          }
          
          toast({
            title: "Bienvenido de nuevo",
            description: "Accediendo a tu cuenta",
          });
          // El listener onAuthStateChange redireccionará automáticamente
          return;
        }

        if (error) throw error;

        toast({
          title: "Cuenta creada",
          description: "Bienvenido a Tu Mayordomo",
        });
        // El listener onAuthStateChange redireccionará automáticamente
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Inicio de sesión exitoso",
          description: "Bienvenido de nuevo",
        });
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error durante la autenticación",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast({
        title: "Error",
        description: "Por favor ingresa tu correo electrónico",
        variant: "destructive",
      });
      return;
    }

    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });

      if (error) throw error;

      toast({
        title: "Email enviado",
        description: "Revisa tu correo para restablecer tu contraseña",
      });
      setShowResetDialog(false);
      setResetEmail("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al enviar el correo de recuperación",
        variant: "destructive",
      });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden font-['Inter']" style={{ background: 'var(--gradient-hero)' }}>
      {/* Premium animated mesh background */}
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'var(--gradient-mesh)' }} />
      
      {/* Floating orbs with glow effect */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-primary-glow/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s', filter: 'blur(80px)' }} />
      <div className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-accent/25 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s', filter: 'blur(100px)' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-lilac/20 rounded-full blur-3xl" style={{ filter: 'blur(120px)' }} />
      
      <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center p-4 sm:p-6 lg:p-12 relative z-10 gap-8 lg:gap-12">
        <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left side - Hero & Branding */}
          <div className="flex flex-col space-y-6 lg:space-y-8 text-white">
            {/* Hero Title - Always visible */}
            <div className="text-center lg:text-left space-y-4 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/15 backdrop-blur-md border border-white/30 shadow-lg mx-auto lg:mx-0">
                <Sparkles className="w-5 h-5 text-yellow-300" />
                <span className="text-sm font-semibold tracking-wide">Fintech Premium</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Gestión Financiera<br />
                <span className="bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-transparent drop-shadow-lg">
                  Inteligente
                </span>
              </h1>
              <p className="text-lg lg:text-xl text-white/90 max-w-xl mx-auto lg:mx-0 font-light">
                Controla tus finanzas de forma profesional con análisis en tiempo real y reportes detallados
              </p>
            </div>

            {/* Hero Illustration */}
            <div className="hidden lg:block relative animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl blur-2xl" />
              <img 
                src={fintechHero} 
                alt="Mujer analizando finanzas" 
                className="relative rounded-3xl shadow-2xl border border-white/20 w-full h-auto"
                style={{ boxShadow: 'var(--shadow-glow)' }}
              />
            </div>

            {/* Feature Grid - Desktop only */}
            <div className="hidden lg:grid grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/25 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-glow">
                <TrendingUp className="w-9 h-9 mb-3 text-yellow-300" />
                <h3 className="font-bold mb-1.5 text-lg">Reportes Inteligentes</h3>
                <p className="text-sm text-white/80">Análisis avanzados y visualización de datos</p>
              </div>
              <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/25 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-glow">
                <Shield className="w-9 h-9 mb-3 text-yellow-300" />
                <h3 className="font-bold mb-1.5 text-lg">Seguridad Total</h3>
                <p className="text-sm text-white/80">Protección bancaria de nivel empresarial</p>
              </div>
            </div>

            {/* Mobile badges */}
            <div className="lg:hidden flex justify-center gap-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/15 backdrop-blur-md border border-white/30">
                <Shield className="w-4 h-4 text-yellow-300" />
                <span className="text-sm font-semibold">Seguro</span>
              </div>
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/15 backdrop-blur-md border border-white/30">
                <Zap className="w-4 h-4 text-yellow-300" />
                <span className="text-sm font-semibold">Rápido</span>
              </div>
            </div>
          </div>

          {/* Right side - Premium Auth form */}
          <div className="w-full animate-scale-in" style={{ animationDelay: '0.15s' }}>
            <div className="bg-white/95 dark:bg-card/95 backdrop-blur-2xl rounded-[2rem] shadow-glass border border-white/30 p-8 sm:p-10 lg:p-12" style={{ boxShadow: 'var(--shadow-elegant)' }}>
              <div className="mb-8 sm:mb-10">
                <h2 className="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {isSignUp ? "Crear cuenta" : "Bienvenido de vuelta"}
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground font-light">
                  {isSignUp ? (
                    <>
                      Comienza tu viaje hacia el control financiero{" "}
                      <button
                        type="button"
                        onClick={() => setIsSignUp(false)}
                        className="text-primary font-bold hover:text-accent transition-colors inline-flex items-center gap-1"
                      >
                        Inicia sesión aquí
                      </button>
                    </>
                  ) : (
                    <>
                      ¿Nuevo en la plataforma?{" "}
                      <button
                        type="button"
                        onClick={() => setIsSignUp(true)}
                        className="text-primary font-bold hover:text-accent transition-colors inline-flex items-center gap-1"
                      >
                        Crea tu cuenta
                      </button>
                    </>
                  )}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-7">
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-base font-bold text-foreground">
                    Correo electrónico
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    required
                    className="h-14 px-5 text-base rounded-2xl bg-secondary/40 border-2 border-input/60 focus:border-primary focus:bg-background/60 backdrop-blur-sm transition-all hover:bg-secondary/60 hover:border-primary/50 font-medium"
                  />
                </div>

                {isSignUp && (
                  <div className="space-y-3">
                    <Label htmlFor="phone" className="text-base font-bold text-foreground">
                      Número de teléfono
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+56 9 1234 5678"
                      required
                      className="h-14 px-5 text-base rounded-2xl bg-secondary/40 border-2 border-input/60 focus:border-primary focus:bg-background/60 backdrop-blur-sm transition-all hover:bg-secondary/60 hover:border-primary/50 font-medium"
                    />
                  </div>
                )}

                <div className="space-y-3">
                  <Label htmlFor="password" className="text-base font-bold text-foreground">
                    Contraseña
                  </Label>
                  <div className="relative group">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      required
                      className="h-14 px-5 pr-14 text-base rounded-2xl bg-secondary/40 border-2 border-input/60 focus:border-primary focus:bg-background/60 backdrop-blur-sm transition-all hover:bg-secondary/60 hover:border-primary/50 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors p-2 touch-manipulation rounded-full hover:bg-secondary/50"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {!isSignUp && (
                  <div className="flex justify-end -mt-2">
                    <button
                      type="button"
                      onClick={() => setShowResetDialog(true)}
                      className="text-sm font-semibold text-primary hover:text-accent transition-colors touch-manipulation"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-14 rounded-2xl text-lg font-bold shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] touch-manipulation" 
                  style={{ background: 'var(--gradient-header)' }}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      Procesando...
                    </div>
                  ) : (
                    isSignUp ? "Crear mi cuenta" : "Acceder ahora"
                  )}
                </Button>
              </form>

              <div className="mt-8 sm:mt-10 pt-6 border-t border-border/30">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Shield className="w-4 h-4 text-primary" />
                  <p className="text-sm text-center text-muted-foreground font-medium">
                    {isSignUp ? (
                      <>
                        Al crear una cuenta, aceptas nuestros{" "}
                        <a href="#" className="text-primary hover:text-accent font-bold transition-colors">
                          términos y condiciones
                        </a>
                      </>
                    ) : (
                      "Tus datos están protegidos con encriptación de nivel bancario"
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Restablecer contraseña</DialogTitle>
            <DialogDescription>
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetPassword} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Correo electrónico</Label>
              <Input
                id="reset-email"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="nombre@ejemplo.com"
                required
                className="h-12"
              />
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowResetDialog(false)}
                className="flex-1"
                disabled={resetLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={resetLoading}
              >
                {resetLoading ? "Enviando..." : "Enviar enlace"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
