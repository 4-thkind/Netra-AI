import { useEffect, useState } from 'react';

/**
 * Tracks whether we are on a phone-sized viewport.
 *
 * Most responsive work is done in CSS. This hook exists for the cases where
 * mobile needs a genuinely DIFFERENT component tree rather than a restyled one
 * (bottom sheets instead of centre modals, a 3-day cash-flow strip instead of
 * 7 bars, swipeable rails instead of grids) - decisions CSS alone cannot make.
 *
 * Breakpoint matches Tailwind's `lg` so JS and CSS never disagree.
 */
export function useIsMobile(query = '(max-width: 1023px)') {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e) => setIsMobile(e.matches);
    mql.addEventListener('change', onChange);
    setIsMobile(mql.matches);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return isMobile;
}
