// Visual effects for the greeting app

export function startFallingFlowers() {
    const flowers = ['🌸', '🌺', '🌷', '🌹', '💐', '🏵️', '💮'];

    function createFlower() {
        const flower = document.createElement('div');
        flower.className = 'flower';
        flower.textContent = flowers[Math.floor(Math.random() * flowers.length)];
        flower.style.left = Math.random() * 100 + '%';
        flower.style.fontSize = (Math.random() * 1.5 + 1) + 'rem';
        flower.style.animationDuration = (Math.random() * 4 + 4) + 's';
        document.body.appendChild(flower);

        setTimeout(() => flower.remove(), 8000);
    }

    // Create flowers periodically
    const interval = setInterval(createFlower, 400);

    // Store interval for cleanup
    window.__flowerInterval = interval;

    // Create initial batch
    for (let i = 0; i < 8; i++) {
        setTimeout(createFlower, i * 200);
    }
}

export function stopFallingFlowers() {
    if (window.__flowerInterval) {
        clearInterval(window.__flowerInterval);
        window.__flowerInterval = null;
    }
}

export function startFloatingHearts() {
    const hearts = ['💕', '💗', '💖', '💝', '❤️', '💓'];

    function createHeart() {
        const heart = document.createElement('div');
        heart.className = 'float-heart';
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.fontSize = (Math.random() * 1 + 0.8) + 'rem';
        heart.style.animationDuration = (Math.random() * 4 + 5) + 's';
        document.body.appendChild(heart);

        setTimeout(() => heart.remove(), 9000);
    }

    const interval = setInterval(createHeart, 800);
    window.__heartInterval = interval;

    for (let i = 0; i < 5; i++) {
        setTimeout(createHeart, i * 300);
    }
}

export function stopFloatingHearts() {
    if (window.__heartInterval) {
        clearInterval(window.__heartInterval);
        window.__heartInterval = null;
    }
}

export function launchConfettiBurst() {
    const colors = ['#ff69b4', '#e91e63', '#ffd700', '#9c27b0', '#ff6b9d', '#ce93d8', '#ffb6c1', '#ff1493'];

    for (let i = 0; i < 80; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.width = (Math.random() * 12 + 4) + 'px';
        confetti.style.height = (Math.random() * 12 + 4) + 'px';
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
        confetti.style.animationDelay = (Math.random() * 1) + 's';
        document.body.appendChild(confetti);

        setTimeout(() => confetti.remove(), 6000);
    }
}

export function cleanupEffects() {
    stopFallingFlowers();
    stopFloatingHearts();
    document.querySelectorAll('.flower, .float-heart, .confetti-piece').forEach(el => el.remove());
}
