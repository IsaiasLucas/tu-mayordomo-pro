import { Home, Receipt, BarChart3, Crown, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useActiveTab, ActiveTab } from "@/store/appState";
import { useCallback } from "react";

interface NavigationProps {
  isPro: boolean;
}

const Navigation = ({ isPro = false }: NavigationProps) => {
  const { activeTab, setActiveTab } = useActiveTab();
  
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
  
  // Debounced navigation to prevent double-renders
  const handleNavigation = useCallback((target: ActiveTab) => {
    // Prevent re-navigation to same tab
    if (activeTab === target) return;
    
    setActiveTab(target);
  }, [activeTab, setActiveTab]);
  
  return (
    <>
       {/* WhatsApp Floating Button - Only on Inicio */}
       {activeTab === "inicio" && (
         <div 
           className="fixed z-40 flex justify-end items-center px-4 pointer-events-none"
           style={{ 
             bottom: 'calc(env(safe-area-inset-bottom) + 6.5rem)',
             right: '1rem'
           }}
         >
         <a
           href="https://wa.me/56955264713?text=Enséñame%20a%20usar%20Tu%20Mayordomo%20paso%20a%20paso%20🚀"
           target="_blank"
           rel="noopener noreferrer"
           className="group touch-manipulation pointer-events-auto"
           title="Chatear con Tu Mayordomo"
         >
          <div className="relative bg-gradient-to-br from-purple-600 to-blue-600 rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-purple-400 animate-ping opacity-20"></div>
            
            <svg className="relative w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
          </div>
        </a>
      </div>
      )}

      {/* Navigation Bar */}
      <div 
        className="fixed left-0 right-0 z-[9999] flex justify-center items-center px-4 pointer-events-none"
        style={{ bottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}
      >
      <nav className="bg-card/90 backdrop-blur-xl border border-border/40 rounded-[1.5rem] shadow-2xl transition-all duration-300 ease-out pointer-events-auto">
        <div className="flex items-center justify-center gap-1.5 px-4 py-2.5">
            {navigationItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isLocked = item.requiresPro && !isPro;
              
              const handleClick = () => {
                // Silent redirect to plans if locked
                const target = isLocked ? 'planes' : (item.id as ActiveTab);
                handleNavigation(target);
              };
            
            return (
                <button
                  type="button"
                  key={item.id}
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