import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  const isPro = false; // You can get this from auth context later
  const [showBalance, setShowBalance] = useState(true);
  const [notifications, setNotifications] = useState({
    expenses: true,
    budgets: true,
    reports: isPro,
    marketing: false
  });

  const userProfile = {
    name: "María González",
    email: "maria.gonzalez@email.com",
    phone: "+56 9 8765 4321",
    location: "Santiago, Chile",
    joinDate: "Marzo 2024",
    planType: isPro ? "PRO" : "Gratis",
    totalTransactions: 247,
    monthsActive: 7
  };

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
    { label: "Ahorro promedio mensual", value: formatCLP(285000), icon: PiggyBank },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="bg-gradient-header text-white shadow-card-hover rounded-3xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-6">
            <div className="bg-white/20 backdrop-blur-sm p-6 rounded-3xl">
              <User className="h-12 w-12" />
            </div>
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold">{userProfile.name}</h1>
                {isPro && (
                  <Badge className="bg-accent text-accent-foreground px-3 py-1 rounded-full font-semibold">
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
        <Card className="bg-gradient-card shadow-card rounded-3xl p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Configuración de Cuenta
          </h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Mostrar balance en inicio</h4>
                <p className="text-sm text-muted-foreground">Controla la visibilidad de tu balance principal</p>
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
              <h4 className="font-medium mb-4">Información Personal</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-xl transition-colors">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>Email</span>
                  </div>
                  <span className="text-muted-foreground">{userProfile.email}</span>
                </div>
                <div className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-xl transition-colors">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>Teléfono</span>
                  </div>
                  <span className="text-muted-foreground">{userProfile.phone}</span>
                </div>
                <div className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-xl transition-colors">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Miembro desde</span>
                  </div>
                  <span className="text-muted-foreground">{userProfile.joinDate}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-card shadow-card rounded-3xl p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Notificaciones
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Alertas de gastos</h4>
                <p className="text-sm text-muted-foreground">Notificaciones cuando registres nuevos gastos</p>
              </div>
              <Button
                variant={notifications.expenses ? "default" : "outline"}
                size="sm"
                onClick={() => handleNotificationChange('expenses')}
                className="rounded-xl"
              >
                {notifications.expenses ? "Activado" : "Desactivado"}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Límites de presupuesto</h4>
                <p className="text-sm text-muted-foreground">Avisos cuando superes tus presupuestos</p>
              </div>
              <Button
                variant={notifications.budgets ? "default" : "outline"}
                size="sm"
                onClick={() => handleNotificationChange('budgets')}
                className="rounded-xl"
              >
                {notifications.budgets ? "Activado" : "Desactivado"}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div>
                  <h4 className="font-medium">Reportes semanales</h4>
                  <p className="text-sm text-muted-foreground">Resumen semanal de tus finanzas</p>
                </div>
                {isPro && (
                  <Badge className="bg-accent text-accent-foreground px-2 py-0 text-xs rounded-full">
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
                {notifications.reports ? "Activado" : "Desactivado"}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Promociones</h4>
                <p className="text-sm text-muted-foreground">Ofertas especiales y novedades</p>
              </div>
              <Button
                variant={notifications.marketing ? "default" : "outline"}
                size="sm"
                onClick={() => handleNotificationChange('marketing')}
                className="rounded-xl"
              >
                {notifications.marketing ? "Activado" : "Desactivado"}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Security & Data */}
      <Card className="bg-gradient-card shadow-card rounded-3xl p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Seguridad y Datos
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium">Gestión de Datos</h4>
            <div className="space-y-3">
              <Button variant="outline" className="w-full rounded-2xl py-3 justify-start">
                <Download className="h-4 w-4 mr-2" />
                Exportar mis datos
              </Button>
              <Button variant="outline" className="w-full rounded-2xl py-3 justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Cambiar contraseña
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Acciones de Cuenta</h4>
            <div className="space-y-3">
              <Button variant="outline" className="w-full rounded-2xl py-3 justify-start text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar cuenta
              </Button>
              <Button variant="outline" className="w-full rounded-2xl py-3 justify-start">
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Plan Information */}
      <Card className="bg-gradient-card shadow-card rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Tu Plan Actual</h3>
            <div className="flex items-center space-x-3">
              <Badge className={`px-3 py-1 rounded-full font-semibold ${
                isPro 
                  ? 'bg-accent text-accent-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {isPro && <Crown className="h-3 w-3 mr-1" />}
                {userProfile.planType}
              </Badge>
              {isPro ? (
                <p className="text-muted-foreground">Acceso completo a todas las funciones</p>
              ) : (
                <p className="text-muted-foreground">Funciones básicas disponibles</p>
              )}
            </div>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl px-6">
            {isPro ? "Gestionar Plan" : "Actualizar a PRO"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PerfilView;