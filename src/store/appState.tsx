import { createContext, useContext, useMemo, useState } from "react";

export type ActiveTab = 'inicio' | 'gastos' | 'reportes' | 'planes' | 'perfil';

interface ActiveTabContextValue {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

const ActiveTabContext = createContext<ActiveTabContextValue>({
  activeTab: 'inicio',
  setActiveTab: () => {},
});

export const ActiveTabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTabState, setActiveTabState] = useState<ActiveTab>(() => {
    try {
      const saved = localStorage.getItem('app.activeTab') as ActiveTab | null;
      if (saved && ['inicio','gastos','reportes','planes','perfil'].includes(saved)) return saved;
    } catch {}
    return 'inicio';
  });

  const setActiveTab = (tab: ActiveTab) => {
    setActiveTabState(tab);
    try { localStorage.setItem('app.activeTab', tab); } catch {}
  };

  const value = useMemo(() => ({ activeTab: activeTabState, setActiveTab }), [activeTabState]);

  return (
    <ActiveTabContext.Provider value={value}>
      {children}
    </ActiveTabContext.Provider>
  );
};

export const useActiveTab = () => useContext(ActiveTabContext);
