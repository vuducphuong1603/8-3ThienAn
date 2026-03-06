import { startFallingFlowers, startFloatingHearts } from '../effects.js';

export function renderGreetingPage() {
    const data = window.__greetingData;
    if (!data || !data.greeting_cards) {
        window.location.hash = '#';
        return;
    }

    const card = data.greeting_cards;
    const app = document.getElementById('app');

    app.innerHTML = `
    <div class="page-container greeting-page">
      <div class="greeting-envelope">
        <p class="greeting-date">✦ Ngày 8 tháng 3 ✦</p>
        <h1 class="greeting-title">${card.welcome_title || 'Chúc Mừng Ngày Quốc Tế Phụ Nữ'}</h1>
        <p class="greeting-sub">${card.sub_heading || 'Gửi người tôi yêu thương'}</p>
      </div>

      <div class="glass-card greeting-body">
        ${card.para1 ? `<p>💌 ${card.para1}</p>` : ''}
        ${card.para2 ? `<p>🌷 ${card.para2}</p>` : ''}
        ${card.para3 ? `<p>🌹 ${card.para3}</p>` : ''}
        ${card.para4 ? `<p>💗 ${card.para4}</p>` : ''}
        
        <div class="greeting-signature">
          ${card.sig1 ? `<p>${card.sig1}</p>` : ''}
          ${card.sig2 ? `<p>${card.sig2}</p>` : ''}
        </div>
      </div>

      <div class="gift-section">
        <p class="gift-prompt">🎁 Bấm vào hộp quà để nhận bất ngờ!</p>
        <div class="gift-box-wrapper" id="gift-box-wrapper">
          <div class="gift-box" id="gift-box">
            <div class="gift-box-lid"></div>
            <div class="gift-box-body"></div>
            <div class="gift-sparkles">
              ${generateSparkles()}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

    // Start effects
    startFallingFlowers();
    startFloatingHearts();

    // Gift box click
    const giftBoxWrapper = document.getElementById('gift-box-wrapper');
    const giftBox = document.getElementById('gift-box');

    giftBoxWrapper.addEventListener('click', () => {
        giftBox.classList.add('opened');
        launchConfetti();

        setTimeout(() => {
            window.location.hash = '#reveal';
        }, 1500);
    });
}

function generateSparkles() {
    let html = '';
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * 360;
        const distance = 60 + Math.random() * 40;
        const tx = Math.cos(angle * Math.PI / 180) * distance;
        const ty = Math.sin(angle * Math.PI / 180) * distance;
        html += `<div class="sparkle" style="--tx:${tx}px;--ty:${ty}px;animation-delay:${i * 0.05}s"></div>`;
    }
    return html;
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
