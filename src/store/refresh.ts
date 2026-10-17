// Refresh requests for React-owned data views. Legacy code (e.g. the score
// reset flow calling game.refreshLeaderboard()) asks for a refresh through
// these counters; the matching modal refetches when its counter changes.
import { useSyncExternalStore } from 'react';

type Feed = 'leaderboard' | 'credentials';

const counters: Record<Feed, number> = { leaderboard: 0, credentials: 0 };
const listeners = new Set<() => void>();

export function requestRefresh(feed: Feed) {
    counters[feed]++;
    listeners.forEach((l) => l());
}

export function useRefreshKey(feed: Feed): number {
    return useSyncExternalStore(
        (l) => {
            listeners.add(l);
            return () => {
                listeners.delete(l);
            };
        },
        () => counters[feed],
    );
}
