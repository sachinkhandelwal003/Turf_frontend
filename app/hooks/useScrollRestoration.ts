"use client";

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export function useScrollRestoration() {
  const pathname = usePathname();
  const isPopStateRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Enable manual scroll restoration to prevent browser auto-jumps/clamps
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const handlePopState = () => {
      isPopStateRef.current = true;
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (isPopStateRef.current) {
      isPopStateRef.current = false;
      const savedPosition = sessionStorage.getItem(`scroll_${pathname}`);
      if (savedPosition) {
        const y = parseInt(savedPosition, 10);
        let attempts = 0;
        const interval = setInterval(() => {
          const docHeight = document.documentElement.scrollHeight;
          window.scrollTo(0, y);
          // Stop checking if we reached target scroll or page height is enough or we reached max attempts
          if (window.scrollY >= y || docHeight >= y + window.innerHeight || attempts > 30) {
            clearInterval(interval);
          }
          attempts++;
        }, 50);
        return () => clearInterval(interval);
      }
    } else {
      // Forward navigation: Scroll to top of the page
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeoutId: NodeJS.Timeout;
    const saveScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        // Save the scroll position of the current page
        sessionStorage.setItem(`scroll_${pathname}`, window.scrollY.toString());
      }, 100);
    };

    window.addEventListener('scroll', saveScroll);
    return () => {
      window.removeEventListener('scroll', saveScroll);
      clearTimeout(timeoutId);
    };
  }, [pathname]);
}
