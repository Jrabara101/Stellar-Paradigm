import { LazyMotion, MotionConfig } from 'motion/react';
import { ChangelogModal } from './components/ChangelogModal';

/**
 * React layer, mounted alongside the legacy game. Surfaces move in here one
 * at a time (see docs/REACT_MIGRATION.md); the board itself is still legacy.
 */
const loadFeatures = () => import('./motion-features').then((mod) => mod.default);

export function App() {
    return (
        // Honour prefers-reduced-motion for every Motion animation.
        <MotionConfig reducedMotion="user">
            {/* `strict` makes any stray full `motion.*` import a runtime error. */}
            <LazyMotion features={loadFeatures} strict>
                <ChangelogModal />
            </LazyMotion>
        </MotionConfig>
    );
}
