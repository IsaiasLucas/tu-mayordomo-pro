import { createContext, useContext, useMemo, useState, useCallback, useRef, ReactNode } from "react";

export type ActiveTab = 'inicio' | 'gastos' | 'reportes' | 'planes' | 'perfil';

interface ActiveTabContextValue {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

const ActiveTabContext = createContext<ActiveTabContextValue>({
  activeTab: 'inicio',
  setActiveTab: () => {},
});

export const ActiveTabProvider = ({ children }: { children: ReactNode }) => {
  const [activeTabState, setActiveTabState] = useState<ActiveTab>(() => {
    try {
      const saved = localStorage.getItem('app.activeTab') as ActiveTab | null;
      if (saved && ['inicio','gastos','reportes','planes','perfil'].includes(saved)) return saved;
    } catch {}
    return 'inicio';
  });

  // Debounce navigation to prevent double-renders
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTabRef = useRef<ActiveTab>(activeTabState);

  const setActiveTab = useCallback((tab: ActiveTab) => {
    // Skip if same as current
    if (lastTabRef.current === tab) return;
    
    // Clear any pending navigation
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce navigation (prevents double-tap issues)
    debounceTimerRef.current = setTimeout(() => {
      lastTabRef.current = tab;
      setActiveTabState(tab);
      try { 
        localStorage.setItem('app.activeTab', tab); 
      } catch (e) {
        console.error('Failed to save tab to localStorage:', e);
      }
    }, 50); // 50ms debounce
  }, []);

  const value = useMemo(() => ({ activeTab: activeTabState, setActiveTab }), [activeTabState, setActiveTab]);

  return (
    <ActiveTabContext.Provider value={value}>
      {children}
    </ActiveTabContext.Provider>
  );
};

export const useActiveTab = () => useContext(ActiveTabContext);
