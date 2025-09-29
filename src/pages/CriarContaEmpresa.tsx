import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { 
  Building2, 
  ArrowLeft, 
  Eye, 
  EyeOff,
  UserPlus
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const CriarContaEmpresa = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nomeEmpresa: "",
    rut: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    nomeResponsavel: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.senha !== formData.confirmarSenha) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive"
      });
      return;
    }

    if (formData.senha.length < 6) {
      toast({
        title: "Erro", 
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Criar conta no Supabase
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.senha,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            display_name: formData.nomeResponsavel,
            entidad: 'empresa'
          }
        }
      });

      if (error) {
        toast({
          title: "Erro ao criar conta",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      if (data.user) {
        // Criar entidade empresa
        const { error: entityError } = await supabase
          .from('entities')
          .insert({
            user_id: data.user.id,
            rut: formData.rut,
            nome_legal: formData.nomeEmpresa,
            tipo: 'empresa'
          });

        if (entityError) {
          console.error('Erro ao criar entidade:', entityError);
        }

        toast({
          title: "Conta criada com sucesso!",
          description: "Verifique seu email para confirmar a conta"
        });

        // Redirecionar para página principal
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
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Conta Empresa</h1>
              <p className="text-sm text-muted-foreground">Crie sua conta empresarial</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="nomeEmpresa" className="text-sm font-medium">
                Nome da Empresa
              </Label>
              <Input
                id="nomeEmpresa"
                type="text"
                value={formData.nomeEmpresa}
                onChange={(e) => handleInputChange('nomeEmpresa', e.target.value)}
                className="mt-2 rounded-xl"
                placeholder="Ex: Empresa Ltda"
                required
              />
            </div>

            <div>
              <Label htmlFor="rut" className="text-sm font-medium">
                RUT da Empresa
              </Label>
              <Input
                id="rut"
                type="text"
                value={formData.rut}
                onChange={(e) => handleInputChange('rut', e.target.value)}
                className="mt-2 rounded-xl"
                placeholder="Ex: 12.345.678-9"
                required
              />
            </div>

            <div>
              <Label htmlFor="nomeResponsavel" className="text-sm font-medium">
                Nome do Responsável
              </Label>
              <Input
                id="nomeResponsavel"
                type="text"
                value={formData.nomeResponsavel}
                onChange={(e) => handleInputChange('nomeResponsavel', e.target.value)}
                className="mt-2 rounded-xl"
                placeholder="Seu nome completo"
                required
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                Email Corporativo
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="mt-2 rounded-xl"
                placeholder="empresa@email.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="senha" className="text-sm font-medium">
                Senha
              </Label>
              <div className="relative mt-2">
                <Input
                  id="senha"
                  type={showPassword ? "text" : "password"}
                  value={formData.senha}
                  onChange={(e) => handleInputChange('senha', e.target.value)}
                  className="rounded-xl pr-12"
                  placeholder="Mínimo 6 caracteres"
                  required
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

            <div>
              <Label htmlFor="confirmarSenha" className="text-sm font-medium">
                Confirmar Senha
              </Label>
              <div className="relative mt-2">
                <Input
                  id="confirmarSenha"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmarSenha}
                  onChange={(e) => handleInputChange('confirmarSenha', e.target.value)}
                  className="rounded-xl pr-12"
                  placeholder="Digite a senha novamente"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-accent/10 rounded-lg"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
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
                <span>Criando conta...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <UserPlus className="h-5 w-5" />
                <span>Criar Conta Empresa</span>
              </div>
            )}
          </Button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Já tem uma conta empresarial?{' '}
            <Button
              variant="link"
              className="text-primary hover:text-primary/80 p-0 h-auto"
              onClick={() => navigate('/ingresar')}
            >
              Fazer login
            </Button>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default CriarContaEmpresa;