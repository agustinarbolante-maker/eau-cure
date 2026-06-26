let letters = [];
let editingLetterId = null;

const lettersList = document.getElementById('letters-list');
const letterForm = document.getElementById('letter-form');
const formMessage = document.getElementById('form-message');
const heartBtn = document.getElementById('heart-btn');
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const floatingHeartsContainer = document.getElementById('floating-hearts');

function openEditModal(letterId) {
  editingLetterId = letterId;
  const letter = letters.find(l => l.id === letterId);
  if (!letter) return;

  const date = new Date(letter.timestamp);
  const isoString = date.toISOString().slice(0, 16);
  document.getElementById('edit-timestamp').value = isoString;
  editModal.classList.add('show');
}

function closeEditModal() {
  editModal.classList.remove('show');
  editingLetterId = null;
}

async function saveTimestamp(e) {
  e.preventDefault();
  if (!editingLetterId) return;

  const newTime = document.getElementById('edit-timestamp').value;
  const newTimestamp = new Date(newTime).toISOString();

  try {
    const response = await fetch(`/api/letters/${editingLetterId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timestamp: newTimestamp })
    });

    if (response.ok) {
      closeEditModal();
      await loadLetters();
      showMessage('Timestamp updated! 💌', 'success');
    } else {
      showMessage('Error updating timestamp', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    showMessage('Error updating timestamp', 'error');
  }
}

function createFloatingHearts() {
  if (!heartBtn) return;

  const rect = heartBtn.getBoundingClientRect();
  const startX = rect.left + rect.width / 2;
  const startY = rect.top + rect.height / 2;

  for (let i = 0; i < 20; i++) {
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.textContent = '❤️';

    const angle = (Math.PI * 2 * i) / 20;
    const distance = 100;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;

    heart.style.left = startX + 'px';
    heart.style.top = startY + 'px';
    heart.style.setProperty('--tx', tx + 'px');

    floatingHeartsContainer.appendChild(heart);

    setTimeout(() => heart.remove(), 2000);
  }

  setTimeout(() => {
    window.location.href = 'inbox.html';
  }, 800);
}

async function loadLetters() {
  try {
    const response = await fetch('/api/letters');
    letters = await response.json();
    renderLetters();
  } catch (error) {
    console.error('Error loading letters:', error);
    lettersList.innerHTML = '<p class="loading">Error loading letters. Please refresh the page.</p>';
  }
}

function formatTimestamp(isoString) {
  const date = new Date(isoString);
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return date.toLocaleDateString('en-US', options);
}

function renderLetters() {
  if (letters.length === 0) {
    lettersList.innerHTML = '<p class="no-letters">No letters yet. Write the first one! 💌</p>';
    return;
  }

  lettersList.innerHTML = letters.map((letter, index) => `
    <div class="letter-item" data-index="${index}" data-id="${letter.id}">
      <div class="letter-item-header">
        <div class="letter-author">${escapeHtml(letter.author)}</div>
        <div class="letter-timestamp" onclick="event.stopPropagation(); openEditModal(${letter.id})">
          ${formatTimestamp(letter.timestamp)}
          <button class="edit-timestamp-btn" onclick="event.stopPropagation();">✏️</button>
        </div>
      </div>
      <div class="letter-content">${escapeHtml(letter.content)}</div>
    </div>
  `).join('');

  document.querySelectorAll('.letter-item').forEach(item => {
    item.addEventListener('click', toggleLetterExpanded);
  });
}

function toggleLetterExpanded(e) {
  e.currentTarget.classList.toggle('expanded');
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

async function submitLetter(e) {
  e.preventDefault();

  const author = document.getElementById('author').value;
  const content = document.getElementById('content').value;

  if (!author.trim() || !content.trim()) {
    showMessage('Please fill in all fields', 'error');
    return;
  }

  try {
    const response = await fetch('/api/letters', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ author, content })
    });

    if (!response.ok) {
      const error = await response.json();
      showMessage(error.error || 'Error posting letter', 'error');
      return;
    }

    showMessage('Letter sent with love! 💌', 'success');
    letterForm.reset();
    await loadLetters();
  } catch (error) {
    console.error('Error posting letter:', error);
    showMessage('Error posting letter. Please try again.', 'error');
  }
}

function showMessage(text, type) {
  formMessage.textContent = text;
  formMessage.className = `form-message show ${type}`;
  setTimeout(() => {
    formMessage.classList.remove('show');
  }, 3000);
}

if (heartBtn) {
  heartBtn.addEventListener('click', createFloatingHearts);
}

if (letterForm) {
  letterForm.addEventListener('submit', submitLetter);
}

if (editForm) {
  editForm.addEventListener('submit', saveTimestamp);
}

if (editModal) {
  window.addEventListener('click', (e) => {
    if (e.target === editModal) {
      closeEditModal();
    }
  });
}

loadLetters();
