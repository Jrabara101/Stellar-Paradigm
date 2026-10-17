import { useCallback, useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, useDragControls, type Transition } from 'motion/react';
import * as m from 'motion/react-m';
import { useIsMobile } from '../hooks/useMediaQuery';
import { ui, useIsTopModal, useModalOpen, type ModalId } from '../store/ui';
import { playSound } from '../legacy/sound';

interface ModalProps {
    id: ModalId;
    /** Legacy panel class (e.g. "theme-modal") so every theme's tokens apply. */
    panelClassName: string;
    panelStyle?: CSSProperties;
    labelledBy: string;
    /**
     * The modal's close behaviour, used for Escape, backdrop clicks and the
     * Android back button. Defaults to the legacy "select" blip + close.
     */
    onDismiss?: () => void;
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
export function Modal({ id, panelClassName, panelStyle, labelledBy, onDismiss, children }: ModalProps) {
    const open = useModalOpen(id);
    const isTop = useIsTopModal(id);
    const isMobile = useIsMobile();
    const panelRef = useRef<HTMLDivElement>(null);
    const restoreFocus = useRef<HTMLElement | null>(null);
    // Sheets drag from the grip only, so scrolling a long list inside the
    // panel never turns into an accidental dismiss.
    const dragControls = useDragControls();

    const dismiss = useCallback(() => {
        if (onDismiss) onDismiss();
        else {
            playSound('select');
            ui.close(id);
        }
    }, [id, onDismiss]);

    useEffect(() => ui.registerDismiss(id, dismiss), [id, dismiss]);

    useEffect(() => {
        if (!open) return;
        restoreFocus.current = document.activeElement as HTMLElement | null;
        panelRef.current?.focus({ preventScroll: true });
        return () => {
            restoreFocus.current?.focus?.({ preventScroll: true });
        };
    }, [open]);

    useEffect(() => {
        if (!open || !isTop) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') dismiss();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, isTop, dismiss]);

    const panelMotion = isMobile
        ? { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' } }
        : { initial: { scale: 0.86, y: 24, opacity: 0 }, animate: { scale: 1, y: 0, opacity: 1 }, exit: { scale: 0.92, y: 12, opacity: 0 } };

    return createPortal(
        <AnimatePresence>
            {open && (
                <m.div
                    key={id}
                    className={`modal-backdrop active rx-backdrop${isMobile ? ' rx-backdrop--sheet' : ''}`}
                    data-modal={id}
                    onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
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
                        style={panelStyle}
                        {...panelMotion}
                        transition={spring}
                        drag={isMobile ? 'y' : false}
                        dragControls={dragControls}
                        dragListener={false}
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={{ top: 0, bottom: 0.6 }}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > 110 || info.velocity.y > 600) dismiss();
                        }}
                    >
                        {isMobile && (
                            <div className="rx-sheet-handle" aria-hidden="true" onPointerDown={(e) => dragControls.start(e)}>
                                <div className="rx-sheet-grip" />
                            </div>
                        )}
                        {children}
                    </m.div>
                </m.div>
            )}
        </AnimatePresence>,
        document.body,
    );
}
