import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function EmailConfirm() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // Exchange code for session using the current URL
        const url = window.location.href;
        const { error } = await supabase.auth.exchangeCodeForSession(url);
        
        if (error) {
          console.error('Error al verificar email:', error);
          setStatus('error');
          return;
        }

        // Success - sync user profile
        const { syncUserProfile } = await import('@/lib/syncUserProfile');
        await syncUserProfile();
        
        setStatus('success');
      } catch (error) {
        console.error('Error en confirmación:', error);
        setStatus('error');
      }
    };

    confirmEmail();
  }, []);

  const handleSuccessClick = () => {
    // Navigate to auth/login page
    navigate('/auth');
  };

  const handleErrorClick = () => {
    // Navigate to home
    navigate('/');
  };

  return (
    <div className="w-full h-full flex items-center justify-center" style={{ 
      minHeight: '-webkit-fill-available',
      background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-glow)) 100%)'
    }}>
      {/* Loading Dialog */}
      <Dialog open={status === 'loading'}>
        <DialogContent className="sm:max-w-md [&>button]:hidden">
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <Loader2 className="w-16 h-16 animate-spin text-primary" />
            <p className="text-lg font-semibold text-center">Verificando tu correo...</p>
            <p className="text-sm text-muted-foreground text-center">Por favor espera un momento</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={status === 'success'}>
        <DialogContent className="sm:max-w-md [&>button]:hidden">
          <DialogHeader>
            <div className="flex flex-col items-center space-y-4 pt-4">
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
              <DialogTitle className="text-2xl font-bold text-center">
                ¡Verificación completada!
              </DialogTitle>
            </div>
            <DialogDescription className="text-center text-base pt-2">
              Tu correo fue confirmado con éxito. Por favor, inicia sesión para continuar.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={handleSuccessClick}
              className="w-full h-12 text-base font-semibold"
              size="lg"
            >
              Iniciar sesión
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <Dialog open={status === 'error'}>
        <DialogContent className="sm:max-w-md [&>button]:hidden">
          <DialogHeader>
            <div className="flex flex-col items-center space-y-4 pt-4">
              <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
              </div>
              <DialogTitle className="text-2xl font-bold text-center">
                Error de verificación
              </DialogTitle>
            </div>
            <DialogDescription className="text-center text-base pt-2">
              No pudimos verificar tu correo. Por favor, inténtalo de nuevo.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={handleErrorClick}
              variant="outline"
              className="w-full h-12 text-base font-semibold"
              size="lg"
            >
              Volver al inicio
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
