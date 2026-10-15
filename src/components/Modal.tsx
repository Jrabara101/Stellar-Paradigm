import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, type Transition } from 'motion/react';
import * as m from 'motion/react-m';
import { useIsMobile } from '../hooks/useMediaQuery';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    /** Legacy panel class (e.g. "changelog-modal") so every theme's tokens apply. */
    panelClassName: string;
    labelledBy: string;
    children: ReactNode;
}

const spring: Transition = { type: 'spring', stiffness: 420, damping: 32, mass: 0.9 };

/**
 * Shared animated modal shell for ported surfaces.
 *
 * Desktop: the panel springs up from 0.86 scale. Phones: it slides up from
 * the bottom edge as a sheet and can be dragged down to dismiss — matching
 * the v2.0.0 "menus slide up from the bottom" behaviour of the legacy CSS.
 *
 * The backdrop keeps the legacy `modal-backdrop active` classes on purpose:
 * wallet-guide.js waits for any `.modal-backdrop.active` to close before it
 * auto-opens, and that must keep working while it is still legacy code.
 */
export function Modal({ open, onClose, panelClassName, labelledBy, children }: ModalProps) {
    const isMobile = useIsMobile();
    const panelRef = useRef<HTMLDivElement>(null);
    const restoreFocus = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!open) return;
        restoreFocus.current = document.activeElement as HTMLElement | null;
        panelRef.current?.focus({ preventScroll: true });
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => {
            window.removeEventListener('keydown', onKey);
            restoreFocus.current?.focus?.({ preventScroll: true });
        };
    }, [open, onClose]);

    const panelMotion = isMobile
        ? { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' } }
        : { initial: { scale: 0.86, y: 24, opacity: 0 }, animate: { scale: 1, y: 0, opacity: 1 }, exit: { scale: 0.92, y: 12, opacity: 0 } };

    return createPortal(
        <AnimatePresence>
            {open && (
                <m.div
                    className={`modal-backdrop active rx-backdrop${isMobile ? ' rx-backdrop--sheet' : ''}`}
                    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.18 } }}
                    transition={{ duration: 0.22 }}
                >
                    <m.div
                        ref={panelRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={labelledBy}
                        tabIndex={-1}
                        className={`${panelClassName} rx-panel${isMobile ? ' rx-panel--sheet' : ''}`}
                        {...panelMotion}
                        transition={spring}
                        drag={isMobile ? 'y' : false}
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={{ top: 0, bottom: 0.6 }}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > 110 || info.velocity.y > 600) onClose();
                        }}
                    >
                        {isMobile && <div className="rx-sheet-grip" aria-hidden="true" />}
                        {children}
                    </m.div>
                </m.div>
            )}
        </AnimatePresence>,
        document.body,
    );
}
