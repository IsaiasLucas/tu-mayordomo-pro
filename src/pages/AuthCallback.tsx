import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Exchange code for session
        const url = window.location.href;
        await supabase.auth.exchangeCodeForSession(url);
        
        // Wait a moment for auth state to update
        setTimeout(() => {
          window.location.replace('/');
        }, 1500);
      } catch (error) {
        console.error('Error en callback:', error);
        // Si hay error, redirigir a auth después de un momento
        setTimeout(() => {
          navigate('/auth');
        }, 2000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-accent/5 to-background">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
        <p className="text-lg font-medium text-foreground">Confirmando tu cuenta...</p>
        <p className="text-sm text-muted-foreground">Serás redirigido en un momento</p>
      </div>
    </div>
  );
}
