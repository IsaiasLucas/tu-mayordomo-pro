import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Eye, 
  EyeOff,
  LogIn,
  User,
  Building2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface LocationState {
  accountType: 'personal' | 'empresa';
  accountData: {
    id: string;
    nome: string;
    email: string;
    tipo: 'personal' | 'empresa';
  };
}

const LoginSecundario = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!state?.accountData) {
      navigate('/');
    }
  }, [state, navigate]);

  if (!state?.accountData) {
    return null;
  }

  const { accountData, accountType } = state;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: accountData.email,
        password: senha
      });

      if (error) {
        toast({
          title: "Erro ao fazer login",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      if (data.user) {
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo de volta${accountType === 'empresa' ? ' à conta empresarial' : ''}!`
        });

        navigate('/');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro inesperado",
        description: "Tente novamente mais tarde",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-header flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-background/95 backdrop-blur-lg shadow-card-hover rounded-3xl p-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mr-3 hover:bg-accent/10 rounded-xl"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary/10 rounded-2xl">
              {accountType === 'empresa' ? (
                <Building2 className="h-6 w-6 text-primary" />
              ) : (
                <User className="h-6 w-6 text-primary" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold">Login Rápido</h1>
              <p className="text-sm text-muted-foreground">
                Entre na sua conta {accountType === 'empresa' ? 'empresarial' : 'pessoal'}
              </p>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="mb-6 p-4 bg-muted/30 rounded-2xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-background">
              {accountType === 'empresa' ? (
                <Building2 className="h-4 w-4 text-primary" />
              ) : (
                <User className="h-4 w-4 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{accountData.nome}</p>
              <p className="text-xs text-muted-foreground">{accountData.email}</p>
            </div>
            <Badge 
              variant={accountType === 'empresa' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {accountType === 'empresa' ? 'Empresa' : 'Personal'}
            </Badge>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="senha" className="text-sm font-medium">
              Senha
            </Label>
            <div className="relative mt-2">
              <Input
                id="senha"
                type={showPassword ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="rounded-xl pr-12"
                placeholder="Digite sua senha"
                required
                autoFocus
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-accent/10 rounded-lg"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 rounded-xl font-semibold"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Entrando...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <LogIn className="h-5 w-5" />
                <span>Entrar</span>
              </div>
            )}
          </Button>
        </form>

        <div className="text-center mt-6">
          <Button
            variant="link"
            className="text-primary hover:text-primary/80 text-sm"
            onClick={() => navigate('/ingresar')}
          >
            Esqueceu a senha?
          </Button>
        </div>

        <div className="text-center mt-4">
          <p className="text-xs text-muted-foreground">
            Não é você?{' '}
            <Button
              variant="link"
              className="text-primary hover:text-primary/80 p-0 h-auto text-xs"
              onClick={() => navigate('/ingresar')}
            >
              Usar outra conta
            </Button>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default LoginSecundario;