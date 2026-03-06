import { startFallingFlowers, startFloatingHearts, launchConfettiBurst, startFloatingPhotos } from '../effects.js';
import { SUPABASE_URL } from '../lib/supabase.js';

export function renderGiftRevealPage() {
    const data = window.__greetingData;
    if (!data || !data.greeting_cards) {
        window.location.hash = '#';
        return;
    }

    const card = data.greeting_cards;
    const app = document.getElementById('app');

    // Build photo URLs for floating effect
    const photos = (card.photo_urls || []).map(url =>
        url.startsWith('http') ? url : `${SUPABASE_URL}/storage/v1/object/public/card-photos/${url}`
    );

    app.innerHTML = `
    <div class="page-container reveal-page">
      <div class="reveal-message">
        <h1 class="reveal-title">${card.final_sub || 'Chúc Mừng Ngày 8/3!'}</h1>

        ${card.final_quote ? `<div class="reveal-quote">${card.final_quote}</div>` : ''}
      </div>

      <div class="glass-card reveal-greeting">
        ${card.para1 ? `<p>💌 ${card.para1}</p>` : ''}
        ${card.para2 ? `<p>🌷 ${card.para2}</p>` : ''}
        ${card.para3 ? `<p>🌹 ${card.para3}</p>` : ''}
        ${card.para4 ? `<p>💗 ${card.para4}</p>` : ''}

        <div class="reveal-signature">
          ${card.sig1 ? `<p>${card.sig1}</p>` : ''}
          ${card.sig2 ? `<p>${card.sig2}</p>` : ''}
        </div>
      </div>
    </div>

    <!-- Lightbox -->
    <div class="lightbox" id="lightbox">
      <button class="lightbox-close" id="lightbox-close">✕</button>
      <img src="" alt="Full image" id="lightbox-img" />
    </div>
  `;

    // Effects
    startFallingFlowers();
    startFloatingHearts();
    launchConfettiBurst();

    // Floating photos effect - fly from bottom to top continuously
    if (photos.length > 0) {
        startFloatingPhotos(photos);
    }

    // Lightbox functionality
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');

    lightboxClose.addEventListener('click', () => {
        lightbox.classList.remove('active');
    });

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.classList.remove('active');
        }
    });
}
