let songs = [];
let images = [];
let notes = [];

// Check authentication
if (localStorage.getItem('authenticated') !== 'true') {
  window.location.href = 'index.html';
}

// ===== FLOATING PARTICLES =====
const particles = ['🌈', '💕', '🐱', '⭐', '✨', '💜', '💙', '💚', '🌸', '🎀'];

function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  setInterval(() => {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.textContent = particles[Math.floor(Math.random() * particles.length)];
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 20 + '%';
    particle.style.animationDuration = (Math.random() * 5 + 8) + 's';
    particle.style.color = ['#ff006e', '#fb5607', '#ffbe0b', '#8338ec', '#3a86ff'][Math.floor(Math.random() * 5)];

    container.appendChild(particle);

    setTimeout(() => particle.remove(), 13000);
  }, 300);
}

// ===== SETTINGS FUNCTIONS =====
function toggleSettings() {
  const panel = document.getElementById('settings-panel');
  const overlay = document.getElementById('settings-overlay');
  panel.classList.toggle('open');
  overlay.classList.toggle('open');
}

function closeSettings() {
  const panel = document.getElementById('settings-panel');
  const overlay = document.getElementById('settings-overlay');
  panel.classList.remove('open');
  overlay.classList.remove('open');
}

function setTheme(theme) {
  const body = document.body;
  body.classList.remove('theme-blue', 'theme-purple', 'theme-green');

  if (theme !== 'default') {
    body.classList.add('theme-' + theme);
  }

  localStorage.setItem('theme', theme);
  updateThemeButtons(theme);
  showNotification('Theme changed! 🎨');
}

function updateThemeButtons(theme) {
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  const themeMap = {
    'default': 0,
    'blue': 1,
    'purple': 2,
    'green': 3
  };

  const buttons = document.querySelectorAll('.theme-btn');
  if (themeMap[theme] !== undefined) {
    buttons[themeMap[theme]].classList.add('active');
  }
}

function setInboxBackground() {
  const url = document.getElementById('inbox-bg-url').value;

  if (!url) {
    showNotification('Please enter an image URL');
    return;
  }

  const inboxContainer = document.querySelector('.inbox-container');
  if (inboxContainer) {
    inboxContainer.style.setProperty('--inbox-bg-image', `url('${url}')`);
  }

  localStorage.setItem('inboxBgUrl', url);
  showNotification('Background set! 🖼️');
}

function clearInboxBackground() {
  const inboxContainer = document.querySelector('.inbox-container');
  if (inboxContainer) {
    inboxContainer.style.setProperty('--inbox-bg-image', 'none');
  }

  document.getElementById('inbox-bg-url').value = '';
  localStorage.removeItem('inboxBgUrl');
  showNotification('Background cleared');
}

// Load saved preferences
function loadPreferences() {
  const savedTheme = localStorage.getItem('theme') || 'default';
  setTheme(savedTheme);

  const savedBgUrl = localStorage.getItem('inboxBgUrl');
  if (savedBgUrl) {
    document.getElementById('inbox-bg-url').value = savedBgUrl;
    const inboxContainer = document.querySelector('.inbox-container');
    if (inboxContainer) {
      inboxContainer.style.setProperty('--inbox-bg-image', `url('${savedBgUrl}')`);
    }
  }
}

function logout() {
  localStorage.removeItem('authenticated');
  window.location.href = 'index.html';
}

// ===== DEBUG LOG FUNCTIONS =====
function toggleDebugLog() {
  const panel = document.getElementById('debug-log-panel');
  panel.classList.toggle('open');
  if (panel.classList.contains('open')) {
    loadFailedAttempts();
  }
}

function closeDebugLog() {
  const panel = document.getElementById('debug-log-panel');
  panel.classList.remove('open');
}

async function loadFailedAttempts() {
  try {
    const response = await fetch('/api/attempts');
    const attempts = await response.json();
    const content = document.getElementById('debug-log-content');

    if (attempts.length === 0) {
      content.innerHTML = '<p class="no-attempts">No failed attempts yet</p>';
      return;
    }

    content.innerHTML = attempts.map((attempt, index) => {
      const date = new Date(attempt.timestamp);
      const timeStr = date.toLocaleString();
      return `
        <div class="attempt-log">
          <span class="attempt-time">${timeStr}</span>
          <span class="attempt-password">Entered: <strong>${escapeHtml(attempt.password)}</strong></span>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Error loading attempts:', error);
    document.getElementById('debug-log-content').innerHTML = '<p class="no-attempts">Error loading attempts</p>';
  }
}

async function clearFailedAttempts() {
  if (confirm('Clear all failed login attempts?')) {
    try {
      await fetch('/api/attempts', { method: 'DELETE' });
      await loadFailedAttempts();
      showNotification('Debug logs cleared');
    } catch (error) {
      console.error('Error clearing attempts:', error);
      showNotification('Error clearing logs');
    }
  }
}

function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('active');
  });

  // Remove active class from all nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // Show selected section
  document.getElementById(sectionId + '-section').classList.add('active');

  // Add active class to clicked button
  event.target.classList.add('active');

  // Load data if needed
  if (sectionId === 'music') {
    loadSongs();
  } else if (sectionId === 'gallery') {
    loadImages();
  } else if (sectionId === 'notes') {
    loadNotes();
  }
}

// ===== MUSIC SECTION =====
async function loadSongs() {
  try {
    const response = await fetch('/api/songs');
    songs = await response.json();
    renderSongs();
  } catch (error) {
    console.error('Error loading songs:', error);
  }
}

function renderSongs() {
  const musicList = document.getElementById('music-list');

  if (songs.length === 0) {
    musicList.innerHTML = '<p class="empty-state">No songs yet. Add one to get started! 🎵</p>';
    return;
  }

  musicList.innerHTML = songs.map((song, index) => `
    <div class="song-card">
      <div class="song-header">
        <h4>${escapeHtml(song.title)}</h4>
        <button class="delete-btn" onclick="deleteSong(${index})">🗑️</button>
      </div>
      <p class="song-artist">by ${escapeHtml(song.artist)}</p>
      <p class="song-reason">"${escapeHtml(song.reason)}"</p>
    </div>
  `).join('');
}

async function addSong() {
  const title = document.getElementById('song-title').value;
  const artist = document.getElementById('song-artist').value;
  const reason = document.getElementById('song-reason').value;

  if (!title || !artist || !reason) {
    alert('Please fill in all fields!');
    return;
  }

  try {
    const response = await fetch('/api/songs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, artist, reason })
    });

    if (response.ok) {
      document.getElementById('song-title').value = '';
      document.getElementById('song-artist').value = '';
      document.getElementById('song-reason').value = '';
      await loadSongs();
      showNotification('Song added! 🎵');
    }
  } catch (error) {
    console.error('Error adding song:', error);
  }
}

async function deleteSong(index) {
  if (!confirm('Delete this song?')) return;

  try {
    await fetch(`/api/songs/${songs[index].id}`, { method: 'DELETE' });
    await loadSongs();
    showNotification('Song deleted.');
  } catch (error) {
    console.error('Error deleting song:', error);
  }
}

// ===== GALLERY SECTION =====
async function loadImages() {
  try {
    const response = await fetch('/api/images');
    images = await response.json();
    renderGallery();
  } catch (error) {
    console.error('Error loading images:', error);
  }
}

function renderGallery() {
  const gallery = document.getElementById('gallery-grid');

  if (images.length === 0) {
    gallery.innerHTML = '<p class="empty-state">No images yet. Add one to get started! 📸</p>';
    return;
  }

  gallery.innerHTML = images.map((img, index) => `
    <div class="gallery-item">
      <img src="${escapeHtml(img.url)}" alt="${escapeHtml(img.title || 'Memory')}">
      <div class="gallery-overlay">
        ${img.title ? `<p class="gallery-title">${escapeHtml(img.title)}</p>` : ''}
        ${img.date ? `<p class="gallery-date">${escapeHtml(img.date)}</p>` : ''}
        <button class="delete-btn" onclick="deleteImage(${index})">🗑️</button>
      </div>
    </div>
  `).join('');
}

async function addImage() {
  const url = document.getElementById('image-url').value;
  const title = document.getElementById('image-title').value;
  const date = document.getElementById('image-date').value;

  if (!url) {
    alert('Please enter an image URL!');
    return;
  }

  try {
    const response = await fetch('/api/images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, title, date })
    });

    if (response.ok) {
      document.getElementById('image-url').value = '';
      document.getElementById('image-title').value = '';
      document.getElementById('image-date').value = '';
      await loadImages();
      showNotification('Image added! 📸');
    }
  } catch (error) {
    console.error('Error adding image:', error);
  }
}

async function deleteImage(index) {
  if (!confirm('Delete this image?')) return;

  try {
    await fetch(`/api/images/${images[index].id}`, { method: 'DELETE' });
    await loadImages();
    showNotification('Image deleted.');
  } catch (error) {
    console.error('Error deleting image:', error);
  }
}

// ===== NOTES SECTION =====
async function loadNotes() {
  try {
    const response = await fetch('/api/notes');
    notes = await response.json();
    renderNotes();
  } catch (error) {
    console.error('Error loading notes:', error);
  }
}

function renderNotes() {
  const notesList = document.getElementById('notes-list');

  if (notes.length === 0) {
    notesList.innerHTML = '<p class="empty-state">No memories yet. Add one to get started! 💕</p>';
    return;
  }

  notesList.innerHTML = notes.map((note, index) => `
    <div class="note-card">
      <div class="note-header">
        <h4>${escapeHtml(note.title)}</h4>
        <button class="delete-btn" onclick="deleteNote(${index})">🗑️</button>
      </div>
      <p class="note-date">${new Date(note.createdAt).toLocaleDateString()}</p>
      <p class="note-content">${escapeHtml(note.content)}</p>
    </div>
  `).join('');
}

async function addNote() {
  const title = document.getElementById('note-title').value;
  const content = document.getElementById('note-content').value;

  if (!title || !content) {
    alert('Please fill in all fields!');
    return;
  }

  try {
    const response = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content })
    });

    if (response.ok) {
      document.getElementById('note-title').value = '';
      document.getElementById('note-content').value = '';
      await loadNotes();
      showNotification('Memory saved! 💕');
    }
  } catch (error) {
    console.error('Error adding note:', error);
  }
}

async function deleteNote(index) {
  if (!confirm('Delete this memory?')) return;

  try {
    await fetch(`/api/notes/${notes[index].id}`, { method: 'DELETE' });
    await loadNotes();
    showNotification('Memory deleted.');
  } catch (error) {
    console.error('Error deleting note:', error);
  }
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

function showNotification(message) {
  const notif = document.createElement('div');
  notif.className = 'notification';
  notif.textContent = message;
  document.body.appendChild(notif);

  setTimeout(() => notif.remove(), 2000);
}

// ===== NYAN CAT =====
function createNyanCat() {
  const container = document.getElementById('nyan-cats-container');
  if (!container) return;

  const paths = ['path-1', 'path-2', 'path-3', 'path-4', 'path-5'];
  const randomPath = paths[Math.floor(Math.random() * paths.length)];
  const durations = { 'path-1': 8000, 'path-2': 8000, 'path-3': 10000, 'path-4': 10000, 'path-5': 12000 };

  const nyan = document.createElement('img');
  nyan.src = 'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExNzI0ZTMwYzUwNDY3OTQ1YzQ5ZmM0NzA4ZDBmMzk2OTVkZjc5ODkxZCZjdD1n/BzyTuYCmMMSBi/giphy.gif';
  nyan.className = `nyan-cat-img ${randomPath}`;
  nyan.alt = 'Nyan Cat';
  nyan.onload = function() {
    nyan.style.display = 'block';
  };
  nyan.onerror = function() {
    nyan.textContent = '🐱';
  };

  container.appendChild(nyan);

  setTimeout(() => {
    nyan.remove();
    createNyanCat();
  }, durations[randomPath]);
}

// Load songs, preferences, start particles, and spawn Nyan Cat on page load
loadSongs();
loadPreferences();
createParticles();
createNyanCat();
