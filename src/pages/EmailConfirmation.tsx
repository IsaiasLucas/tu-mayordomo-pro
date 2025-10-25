import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Loader2, MessageCircle } from "lucide-react";

type VerificationState = "loading" | "success" | "error";

export default function EmailConfirmation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState<VerificationState>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const verifyEmail = async () => {
      const code = searchParams.get("code");
      const type = searchParams.get("type");

      // Si no hay código, mostrar error
      if (!code) {
        setState("error");
        setErrorMessage("Falta el código de verificación en el enlace.");
        return;
      }

      try {
        // Intercambiar el código por una sesión
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          setState("error");
          setErrorMessage(
            error.message || "El enlace puede haber expirado o ya fue utilizado."
          );
        } else {
          setState("success");
        }
      } catch (err: any) {
        setState("error");
        setErrorMessage(
          err.message || "Ocurrió un error inesperado al verificar tu correo."
        );
      }
    };

    verifyEmail();
  }, [searchParams]);

  const handleRetry = () => {
    window.location.reload();
  };

  const handleBackToLogin = () => {
    navigate("/auth");
  };

  const handleWhatsAppSupport = () => {
    window.open("https://wa.me/56955264713", "_blank");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-[480px] shadow-lg">
        {state === "loading" && (
          <>
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 flex items-center justify-center">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
              </div>
              <CardTitle className="text-2xl" tabIndex={0}>
                Verificando tu correo…
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription>
                Por favor espera mientras confirmamos tu correo electrónico.
              </CardDescription>
            </CardContent>
          </>
        )}

        {state === "success" && (
          <>
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 flex items-center justify-center">
                <CheckCircle2 className="w-16 h-16 text-green-600" />
              </div>
              <CardTitle className="text-2xl" tabIndex={0}>
                ¡Verificación concluida!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <CardDescription className="text-center text-base">
                Tu correo fue confirmado correctamente. Vuelve a la app e inicia sesión de nuevo.
              </CardDescription>
              
              <div className="space-y-3">
                <Button
                  onClick={handleBackToLogin}
                  className="w-full"
                  size="lg"
                  aria-label="Volver a la pantalla de inicio de sesión"
                >
                  Volver a la app
                </Button>
                
                <Button
                  onClick={handleWhatsAppSupport}
                  variant="outline"
                  className="w-full"
                  aria-label="Contactar soporte por WhatsApp"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Necesito ayuda
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Si no funciona el botón, cierra esta pestaña y abre la app manualmente.
              </p>
            </CardContent>
          </>
        )}

        {state === "error" && (
          <>
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 flex items-center justify-center">
                <AlertCircle className="w-16 h-16 text-destructive" />
              </div>
              <CardTitle className="text-2xl" tabIndex={0}>
                No pudimos verificar tu correo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <CardDescription className="text-center text-base">
                {errorMessage || "El enlace puede haber expirado o ya fue utilizado. Solicita un nuevo correo de verificación desde la app."}
              </CardDescription>
              
              <div className="space-y-3">
                <Button
                  onClick={handleRetry}
                  className="w-full"
                  size="lg"
                  aria-label="Reintentar verificación"
                >
                  Reintentar
                </Button>
                
                <Button
                  onClick={handleBackToLogin}
                  variant="outline"
                  className="w-full"
                  aria-label="Volver a la pantalla de inicio de sesión"
                >
                  Volver a la app
                </Button>

                <Button
                  onClick={handleWhatsAppSupport}
                  variant="ghost"
                  className="w-full"
                  aria-label="Contactar soporte por WhatsApp"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Necesito ayuda
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Si no funciona el botón, cierra esta pestaña y abre la app manualmente.
              </p>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
