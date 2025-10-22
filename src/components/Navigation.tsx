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
  return <>
      {/* Bottom floating navigation */}
      <div className="fixed left-1/2 transform -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-lg" style={{ bottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}>
        <div className="bg-background/95 backdrop-blur-lg border rounded-3xl shadow-xl px-3 py-3 transition-all duration-300 ease-out">
          <div className="flex items-center justify-around gap-1.5">
            {navigationItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            const isLocked = item.requiresPro && !isPro;
            
            const handleClick = () => {
              if (isLocked) {
                onViewChange('planes');
              } else {
                onViewChange(item.id);
              }
            };
            
            return <Button key={item.id} variant={isActive ? "default" : "ghost"} size="lg" onClick={handleClick} className={cn("flex flex-col items-center justify-center gap-2 h-auto py-4 px-4 rounded-2xl min-w-[70px] sm:min-w-[80px] flex-1 touch-manipulation transition-all duration-300 ease-out", isActive && "bg-primary text-primary-foreground shadow-lg scale-105", isLocked && "opacity-50", !isActive && "hover:scale-105 active:scale-95")}>
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 transition-transform duration-300" />
                  <span className="text-xs sm:text-sm font-semibold leading-none whitespace-nowrap">{item.label}</span>
                  {item.requiresPro && !isPro && <Badge variant="secondary" className="absolute -top-1 -right-1 text-[9px] sm:text-xs w-4 h-4 sm:w-5 sm:h-5 p-0 flex items-center justify-center">
              </Badge>}
                </Button>;
          })}
          </div>
        </div>
      </div>
    </>;
};
export default Navigation;