// Fix for mobile viewport height (iOS Safari address bar issue)
export const initMobileViewport = () => {
  const setVH = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };

  // Set initial value
  setVH();

  // Update on resize and orientation change
  window.addEventListener('resize', setVH);
  window.addEventListener('orientationchange', setVH);

  // Also update on load
  window.addEventListener('load', setVH);

  return () => {
    window.removeEventListener('resize', setVH);
    window.removeEventListener('orientationchange', setVH);
    window.removeEventListener('load', setVH);
  };
};
