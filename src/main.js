import './style.css';
import { renderBirthdayPage } from './pages/birthday-input.js';
import { renderGreetingPage } from './pages/greeting.js';
import { renderGiftRevealPage } from './pages/gift-reveal.js';
import { renderAdminPage } from './pages/admin.js';
import { cleanupEffects } from './effects.js';

// Simple hash-based router
function router() {
    // Cleanup effects from previous page
    cleanupEffects();

    const hash = window.location.hash || '#';

    switch (hash) {
        case '#greeting':
            renderGreetingPage();
            break;
        case '#reveal':
            renderGiftRevealPage();
            break;
        case '#admin':
            renderAdminPage();
            break;
        default:
            renderBirthdayPage();
            break;
    }
}

// Listen for hash changes
window.addEventListener('hashchange', router);

// Initial render
router();
