// Visual effects for the greeting app

export function startFallingFlowers() {
    if (document.documentElement.getAttribute('data-theme') === 'ocean-blue') return;
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

function getThemeColors() {
    const s = getComputedStyle(document.documentElement);
    return [
        s.getPropertyValue('--color-pink').trim(),
        s.getPropertyValue('--color-rose').trim(),
        s.getPropertyValue('--color-gold').trim(),
        s.getPropertyValue('--color-purple').trim(),
        s.getPropertyValue('--color-pink-light').trim(),
        s.getPropertyValue('--color-purple-light').trim(),
        s.getPropertyValue('--color-pink-dark').trim(),
        s.getPropertyValue('--color-lavender').trim(),
    ];
}

export function launchConfettiBurst() {
    const colors = getThemeColors();

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

export function startFloatingPhotos(photoUrls) {
    let index = 0;

    function createFloatingPhoto() {
        const url = photoUrls[index % photoUrls.length];
        index++;

        const duration = Math.random() * 4 + 6; // 6s - 10s

        // Preload image before adding to DOM to prevent flickering
        const img = new Image();
        img.src = url;
        img.alt = 'Ảnh kỷ niệm';

        const addToDOM = () => {
            const container = document.createElement('div');
            container.className = 'floating-photo';
            container.style.left = (Math.random() * 70 + 5) + '%';

            const size = Math.random() * 80 + 100; // 100px - 180px
            container.style.width = size + 'px';
            container.style.height = size + 'px';

            container.style.animationDuration = duration + 's';

            // Random slight rotation
            const rotate = Math.random() * 20 - 10;
            container.style.setProperty('--float-rotate', rotate + 'deg');
            // Random horizontal drift
            const drift = Math.random() * 100 - 50;
            container.style.setProperty('--float-drift', drift + 'px');

            container.appendChild(img);

            // Click to open lightbox
            container.addEventListener('click', () => {
                const lightbox = document.getElementById('lightbox');
                const lightboxImg = document.getElementById('lightbox-img');
                if (lightbox && lightboxImg) {
                    lightboxImg.src = url;
                    lightbox.classList.add('active');
                }
            });

            document.body.appendChild(container);

            setTimeout(() => container.remove(), duration * 1000 + 500);
        };

        // Use decode() to ensure image is fully decoded before rendering (prevents flickering)
        img.decode().then(addToDOM).catch(() => {
            // Fallback: still add even if decode fails
            addToDOM();
        });
    }

    // Launch initial batch staggered
    for (let i = 0; i < Math.min(photoUrls.length, 3); i++) {
        setTimeout(createFloatingPhoto, i * 800);
    }

    // Keep creating photos
    const interval = setInterval(createFloatingPhoto, 2000);
    window.__floatingPhotoInterval = interval;
}

export function stopFloatingPhotos() {
    if (window.__floatingPhotoInterval) {
        clearInterval(window.__floatingPhotoInterval);
        window.__floatingPhotoInterval = null;
    }
}

export function startFloatingWishes(wishes) {
    let index = 0;

    function createFloatingWish() {
        const text = wishes[index % wishes.length];
        index++;

        const duration = Math.random() * 4 + 7; // 7s - 11s

        const el = document.createElement('div');
        el.className = 'floating-wish';
        el.textContent = text;
        el.style.left = (Math.random() * 60 + 10) + '%';
        el.style.animationDuration = duration + 's';

        const rotate = Math.random() * 10 - 5;
        el.style.setProperty('--wish-rotate', rotate + 'deg');
        const drift = Math.random() * 80 - 40;
        el.style.setProperty('--wish-drift', drift + 'px');

        // Random font size
        const fontSize = Math.random() * 0.3 + 0.85;
        el.style.fontSize = fontSize + 'rem';

        document.body.appendChild(el);
        setTimeout(() => el.remove(), duration * 1000 + 500);
    }

    // Stagger initial batch
    for (let i = 0; i < Math.min(wishes.length, 2); i++) {
        setTimeout(createFloatingWish, i * 1200);
    }

    // Keep creating, offset from photos (photos every 2s, wishes every 3s)
    const interval = setInterval(createFloatingWish, 3000);
    window.__floatingWishInterval = interval;
}

export function stopFloatingWishes() {
    if (window.__floatingWishInterval) {
        clearInterval(window.__floatingWishInterval);
        window.__floatingWishInterval = null;
    }
}

export function cleanupEffects() {
    stopFallingFlowers();
    stopFloatingHearts();
    stopFloatingPhotos();
    stopFloatingWishes();
    document.querySelectorAll('.flower, .float-heart, .confetti-piece, .floating-photo, .floating-wish').forEach(el => el.remove());
}
