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
import geminisLogo from "@/assets/geminis-logo.png";
import apoyadorLogo from "@/assets/apoyador-logo.png";
import { z } from "zod";

// Security: Input validation schema for authentication
const authSchema = z.object({
  email: z.string()
    .trim()
    .toLowerCase()
    .email('Email inválido')
    .max(255, 'Email demasiado largo'),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(72, 'La contraseña es demasiado larga')
});

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetCooldown, setResetCooldown] = useState(0);
  const [showEmailConfirmModal, setShowEmailConfirmModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
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

  const confirmRedirectUrl = `${window.location.origin}/auth/confirm`;
  const resetRedirectUrl = `${window.location.origin}/auth/callback`;


  // Inicializar cooldown desde localStorage (persistente entre recargas)
  useEffect(() => {
    try {
      const until = parseInt(localStorage.getItem('resetCooldownUntil') || '0', 10);
      if (until > Date.now()) {
        setResetCooldown(Math.ceil((until - Date.now()) / 1000));
      }
    } catch {}
  }, []);

  // Persistir cooldown en localStorage y contador regresivo
  useEffect(() => {
    try {
      if (resetCooldown > 0) {
        const until = Date.now() + resetCooldown * 1000;
        localStorage.setItem('resetCooldownUntil', String(until));
      } else {
        localStorage.removeItem('resetCooldownUntil');
      }
    } catch {}
  }, [resetCooldown]);

  // Cooldown para evitar spam del endpoint /recover
  useEffect(() => {
    if (resetCooldown <= 0) return;
    const t = setInterval(() => setResetCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resetCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que los campos no estén vacíos
    const trimmedEmail = email.trim();
    const trimmedPassword = password;
    
    if (!trimmedEmail || !trimmedPassword) {
      toast({
        title: "Error",
        description: "Completa tu correo y contraseña.",
        variant: "destructive",
      });
      return;
    }
    
    // Security: Validate input before processing
    const validationResult = authSchema.safeParse({ email: trimmedEmail, password: trimmedPassword });
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      toast({
        title: "Error de validación",
        description: firstError.message,
        variant: "destructive",
      });
      return;
    }

    const { email: validEmail, password: validPassword } = validationResult.data;
    setLoading(true);

    try {
      const { syncUserProfile } = await import('@/lib/syncUserProfile');
      
      if (isSignUp) {
        // Flujo de registro - SIEMPRE envía correo
        const { data, error } = await supabase.auth.signUp({
          email: validEmail,
          password: validPassword,
            options: {
              emailRedirectTo: confirmRedirectUrl
            }
        });

        if (error) {
          const msg = (error.message || '').toLowerCase();
          
          // Manejo de errores específicos con reintento de reenvío
          if (msg.includes('rate') || msg.includes('too many')) {
            try {
              await supabase.auth.resend({
                type: 'signup',
                email: validEmail,
                options: { emailRedirectTo: confirmRedirectUrl }
              });
              setRegisteredEmail(validEmail);
              setShowEmailConfirmModal(true);
              toast({ title: "Demasiados intentos", description: "Reenviamos el correo de verificación. Revisa tu bandeja y spam." });
            } catch (_) {
              toast({ title: "Error", description: "Demasiados intentos. Prueba en unos minutos.", variant: "destructive" });
            }
            return;
          }
          
          if (msg.includes('smtp') || msg.includes('email')) {
            try {
              await supabase.auth.resend({
                type: 'signup',
                email: validEmail,
                options: { emailRedirectTo: confirmRedirectUrl }
              });
              setRegisteredEmail(validEmail);
              setShowEmailConfirmModal(true);
              toast({ title: "Correo reenviado", description: "No pudimos enviar el primero. Revisa tu bandeja y spam." });
            } catch (_) {
              toast({ title: "Error", description: "No pudimos enviar el correo. Verifica tu dirección o reintenta.", variant: "destructive" });
            }
            return;
          }
          
          // Otros errores genéricos
          toast({
            title: "Error",
            description: "No pudimos crear tu cuenta. Inténtalo de nuevo.",
            variant: "destructive",
          });
          return;
        }

        // Detectar si es un signup repetido (usuario ya existe pero no confirmó)
        const isRepeatedSignup = data.user && (!data.user.identities || data.user.identities.length === 0);
        
        if (isRepeatedSignup) {
          // Usuario ya existe pero no ha confirmado - FORZAR reenvío del email
          try {
            await supabase.auth.resend({
              type: 'signup',
              email: validEmail,
               options: { emailRedirectTo: confirmRedirectUrl }
            });
            
            toast({
              title: "Correo reenviado",
              description: "Ya tienes una cuenta. Te reenviamos el correo de verificación. Revisa tu bandeja y spam.",
            });
          } catch (resendError) {
            toast({
              title: "Error",
              description: "No pudimos reenviar el correo. Intenta nuevamente.",
              variant: "destructive",
            });
          }
          
          setRegisteredEmail(validEmail);
          setShowEmailConfirmModal(true);
          return;
        }

        // Si Supabase aceptó el registro: SIEMPRE muestra feedback positivo
        toast({
          title: "¡Correo enviado!",
          description: "Te enviamos un correo para verificar tu cuenta. Revisa tu bandeja y spam.",
        });
        
        // Mostrar modal con opción de reenvío
        setRegisteredEmail(validEmail);
        setShowEmailConfirmModal(true);
        
      } else {
        // Login flow
        const { data, error } = await supabase.auth.signInWithPassword({
          email: validEmail,
          password: validPassword,
        });

        if (error) {
          const msg = (error.message || '').toLowerCase();
          const code = error.code || '';
          
          if (msg.includes('email not confirmed') || code === 'email_not_confirmed') {
            // Email no confirmado - reenviar
            await supabase.auth.resend({ 
              type: 'signup', 
              email: validEmail, 
              options: { emailRedirectTo: confirmRedirectUrl }
            });
            setRegisteredEmail(validEmail);
            setShowEmailConfirmModal(true);
            toast({
              title: "Confirma tu correo",
              description: `Te enviamos un email a ${validEmail} para activar tu cuenta.`,
            });
          } else if (msg.includes('invalid') || msg.includes('credentials') || code === 'invalid_credentials') {
            // Credenciales incorrectas
            toast({
              title: "Credenciales incorrectas",
              description: "Verifica tu correo y contraseña.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Error",
              description: "No pudimos iniciar sesión. Intenta de nuevo.",
              variant: "destructive",
            });
          }
          return;
        }

        // Login exitoso - sincronizar profiles/usuarios por user_id
        const user = data.user;
        if (!user) {
          toast({
            title: "Error",
            description: "No se pudo obtener los datos del usuario.",
            variant: "destructive",
          });
          return;
        }

        // Sync identity: reconciliar profiles/usuarios por auth.uid()
        await syncUserProfile();

        toast({
          title: "✅ Acceso exitoso",
          description: "Cargando tus datos...",
        });

        // Redirigir a inicio para cargar gastos/plan/perfil por user_id
        window.location.replace('/inicio');
      }
    } catch (error: any) {
      const msg = (error?.message || '').toLowerCase();
      
      // Manejo específico de errores en catch
      if (msg.includes('rate') || msg.includes('too many')) {
        toast({
          title: "Error",
          description: "Demasiados intentos. Prueba en unos minutos.",
          variant: "destructive",
        });
      } else if (msg.includes('smtp') || msg.includes('email')) {
        toast({
          title: "Error",
          description: "No pudimos enviar el correo. Verifica tu dirección o reintenta.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "No pudimos crear tu cuenta. Inténtalo de nuevo.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    try {
      await supabase.auth.resend({
        type: 'signup',
        email: registeredEmail,
        options: { emailRedirectTo: confirmRedirectUrl }
      });
      
      toast({
        title: "Correo reenviado",
        description: "Hemos reenviado el correo de verificación. Revisa tu bandeja y spam.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No pudimos reenviar el correo. Intenta nuevamente.",
        variant: "destructive",
      });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (resetCooldown > 0) {
      toast({
        title: "Espera un momento",
        description: `Vuelve a intentarlo en ${resetCooldown}s para evitar bloqueos por muchos intentos`,
      });
      return;
    }

    const emailToReset = resetEmail.trim().toLowerCase();
    if (!emailToReset) {
      toast({
        title: "Error",
        description: "Por favor ingresa tu correo electrónico",
        variant: "destructive",
      });
      return;
    }

    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(emailToReset, {
        redirectTo: `${resetRedirectUrl}`,
      });

      if (error) throw error;

      toast({
        title: "Email enviado",
        description: "Revisa tu correo para restablecer tu contraseña",
      });
      setShowResetDialog(false);
      setResetEmail("");
      setResetCooldown(60); // Iniciar cooldown de 60s para evitar rate limit
    } catch (error: any) {
      const msg = (error?.message || '').toLowerCase();
      if (msg.includes('rate') || msg.includes('429')) {
        setResetCooldown(900);
        toast({
          title: "Demasiados intentos",
          description: "Has solicitado demasiados correos en poco tiempo. Inténtalo nuevamente en unos minutos.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Error al enviar el correo de recuperación",
          variant: "destructive",
        });
      }
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="w-full h-full relative overflow-y-auto overflow-x-hidden font-['Inter']" style={{ 
      minHeight: '-webkit-fill-available',
      background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-glow)) 100%)'
    }}>
      {/* Premium animated mesh background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'var(--gradient-mesh)' }} />
      
      {/* Floating orbs with glow effect */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-primary-glow/30 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDuration: '4s', filter: 'blur(80px)' }} />
      <div className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-accent/25 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDuration: '6s', animationDelay: '1s', filter: 'blur(100px)' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-lilac/20 rounded-full blur-3xl pointer-events-none" style={{ filter: 'blur(120px)' }} />
      
      <div className="flex flex-col lg:flex-row items-center justify-center px-4 py-4 sm:py-6 lg:p-12 relative z-10 gap-6 lg:gap-12" style={{ 
        minHeight: '-webkit-fill-available',
        paddingTop: 'max(1rem, env(safe-area-inset-top))',
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom))'
      }}>
        <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-6 lg:gap-16 items-center">
          {/* Left side - Hero & Branding */}
          <div className="hidden lg:flex flex-col space-y-6 lg:space-y-8 text-white">
            {/* Hero Title - Desktop only */}
            <div className="text-left space-y-4 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/15 backdrop-blur-md border border-white/30 shadow-lg">
                <Sparkles className="w-5 h-5 text-yellow-300" />
                <span className="text-sm font-semibold tracking-wide">Fintech Premium</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Gestión Financiera<br />
                <span className="bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-transparent drop-shadow-lg">
                  Inteligente
                </span>
              </h1>
              <p className="text-lg lg:text-xl text-white/90 font-light">
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
            <div className="grid grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
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
          </div>

          {/* Right side - Premium Auth form */}
          <div className="w-full animate-scale-in" style={{ animationDelay: '0.15s' }}>
            {/* Mobile header */}
            <div className="lg:hidden text-center mb-6 text-white space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-md border border-white/30">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span className="text-sm font-semibold">Fintech Premium</span>
              </div>
              <h1 className="text-3xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-transparent">
                  Gestión Financiera Inteligente
                </span>
              </h1>
            </div>

            {/* Contenedor con bordes redondeados */}
            <div className="space-y-0">
              {/* Tarjeta blanca del formulario */}
              <div className="bg-white/95 dark:bg-card/95 backdrop-blur-2xl rounded-3xl lg:rounded-[2rem] shadow-glass border border-white/30 p-6 sm:p-8 lg:p-12 pb-8" style={{ boxShadow: 'var(--shadow-elegant)' }}>
                <div className="mb-6 sm:mb-8 lg:mb-10">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {isSignUp ? "Crear cuenta" : "Bienvenido de vuelta"}
                  </h2>
                  <p className="text-sm sm:text-base lg:text-lg text-muted-foreground font-light">
                    {isSignUp ? (
                      <>
                        Comienza tu viaje{" "}
                        <button
                          type="button"
                          onClick={() => setIsSignUp(false)}
                          className="text-primary font-bold hover:text-accent transition-colors"
                        >
                          Inicia sesión
                        </button>
                      </>
                    ) : (
                      <>
                        ¿Nuevo?{" "}
                        <button
                          type="button"
                          onClick={() => setIsSignUp(true)}
                          className="text-primary font-bold hover:text-accent transition-colors"
                        >
                          Crea tu cuenta
                        </button>
                      </>
                    )}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 lg:space-y-7">
                <div className="space-y-2 sm:space-y-3">
                  <Label htmlFor="email" className="text-sm sm:text-base font-bold text-foreground">
                    Correo electrónico
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    required
                    autoComplete="email"
                    inputMode="email"
                    className="h-12 sm:h-14 px-4 sm:px-5 text-sm sm:text-base rounded-xl sm:rounded-2xl bg-secondary/40 border-2 border-input/60 focus:border-primary focus:bg-background/60 backdrop-blur-sm transition-all hover:bg-secondary/60 hover:border-primary/50 font-medium"
                  />
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <Label htmlFor="password" className="text-sm sm:text-base font-bold text-foreground">
                    Contraseña
                  </Label>
                  {isSignUp && (
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      La contraseña debe contener letras y números
                    </p>
                  )}
                  <div className="relative group">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      required
                      autoComplete={isSignUp ? "new-password" : "current-password"}
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
                </div>

                {!isSignUp && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowResetDialog(true)}
                      className="text-xs sm:text-sm font-semibold text-primary hover:text-accent transition-colors touch-manipulation"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl text-base sm:text-lg font-bold shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] touch-manipulation" 
                  style={{ background: 'var(--gradient-header)' }}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 sm:border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="text-sm sm:text-base">Procesando...</span>
                    </div>
                  ) : (
                    isSignUp ? "Crear mi cuenta" : "Acceder ahora"
                  )}
                </Button>
              </form>

                <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-border/30">
                  <div className="flex items-center justify-center gap-2">
                    <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                    <p className="text-xs sm:text-sm text-center text-muted-foreground font-medium">
                      {isSignUp ? (
                        <>
                          Al crear cuenta, aceptas nuestros{" "}
                          <a href="#" className="text-primary hover:text-accent font-bold transition-colors whitespace-nowrap">
                            términos
                          </a>
                        </>
                      ) : (
                        "🔒 Protección de nivel bancario"
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sección de apoyadores sin fondo */}
              <div className="flex flex-col items-center justify-center mt-6 gap-0">
                <p className="text-white/90 text-base sm:text-lg font-semibold text-center mb-[-16px]">
                  Apoyadores
                </p>
                
                {/* Logo GEMINIS - PNG transparente, alineado con línea invisible */}
                <img 
                  src={geminisLogo} 
                  alt="GEMINIS" 
                  className="h-[32px] sm:h-[40px] w-auto object-contain mt-5"
                  style={{ margin: 0, padding: 0 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación de email */}
      <Dialog open={showEmailConfirmModal} onOpenChange={setShowEmailConfirmModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Confirma tu correo</DialogTitle>
            <DialogDescription className="text-base pt-2 space-y-3">
              <p>Te enviamos un email a <span className="font-semibold text-primary">{registeredEmail}</span> con un enlace para activar tu cuenta.</p>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">¿No lo encuentras?</span> Revisa tu carpeta de spam o correo no deseado. A veces los correos de verificación llegan ahí.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={() => {
                setShowEmailConfirmModal(false);
                setEmail("");
                setPassword("");
              }}
              className="w-full"
            >
              Entendido
            </Button>
            <button
              type="button"
              onClick={handleResendEmail}
              className="text-sm font-semibold text-primary hover:text-accent transition-colors underline"
            >
              Reenviar correo
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de restablecer contraseña */}
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
                disabled={resetLoading || resetCooldown > 0}
              >
                {resetLoading ? "Enviando..." : resetCooldown > 0 ? `Espera ${resetCooldown}s` : "Enviar enlace"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
    </div>
  );
}
