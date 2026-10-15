// Minimal UI store for React-owned surfaces. Deliberately tiny (no library):
// a modal stack so the Android back button and Escape always close the
// top-most React modal first.
import { useSyncExternalStore } from 'react';

export type ModalId = 'changelog';

interface UIState {
    modals: ModalId[];
}

let state: UIState = { modals: [] };
const listeners = new Set<() => void>();

function setState(next: UIState) {
    state = next;
    listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export const ui = {
    getState: () => state,
    open(id: ModalId) {
        if (state.modals.includes(id)) return;
        setState({ modals: [...state.modals, id] });
    },
    close(id: ModalId) {
        if (!state.modals.includes(id)) return;
        setState({ modals: state.modals.filter((m) => m !== id) });
    },
    /** Closes the top-most React modal. Returns false when none was open. */
    closeTop(): boolean {
        const top = state.modals[state.modals.length - 1];
        if (!top) return false;
        ui.close(top);
        return true;
    },
};

export function useModalOpen(id: ModalId): boolean {
    return useSyncExternalStore(subscribe, () => state.modals.includes(id));
}
