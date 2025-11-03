import React, { createContext, useContext, useMemo, useState, useCallback } from "react";

export type ActiveTab = 'inicio' | 'gastos' | 'ahorro' | 'reportes' | 'planes' | 'perfil';

interface ActiveTabContextValue {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

const ActiveTabContext = createContext<ActiveTabContextValue>({
  activeTab: 'inicio',
  setActiveTab: () => {},
});

export function ActiveTabProvider({ children }: { children: React.ReactNode }) {
  // Sempre iniciar em 'inicio' ao abrir a app
  const [activeTabState, setActiveTabState] = useState<ActiveTab>('inicio');

  const setActiveTab = useCallback((tab: ActiveTab) => {
    setActiveTabState(tab);
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
