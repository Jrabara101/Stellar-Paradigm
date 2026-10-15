import { useSyncExternalStore } from 'react';

export function useMediaQuery(query: string): boolean {
    return useSyncExternalStore(
        (onChange) => {
            const mql = window.matchMedia(query);
            mql.addEventListener('change', onChange);
            return () => mql.removeEventListener('change', onChange);
        },
        () => window.matchMedia(query).matches,
    );
}

/** Same breakpoint the legacy CSS uses for its bottom-sheet menus. */
export const useIsMobile = () => useMediaQuery('(max-width: 520px)');
