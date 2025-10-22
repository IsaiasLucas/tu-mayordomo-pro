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
      <div className="fixed left-1/2 transform -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md" style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
        <div className="bg-background/95 backdrop-blur-lg border rounded-full shadow-xl px-4 py-4">
          <div className="flex items-center justify-around gap-2">
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
            
            return <Button key={item.id} variant={isActive ? "default" : "ghost"} size="sm" onClick={handleClick} className={cn("flex flex-col items-center gap-1.5 h-auto py-3 sm:py-4 px-3 sm:px-4 rounded-full transition-all min-w-0 flex-1 touch-manipulation", isActive && "bg-primary text-primary-foreground shadow-md", isLocked && "opacity-50", "hover:scale-105 active:scale-95")}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                  <span className="text-[11px] sm:text-xs font-semibold leading-none">{item.label}</span>
                  {item.requiresPro && !isPro && <Badge variant="secondary" className="absolute -top-1 -right-1 text-[9px] sm:text-xs w-3.5 h-3.5 sm:w-4 sm:h-4 p-0 flex items-center justify-center">
              </Badge>}
                </Button>;
          })}
          </div>
        </div>
      </div>
    </>;
};
export default Navigation;