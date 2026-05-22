'use client';

import { useCallback } from 'react';

interface UseViewTransitionOptions {
  respectReducedMotion?: boolean;
}

export function useViewTransition(options: UseViewTransitionOptions = {}) {
  const { respectReducedMotion = true } = options;

  const startViewTransition = useCallback((updateDOM: () => void) => {
    if (!document.startViewTransition) {
      updateDOM();
      return;
    }

    if (respectReducedMotion) {
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      if (prefersReducedMotion) {
        updateDOM();
        return;
      }
    }

    document.startViewTransition(() => {
      updateDOM();
    });
  }, [respectReducedMotion]);

  return { startViewTransition };
}
