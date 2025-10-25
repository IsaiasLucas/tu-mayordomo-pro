import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex h-full w-full items-center justify-center" style={{ minHeight: 'calc(var(--vh, 1vh) * 100)', background: 'var(--gradient-hero)' }}>
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
