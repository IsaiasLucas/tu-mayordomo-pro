import { ReactNode, useRef, useEffect, memo } from 'react';

interface TabKeepAliveProps {
  children: ReactNode;
  tabId: string;
  isActive: boolean;
}

/**
 * Keeps tab content mounted but hidden when not active
 * Prevents re-mount flicker and preserves state
 * Uses position/visibility instead of display:none to preserve scroll
 */
export const TabKeepAlive = memo(({ children, tabId, isActive }: TabKeepAliveProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Accessibility: hide from screen readers when not active
      containerRef.current.setAttribute('aria-hidden', String(!isActive));
      
      // Prevent tab order when hidden
      if (!isActive) {
        containerRef.current.setAttribute('inert', '');
      } else {
        containerRef.current.removeAttribute('inert');
      }
    }
  }, [isActive]);

  return (
    <div
      ref={containerRef}
      data-tab-id={tabId}
      style={{
        // Use position/visibility instead of display:none to preserve scroll
        position: isActive ? 'relative' : 'absolute',
        visibility: isActive ? 'visible' : 'hidden',
        opacity: isActive ? 1 : 0,
        pointerEvents: isActive ? 'auto' : 'none',
        width: '100%',
        minHeight: '100%',
        top: 0,
        left: 0,
        zIndex: isActive ? 1 : -1,
      }}
    >
      {children}
    </div>
  );
});

TabKeepAlive.displayName = 'TabKeepAlive';
