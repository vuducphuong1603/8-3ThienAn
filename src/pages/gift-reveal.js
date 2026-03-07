import { startFallingFlowers, startFloatingHearts, launchConfettiBurst, startFloatingPhotos, startFloatingWishes } from '../effects.js';
import { SUPABASE_URL } from '../lib/supabase.js';

export function renderGiftRevealPage() {
    const data = window.__greetingData;
    if (!data || !data.greeting_cards) {
        window.location.hash = '#';
        return;
    }

    const card = data.greeting_cards;
    const app = document.getElementById('app');
    const photos = (card.photo_urls || []).map(url =>
        url.startsWith('http') ? url : `${SUPABASE_URL}/storage/v1/object/public/card-photos/${url}`
    );
    const wishes = card.floating_wishes || [];

    if (card.greeting === 'heart-draw') {
        renderHeartReveal(app, card, photos, wishes);
    } else {
        renderDefaultReveal(app, card, photos, wishes);
    }
}

function setupLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxClose = document.getElementById('lightbox-close');
    if (lightboxClose) {
        lightboxClose.addEventListener('click', () => lightbox.classList.remove('active'));
    }
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) lightbox.classList.remove('active');
        });
    }
}

// ========== DEFAULT REVEAL (unchanged) ==========

function renderDefaultReveal(app, card, photos, wishes) {
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

    startFallingFlowers();
    startFloatingHearts();
    launchConfettiBurst();

    if (photos.length > 0) startFloatingPhotos(photos);
    if (wishes.length > 0) setTimeout(() => startFloatingWishes(wishes), 1000);

    setupLightbox();
}

// ========== HEART DRAW REVEAL ==========

function renderHeartReveal(app, card, photos, wishes) {
    app.innerHTML = `
    <div class="page-container reveal-page heart-reveal-page">
      <canvas id="heart-canvas"></canvas>
      <div class="heart-content" id="heart-content">
        <h1 class="heart-title">${card.final_sub || 'Chúc Mừng Ngày 8/3!'}</h1>
        ${card.final_quote ? `<div class="heart-quote">${card.final_quote}</div>` : ''}
        <div class="heart-signature">
          ${card.sig1 ? `<p>${card.sig1}</p>` : ''}
          ${card.sig2 ? `<p>${card.sig2}</p>` : ''}
        </div>
      </div>
    </div>

    <div class="lightbox" id="lightbox">
      <button class="lightbox-close" id="lightbox-close">✕</button>
      <img src="" alt="Full image" id="lightbox-img" />
    </div>
  `;

    const canvas = document.getElementById('heart-canvas');

    // Start flowers & hearts immediately as background
    startFallingFlowers();
    startFloatingHearts();

    // Animate heart draw, then reveal text + more effects
    animateHeart(canvas).then(() => {
        document.getElementById('heart-content').classList.add('show');
        launchConfettiBurst();

        if (photos.length > 0) startFloatingPhotos(photos);
        if (wishes.length > 0) setTimeout(() => startFloatingWishes(wishes), 1000);
    });

    setupLightbox();
}

function animateHeart(canvas) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const w = rect.width;
    const h = rect.height;
    const scale = Math.min(w, h) / 48;
    const cx = w / 2;
    const cy = h * 0.42;

    // Heart parametric equations (clockwise in screen coords)
    const N = 300;
    const pts = [];
    for (let i = 0; i <= N; i++) {
        const t = (i / N) * 2 * Math.PI;
        const sx = 16 * Math.pow(Math.sin(t), 3);
        const sy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        pts.push({ x: cx + scale * sx, y: cy + scale * sy });
    }

    const DRAW_MS = 3000;
    const FILL_MS = 800;
    let t0 = null;

    return new Promise(resolve => {
        function frame(ts) {
            if (!t0) t0 = ts;
            const elapsed = ts - t0;

            ctx.clearRect(0, 0, w, h);

            if (elapsed <= DRAW_MS) {
                // Phase 1: Draw outline clockwise
                const p = Math.min(elapsed / DRAW_MS, 1);
                const eased = 1 - Math.pow(1 - p, 3);
                const count = Math.floor(eased * N);

                ctx.save();
                ctx.beginPath();
                for (let i = 0; i <= count; i++) {
                    if (i === 0) ctx.moveTo(pts[i].x, pts[i].y);
                    else ctx.lineTo(pts[i].x, pts[i].y);
                }
                ctx.strokeStyle = '#ff69b4';
                ctx.lineWidth = 3.5;
                ctx.shadowColor = '#ff69b4';
                ctx.shadowBlur = 25;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.stroke();
                ctx.restore();

                // Glowing dot at drawing tip
                const tip = pts[Math.min(count, N)];
                ctx.save();
                ctx.beginPath();
                ctx.arc(tip.x, tip.y, 6, 0, 2 * Math.PI);
                ctx.fillStyle = '#fff';
                ctx.shadowColor = '#ff1493';
                ctx.shadowBlur = 30;
                ctx.fill();
                ctx.restore();

                requestAnimationFrame(frame);
            } else if (elapsed <= DRAW_MS + FILL_MS) {
                // Phase 2: Fill the heart
                const fp = (elapsed - DRAW_MS) / FILL_MS;
                drawFilledHeart(ctx, pts, N, cx, cy, scale, fp, w, h);
                requestAnimationFrame(frame);
            } else {
                // Done drawing - start subtle pulse and resolve
                drawFilledHeart(ctx, pts, N, cx, cy, scale, 1, w, h);
                startHeartPulse(ctx, pts, N, cx, cy, scale, w, h);
                resolve();
            }
        }
        requestAnimationFrame(frame);
    });
}

function drawFilledHeart(ctx, pts, N, cx, cy, scale, fillAlpha, w, h) {
    ctx.clearRect(0, 0, w, h);

    ctx.save();
    ctx.beginPath();
    for (let i = 0; i <= N; i++) {
        if (i === 0) ctx.moveTo(pts[i].x, pts[i].y);
        else ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.closePath();

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, scale * 20);
    grad.addColorStop(0, `rgba(255, 182, 193, ${fillAlpha * 0.45})`);
    grad.addColorStop(0.5, `rgba(255, 105, 180, ${fillAlpha * 0.25})`);
    grad.addColorStop(1, `rgba(255, 20, 147, ${fillAlpha * 0.1})`);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = '#ff69b4';
    ctx.lineWidth = 3.5;
    ctx.shadowColor = '#ff69b4';
    ctx.shadowBlur = 25;
    ctx.stroke();
    ctx.restore();
}

function startHeartPulse(ctx, pts, N, cx, cy, scale, w, h) {
    function pulse(ts) {
        const glow = 20 + 12 * Math.sin(ts / 600);
        ctx.clearRect(0, 0, w, h);

        ctx.save();
        ctx.beginPath();
        for (let i = 0; i <= N; i++) {
            if (i === 0) ctx.moveTo(pts[i].x, pts[i].y);
            else ctx.lineTo(pts[i].x, pts[i].y);
        }
        ctx.closePath();

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, scale * 20);
        grad.addColorStop(0, 'rgba(255, 182, 193, 0.45)');
        grad.addColorStop(0.5, 'rgba(255, 105, 180, 0.25)');
        grad.addColorStop(1, 'rgba(255, 20, 147, 0.1)');
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.strokeStyle = '#ff69b4';
        ctx.lineWidth = 3.5;
        ctx.shadowColor = '#ff69b4';
        ctx.shadowBlur = glow;
        ctx.stroke();
        ctx.restore();

        requestAnimationFrame(pulse);
    }
    requestAnimationFrame(pulse);
}
