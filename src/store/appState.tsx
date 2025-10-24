import React, { createContext, useContext, useMemo, useState, useCallback } from "react";

export type ActiveTab = 'inicio' | 'gastos' | 'reportes' | 'planes' | 'perfil';

interface ActiveTabContextValue {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

const ActiveTabContext = createContext<ActiveTabContextValue>({
  activeTab: 'inicio',
  setActiveTab: () => {},
});

export function ActiveTabProvider({ children }: { children: React.ReactNode }) {
  const [activeTabState, setActiveTabState] = useState<ActiveTab>(() => {
    try {
      const saved = localStorage.getItem('app.activeTab') as ActiveTab | null;
      if (saved && ['inicio','gastos','reportes','planes','perfil'].includes(saved)) return saved;
    } catch {}
    return 'inicio';
  });

  const setActiveTab = useCallback((tab: ActiveTab) => {
    setActiveTabState(tab);
    try { localStorage.setItem('app.activeTab', tab); } catch {}
  }, []);

  const value = useMemo(() => ({ 
    activeTab: activeTabState, 
    setActiveTab 
  }), [activeTabState, setActiveTab]);

  return (
    <ActiveTabContext.Provider value={value}>
      {children}
    </ActiveTabContext.Provider>
  );
}

export const useActiveTab = () => useContext(ActiveTabContext);
