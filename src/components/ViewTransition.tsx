import { ReactNode } from "react";

interface ViewTransitionProps {
  children: ReactNode;
  isActive: boolean;
}

export function ViewTransition({ children, isActive }: ViewTransitionProps) {
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
