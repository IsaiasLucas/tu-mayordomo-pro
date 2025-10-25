import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Si es recuperación de contraseña, reenviar a /reset-password preservando tokens
        const fullUrl = window.location.href;
        const isRecovery = fullUrl.includes('type=recovery');
        if (isRecovery) {
          const target = `${window.location.origin}/reset-password${window.location.search}${window.location.hash}`;
          window.location.replace(target);
          return;
        }

        // Exchange code for session (signup/login flows)
        const { error } = await supabase.auth.exchangeCodeForSession(fullUrl);
        
        if (error) {
          console.error('Error exchanging code:', error);
          // Redirect to auth if there's an error
          setTimeout(() => {
            navigate('/auth');
          }, 2000);
          return;
        }

        // Import and execute sync
        const { syncUserProfile } = await import('@/lib/syncUserProfile');
        await syncUserProfile();
        
        // Redirect to home - the useAuth hook will handle profile fetching
        window.location.replace('/inicio');
      } catch (error) {
        console.error('Error en callback:', error);
        // If error, redirect to auth
        setTimeout(() => {
          navigate('/auth');
        }, 2000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 via-accent/5 to-background" style={{
      minHeight: '-webkit-fill-available'
    }}>
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
        <p className="text-lg font-medium text-foreground">Confirmando tu cuenta...</p>
        <p className="text-sm text-muted-foreground">Serás redirigido en un momento</p>
      </div>
      
    </div>
  );
}
