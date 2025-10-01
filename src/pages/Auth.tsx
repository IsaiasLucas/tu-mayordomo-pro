import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
import loginCharacter from "@/assets/login-character.png";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/inicio");
      }
    });

    // Listen for auth changes
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
        // Sign up
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
        // Sign in
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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-accent">
      {/* Decorative floating circles */}
      <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-primary-glow/20 blur-xl animate-pulse" />
      <div className="absolute top-32 right-20 w-16 h-16 rounded-full bg-card/10 animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-32 left-32 w-12 h-12 rounded-full bg-primary-glow/30 animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-20 right-40 w-8 h-8 rounded-full bg-card/20 animate-pulse" style={{ animationDelay: '1.5s' }} />
      
      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md">
          {/* Character illustration */}
          <div className="flex justify-center mb-8 animate-fade-in">
            <div className="relative">
              <div className="absolute inset-0 bg-primary-glow/20 rounded-full blur-3xl" />
              <img 
                src={loginCharacter} 
                alt="Welcome character" 
                className="w-48 h-48 object-contain relative z-10 drop-shadow-2xl"
              />
            </div>
          </div>

          {/* Auth card */}
          <div className="bg-card rounded-3xl shadow-elegant p-8 animate-scale-in backdrop-blur-sm">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold mb-2">
                {isSignUp ? "Crea tu cuenta!" : "Bienvenido de vuelta!"}
              </h1>
              <p className="text-muted-foreground">
                {isSignUp ? "Únete a nosotros hoy" : "Nos alegra verte de nuevo"}
                {!isSignUp && (
                  <span className="ml-1">
                    <button
                      type="button"
                      onClick={() => setIsSignUp(true)}
                      className="text-primary font-semibold hover:underline"
                    >
                      Regístrate
                    </button>
                  </span>
                )}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  className="h-12 px-4 rounded-xl bg-secondary/50 border-transparent focus:border-primary focus:bg-background transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="h-12 px-4 pr-12 rounded-xl bg-secondary/50 border-transparent focus:border-primary focus:bg-background transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
                <div className="text-right">
                  <button
                    type="button"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Olvidé mi contraseña
                  </button>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-14 rounded-2xl text-base font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all shadow-lg hover:shadow-xl" 
                disabled={loading}
              >
                {loading ? "Procesando..." : (isSignUp ? "Crear cuenta" : "Entrar")}
              </Button>

              {isSignUp && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setIsSignUp(false)}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    ¿Ya tienes cuenta?{" "}
                    <span className="font-semibold">Iniciar sesión</span>
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
