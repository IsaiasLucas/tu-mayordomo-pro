import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { 
  User,
  Crown,
  Settings,
  Bell,
  Shield,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Edit3,
  LogOut,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Receipt,
  PiggyBank
} from "lucide-react";

const PerfilView = () => {
  const { user, profile, signOut } = useAuth();
  const [showBalance, setShowBalance] = useState(true);

  const isPro = profile?.plan === 'pro' || profile?.plan === 'premium';
  
  const [notifications, setNotifications] = useState({
    expenses: true,
    budgets: true,
    reports: isPro,
    marketing: false
  });

  const userProfile = {
    name: profile?.display_name || user?.user_metadata?.nombre || user?.email?.split('@')[0] || "Usuario",
    email: user?.email || "",
    phone: profile?.phone_personal || user?.user_metadata?.telefone || "No registrado",
    location: "Chile",
    joinDate: new Date(user?.created_at || new Date()).toLocaleDateString('es-CL', { 
      year: 'numeric', 
      month: 'long' 
    }),
    planType: profile?.plan || "free",
    totalTransactions: 0,
    monthsActive: Math.ceil((new Date().getTime() - new Date(user?.created_at || new Date()).getTime()) / (1000 * 60 * 60 * 24 * 30))
  };

  if (!user) {
    return <div className="p-4">Cargando perfil...</div>;
  }

  const formatCLP = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleNotificationChange = (key: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const stats = [
    { label: "Transacciones registradas", value: userProfile.totalTransactions, icon: Receipt },
    { label: "Meses activo", value: userProfile.monthsActive, icon: Calendar },
    { label: "Ahorro promedio mensual", value: formatCLP(0), icon: PiggyBank },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-lg rounded-3xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-6">
            <div className="bg-white/20 backdrop-blur-sm p-6 rounded-3xl">
              <User className="h-12 w-12" />
            </div>
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold">{userProfile.name}</h1>
                {isPro && (
                  <Badge className="bg-yellow-500 text-black px-3 py-1 rounded-full font-semibold">
                    <Crown className="h-3 w-3 mr-1" />
                    PRO
                  </Badge>
                )}
              </div>
              <p className="text-white/80 text-lg">{userProfile.email}</p>
              <div className="flex items-center space-x-4 mt-2 text-white/70">
                <span className="flex items-center">
                  <Phone className="h-4 w-4 mr-1" />
                  {userProfile.phone}
                </span>
                <span className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {userProfile.location}
                </span>
              </div>
            </div>
          </div>
          <Button variant="ghost" className="text-white hover:bg-white/20 rounded-2xl px-6">
            <Edit3 className="h-4 w-4 mr-2" />
            Editar Perfil
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <IconComponent className="h-5 w-5" />
                  <span className="text-sm font-medium">{stat.label}</span>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Account Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white shadow-sm rounded-3xl p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Configuração da Conta
          </h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Mostrar saldo no início</h4>
                <p className="text-sm text-gray-600">Controle a visibilidade do seu saldo principal</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBalance(!showBalance)}
                className="rounded-xl"
              >
                {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-4">Informações Pessoais</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>Email</span>
                  </div>
                  <span className="text-gray-600">{userProfile.email}</span>
                </div>
                <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>Telefone</span>
                  </div>
                  <span className="text-gray-600">{userProfile.phone}</span>
                </div>
                <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>Membro desde</span>
                  </div>
                  <span className="text-gray-600">{userProfile.joinDate}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-white shadow-sm rounded-3xl p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Notificações
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Alertas de gastos</h4>
                <p className="text-sm text-gray-600">Notificações quando registrar novos gastos</p>
              </div>
              <Button
                variant={notifications.expenses ? "default" : "outline"}
                size="sm"
                onClick={() => handleNotificationChange('expenses')}
                className="rounded-xl"
              >
                {notifications.expenses ? "Ativado" : "Desativado"}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Limites de orçamento</h4>
                <p className="text-sm text-gray-600">Avisos quando superar seus orçamentos</p>
              </div>
              <Button
                variant={notifications.budgets ? "default" : "outline"}
                size="sm"
                onClick={() => handleNotificationChange('budgets')}
                className="rounded-xl"
              >
                {notifications.budgets ? "Ativado" : "Desativado"}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div>
                  <h4 className="font-medium">Relatórios semanais</h4>
                  <p className="text-sm text-gray-600">Resumo semanal das suas finanças</p>
                </div>
                {isPro && (
                  <Badge className="bg-yellow-500 text-black px-2 py-0 text-xs rounded-full">
                    PRO
                  </Badge>
                )}
              </div>
              <Button
                variant={notifications.reports ? "default" : "outline"}
                size="sm"
                onClick={() => handleNotificationChange('reports')}
                disabled={!isPro}
                className="rounded-xl"
              >
                {notifications.reports ? "Ativado" : "Desativado"}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Security & Data */}
      <Card className="bg-white shadow-sm rounded-3xl p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Segurança e Dados
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium">Gestão de Dados</h4>
            <div className="space-y-3">
              <Button variant="outline" className="w-full rounded-2xl py-3 justify-start">
                <Download className="h-4 w-4 mr-2" />
                Exportar meus dados
              </Button>
              <Button variant="outline" className="w-full rounded-2xl py-3 justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Alterar senha
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Ações da Conta</h4>
            <div className="space-y-3">
              <Button variant="outline" className="w-full rounded-2xl py-3 justify-start text-red-600 border-red-300 hover:bg-red-50">
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir conta
              </Button>
              <Button 
                variant="outline" 
                onClick={signOut}
                className="w-full rounded-2xl py-3 justify-start"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Plan Information */}
      <Card className="bg-white shadow-sm rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Seu Plano Atual</h3>
            <div className="flex items-center space-x-3">
              <Badge className={`px-3 py-1 rounded-full font-semibold ${
                isPro 
                  ? 'bg-yellow-500 text-black' 
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {isPro && <Crown className="h-3 w-3 mr-1" />}
                {userProfile.planType.toUpperCase()}
              </Badge>
              {isPro ? (
                <p className="text-gray-600">Acesso completo a todas as funcionalidades</p>
              ) : (
                <p className="text-gray-600">Funcionalidades básicas disponíveis</p>
              )}
            </div>
          </div>
          <Button className="bg-purple-600 text-white hover:bg-purple-700 rounded-2xl px-6">
            {isPro ? "Gerenciar Plano" : "Atualizar para PRO"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PerfilView;