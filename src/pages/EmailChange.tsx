import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

type ViewState = "loading" | "success" | "error";

export default function EmailChange() {
  const navigate = useNavigate();
  const [state, setState] = useState<ViewState>("loading");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    let unsub: { unsubscribe: () => void } | null = null;

    const run = async () => {
      try {
        // 0) Se já houver sessão, pode ser que o link tenha funcionado automaticamente
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setState("success");
          setMessage("Seu e-mail foi atualizado com sucesso.");
          return;
        }
      } catch {}

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          setState("success");
          setMessage("Seu e-mail foi atualizado com sucesso.");
        }
      });
      unsub = subscription;

      const hash = window.location.hash?.replace(/^#/, "") || "";
      const hashParams = new URLSearchParams(hash);
      const searchParams = new URLSearchParams(window.location.search);

      // 1) Fluxo com tokens no hash (#access_token & #refresh_token)
      const typeHash = hashParams.get("type");
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      if (typeHash === "email_change" && accessToken && refreshToken) {
        try {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;
          window.history.replaceState(null, "", window.location.pathname + window.location.search);
          setState("success");
          setMessage("Seu e-mail foi atualizado com sucesso.");
          return;
        } catch (err: any) {
          console.error("email_change setSession error", err);
        }
      }

      // 2) Fluxo por código (?code=...)
      const code = searchParams.get("code");
      if (code) {
        try {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          setState("success");
          setMessage("Seu e-mail foi atualizado com sucesso.");
          return;
        } catch (err: any) {
          console.error("email_change exchangeCodeForSession error", err);
        }
      }

      // 3) Fluxo verifyOtp com token_hash/token (?type=email_change&token_hash=...)
      const typeParam = searchParams.get("type") || hashParams.get("type");
      const tokenHash = searchParams.get("token_hash") || hashParams.get("token_hash");
      const token = searchParams.get("token") || hashParams.get("token");
      if (typeParam === "email_change" && (tokenHash || token)) {
        try {
          const authAny: any = supabase.auth as any;
          if (tokenHash) {
            const { error } = await authAny.verifyOtp({ type: "email_change", token_hash: tokenHash });
            if (error) throw error;
          } else if (token) {
            const { error } = await authAny.verifyOtp({ type: "email_change", token });
            if (error) throw error;
          }
          setState("success");
          setMessage("Seu e-mail foi atualizado com sucesso.");
          return;
        } catch (err: any) {
          console.error("email_change verifyOtp error", err);
        }
      }

      // 4) Mensagem de erro vinda na URL
      const urlErr = hashParams.get("error_description") || searchParams.get("error_description");
      if (urlErr) {
        setState("error");
        setMessage(decodeURIComponent(urlErr));
        return;
      }

      setState("error");
      setMessage("O link é inválido ou expirou. Solicite novamente.");
    };

    run();
    return () => { try { unsub?.unsubscribe(); } catch {} };
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-[480px] shadow-lg">
        {state === "loading" && (
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 flex items-center justify-center">
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
            </div>
            <CardTitle className="text-2xl">Validando link…</CardTitle>
          </CardHeader>
        )}

        {state === "success" && (
          <>
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 flex items-center justify-center">
                <CheckCircle2 className="w-16 h-16 text-green-600" />
              </div>
              <CardTitle className="text-2xl">E-mail atualizado!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <CardDescription className="text-center text-base">
                {message || "Você já pode continuar usando a conta."}
              </CardDescription>
              <Button className="w-full" size="lg" onClick={() => navigate('/perfil')}>
                Voltar ao perfil
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
              <CardTitle className="text-2xl">Erro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <CardDescription className="text-center text-base">{message}</CardDescription>
              <Button className="w-full" size="lg" onClick={() => navigate('/perfil')}>
                Voltar ao perfil
              </Button>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
