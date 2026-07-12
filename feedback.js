// --- USER FEEDBACK WIDGET ---
//
// Setup (one-time):
// 1. Create a Google Form with 1-2 short questions, e.g.
//    "How would you rate this game? (1-5)" and "Anything confusing or broken?"
// 2. In the Form editor, click Send > the "<>" embed icon, and copy the
//    src URL from the generated <iframe> tag.
// 3. Paste that URL below, replacing FEEDBACK_FORM_URL.
//
// If this URL is ever reverted to a placeholder (contains
// REPLACE_WITH_YOUR_FORM_ID), the widget falls back to a native form that
// opens the player's mail client addressed to FEEDBACK_EMAIL — feedback is
// never silently lost.
const FEEDBACK_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSeHiCmcXKAWSnRyRMX7GbVMN4mMuhZukWUVFmX9pDBWbqPODA/viewform?embedded=true';
const FEEDBACK_EMAIL = 'prdgmcreatives2@gmail.com';

const feedbackFormIsPlaceholder = FEEDBACK_FORM_URL.includes('REPLACE_WITH_YOUR_FORM_ID');

let feedbackPromptQueued = false;

function buildFeedbackModal() {
    if (document.getElementById('feedback-modal')) return;

    const body = feedbackFormIsPlaceholder
        ? `
            <p class="feedback-hint">Spotted a bug, or have an idea? It goes straight to the developer.</p>
            <textarea class="feedback-text" rows="6" maxlength="2000" placeholder="Type your feedback here..."></textarea>
            <button class="feedback-send" type="button">Send Feedback</button>
        `
        : `<iframe src="${FEEDBACK_FORM_URL}" width="100%" height="480" frameborder="0">Loading…</iframe>`;

    const overlay = document.createElement('div');
    overlay.id = 'feedback-modal';
    overlay.className = 'feedback-overlay';
    overlay.innerHTML = `
        <div class="feedback-box">
            <button class="feedback-close" aria-label="Close feedback">&times;</button>
            <h3>Got a sec? Tell us what you think</h3>
            ${body}
        </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('.feedback-close').addEventListener('click', hideFeedbackModal);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) hideFeedbackModal();
    });

    const sendBtn = overlay.querySelector('.feedback-send');
    if (sendBtn) {
        sendBtn.addEventListener('click', () => {
            const text = overlay.querySelector('.feedback-text').value.trim();
            if (!text) return;
            const subject = encodeURIComponent('Word Scramble feedback');
            const bodyText = encodeURIComponent(`${text}\n\n—\nSent from ${window.location.origin}`);
            window.location.href = `mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${bodyText}`;
            if (window.trackEvent) window.trackEvent('feedback_sent');
            hideFeedbackModal();
        });
    }
}

function showFeedbackModal() {
    buildFeedbackModal();
    document.getElementById('feedback-modal').classList.add('feedback-overlay--open');
    if (window.trackEvent) window.trackEvent('feedback_opened');
}

function hideFeedbackModal() {
    const el = document.getElementById('feedback-modal');
    if (el) el.classList.remove('feedback-overlay--open');
    localStorage.setItem('feedback_dismissed_at', Date.now());
}

// Auto-prompt shortly after the player's first successful on-chain score save.
// Suppressed permanently once dismissed, so it never nags a returning player.
window.showFeedbackPrompt = function showFeedbackPrompt() {
    if (feedbackPromptQueued) return;
    if (localStorage.getItem('feedback_dismissed_at')) return;
    feedbackPromptQueued = true;
    setTimeout(showFeedbackModal, 2500);
};

// Persistent floating button so anyone can leave feedback anytime, not just
// right after a score submission.
function buildFeedbackButton() {
    const btn = document.createElement('button');
    btn.id = 'feedback-fab';
    btn.className = 'feedback-fab';
    btn.title = 'Give feedback';
    btn.textContent = 'Feedback';
    btn.addEventListener('click', showFeedbackModal);
    document.body.appendChild(btn);
}

document.addEventListener('DOMContentLoaded', buildFeedbackButton);
