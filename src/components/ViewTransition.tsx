import { ReactNode } from "react";

interface ViewTransitionProps {
  children: ReactNode;
  viewKey: string;
}

export function ViewTransition({ children, viewKey }: ViewTransitionProps) {
  return (
    <div 
      key={viewKey} 
      className="animate-fade-in-fast will-change-transform"
      style={{ 
        animationFillMode: 'both',
        backfaceVisibility: 'hidden',
        transform: 'translateZ(0)'
      }}
    >
      {children}
    </div>
  );
}
