import { Home, Receipt, BarChart3, Crown, User } from "lucide-react";
import { cn } from "@/lib/utils";
interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isPro: boolean;
}
const Navigation = ({
  currentView,
  onViewChange,
  isPro,
}: NavigationProps) => {
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
    <div 
      className="fixed left-0 right-0 z-50 flex justify-center items-center px-4"
      style={{ bottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}
    >
      <nav className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-[1.5rem] shadow-2xl transition-all duration-300 ease-out">
        <div className="flex items-center justify-center gap-1.5 px-4 py-2.5">
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
            
            return (
              <button
                key={item.id}
                onClick={handleClick}
                className={cn(
                  "flex flex-col items-center justify-center gap-1.5 transition-all duration-300 ease-out touch-manipulation relative",
                  "min-w-[69px] px-3.5 py-2.5",
                  isActive 
                    ? "bg-gradient-to-br from-primary via-primary-glow to-primary rounded-2xl shadow-glow scale-105" 
                    : "hover:scale-105 active:scale-95",
                  isLocked && "opacity-60"
                )}
              >
                <Icon 
                  className={cn(
                    "w-[22px] h-[22px] transition-all duration-300",
                    isActive ? "text-primary-foreground" : "text-foreground"
                  )} 
                />
                <span 
                  className={cn(
                    "text-[11.5px] font-semibold leading-none whitespace-nowrap transition-colors duration-300",
                    isActive ? "text-primary-foreground" : "text-foreground"
                  )}
                >
                  {item.label}
                </span>
                {isLocked && (
                  <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-accent rounded-full flex items-center justify-center">
                    <Crown className="w-2 h-2 text-accent-foreground" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
export default Navigation;