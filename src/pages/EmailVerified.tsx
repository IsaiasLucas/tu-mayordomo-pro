import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Sparkles, Shield } from "lucide-react";

export default function EmailVerified() {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto redirect after 5 seconds
    const timer = setTimeout(() => {
      navigate("/auth");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4" style={{ 
      background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-glow)) 100%)'
    }}>
      {/* Premium animated mesh background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'var(--gradient-mesh)' }} />
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-primary-glow/30 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDuration: '4s', filter: 'blur(80px)' }} />
      <div className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-accent/25 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDuration: '6s', animationDelay: '1s', filter: 'blur(100px)' }} />

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/95 dark:bg-card/95 backdrop-blur-2xl rounded-3xl shadow-glass border border-white/30 p-8 sm:p-12 text-center space-y-6" style={{ boxShadow: 'var(--shadow-elegant)' }}>
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse" />
              <CheckCircle2 className="w-20 h-20 text-green-500 relative animate-scale-in" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30">
              <Sparkles className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-700 dark:text-green-400">Verificación exitosa</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ¡Correo verificado!
            </h1>
            
            <p className="text-base sm:text-lg text-muted-foreground">
              Tu correo fue confirmado con éxito. Ahora puedes iniciar sesión en Tu Mayordomo.
            </p>
          </div>

          {/* Action Button */}
          <div className="space-y-3 pt-4">
            <Button 
              onClick={() => navigate("/auth")}
              className="w-full h-14 rounded-2xl text-lg font-bold shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]" 
              style={{ background: 'var(--gradient-header)' }}
            >
              Ir al login
            </Button>
            
            <p className="text-sm text-muted-foreground">
              Serás redirigido automáticamente en 5 segundos...
            </p>
          </div>

          {/* Security Badge */}
          <div className="pt-4 border-t border-border/30">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
              <Shield className="w-3 h-3 text-primary" />
              Protección de nivel bancario
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
