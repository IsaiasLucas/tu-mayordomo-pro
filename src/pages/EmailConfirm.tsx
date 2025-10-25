import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

type VerificationState = "loading" | "success" | "error";

export default function EmailConfirm() {
  const navigate = useNavigate();
  const [state, setState] = useState<VerificationState>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const confirmEmail = async () => {
      // Leer código de la URL
      const code = new URLSearchParams(window.location.search).get('code');

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
          setErrorMessage("El enlace puede haber expirado o ya fue utilizado. Solicita un nuevo correo desde la app.");
        } else {
          setState("success");
        }
      } catch (error) {
        setState("error");
        setErrorMessage("El enlace puede haber expirado o ya fue utilizado. Solicita un nuevo correo desde la app.");
      }
    };

    confirmEmail();
  }, []);

  const handleSuccessClick = () => {
    navigate('/auth');
  };

  const handleRetry = () => {
    window.location.reload();
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
          </>
        )}

        {state === "success" && (
          <>
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 flex items-center justify-center">
                <CheckCircle2 className="w-16 h-16 text-green-600" />
              </div>
              <CardTitle className="text-2xl" tabIndex={0}>
                ¡Correo verificado!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <CardDescription className="text-center text-base">
                Tu correo fue confirmado correctamente. Vuelve a la app e inicia sesión.
              </CardDescription>
              
              <Button
                onClick={handleSuccessClick}
                className="w-full"
                size="lg"
                aria-label="Iniciar sesión"
              >
                Iniciar sesión
              </Button>
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
                {errorMessage}
              </CardDescription>
              
              <Button
                onClick={handleRetry}
                className="w-full"
                size="lg"
                aria-label="Reintentar verificación"
              >
                Reintentar
              </Button>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
