import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, Sparkles, TrendingUp, Shield, Zap } from "lucide-react";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          }
        });

        if (error) throw error;

        toast({
          title: "Registro realizado",
          description: "Verifica tu email para confirmar la cuenta",
        });
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

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-accent font-['Inter']">
      {/* Animated mesh background - simplified for mobile performance */}
      <div className="absolute inset-0 opacity-20 sm:opacity-30" style={{ backgroundImage: 'var(--gradient-mesh)' }} />
      
      {/* Animated orbs - reduced on mobile */}
      <div className="absolute top-10 sm:top-20 left-10 sm:left-20 w-48 sm:w-72 h-48 sm:h-72 bg-primary-glow/20 sm:bg-primary-glow/30 rounded-full blur-2xl sm:blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-10 sm:bottom-20 right-10 sm:right-20 w-56 sm:w-96 h-56 sm:h-96 bg-accent/15 sm:bg-accent/20 rounded-full blur-2xl sm:blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
      
      <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-6 lg:gap-8 items-center">
          {/* Left side - Branding - Mobile header */}
          <div className="flex flex-col space-y-4 sm:space-y-6 lg:space-y-8 text-white">
            {/* Mobile compact header */}
            <div className="lg:hidden text-center space-y-3 animate-fade-in">
              <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Tu Mayordomo</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold">
                Gestión Financiera<br />
                <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                  Inteligente
                </span>
              </h1>
            </div>

            {/* Desktop full branding */}
            <div className="hidden lg:block space-y-4 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Sistema de Gestión Financiera</span>
              </div>
              <h1 className="text-5xl font-bold leading-tight">
                Controla tus<br />
                <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                  finanzas personales
                </span>
              </h1>
              <p className="text-lg text-white/80 max-w-md">
                Gestiona gastos, crea presupuestos y obtén reportes detallados de forma simple y profesional.
              </p>
            </div>

            {/* Feature cards - only on larger screens */}
            <div className="hidden lg:grid grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                <TrendingUp className="w-8 h-8 mb-3 text-white" />
                <h3 className="font-semibold mb-1">Reportes Inteligentes</h3>
                <p className="text-sm text-white/70">Análisis detallados en tiempo real</p>
              </div>
              <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                <Sparkles className="w-8 h-8 mb-3 text-white" />
                <h3 className="font-semibold mb-1">Control Total</h3>
                <p className="text-sm text-white/70">Gestión completa de tus gastos</p>
              </div>
            </div>

            {/* Mobile feature badges */}
            <div className="lg:hidden flex justify-center gap-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">Seguro</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium">Rápido</span>
              </div>
            </div>
          </div>

          {/* Right side - Auth form */}
          <div className="w-full animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <div className="bg-card/95 backdrop-blur-xl rounded-3xl shadow-glass border border-white/20 p-6 sm:p-8 lg:p-10">
              <div className="mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                  {isSignUp ? "Crear cuenta" : "Bienvenido"}
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {isSignUp ? (
                    <>
                      Comienza tu viaje financiero{" "}
                      <button
                        type="button"
                        onClick={() => setIsSignUp(false)}
                        className="text-primary font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        Inicia sesión
                      </button>
                    </>
                  ) : (
                    <>
                      Continúa donde lo dejaste{" "}
                      <button
                        type="button"
                        onClick={() => setIsSignUp(true)}
                        className="text-primary font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        Regístrate
                      </button>
                    </>
                  )}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold">
                    Correo electrónico
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nombre@ejemplo.com"
                    required
                    className="h-12 sm:h-13 px-4 text-base rounded-xl bg-secondary/30 border border-input/50 focus:border-primary focus:bg-background/50 backdrop-blur-sm transition-all hover:bg-secondary/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold">
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
                      className="h-12 sm:h-13 px-4 pr-12 text-base rounded-xl bg-secondary/30 border border-input/50 focus:border-primary focus:bg-background/50 backdrop-blur-sm transition-all hover:bg-secondary/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 touch-manipulation"
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
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors touch-manipulation"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-12 sm:h-13 rounded-xl text-base font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 hover:shadow-elegant transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] touch-manipulation" 
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Procesando...
                    </div>
                  ) : (
                    isSignUp ? "Crear cuenta" : "Iniciar sesión"
                  )}
                </Button>
              </form>

              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border/50">
                <p className="text-xs sm:text-sm text-center text-muted-foreground px-2">
                  {isSignUp ? (
                    <>
                      Al crear una cuenta, aceptas nuestros{" "}
                      <a href="#" className="text-primary hover:underline font-medium">
                        términos
                      </a>
                    </>
                  ) : (
                    "Tus datos están protegidos de forma segura"
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
