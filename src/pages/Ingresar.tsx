import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

const Ingresar = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });
        
        if (error) throw error;
        
        toast({
          title: "¡Registro exitoso!",
          description: "Revisa tu email para confirmar tu cuenta.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        toast({
          title: "¡Bienvenido a Tu Mayordomo!",
          description: "Has iniciado sesión correctamente.",
        });
        
        navigate('/');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error inesperado",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-header flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="absolute top-4 left-4 text-white/80 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          
          <div className="mx-auto w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">💼</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Tu Mayordomo</h1>
          <p className="text-white/80">
            {isSignUp ? 'Crea tu cuenta y comienza a gestionar tus finanzas' : 'Inicia sesión en tu cuenta'}
          </p>
        </div>

        {/* Login Form */}
        <Card className="bg-white/95 backdrop-blur border-0 shadow-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
            </CardTitle>
            <CardDescription className="text-center">
              {isSignUp 
                ? 'Ingresa tus datos para crear tu cuenta'
                : 'Ingresa tus credenciales para acceder'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
                disabled={isLoading}
              >
                {isLoading 
                  ? (isSignUp ? 'Creando cuenta...' : 'Iniciando sesión...') 
                  : (isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión')
                }
              </Button>
            </form>

            <div className="text-center">
              <Button
                variant="link"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                {isSignUp 
                  ? '¿Ya tienes cuenta? Inicia sesión aquí'
                  : '¿No tienes cuenta? Regístrate aquí'
                }
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-white/60 text-sm">
          <p>© 2024 Tu Mayordomo. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default Ingresar;