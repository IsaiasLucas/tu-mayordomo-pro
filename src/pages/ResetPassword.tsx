import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type ResetState = "loading" | "form" | "success" | "error";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [state, setState] = useState<ResetState>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const verifyResetLink = async () => {
      // Leer código de la URL
      const code = new URLSearchParams(window.location.search).get('code');

      // Si no hay código, mostrar error
      if (!code) {
        setState("error");
        setErrorMessage("El enlace no es válido o expiró. Solicita uno nuevo.");
        return;
      }

      try {
        // Intercambiar el código por una sesión temporal (tipo recovery)
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          setState("error");
          setErrorMessage("El enlace no es válido o expiró. Solicita uno nuevo.");
        } else {
          // Mostrar el formulario para nueva contraseña
          setState("form");
        }
      } catch (error) {
        setState("error");
        setErrorMessage("El enlace no es válido o expiró. Solicita uno nuevo.");
      }
    };

    verifyResetLink();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar mínimo 8 caracteres
    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 8 caracteres",
        variant: "destructive",
      });
      return;
    }

    // Validar que ambas contraseñas coincidan
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      // Mostrar estado de éxito
      setState("success");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al actualizar la contraseña",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/auth');
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
                Verificando tu enlace…
              </CardTitle>
            </CardHeader>
          </>
        )}

        {state === "form" && (
          <>
            <CardHeader className="text-center space-y-4">
              <CardTitle className="text-2xl" tabIndex={0}>
                Crea tu nueva contraseña
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nueva contraseña</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repite tu contraseña"
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                      aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={submitting}
                  aria-label="Guardar nueva contraseña"
                >
                  {submitting ? "Guardando..." : "Guardar nueva contraseña"}
                </Button>
              </form>
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
                ¡Contraseña actualizada!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <CardDescription className="text-center text-base">
                Vuelve a la app e inicia sesión.
              </CardDescription>
              
              <Button
                onClick={handleBackToLogin}
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
                Error
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <CardDescription className="text-center text-base">
                {errorMessage}
              </CardDescription>
              
              <Button
                onClick={handleBackToLogin}
                className="w-full"
                size="lg"
                aria-label="Volver a iniciar sesión"
              >
                Volver a la app
              </Button>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
