const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const dotenv = require('dotenv');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const auth = require('./auth'); // 🔐 שכבת הרשאות

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 🛡️ Middleware להרשאות – כל route חוץ מ־/status ו־POST /users
app.use((req, res, next) => {
  if (req.path === '/status') return next();
  if (req.path === '/users' && req.method === 'POST') return next();
  auth(req, res, next);
});

// 📁 Directory for uploaded quote files
const uploadDir = './uploads/quotes';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 🗂️ Multer file storage config
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + file.originalname;
    cb(null, unique);
  }
});
const upload = multer({ storage });

// 🔌 Connect to SQLite
const db = new sqlite3.Database('./db/database.sqlite', (err) => {
  if (err) console.error('❌ DB Error:', err.message);
  else console.log('✅ Connected to SQLite database.');
});

// ✅ Health check (פתוח)
app.get('/status', (req, res) => {
  res.json({ status: 'CRM server is running 👌' });
});

// ========== CONTACTS ==========
app.get('/contacts', (req, res) => {
  db.all('SELECT * FROM contacts', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/contacts/:id', (req, res) => {
  db.get('SELECT * FROM contacts WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Contact not found' });
    res.json(row);
  });
});

app.post('/contacts', (req, res) => {
  const { full_name, phone, email, status, notes } = req.body;
  db.run(`
    INSERT INTO contacts (full_name, phone, email, status, notes)
    VALUES (?, ?, ?, ?, ?)`,
    [full_name, phone, email, status, notes],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    });
});

// ========== LEADS ==========
app.get('/leads', (req, res) => {
  db.all('SELECT * FROM leads', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/leads', (req, res) => {
  const { title, description, contact_id, channel, funnel_stage, status } = req.body;
  db.run(`
    INSERT INTO leads (title, description, contact_id, channel, funnel_stage, status)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [title, description, contact_id, channel, funnel_stage, status],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    });
});

// ========== TASKS ==========
app.get('/tasks', (req, res) => {
  db.all('SELECT * FROM tasks', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/tasks', (req, res) => {
  const { title, description, status, due_date, related_to, related_id } = req.body;
  db.run(`
    INSERT INTO tasks (title, description, status, due_date, related_to, related_id)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [title, description, status, due_date, related_to, related_id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    });
});

// ========== MEETINGS ==========
app.get('/meetings', (req, res) => {
  db.all('SELECT * FROM meetings', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/meetings', (req, res) => {
  const { contact_id, title, datetime, location, status } = req.body;
  db.run(`
    INSERT INTO meetings (contact_id, title, datetime, location, status)
    VALUES (?, ?, ?, ?, ?)`,
    [contact_id, title, datetime, location, status],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    });
});

// ========== QUOTES ==========
app.get('/quotes', (req, res) => {
  db.all('SELECT * FROM quotes', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/quotes', upload.single('file'), (req, res) => {
  const { contact_id, amount, status } = req.body;
  const file_url = req.file ? `/uploads/quotes/${req.file.filename}` : null;
  db.run(`
    INSERT INTO quotes (contact_id, amount, status, file_url)
    VALUES (?, ?, ?, ?)`,
    [contact_id, amount, status, file_url],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, file_url });
    });
});

// ========== PAYMENTS ==========
app.get('/payments', (req, res) => {
  db.all('SELECT * FROM payments', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/payments', (req, res) => {
  const { quote_id, amount, status, due_date, paid_at } = req.body;
  db.run(`
    INSERT INTO payments (quote_id, amount, status, due_date, paid_at)
    VALUES (?, ?, ?, ?, ?)`,
    [quote_id, amount, status, due_date, paid_at],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    });
});

// ========== AGENT REQUESTS ==========
app.get('/agent-requests', (req, res) => {
  db.all('SELECT * FROM agent_requests ORDER BY timestamp DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/agent-requests', (req, res) => {
  const { agent_name, action, target_table, target_id, input_prompt, output, status } = req.body;
  db.run(`
    INSERT INTO agent_requests (agent_name, action, target_table, target_id, input_prompt, output, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [agent_name, action, target_table, target_id, input_prompt, output, status],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    });
});

// ========== USERS ==========
app.get('/users', (req, res) => {
  db.all('SELECT * FROM users ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/users', (req, res) => {
  const { name, email, role, api_key } = req.body;
  if (!name || !email || !role || !api_key) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.run(`
    INSERT INTO users (name, email, role, api_key)
    VALUES (?, ?, ?, ?)`,
    [name, email, role, api_key],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Email or API key already exists' });
        }
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID });
    });
});

app.delete('/users/:id', (req, res) => {
  db.run('DELETE FROM users WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  });
});

// 📂 Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ❌ 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found 😢' });
});

// 🚀 Start server
app.listen(process.env.PORT || 3000, () => {
  console.log(`🚀 AgentCRM running on port ${process.env.PORT || 3000}`);
});
