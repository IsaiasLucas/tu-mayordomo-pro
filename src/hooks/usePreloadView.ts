import { useEffect } from 'react';

/**
 * Hook para pré-carregar recursos de uma view antes dela ser exibida
 * Isso melhora a percepção de velocidade ao trocar de abas
 */
export const usePreloadView = (viewName: string) => {
  useEffect(() => {
    // Pré-carregar imagens ou recursos específicos da view
    if (viewName === 'reportes') {
      // Aqui poderia pré-carregar gráficos, ícones, etc
      const img = new Image();
      img.src = '/icon-512.png'; // Exemplo
    }
  }, [viewName]);
};
