import React from "react";

interface ViewTransitionProps {
  children: React.ReactNode;
  viewKey: string;
}

export const ViewTransition = React.memo(({ children, viewKey }: ViewTransitionProps) => {
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
});

ViewTransition.displayName = "ViewTransition";
