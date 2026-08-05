import { useState, useEffect } from 'react';

/**
 * Hook reactivo de viewport: detecta si la pantalla es móvil (< 768px)
 * usando matchMedia con listener, en lugar de window.innerWidth estático.
 * Al cambiar el tamaño, React re-renderiza automáticamente.
 */
export function useIsMobile(breakpoint: number = 768): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < breakpoint;
  });

  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${breakpoint}px)`);
    const handleChange = (e: MediaQueryListEvent) => {
      setIsMobile(!e.matches);
    };

    // Estado inicial sincronizado con la media query
    setIsMobile(!mql.matches);

    // Soporte moderno (addEventListener) y fallback antiguo (addListener)
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', handleChange);
    } else {
      mql.addListener(handleChange);
    }

    return () => {
      if (typeof mql.removeEventListener === 'function') {
        mql.removeEventListener('change', handleChange);
      } else {
        mql.removeListener(handleChange);
      }
    };
  }, [breakpoint]);

  return isMobile;
}