import { Home, Receipt, BarChart3, Crown, User, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";
import { useCallback } from "react";

interface NavigationProps {
  isPro: boolean;
}

const Navigation = ({ isPro = false }: NavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  
  const navigationItems = [{
    path: "/inicio",
    label: "Inicio",
    icon: Home
  }, {
    path: "/gastos",
    label: "Gastos",
    icon: Receipt
  }, {
    path: "/reportes",
    label: "Reportes",
    icon: BarChart3,
    requiresPro: true
  }, {
    path: "/planes",
    label: "Planes",
    icon: Crown
  }, {
    path: "/perfil",
    label: "Perfil",
    icon: User
  }];
  
  const handleNavigation = useCallback((path: string) => {
    if (currentPath === path) return;
    navigate(path);
  }, [currentPath, navigate]);
  
  const whatsappLink = "https://wa.me/56955264713?text=Enséñame%20a%20usar%20Tu%20Mayordomo%20paso%20a%20paso%20🚀";
  
  return (
    <>
       {/* WhatsApp Floating Button */}
       {(currentPath === "/inicio" || currentPath === "/" || currentPath === "/reportes") && (
         <a
           href={whatsappLink}
           target="_blank"
           rel="noopener noreferrer"
           className="fixed z-10 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300"
           style={{
             right: '16px',
             bottom: 'calc(16px + env(safe-area-inset-bottom) + 68px)'
           }}
           aria-label="Abrir WhatsApp"
         >
           <MessageCircle className="h-6 w-6" />
         </a>
       )}

      {/* Navigation Bar */}
      <div 
        className="fixed left-0 right-0 z-[9999] flex justify-center items-center pointer-events-none"
        style={{ 
          bottom: 0,
          paddingLeft: 'max(16px, env(safe-area-inset-left))',
          paddingRight: 'max(16px, env(safe-area-inset-right))',
          paddingBottom: 'env(safe-area-inset-bottom)'
        }}
      >
      <nav className="bg-card/90 backdrop-blur-xl border border-border/40 rounded-[1.5rem] shadow-2xl transition-all duration-300 ease-out pointer-events-auto mb-2">
        <div className="flex items-center justify-center gap-1.5 px-4 py-2.5">
          {navigationItems.map(item => {
              const Icon = item.icon;
              const isActive = currentPath === item.path || (currentPath === "/" && item.path === "/inicio");
              const isLocked = item.requiresPro && !isPro;
              
              const handleClick = () => {
                const target = isLocked ? "/planes" : item.path;
                handleNavigation(target);
              };
            
            return (
                <button
                  type="button"
                  key={item.path}
                  onClick={handleClick}
                  aria-pressed={isActive}
                  aria-label={item.label}
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
    </>
  );
};
export default Navigation;