import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex h-full w-full items-center justify-center" style={{ 
      minHeight: '100dvh', 
      background: 'linear-gradient(135deg, hsl(270 70% 60%) 0%, hsl(280 80% 70%) 50%, hsl(285 75% 65%) 100%)',
      paddingTop: 'env(safe-area-inset-top)',
      paddingBottom: 'env(safe-area-inset-bottom)'
    }}>
      <div className="text-center p-8 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-glass border border-white/30">
        <h1 className="mb-4 text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">¡Ups! Página no encontrada</p>
        <a href="/" className="text-primary underline hover:text-accent font-semibold transition-colors">
          Volver al Inicio
        </a>
      </div>
    </div>
  );
};

export default NotFound;
