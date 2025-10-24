/**
 * Performance monitoring and optimization utilities
 */

/**
 * Measure and log performance metrics
 */
export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  const duration = end - start;

  if (duration > 100) {
    console.warn(`Performance: ${name} took ${duration.toFixed(2)}ms`);
  }

  return duration;
};

/**
 * Lazy load images with intersection observer
 */
export const lazyLoadImage = (img: HTMLImageElement) => {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLImageElement;
            const src = target.dataset.src;
            if (src) {
              target.src = src;
              target.removeAttribute('data-src');
            }
            observer.unobserve(target);
          }
        });
      },
      {
        rootMargin: '50px',
      }
    );

    observer.observe(img);
  } else {
    // Fallback for older browsers
    const src = img.dataset.src;
    if (src) {
      img.src = src;
    }
  }
};

/**
 * Optimize scroll performance
 */
export const optimizeScroll = (callback: () => void) => {
  let ticking = false;

  return () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        callback();
        ticking = false;
      });
      ticking = true;
    }
  };
};

/**
 * Check if device is low-end
 */
export const isLowEndDevice = (): boolean => {
  // Check for low-end device indicators
  const connection = (navigator as any).connection;
  const memory = (performance as any).memory;

  const isSlowConnection = connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g';
  const isLowMemory = memory && memory.jsHeapSizeLimit < 500 * 1024 * 1024; // Less than 500MB

  return isSlowConnection || isLowMemory || false;
};

/**
 * Preload critical resources
 */
export const preloadResource = (url: string, type: 'image' | 'script' | 'style') => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = url;
  link.as = type;
  document.head.appendChild(link);
};

/**
 * Monitor Web Vitals
 */
export const reportWebVitals = () => {
  if ('PerformanceObserver' in window) {
    try {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        const lcp = lastEntry.startTime;
        if (lcp > 2500) {
          console.warn(`LCP: ${lcp.toFixed(0)}ms (target: <2500ms)`);
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          const fid = entry.processingStart - entry.startTime;
          if (fid > 100) {
            console.warn(`FID: ${fid.toFixed(0)}ms (target: <100ms)`);
          }
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS)
      let clsScore = 0;
      const clsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsScore += entry.value;
          }
        });
        if (clsScore > 0.1) {
          console.warn(`CLS: ${clsScore.toFixed(3)} (target: <0.1)`);
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.error('Error setting up performance observers:', error);
    }
  }
};

/**
 * Detect long tasks (>50ms)
 */
export const detectLongTasks = () => {
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 50) {
            console.warn(`Long task detected: ${entry.duration.toFixed(0)}ms`);
          }
        });
      });
      observer.observe({ entryTypes: ['longtask'] });
    } catch (error) {
      // PerformanceObserver might not support longtask
    }
  }
};

// Initialize performance monitoring in development
if (import.meta.env.DEV) {
  reportWebVitals();
  detectLongTasks();
}
