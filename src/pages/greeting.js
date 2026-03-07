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
    <div class="page-container bouquet-page">
      <div class="bq-top-text">
        <span class="bq-top-happy">Happy</span>
        <span class="bq-top-wd">Women's Day</span>
        <span class="bq-top-date">8/3</span>
      </div>
      <div class="bq-scene">
        <div class="bq-bouquet">
          <div class="bq-image-wrap">
            <img src="/bouquet.png" alt="Bó hoa" class="bq-image" />
            <div class="bq-card-tag" id="bq-envelope">
              <div class="bq-card-tag-inner">
                <span class="bq-card-tag-icon">💌</span>
                <span class="bq-card-tag-text">Mở thiệp</span>
              </div>
            </div>
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
  const s = getComputedStyle(document.documentElement);
  const colors = [
    s.getPropertyValue('--color-pink').trim(),
    s.getPropertyValue('--color-rose').trim(),
    s.getPropertyValue('--color-gold').trim(),
    s.getPropertyValue('--color-purple').trim(),
    s.getPropertyValue('--color-pink-light').trim(),
    s.getPropertyValue('--color-purple-light').trim(),
    s.getPropertyValue('--color-pink-dark').trim(),
  ];
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
