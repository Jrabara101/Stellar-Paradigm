// Minimal UI store for React-owned surfaces. Deliberately tiny (no library):
// a modal stack so the Android back button and Escape always close the
// top-most React modal first.
import { useSyncExternalStore } from 'react';

export type ModalId =
    | 'changelog'
    | 'onboarding'
    | 'category'
    | 'theme'
    | 'chip'
    | 'tileEffects'
    | 'apiSettings'
    | 'leaderboard'
    | 'credentials'
    | 'getApp'
    | 'effects'
    | 'audio'
    | 'howToPlay'
    | 'hintGuide';

interface UIState {
    modals: ModalId[];
    /** Optional data a modal was opened with (e.g. category picker from onboarding). */
    payload: Partial<Record<ModalId, unknown>>;
}

let state: UIState = { modals: [], payload: {} };
const listeners = new Set<() => void>();
// A modal's own close behaviour (sound, side effects like onboarding's
// "seen" flag). Escape, backdrop clicks and Android back all go through it.
const dismissers = new Map<ModalId, () => void>();

function setState(next: UIState) {
    state = next;
    listeners.forEach((l) => l());
}

export function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export const ui = {
    getState: () => state,
    open(id: ModalId, payload?: unknown) {
        const modals = state.modals.includes(id) ? state.modals : [...state.modals, id];
        setState({ modals, payload: { ...state.payload, [id]: payload } });
    },
    close(id: ModalId) {
        if (!state.modals.includes(id)) return;
        setState({ ...state, modals: state.modals.filter((m) => m !== id) });
    },
    isOpen: (id: ModalId) => state.modals.includes(id),
    registerDismiss(id: ModalId, fn: () => void) {
        dismissers.set(id, fn);
        return () => {
            if (dismissers.get(id) === fn) dismissers.delete(id);
        };
    },
    /** Runs a modal's own close behaviour (falls back to a plain close). */
    dismiss(id: ModalId) {
        const fn = dismissers.get(id);
        if (fn) fn();
        else ui.close(id);
    },
    /** Dismisses the top-most React modal. Returns false when none was open. */
    closeTop(): boolean {
        const top = state.modals[state.modals.length - 1];
        if (!top) return false;
        ui.dismiss(top);
        return true;
    },
};

export function useModalOpen(id: ModalId): boolean {
    return useSyncExternalStore(subscribe, () => state.modals.includes(id));
}

export function useModalPayload<T>(id: ModalId): T | undefined {
    return useSyncExternalStore(subscribe, () => state.payload[id] as T | undefined);
}

export function useIsTopModal(id: ModalId): boolean {
    return useSyncExternalStore(subscribe, () => state.modals[state.modals.length - 1] === id);
}
