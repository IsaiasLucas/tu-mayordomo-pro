import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Receipt, 
  BarChart3, 
  Crown, 
  User,
  Phone
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isPro: boolean;
  phoneFilter: string;
  onPhoneFilterChange: (phone: string) => void;
}

const Navigation = ({ 
  currentView, 
  onViewChange, 
  isPro, 
  phoneFilter, 
  onPhoneFilterChange 
}: NavigationProps) => {
  const [showPhoneFilter, setShowPhoneFilter] = useState(false);

  const navigationItems = [
    { id: "inicio", label: "Inicio", icon: Home },
    { id: "gastos", label: "Gastos", icon: Receipt },
    { id: "reportes", label: "Reportes", icon: BarChart3, requiresPro: true },
    { id: "planes", label: "Planes", icon: Crown },
    { id: "perfil", label: "Perfil", icon: User },
  ];

  return (
    <div className="bg-gradient-header text-primary-foreground shadow-card">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
              <Crown className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Tu Mayordomo</h1>
              <p className="text-white/80 text-sm">Gestión financiera personal</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {isPro && (
              <Badge className="bg-accent text-accent-foreground px-3 py-1 rounded-full font-semibold">
                PRO
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPhoneFilter(!showPhoneFilter)}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-xl"
            >
              <Phone className="h-4 w-4 mr-2" />
              Filtrar
            </Button>
          </div>
        </div>

        {showPhoneFilter && (
          <div className="mb-6 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <input
              type="tel"
              placeholder="Filtrar por teléfono (+56 9 xxxx xxxx)"
              value={phoneFilter}
              onChange={(e) => onPhoneFilterChange(e.target.value)}
              className="w-full bg-white/20 text-white placeholder:text-white/60 rounded-xl px-4 py-2 border-0 focus:ring-2 focus:ring-white/30 focus:outline-none"
            />
          </div>
        )}

        <nav className="flex space-x-2 overflow-x-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            const isDisabled = item.requiresPro && !isPro;
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => !isDisabled && onViewChange(item.id)}
                disabled={isDisabled}
                className={cn(
                  "flex items-center space-x-2 px-6 py-3 rounded-2xl transition-all duration-200 whitespace-nowrap",
                  isActive 
                    ? "bg-white text-primary shadow-card-hover" 
                    : "text-white/80 hover:text-white hover:bg-white/20",
                  isDisabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{item.label}</span>
                {item.requiresPro && !isPro && (
                  <Crown className="h-3 w-3 text-accent" />
                )}
              </Button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Navigation;