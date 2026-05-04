const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database('./anime.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initTables();
  }
});

// Initialize database tables
function initTables() {
  const createAnimeTable = `
    CREATE TABLE IF NOT EXISTS anime (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      episodes_total INTEGER DEFAULT 0,
      episodes_watched INTEGER DEFAULT 0,
      status TEXT DEFAULT 'planned',
      rating INTEGER DEFAULT 0,
      genre TEXT,
      year INTEGER,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.run(createAnimeTable, (err) => {
    if (err) {
      console.error('Error creating anime table:', err.message);
    } else {
      console.log('Anime table ready');
    }
  });
}

// API Routes

// Get all anime
app.get('/api/anime', (req, res) => {
  const sql = 'SELECT * FROM anime ORDER BY created_at DESC';
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get single anime
app.get('/api/anime/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM anime WHERE id = ?';
  
  db.get(sql, [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Anime not found' });
      return;
    }
    res.json(row);
  });
});

// Add new anime
app.post('/api/anime', (req, res) => {
  const { title, description, episodes_total, genre, year, image_url } = req.body;
  
  if (!title) {
    res.status(400).json({ error: 'Title is required' });
    return;
  }

  const sql = `
    INSERT INTO anime (title, description, episodes_total, genre, year, image_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  db.run(sql, [title, description, episodes_total || 0, genre, year, image_url], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, message: 'Anime added successfully' });
  });
});

// Update anime
app.put('/api/anime/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, episodes_total, episodes_watched, status, rating, genre, year, image_url } = req.body;
  
  const sql = `
    UPDATE anime 
    SET title = ?, description = ?, episodes_total = ?, episodes_watched = ?, 
        status = ?, rating = ?, genre = ?, year = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  
  db.run(sql, [title, description, episodes_total, episodes_watched, status, rating, genre, year, image_url, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Anime not found' });
      return;
    }
    res.json({ message: 'Anime updated successfully' });
  });
});

// Delete anime
app.delete('/api/anime/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM anime WHERE id = ?';
  
  db.run(sql, [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Anime not found' });
      return;
    }
    res.json({ message: 'Anime deleted successfully' });
  });
});

// Get statistics
app.get('/api/stats', (req, res) => {
  const sql = `
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
      COUNT(CASE WHEN status = 'watching' THEN 1 END) as watching,
      COUNT(CASE WHEN status = 'planned' THEN 1 END) as planned,
      COUNT(CASE WHEN status = 'on_hold' THEN 1 END) as on_hold,
      COUNT(CASE WHEN status = 'dropped' THEN 1 END) as dropped,
      SUM(episodes_watched) as total_episodes_watched,
      AVG(rating) as average_rating
    FROM anime
  `;
  
  db.get(sql, [], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row);
  });
});

// Serve the React app in production.
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
