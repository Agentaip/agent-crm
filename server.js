const express = require('express');
const Database = require('better-sqlite3');
const dotenv = require('dotenv');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const auth = require('./auth');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 📂 יצירת תיקיית קבצים אם לא קיימת
const uploadDir = './uploads/quotes';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + file.originalname;
    cb(null, unique);
  }
});
const upload = multer({ storage });

// 📦 חיבור למסד הנתונים
const db = new Database('./db/database.sqlite');
console.log('✅ Connected to SQLite (better-sqlite3)');

// ✅ Middleware להרשאות – מאפשר גישה חופשית רק ל־GET /status ו־POST /users
app.use((req, res, next) => {
  const isStatus = req.originalUrl.includes('/status');
  const isUserPost = req.originalUrl.includes('/users') && req.method === 'POST';
  if (isStatus || isUserPost) return next();
  auth(req, res, next);
});

// 🩺 בדיקת חיות
app.get('/status', (req, res) => {
  res.json({ status: 'CRM server is running 👌' });
});

// === CONTACTS ===
app.get('/contacts', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM contacts').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/contacts/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Contact not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/contacts', (req, res) => {
  try {
    const { full_name, phone, email, status, notes } = req.body;
    const info = db.prepare(`
      INSERT INTO contacts (full_name, phone, email, status, notes)
      VALUES (?, ?, ?, ?, ?)
    `).run(full_name, phone, email, status, notes);
    res.status(201).json({ id: info.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === LEADS ===
app.get('/leads', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM leads').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/leads', (req, res) => {
  try {
    const { title, description, contact_id, channel, funnel_stage, status } = req.body;
    const info = db.prepare(`
      INSERT INTO leads (title, description, contact_id, channel, funnel_stage, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(title, description, contact_id, channel, funnel_stage, status);
    res.status(201).json({ id: info.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === TASKS ===
app.get('/tasks', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM tasks').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/tasks', (req, res) => {
  try {
    const { title, description, status, due_date, related_to, related_id } = req.body;
    const info = db.prepare(`
      INSERT INTO tasks (title, description, status, due_date, related_to, related_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(title, description, status, due_date, related_to, related_id);
    res.status(201).json({ id: info.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === MEETINGS ===
app.get('/meetings', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM meetings').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/meetings', (req, res) => {
  try {
    const { contact_id, title, datetime, location, status } = req.body;
    const info = db.prepare(`
      INSERT INTO meetings (contact_id, title, datetime, location, status)
      VALUES (?, ?, ?, ?, ?)
    `).run(contact_id, title, datetime, location, status);
    res.status(201).json({ id: info.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === QUOTES ===
app.get('/quotes', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM quotes').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/quotes', upload.single('file'), (req, res) => {
  try {
    const { contact_id, amount, status } = req.body;
    const file_url = req.file ? `/uploads/quotes/${req.file.filename}` : null;
    const info = db.prepare(`
      INSERT INTO quotes (contact_id, amount, status, file_url)
      VALUES (?, ?, ?, ?)
    `).run(contact_id, amount, status, file_url);
    res.status(201).json({ id: info.lastInsertRowid, file_url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === PAYMENTS ===
app.get('/payments', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM payments').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/payments', (req, res) => {
  try {
    const { quote_id, amount, status, due_date, paid_at } = req.body;
    const info = db.prepare(`
      INSERT INTO payments (quote_id, amount, status, due_date, paid_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(quote_id, amount, status, due_date, paid_at);
    res.status(201).json({ id: info.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === AGENT REQUESTS ===
app.get('/agent-requests', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM agent_requests ORDER BY timestamp DESC').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/agent-requests', (req, res) => {
  try {
    const { agent_name, action, target_table, target_id, input_prompt, output, status } = req.body;
    const info = db.prepare(`
      INSERT INTO agent_requests (agent_name, action, target_table, target_id, input_prompt, output, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(agent_name, action, target_table, target_id, input_prompt, output, status);
    res.status(201).json({ id: info.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === USERS ===
app.get('/users', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM users ORDER BY id DESC').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/users', (req, res) => {
  try {
    const { name, email, role, api_key } = req.body;
    if (!name || !email || !role || !api_key) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const info = db.prepare(`
      INSERT INTO users (name, email, role, api_key)
      VALUES (?, ?, ?, ?)
    `).run(name, email, role, api_key);
    res.status(201).json({ id: info.lastInsertRowid });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Email or API key already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

app.delete('/users/:id', (req, res) => {
  try {
    const info = db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
    if (info.changes === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// קבצים סטטיים ו־404
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found 😢' });
});

// 🚀 הפעלת השרת
app.listen(process.env.PORT || 3000, () => {
  console.log(`🚀 AgentCRM running on port ${process.env.PORT || 3000}`);
});
