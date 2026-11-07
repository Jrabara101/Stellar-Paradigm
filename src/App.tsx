import { LazyMotion, MotionConfig } from 'motion/react';
import { ChangelogModal } from './components/ChangelogModal';
import { HeaderMenu } from './components/HeaderMenu';
import { GuidePanels } from './components/GuidePanels';
import { OnboardingModal } from './modals/OnboardingModal';
import { CategoryModal } from './modals/CategoryModal';
import { ThemeModal } from './modals/ThemeModal';
import { ChipModal } from './modals/ChipModal';
import { TileEffectsModal } from './modals/TileEffectsModal';
import { ApiSettingsModal } from './modals/ApiSettingsModal';
import { LeaderboardModal } from './modals/LeaderboardModal';
import { CredentialsModal } from './modals/CredentialsModal';
import { GetAppModal } from './modals/GetAppModal';
import { EffectsModal } from './modals/EffectsModal';
import { AudioModal } from './modals/AudioModal';

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
                <HeaderMenu />
                <GuidePanels />
                <OnboardingModal />
                <CategoryModal />
                <ChangelogModal />
                <ThemeModal />
                <ChipModal />
                <EffectsModal />
                {/* After Effects: it opens on top of the Effects menu. */}
                <TileEffectsModal />
                <AudioModal />
                <LeaderboardModal />
                <CredentialsModal />
                <ApiSettingsModal />
                <GetAppModal />
            </LazyMotion>
        </MotionConfig>
    );
}
