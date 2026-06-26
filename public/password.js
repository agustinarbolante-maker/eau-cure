const CORRECT_PASSWORD = 'SixAndMySeven';
const rainbowColors = ['#ff006e', '#fb5607', '#ffbe0b', '#8338ec', '#3a86ff', '#06ffa5'];

// Nyan Cat rainbow trail
function createRainbowTrail() {
  const nyanCat = document.getElementById('nyan-cat');
  const trail = document.getElementById('rainbow-trail');

  setInterval(() => {
    const rect = nyanCat.getBoundingClientRect();
    const particle = document.createElement('div');
    particle.className = 'rainbow-particle';
    particle.style.left = rect.left + 'px';
    particle.style.top = rect.top + rect.height / 2 + 'px';
    particle.style.backgroundColor = rainbowColors[Math.floor(Math.random() * rainbowColors.length)];
    particle.style.boxShadow = `0 0 10px ${particle.style.backgroundColor}`;

    document.body.appendChild(particle);

    setTimeout(() => particle.remove(), 1000);
  }, 50);
}

document.getElementById('password-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const password = document.getElementById('password-input').value;
  const errorMessage = document.getElementById('error-message');

  if (password === CORRECT_PASSWORD) {
    localStorage.setItem('authenticated', 'true');
    window.location.href = 'flowers.html';
  } else {
    logFailedAttempt(password);
    errorMessage.textContent = '❌';
    errorMessage.style.display = 'block';
    document.getElementById('password-input').value = '';
  }
});

function logFailedAttempt(password) {
  fetch('/api/attempts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  }).catch(error => console.error('Error logging attempt:', error));
}

// Check if already authenticated
if (localStorage.getItem('authenticated') === 'true') {
  window.location.href = 'home.html';
}

// Start rainbow trail
createRainbowTrail();
