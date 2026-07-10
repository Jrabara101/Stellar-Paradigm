// --- USER FEEDBACK WIDGET ---
//
// Setup (one-time):
// 1. Create a Google Form with 1-2 short questions, e.g.
//    "How would you rate this game? (1-5)" and "Anything confusing or broken?"
// 2. In the Form editor, click Send > the "<>" embed icon, and copy the
//    src URL from the generated <iframe> tag.
// 3. Paste that URL below, replacing FEEDBACK_FORM_URL.
//
// Until step 3 is done, the widget still opens with a placeholder Google Form
// so the UI can be reviewed/tested end to end.
const FEEDBACK_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSf_REPLACE_WITH_YOUR_FORM_ID/viewform?embedded=true';

let feedbackPromptQueued = false;

function buildFeedbackModal() {
    if (document.getElementById('feedback-modal')) return;

    const overlay = document.createElement('div');
    overlay.id = 'feedback-modal';
    overlay.className = 'feedback-overlay';
    overlay.innerHTML = `
        <div class="feedback-box">
            <button class="feedback-close" aria-label="Close feedback">&times;</button>
            <h3>Got a sec? Tell us what you think</h3>
            <iframe src="${FEEDBACK_FORM_URL}" width="100%" height="480" frameborder="0">Loading…</iframe>
        </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('.feedback-close').addEventListener('click', hideFeedbackModal);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) hideFeedbackModal();
    });
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
