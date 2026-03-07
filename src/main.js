import './style.css';
import { renderBirthdayPage } from './pages/birthday-input.js';
import { renderGreetingPage } from './pages/greeting.js';
import { renderGiftRevealPage } from './pages/gift-reveal.js';
import { renderAdminPage } from './pages/admin.js';
import { cleanupEffects } from './effects.js';
import { applyCardTheme } from './theme.js';

// Simple hash-based router
function router() {
    // Cleanup effects from previous page
    cleanupEffects();

    const hash = window.location.hash || '#';

    switch (hash) {
        case '#greeting':
            applyCardTheme();
            renderGreetingPage();
            break;
        case '#reveal':
            applyCardTheme();
            renderGiftRevealPage();
            break;
        case '#admin':
            document.documentElement.removeAttribute('data-theme');
            renderAdminPage();
            break;
        default:
            document.documentElement.removeAttribute('data-theme');
            renderBirthdayPage();
            break;
    }
}

// Listen for hash changes
window.addEventListener('hashchange', router);

// Initial render
router();
