const FLOWER_EMOJIS = ['🌹', '🌺', '🌻', '🌷', '🌸', '💐'];
const ANIMATION_DURATION = 5000; // 5 seconds

function createFlower() {
  const flower = document.createElement('div');
  flower.className = 'floating-flower';
  flower.textContent = FLOWER_EMOJIS[Math.floor(Math.random() * FLOWER_EMOJIS.length)];

  // Random size between 30px and 60px
  const size = Math.random() * 30 + 30;
  flower.style.fontSize = size + 'px';

  // Random starting position on the edges
  const edge = Math.floor(Math.random() * 4);
  let startX, startY;

  switch (edge) {
    case 0: // Top
      startX = Math.random() * window.innerWidth;
      startY = -50;
      break;
    case 1: // Right
      startX = window.innerWidth + 50;
      startY = Math.random() * window.innerHeight;
      break;
    case 2: // Bottom
      startX = Math.random() * window.innerWidth;
      startY = window.innerHeight + 50;
      break;
    case 3: // Left
      startX = -50;
      startY = Math.random() * window.innerHeight;
      break;
  }

  flower.style.left = startX + 'px';
  flower.style.top = startY + 'px';

  // Random target in center (with some spread)
  const centerX = window.innerWidth / 2 + (Math.random() - 0.5) * 200;
  const centerY = window.innerHeight / 2 + (Math.random() - 0.5) * 200;

  // Animation
  const duration = Math.random() * 2000 + 2000; // 2-4 seconds per flower
  const startTime = Date.now();

  function animate() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const currentX = startX + (centerX - startX) * progress;
    const currentY = startY + (centerY - startY) * progress;

    flower.style.left = currentX + 'px';
    flower.style.top = currentY + 'px';
    flower.style.opacity = 1 - (progress * 0.5); // Fade out slightly

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      flower.remove();
    }
  }

  animate();
  return flower;
}

function startFlowerAnimation() {
  const container = document.getElementById('flowers-animation');

  // Create flowers continuously for the animation duration
  const flowerInterval = setInterval(() => {
    container.appendChild(createFlower());
  }, 150); // Create a new flower every 150ms

  // Stop creating new flowers and redirect after animation duration
  setTimeout(() => {
    clearInterval(flowerInterval);
    // Wait a bit for flowers to finish animating
    setTimeout(() => {
      window.location.href = 'home.html';
    }, 2500);
  }, ANIMATION_DURATION);
}

// Check authentication
if (localStorage.getItem('authenticated') !== 'true') {
  window.location.href = 'index.html';
} else {
  startFlowerAnimation();
}
