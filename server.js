const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const LETTERS_FILE = path.join(__dirname, 'letters.json');
const SONGS_FILE = path.join(__dirname, 'songs.json');
const IMAGES_FILE = path.join(__dirname, 'images.json');
const NOTES_FILE = path.join(__dirname, 'notes.json');
const ATTEMPTS_FILE = path.join(__dirname, 'failed_attempts.json');

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use(express.static('public'));

let letters = [];
let songs = [];
let images = [];
let notes = [];
let attempts = [];

function loadLetters() {
  try {
    if (fs.existsSync(LETTERS_FILE)) {
      const data = fs.readFileSync(LETTERS_FILE, 'utf-8');
      letters = JSON.parse(data);
    } else {
      letters = [];
    }
  } catch (error) {
    console.error('Error loading letters:', error);
    letters = [];
  }
}

function loadSongs() {
  try {
    if (fs.existsSync(SONGS_FILE)) {
      const data = fs.readFileSync(SONGS_FILE, 'utf-8');
      songs = JSON.parse(data);
    } else {
      songs = [];
    }
  } catch (error) {
    console.error('Error loading songs:', error);
    songs = [];
  }
}

function loadImages() {
  try {
    if (fs.existsSync(IMAGES_FILE)) {
      const data = fs.readFileSync(IMAGES_FILE, 'utf-8');
      images = JSON.parse(data);
    } else {
      images = [];
    }
  } catch (error) {
    console.error('Error loading images:', error);
    images = [];
  }
}

function loadNotes() {
  try {
    if (fs.existsSync(NOTES_FILE)) {
      const data = fs.readFileSync(NOTES_FILE, 'utf-8');
      notes = JSON.parse(data);
    } else {
      notes = [];
    }
  } catch (error) {
    console.error('Error loading notes:', error);
    notes = [];
  }
}

function loadAttempts() {
  try {
    if (fs.existsSync(ATTEMPTS_FILE)) {
      const data = fs.readFileSync(ATTEMPTS_FILE, 'utf-8');
      attempts = JSON.parse(data);
    } else {
      attempts = [];
    }
  } catch (error) {
    console.error('Error loading attempts:', error);
    attempts = [];
  }
}

function saveLetters() {
  try {
    fs.writeFileSync(LETTERS_FILE, JSON.stringify(letters, null, 2));
  } catch (error) {
    console.error('Error saving letters:', error);
  }
}

function saveSongs() {
  try {
    fs.writeFileSync(SONGS_FILE, JSON.stringify(songs, null, 2));
  } catch (error) {
    console.error('Error saving songs:', error);
  }
}

function saveImages() {
  try {
    fs.writeFileSync(IMAGES_FILE, JSON.stringify(images, null, 2));
  } catch (error) {
    console.error('Error saving images:', error);
  }
}

function saveNotes() {
  try {
    fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2));
  } catch (error) {
    console.error('Error saving notes:', error);
  }
}

function saveAttempts() {
  try {
    fs.writeFileSync(ATTEMPTS_FILE, JSON.stringify(attempts, null, 2));
  } catch (error) {
    console.error('Error saving attempts:', error);
  }
}

app.get('/api/letters', (req, res) => {
  res.json(letters);
});

app.post('/api/letters', (req, res) => {
  const { author, content } = req.body;

  if (!author || !content) {
    return res.status(400).json({ error: 'Author and content are required' });
  }

  const newLetter = {
    id: Date.now(),
    author: author.trim(),
    content: content.trim(),
    timestamp: new Date().toISOString()
  };

  letters.push(newLetter);
  saveLetters();

  res.status(201).json(newLetter);
});

app.put('/api/letters/:id', (req, res) => {
  const { id } = req.params;
  const { timestamp } = req.body;

  if (!timestamp) {
    return res.status(400).json({ error: 'Timestamp is required' });
  }

  const letter = letters.find(l => l.id === parseInt(id));
  if (!letter) {
    return res.status(404).json({ error: 'Letter not found' });
  }

  letter.timestamp = timestamp;
  saveLetters();

  res.json(letter);
});

// ===== SONGS ENDPOINTS =====
app.get('/api/songs', (req, res) => {
  res.json(songs);
});

app.post('/api/songs', (req, res) => {
  const { title, artist, reason } = req.body;

  if (!title || !artist || !reason) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const newSong = {
    id: Date.now(),
    title: title.trim(),
    artist: artist.trim(),
    reason: reason.trim(),
    createdAt: new Date().toISOString()
  };

  songs.push(newSong);
  saveSongs();

  res.status(201).json(newSong);
});

app.delete('/api/songs/:id', (req, res) => {
  const { id } = req.params;
  songs = songs.filter(s => s.id !== parseInt(id));
  saveSongs();
  res.json({ success: true });
});

// ===== IMAGES ENDPOINTS =====
app.get('/api/images', (req, res) => {
  res.json(images);
});

app.post('/api/images', (req, res) => {
  const { url, title, date } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'Image URL is required' });
  }

  const newImage = {
    id: Date.now(),
    url: url.trim(),
    title: title ? title.trim() : '',
    date: date ? date.trim() : '',
    createdAt: new Date().toISOString()
  };

  images.push(newImage);
  saveImages();

  res.status(201).json(newImage);
});

app.delete('/api/images/:id', (req, res) => {
  const { id } = req.params;
  images = images.filter(i => i.id !== parseInt(id));
  saveImages();
  res.json({ success: true });
});

// ===== NOTES ENDPOINTS =====
app.get('/api/notes', (req, res) => {
  res.json(notes);
});

app.post('/api/notes', (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const newNote = {
    id: Date.now(),
    title: title.trim(),
    content: content.trim(),
    createdAt: new Date().toISOString()
  };

  notes.push(newNote);
  saveNotes();

  res.status(201).json(newNote);
});

app.delete('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  notes = notes.filter(n => n.id !== parseInt(id));
  saveNotes();
  res.json({ success: true });
});

// ===== FAILED ATTEMPTS ENDPOINTS =====
app.get('/api/attempts', (req, res) => {
  res.json(attempts);
});

app.post('/api/attempts', (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  const attempt = {
    id: Date.now(),
    password: password,
    timestamp: new Date().toISOString(),
    userAgent: req.headers['user-agent']
  };

  attempts.push(attempt);
  saveAttempts();

  res.status(201).json(attempt);
});

app.delete('/api/attempts', (req, res) => {
  attempts = [];
  saveAttempts();
  res.json({ success: true, message: 'All attempts cleared' });
});

loadLetters();
loadSongs();
loadImages();
loadNotes();
loadAttempts();

app.listen(PORT, () => {
  console.log(`Love Letter Website running on http://localhost:${PORT}`);
});
