// --- FIRST-TIME PLAYER WALLET GUIDE ---
//
// Most players testing this game have never used a crypto wallet before.
// This walks them through what a wallet is, installing Freighter, connecting,
// and what happens when they submit a score — using real screenshots from
// this app so nothing they see here is a surprise later.
//
// NOTE: this is deliberately separate from the game's own first-visit
// "onboarding" tutorial in script.js (#onboarding-modal-backdrop /
// ws_onboarding_seen), which explains how to play. This guide explains the
// wallet/blockchain side instead, and waits for that tutorial to be
// dismissed first so the two never stack on top of each other.

const WALLET_GUIDE_SLIDES = [
    {
        title: "What's this?",
        body: "Solve the puzzle, and your score gets saved permanently on a public ledger called Stellar — think of it as a tamper-proof scoreboard. You'll need a free digital wallet to do that; it's basically a login that also proves the score is really yours.",
    },
    {
        title: 'Get a wallet (one-time, ~1 min)',
        body: 'Freighter is a free browser extension — like a password manager, but for this. Install it, create a wallet, and you\'re done.',
        linkUrl: 'https://www.freighter.app/',
        linkLabel: 'Install Freighter',
    },
    {
        title: 'Connect it here',
        body: 'Click "Connect Wallet" in the top bar, then pick Freighter from the list that pops up.',
        image: 'screenshots/wallet-picker.png',
    },
    {
        title: 'Approve the connection',
        body: 'Freighter will ask you to approve the connection — click Approve. That\'s it, you\'re connected.',
        image: 'screenshots/wallet-approval-freighter.png',
    },
    {
        title: 'Play, then save your score',
        body: 'Solve a word, hit Submit, and approve one more time in Freighter. Your score is now on-chain — permanent, and yours.',
        image: 'screenshots/successful-transaction.png',
        finalCta: true,
    },
];

let walletGuideSlideIndex = 0;

function buildWalletGuideModal() {
    if (document.getElementById('wallet-guide-modal')) return;

    const overlay = document.createElement('div');
    overlay.id = 'wallet-guide-modal';
    overlay.className = 'wallet-guide-overlay';

    const slidesHtml = WALLET_GUIDE_SLIDES.map((slide, i) => `
        <div class="wallet-guide-slide${i === 0 ? ' wallet-guide-slide--active' : ''}" data-slide="${i}">
            <h3>${slide.title}</h3>
            ${slide.image ? `<img src="${slide.image}" alt="${slide.title}" loading="lazy">` : ''}
            <p>${slide.body}</p>
            ${slide.linkUrl ? `<a class="wallet-guide-link-btn" href="${slide.linkUrl}" target="_blank" rel="noopener">${slide.linkLabel}</a>` : ''}
        </div>
    `).join('');

    const dotsHtml = WALLET_GUIDE_SLIDES.map((_, i) =>
        `<span class="wallet-guide-dot${i === 0 ? ' wallet-guide-dot--active' : ''}" data-dot="${i}"></span>`
    ).join('');

    overlay.innerHTML = `
        <div class="wallet-guide-box">
            <button class="wallet-guide-close" aria-label="Close guide">&times;</button>
            <div class="wallet-guide-slides">${slidesHtml}</div>
            <div class="wallet-guide-dots">${dotsHtml}</div>
            <div class="wallet-guide-nav">
                <button class="wallet-guide-prev" disabled>Back</button>
                <button class="wallet-guide-next">Next</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('.wallet-guide-close').addEventListener('click', hideWalletGuideModal);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) hideWalletGuideModal();
    });
    overlay.querySelector('.wallet-guide-prev').addEventListener('click', () => goToWalletGuideSlide(walletGuideSlideIndex - 1));
    overlay.querySelector('.wallet-guide-next').addEventListener('click', () => {
        if (walletGuideSlideIndex === WALLET_GUIDE_SLIDES.length - 1) {
            hideWalletGuideModal();
            if (window.stellarWallet && !window.stellarWallet.connected) {
                window.stellarWallet.connect();
            }
            return;
        }
        goToWalletGuideSlide(walletGuideSlideIndex + 1);
    });
    overlay.querySelectorAll('.wallet-guide-dot').forEach((dot) => {
        dot.addEventListener('click', () => goToWalletGuideSlide(Number(dot.dataset.dot)));
    });
}

function goToWalletGuideSlide(index) {
    if (index < 0 || index >= WALLET_GUIDE_SLIDES.length) return;
    walletGuideSlideIndex = index;

    const overlay = document.getElementById('wallet-guide-modal');
    overlay.querySelectorAll('.wallet-guide-slide').forEach((el, i) => {
        el.classList.toggle('wallet-guide-slide--active', i === index);
    });
    overlay.querySelectorAll('.wallet-guide-dot').forEach((el, i) => {
        el.classList.toggle('wallet-guide-dot--active', i === index);
    });

    overlay.querySelector('.wallet-guide-prev').disabled = index === 0;
    const nextBtn = overlay.querySelector('.wallet-guide-next');
    nextBtn.textContent = index === WALLET_GUIDE_SLIDES.length - 1 ? "Got it, let's play!" : 'Next';
}

function hideWalletGuideModal() {
    const el = document.getElementById('wallet-guide-modal');
    if (el) el.classList.remove('wallet-guide-overlay--open');
    localStorage.setItem('wallet_guide_seen', '1');
}

// manualOpen=true means the player clicked the "❓ Guide" button themselves —
// always show regardless of the auto-prompt's dismissal state.
window.showWalletGuide = function showWalletGuide(manualOpen = false) {
    buildWalletGuideModal();
    walletGuideSlideIndex = 0;
    goToWalletGuideSlide(0);
    document.getElementById('wallet-guide-modal').classList.add('wallet-guide-overlay--open');
    if (window.trackEvent) window.trackEvent('wallet_guide_opened', { manual: manualOpen });
};

// Auto-show once for first-time visitors — but only *after* whatever the
// game itself auto-opens on entrance (the first-visit "how to play"
// tutorial, or the changelog modal it shows to returning visitors instead —
// both use the shared .modal-backdrop shell in script.js) has been
// dismissed, so the two never stack on top of each other.
//
// Generic on purpose: rather than hardcoding which modal to wait for, this
// watches for *any* .modal-backdrop.active to appear then disappear. That
// way it stays correct even if script.js's entrance-load modal changes.
//
// Phase 1: wait for an entrance-load modal to appear at all (skip ahead if
// none shows up within phase1MaxMs — e.g. no entrance animation this load).
// Phase 2: once one appears, wait for it to close, then show the guide.
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('wallet_guide_seen')) return;

    const pollMs = 300;
    const phase1MaxMs = 4000;
    const phase2MaxMs = 15000;
    let waited = 0;
    let modalSeen = false;

    const poll = setInterval(() => {
        waited += pollMs;
        const modalActive = !!document.querySelector('.modal-backdrop.active');

        if (!modalSeen) {
            if (modalActive) {
                modalSeen = true;
                waited = 0; // reset the clock for phase 2
            } else if (waited >= phase1MaxMs) {
                clearInterval(poll);
                window.showWalletGuide(false);
            }
            return;
        }

        if (!modalActive || waited >= phase2MaxMs) {
            clearInterval(poll);
            setTimeout(() => window.showWalletGuide(false), 900);
        }
    }, pollMs);
});
