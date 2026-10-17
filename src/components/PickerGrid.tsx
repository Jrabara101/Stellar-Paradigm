import * as m from 'motion/react-m';
import type { PickerItem } from '../data/picker-types';
import { PickerCard } from './PickerCard';

interface PickerGridProps {
    items: PickerItem[];
    currentId: string;
    isLocked?: (id: string) => boolean;
    onPick: (id: string) => void;
    /** Delay before the first card animates in (for a second grid in the same modal). */
    delay?: number;
}

/** A .theme-grid of picker cards that cascade in when the modal opens. */
export function PickerGrid({ items, currentId, isLocked, onPick, delay = 0 }: PickerGridProps) {
    return (
        <div className="theme-grid">
            {items.map((item, i) => (
                <m.div
                    key={item.id}
                    className="rx-card-cell"
                    initial={{ opacity: 0, y: 14, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    // Cap the stagger so long grids never feel slow to settle.
                    transition={{ delay: delay + Math.min(i, 10) * 0.025, duration: 0.24 }}
                >
                    <PickerCard item={item} current={item.id === currentId} locked={isLocked?.(item.id) ?? false} onPick={onPick} />
                </m.div>
            ))}
        </div>
    );
}
