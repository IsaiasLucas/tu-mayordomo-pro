import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, Receipt, BarChart3, Crown, User, Phone } from "lucide-react";
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
  const navigationItems = [{
    id: "inicio",
    label: "Inicio",
    icon: Home
  }, {
    id: "gastos",
    label: "Gastos",
    icon: Receipt
  }, {
    id: "reportes",
    label: "Reportes",
    icon: BarChart3,
    requiresPro: true
  }, {
    id: "planes",
    label: "Planes",
    icon: Crown
  }, {
    id: "perfil",
    label: "Perfil",
    icon: User
  }];
  return (
    <div className="bg-gradient-header text-primary-foreground shadow-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <h1 className="text-xl font-bold">Tu Mayordomo</h1>
          
          <div className="flex items-center gap-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              const isDisabled = item.requiresPro && !isPro;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => !isDisabled && onViewChange(item.id)}
                  disabled={isDisabled}
                  className={cn(
                    "flex items-center gap-2",
                    isActive && "bg-white/20",
                    isDisabled && "opacity-50"
                  )}
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline">{item.label}</span>
                  {item.requiresPro && !isPro && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      Pro
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Navigation;