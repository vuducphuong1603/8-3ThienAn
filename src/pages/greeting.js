import { startFallingFlowers, startFloatingHearts } from '../effects.js';

export function renderGreetingPage() {
    const data = window.__greetingData;
    if (!data || !data.greeting_cards) {
        window.location.hash = '#';
        return;
    }

    const card = data.greeting_cards;
    const app = document.getElementById('app');

    // Generate bouquet flowers
    const flowers = [
        { x: -90, h: 230, rot: -18, delay: 0, emoji: '🌹' },
        { x: -50, h: 270, rot: -10, delay: 0.15, emoji: '🌷' },
        { x: -15, h: 290, rot: -3, delay: 0.25, emoji: '🌹' },
        { x: 20, h: 285, rot: 4, delay: 0.1, emoji: '🌷' },
        { x: 55, h: 260, rot: 11, delay: 0.3, emoji: '🌹' },
        { x: 90, h: 220, rot: 18, delay: 0.2, emoji: '🌷' },
        { x: -70, h: 200, rot: -22, delay: 0.35, emoji: '🌺' },
        { x: 75, h: 195, rot: 22, delay: 0.4, emoji: '🌺' },
    ];

    const flowerHTML = flowers.map(f => `
        <div class="bq-stem" style="--sx:${f.x}px;--sh:${f.h}px;--sr:${f.rot}deg;--sd:${f.delay}s">
            <span class="bq-head">${f.emoji}</span>
            <span class="bq-leaf bq-leaf-l">🍃</span>
            <span class="bq-leaf bq-leaf-r">🍃</span>
        </div>
    `).join('');

    app.innerHTML = `
    <div class="page-container bouquet-page">
      <div class="bq-scene">
        <div class="bq-container">
          <div class="bq-flowers">${flowerHTML}</div>
          <div class="bq-wrap">
            <div class="bq-paper"></div>
            <div class="bq-ribbon"></div>
          </div>
          <div class="bq-envelope" id="bq-envelope">
            <div class="bq-envelope-icon">💌</div>
            <p class="bq-envelope-hint">Bấm để mở thiệp</p>
          </div>
        </div>
      </div>

      <!-- Card overlay -->
      <div class="card-overlay" id="card-overlay">
        <div class="opened-card glass-card">
          <button class="card-close-btn" id="card-close">✕</button>
          <p class="card-date">✦ Ngày 8 tháng 3 ✦</p>
          <h2 class="card-title">${card.welcome_title || 'Chúc Mừng Ngày 8/3'}</h2>
          <p class="card-sub">${card.sub_heading || 'Gửi người tôi yêu thương'}</p>
          <div class="typewriter-area" id="typewriter-area"></div>
          <div class="card-signature" id="card-signature">
            ${card.sig1 ? `<p>${card.sig1}</p>` : ''}
            ${card.sig2 ? `<p>${card.sig2}</p>` : ''}
          </div>
          <div class="card-gift-btn" id="card-gift-btn">
            <button class="btn-primary" id="btn-open-gift">🎁 Mở Quà Nào!</button>
          </div>
        </div>
      </div>
    </div>
  `;

    startFallingFlowers();
    startFloatingHearts();

    // Paragraphs for typewriter
    const paragraphs = [
        card.para1 ? `💌 ${card.para1}` : '',
        card.para2 ? `🌷 ${card.para2}` : '',
        card.para3 ? `🌹 ${card.para3}` : '',
        card.para4 ? `💗 ${card.para4}` : '',
    ].filter(Boolean);

    const envelope = document.getElementById('bq-envelope');
    const overlay = document.getElementById('card-overlay');
    const typewriterArea = document.getElementById('typewriter-area');
    const signature = document.getElementById('card-signature');
    const giftBtn = document.getElementById('card-gift-btn');
    const closeBtn = document.getElementById('card-close');
    const openGiftBtn = document.getElementById('btn-open-gift');

    let typewriterActive = false;

    envelope.addEventListener('click', () => {
        overlay.classList.add('active');
        if (!typewriterActive) {
            typewriterActive = true;
            setTimeout(() => {
                typewriterSequence(typewriterArea, paragraphs, 0, () => {
                    signature.classList.add('show');
                    setTimeout(() => {
                        giftBtn.classList.add('show');
                    }, 800);
                });
            }, 700);
        }
    });

    closeBtn.addEventListener('click', () => {
        overlay.classList.remove('active');
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('active');
    });

    openGiftBtn.addEventListener('click', () => {
        launchConfetti();
        setTimeout(() => {
            window.location.hash = '#reveal';
        }, 800);
    });
}

function typewriterSequence(container, paragraphs, index, onComplete) {
    if (index >= paragraphs.length) {
        // Remove cursor from last paragraph
        const lastP = container.querySelector('p:last-child');
        if (lastP) lastP.classList.add('typed-done');
        if (onComplete) onComplete();
        return;
    }

    const p = document.createElement('p');
    p.className = 'typing-line';
    container.appendChild(p);

    // Remove cursor from previous paragraph
    const prev = container.querySelector('p.typing-line:nth-last-child(2)');
    if (prev) prev.classList.add('typed-done');

    const text = paragraphs[index];
    let charIndex = 0;

    function type() {
        if (charIndex < text.length) {
            p.textContent += text.charAt(charIndex);
            charIndex++;
            setTimeout(type, 35);
        } else {
            setTimeout(() => {
                typewriterSequence(container, paragraphs, index + 1, onComplete);
            }, 400);
        }
    }
    type();
}

function launchConfetti() {
    const colors = ['#ff69b4', '#e91e63', '#ffd700', '#9c27b0', '#ff6b9d', '#ce93d8', '#ffb6c1'];
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.width = (Math.random() * 10 + 5) + 'px';
        confetti.style.height = (Math.random() * 10 + 5) + 'px';
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        confetti.style.animationDuration = (Math.random() * 2 + 1.5) + 's';
        confetti.style.animationDelay = (Math.random() * 0.5) + 's';
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 4000);
    }
}
