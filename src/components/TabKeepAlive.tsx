import { ReactNode, useRef, useEffect, memo } from 'react';

interface TabKeepAliveProps {
  children: ReactNode;
  tabId: string;
  isActive: boolean;
}

/**
 * Keeps tab content mounted but hidden when not active
 * Prevents re-mount flicker and preserves state
 */
export const TabKeepAlive = memo(({ children, tabId, isActive }: TabKeepAliveProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Keep in DOM but hide with CSS
      containerRef.current.style.display = isActive ? 'block' : 'none';
      
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
        display: isActive ? 'block' : 'none',
        width: '100%',
        height: '100%',
      }}
    >
      {children}
    </div>
  );
});

TabKeepAlive.displayName = 'TabKeepAlive';
