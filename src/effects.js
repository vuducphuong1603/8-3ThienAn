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

        // If already cached, add immediately; otherwise wait for load
        if (img.complete) {
            addToDOM();
        } else {
            img.onload = addToDOM;
        }
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

export function cleanupEffects() {
    stopFallingFlowers();
    stopFloatingHearts();
    stopFloatingPhotos();
    document.querySelectorAll('.flower, .float-heart, .confetti-piece, .floating-photo').forEach(el => el.remove());
}
