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
      <div className="fixed bottom-3 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-3">
        <div className="bg-background/95 backdrop-blur-lg border rounded-full shadow-lg px-1.5 py-1.5">
          <div className="flex items-center justify-around gap-0.5">
            {navigationItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            const isDisabled = item.requiresPro && !isPro;
            return <Button key={item.id} variant={isActive ? "default" : "ghost"} size="sm" onClick={() => !isDisabled && onViewChange(item.id)} disabled={isDisabled} className={cn("flex flex-col items-center gap-0.5 h-auto py-2 px-2 sm:px-3 rounded-full transition-all min-w-0 flex-1", isActive && "bg-primary text-primary-foreground shadow-md", isDisabled && "opacity-50", "hover:scale-105")}>
                  <Icon className="w-5 h-5 sm:w-[18px] sm:h-[18px] flex-shrink-0" />
                  <span className="text-[10px] sm:text-xs font-medium leading-tight">{item.label}</span>
                  {item.requiresPro && !isPro && <Badge variant="secondary" className="absolute -top-1 -right-1 text-xs w-4 h-4 p-0 flex items-center justify-center">
              </Badge>}
                </Button>;
          })}
          </div>
        </div>
      </div>
    </>;
};
export default Navigation;