import { ReactNode, useEffect, useRef } from "react";

interface ViewTransitionProps {
  children: ReactNode;
  isActive: boolean;
}

export function ViewTransition({ children, isActive }: ViewTransitionProps) {
  const prevActiveRef = useRef(isActive);

  useEffect(() => {
    // Si la vista se está ocultando, cerrar el teclado
    if (prevActiveRef.current && !isActive) {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }
    prevActiveRef.current = isActive;
  }, [isActive]);

  return (
    <div 
      className="transition-opacity duration-200"
      style={{ 
        display: isActive ? 'block' : 'none',
        opacity: isActive ? 1 : 0,
      }}
    >
      {children}
    </div>
  );
}
