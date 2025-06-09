// server.js – גרסה עם better-sqlite3
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const auth = require('./auth');
const Database = require('better-sqlite3');

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

// פונקציות עזר לשאילתות
const runQuery = (query, params = []) => db.prepare(query).run(...params);
const getQuery = (query, params = []) => db.prepare(query).get(...params);
const allQuery = (query, params = []) => db.prepare(query).all(...params);

// ✅ Middleware להרשאות – מאפשר גישה חופשית רק ל־GET /status ו־POST /users
app.use((req, res, next) => {
  console.log('➡️ Incoming request:', req.method, req.path); // 💥
  const isStatus = req.method === 'GET' && req.path === '/status';
  const isUserPost = req.method === 'POST' && req.path.startsWith('/users');
  if (isStatus || isUserPost) return next();
  auth(req, res, next);
});



// 🩺 בדיקת חיות
app.get('/status', (req, res) => {
  res.json({ status: 'CRM server is running 👌' });
});


// === CONTACTS ===
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

// === LEADS ===
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

// === TASKS ===
app.get('/tasks', (req, res) => {
  db.all('SELECT * FROM tasks ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/tasks', (req, res) => {
  const {
    title,
    description,
    type,
    assigned_to,
    due_date,
    status,
    priority,
    related_to,
    related_id,
    notes
  } = req.body;

  const now = new Date().toISOString();

  db.run(`
    INSERT INTO tasks (
      title, description, type, assigned_to, due_date,
      status, priority, related_to, related_id, created_at, updated_at, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
    [
      title, description, type, assigned_to, due_date,
      status, priority, related_to, related_id, now, now, notes
    ],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    }
  );
});

// === MEETINGS ===
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

// === QUOTES ===
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

// === PAYMENTS (updated) ===
app.get('/payments', (req, res) => {
  db.all('SELECT * FROM payments ORDER BY due_date ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/payments', (req, res) => {
  const {
    quote_id,
    amount,
    status,
    due_date,
    paid_at,
    invoice_link,
    reminder_count = 0,
    last_reminder_at,
    client_email,
    notes
  } = req.body;

  db.run(`
    INSERT INTO payments (
      quote_id, amount, status, due_date, paid_at,
      invoice_link, reminder_count, last_reminder_at,
      client_email, notes
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
    [
      quote_id,
      amount,
      status,
      due_date,
      paid_at,
      invoice_link,
      reminder_count,
      last_reminder_at,
      client_email,
      notes
    ],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    }
  );
});

// === AGENT REQUESTS ===
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

// === USERS ===
app.get('/users', (req, res) => {
  db.all('SELECT * FROM users ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/users', (req, res) => {
  console.log("📥 POST /users called");

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

      console.log("✅ New user inserted with id:", this.lastID); // ⬅️ זו התוספת העיקרית
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

// ... כל ההגדרות שהיו קודם (imports, config וכו') נשארו כמו שהיו

// === FREELANCERS ===
app.get('/freelancers', (req, res) => {
  db.all('SELECT * FROM freelancers ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/freelancers', (req, res) => {
  const {
    name,
    skill,
    contact_email,
    whatsapp,
    is_available,
    current_load,
    rating,
    notes
  } = req.body;

  db.run(`
    INSERT INTO freelancers (
      name, skill, contact_email, whatsapp,
      is_available, current_load, rating, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `,
    [
      name,
      skill,
      contact_email,
      whatsapp,
      is_available ?? 1,
      current_load ?? 0,
      rating ?? 0,
      notes
    ],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    });
});
// === PROJECTS ===
app.get('/projects', (req, res) => {
  db.all('SELECT * FROM projects ORDER BY start_date DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    // פריסת שדה tags מ־string לרשימה
    const parsed = rows.map(p => ({
      ...p,
      tags: p.tags ? JSON.parse(p.tags) : []
    }));
    res.json(parsed);
  });
});

app.post('/projects', (req, res) => {
  const {
    contact_id,
    title,
    description,
    status,
    stage,
    current_agent,
    next_action,
    start_date,
    last_update,
    full_spec,
    admin_notes,
    tags
  } = req.body;

  db.run(`
    INSERT INTO projects (
      contact_id, title, description, status, stage,
      current_agent, next_action, start_date, last_update,
      full_spec, admin_notes, tags
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
    [
      contact_id,
      title,
      description,
      status || 'new',
      stage || 'intake',
      current_agent,
      next_action,
      start_date || new Date().toISOString(),
      last_update || new Date().toISOString(),
      full_spec,
      admin_notes,
      JSON.stringify(tags || [])
    ],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    });
});
// === PROJECT ASSIGNMENTS ===
app.get('/project-assignments', (req, res) => {
  db.all(`
    SELECT * FROM project_assignments
    ORDER BY assigned_at DESC
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/project-assignments', (req, res) => {
  const {
    project_id,
    freelancer_id,
    assigned_at,
    due_date,
    status,
    delivery_link,
    notes
  } = req.body;

  db.run(`
    INSERT INTO project_assignments (
      project_id, freelancer_id, assigned_at, due_date,
      status, delivery_link, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `,
    [
      project_id,
      freelancer_id,
      assigned_at || new Date().toISOString(),
      due_date,
      status || 'assigned',
      delivery_link,
      notes
    ],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    });
});

app.put('/project-assignments/:id', (req, res) => {
  const {
    project_id,
    freelancer_id,
    assigned_at,
    due_date,
    status,
    delivery_link,
    notes
  } = req.body;

  db.run(`
    UPDATE project_assignments SET
      project_id = ?, freelancer_id = ?, assigned_at = ?,
      due_date = ?, status = ?, delivery_link = ?, notes = ?
    WHERE id = ?
  `,
    [
      project_id,
      freelancer_id,
      assigned_at,
      due_date,
      status,
      delivery_link,
      notes,
      req.params.id
    ],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Assignment not found' });
      res.json({ message: 'Assignment updated successfully' });
    });
});

app.delete('/project-assignments/:id', (req, res) => {
  db.run(`DELETE FROM project_assignments WHERE id = ?`, [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Assignment not found' });
    res.json({ message: 'Assignment deleted successfully' });
  });
});
// === QA REVIEWS ===
app.get('/qa-reviews', (req, res) => {
  db.all('SELECT * FROM qa_reviews ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/qa-reviews', (req, res) => {
  const {
    project_id,
    reviewer,
    status,
    notes,
    approved_at
  } = req.body;

  db.run(`
    INSERT INTO qa_reviews (
      project_id, reviewer, status, notes, approved_at
    ) VALUES (?, ?, ?, ?, ?)
  `,
    [project_id, reviewer, status, notes, approved_at],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    });
});

app.put('/qa-reviews/:id', (req, res) => {
  const {
    project_id,
    reviewer,
    status,
    notes,
    approved_at
  } = req.body;

  db.run(`
    UPDATE qa_reviews SET
      project_id = ?, reviewer = ?, status = ?, notes = ?, approved_at = ?
    WHERE id = ?
  `,
    [project_id, reviewer, status, notes, approved_at, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'QA Review not found' });
      res.json({ message: 'QA review updated successfully' });
    });
});

app.delete('/qa-reviews/:id', (req, res) => {
  db.run('DELETE FROM qa_reviews WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'QA Review not found' });
    res.json({ message: 'QA review deleted successfully' });
  });
});
// === DELIVERIES ===
app.get('/deliveries', (req, res) => {
  db.all('SELECT * FROM deliveries ORDER BY delivered_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/deliveries', (req, res) => {
  const {
    project_id,
    delivery_link,
    delivered_at,
    delivered_by,
    followup_status,
    feedback,
    notes
  } = req.body;

  db.run(`
    INSERT INTO deliveries (
      project_id, delivery_link, delivered_at, delivered_by,
      followup_status, feedback, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `,
    [
      project_id,
      delivery_link,
      delivered_at || new Date().toISOString(),
      delivered_by,
      followup_status,
      feedback,
      notes
    ],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    });
});

app.put('/deliveries/:id', (req, res) => {
  const {
    project_id,
    delivery_link,
    delivered_at,
    delivered_by,
    followup_status,
    feedback,
    notes
  } = req.body;

  db.run(`
    UPDATE deliveries SET
      project_id = ?, delivery_link = ?, delivered_at = ?, delivered_by = ?,
      followup_status = ?, feedback = ?, notes = ?
    WHERE id = ?
  `,
    [
      project_id,
      delivery_link,
      delivered_at,
      delivered_by,
      followup_status,
      feedback,
      notes,
      req.params.id
    ],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Delivery not found' });
      res.json({ message: 'Delivery updated successfully' });
    });
});

app.delete('/deliveries/:id', (req, res) => {
  db.run('DELETE FROM deliveries WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Delivery not found' });
    res.json({ message: 'Delivery deleted successfully' });
  });
});
// === SUPPORT ARTICLES ===
app.get('/support-articles', (req, res) => {
  db.all('SELECT * FROM support_articles ORDER BY last_updated DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/support-articles', (req, res) => {
  const {
    question_keywords,
    answer_text,
    related_agent,
    category,
    media_link,
    last_updated,
    times_used
  } = req.body;

  db.run(`
    INSERT INTO support_articles (
      question_keywords, answer_text, related_agent, category,
      media_link, last_updated, times_used
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `,
    [
      question_keywords,
      answer_text,
      related_agent,
      category,
      media_link,
      last_updated || new Date().toISOString(),
      times_used ?? 0
    ],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    });
});

app.put('/support-articles/:id', (req, res) => {
  const {
    question_keywords,
    answer_text,
    related_agent,
    category,
    media_link,
    last_updated,
    times_used
  } = req.body;

  db.run(`
    UPDATE support_articles SET
      question_keywords = ?, answer_text = ?, related_agent = ?, category = ?,
      media_link = ?, last_updated = ?, times_used = ?
    WHERE id = ?
  `,
    [
      question_keywords,
      answer_text,
      related_agent,
      category,
      media_link,
      last_updated || new Date().toISOString(),
      times_used ?? 0,
      req.params.id
    ],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Support article not found' });
      res.json({ message: 'Support article updated successfully' });
    });
});

app.delete('/support-articles/:id', (req, res) => {
  db.run('DELETE FROM support_articles WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Support article not found' });
    res.json({ message: 'Support article deleted successfully' });
  });
});
// === GROWTH OPPORTUNITIES ===
app.get('/growth-opportunities', (req, res) => {
  db.all('SELECT * FROM growth_opportunities ORDER BY response_date DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/growth-opportunities', (req, res) => {
  const {
    client_id,
    project_id,
    suggested_offer,
    status,
    response_date,
    next_step,
    sent_by,
    notes
  } = req.body;

  db.run(`
    INSERT INTO growth_opportunities (
      client_id, project_id, suggested_offer, status,
      response_date, next_step, sent_by, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `,
    [
      client_id,
      project_id,
      suggested_offer,
      status || 'sent',
      response_date,
      next_step,
      sent_by,
      notes
    ],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    });
});

app.put('/growth-opportunities/:id', (req, res) => {
  const {
    client_id,
    project_id,
    suggested_offer,
    status,
    response_date,
    next_step,
    sent_by,
    notes
  } = req.body;

  db.run(`
    UPDATE growth_opportunities SET
      client_id = ?, project_id = ?, suggested_offer = ?, status = ?,
      response_date = ?, next_step = ?, sent_by = ?, notes = ?
    WHERE id = ?
  `,
    [
      client_id,
      project_id,
      suggested_offer,
      status,
      response_date,
      next_step,
      sent_by,
      notes,
      req.params.id
    ],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Growth opportunity not found' });
      res.json({ message: 'Growth opportunity updated successfully' });
    });
});

app.delete('/growth-opportunities/:id', (req, res) => {
  db.run('DELETE FROM growth_opportunities WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Growth opportunity not found' });
    res.json({ message: 'Growth opportunity deleted successfully' });
  });
});
// === MARKETING INSIGHTS ===
app.get('/marketing-insights', (req, res) => {
  db.all('SELECT * FROM marketing_insights ORDER BY date DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/marketing-insights', (req, res) => {
  const {
    date,
    client_segment,
    insight_type,
    insight_text,
    source_type,
    source_id,
    impact_score,
    recommendation,
    used_in_strategy,
    used_by_agent,
    notes
  } = req.body;

  db.run(`
    INSERT INTO marketing_insights (
      date, client_segment, insight_type, insight_text,
      source_type, source_id, impact_score, recommendation,
      used_in_strategy, used_by_agent, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
    [
      date || new Date().toISOString(),
      client_segment,
      insight_type,
      insight_text,
      source_type,
      source_id,
      impact_score,
      recommendation,
      used_in_strategy ?? 0,
      used_by_agent,
      notes
    ],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    });
});
// === SYSTEM CHANGES ===
app.get('/system-changes', (req, res) => {
  db.all('SELECT * FROM system_changes ORDER BY updated_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/system-changes', (req, res) => {
  const {
    reason,
    affected_agents,
    proposed_structure,
    impact_risks,
    testing_plan,
    status,
    approved_by,
    version
  } = req.body;

  const now = new Date().toISOString();

  db.run(`
    INSERT INTO system_changes (
      reason, affected_agents, proposed_structure, impact_risks, testing_plan,
      status, approved_by, version, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    reason,
    JSON.stringify(affected_agents ?? []),
    proposed_structure,
    impact_risks,
    testing_plan,
    status || 'draft',
    approved_by,
    version,
    now,
    now
  ], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID });
  });
});
// === CONTENT POSTS ===
app.get('/content-posts', (req, res) => {
  db.all('SELECT * FROM content_posts ORDER BY posted_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/content-posts', (req, res) => {
  const {
    platform,
    post_type,
    title,
    content_text,
    media_link,
    cta_text,
    posted_at,
    created_by,
    related_campaign_id,
    notes
  } = req.body;

  db.run(`
    INSERT INTO content_posts (
      platform, post_type, title, content_text,
      media_link, cta_text, posted_at,
      created_by, related_campaign_id, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
    [
      platform,
      post_type,
      title,
      content_text,
      media_link,
      cta_text,
      posted_at,
      created_by,
      related_campaign_id,
      notes
    ],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    });
});
// === CONTENT FEEDBACK ===
app.get('/content-feedback', (req, res) => {
  db.all('SELECT * FROM content_feedback ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/content-feedback', (req, res) => {
  const { post_id, client_id, feedback_text, rating, created_at } = req.body;

  db.run(`
    INSERT INTO content_feedback (
      post_id, client_id, feedback_text, rating, created_at
    ) VALUES (?, ?, ?, ?, ?)
  `,
    [
      post_id,
      client_id,
      feedback_text,
      rating,
      created_at || new Date().toISOString()
    ],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    }
  );
});

app.put('/content-feedback/:id', (req, res) => {
  const { post_id, client_id, feedback_text, rating, created_at } = req.body;

  db.run(`
    UPDATE content_feedback SET
      post_id = ?, client_id = ?, feedback_text = ?, rating = ?, created_at = ?
    WHERE id = ?
  `,
    [
      post_id,
      client_id,
      feedback_text,
      rating,
      created_at,
      req.params.id
    ],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Feedback not found' });
      res.json({ message: 'Feedback updated successfully' });
    }
  );
});

app.delete('/content-feedback/:id', (req, res) => {
  db.run('DELETE FROM content_feedback WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Feedback not found' });
    res.json({ message: 'Feedback deleted successfully' });
  });
});
// === CONTENT IDEAS ===
app.get('/content-ideas', (req, res) => {
  db.all('SELECT * FROM content_ideas ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/content-ideas', (req, res) => {
  const {
    idea_text,
    source,
    status = 'draft',
    intended_platform = 'all',
    created_by,
    used_in_post_id
  } = req.body;

  db.run(`
    INSERT INTO content_ideas (
      idea_text, source, status, intended_platform,
      created_by, used_in_post_id, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `,
    [
      idea_text,
      source,
      status,
      intended_platform,
      created_by,
      used_in_post_id,
      new Date().toISOString()
    ],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    }
  );
});

app.put('/content-ideas/:id', (req, res) => {
  const {
    idea_text,
    source,
    status,
    intended_platform,
    created_by,
    used_in_post_id,
    created_at
  } = req.body;

  db.run(`
    UPDATE content_ideas SET
      idea_text = ?, source = ?, status = ?, intended_platform = ?,
      created_by = ?, used_in_post_id = ?, created_at = ?
    WHERE id = ?
  `,
    [
      idea_text,
      source,
      status,
      intended_platform,
      created_by,
      used_in_post_id,
      created_at,
      req.params.id
    ],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Idea not found' });
      res.json({ message: 'Idea updated successfully' });
    }
  );
});

app.delete('/content-ideas/:id', (req, res) => {
  db.run('DELETE FROM content_ideas WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Idea not found' });
    res.json({ message: 'Idea deleted successfully' });
  });
});
// === MARKETING CAMPAIGNS ===
app.get('/marketing-campaigns', (req, res) => {
  db.all('SELECT * FROM marketing_campaigns ORDER BY start_date DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    // נפרוס את שדה התוצאות מ־JSON
    const parsed = rows.map(c => ({
      ...c,
      results_json: c.results_json ? JSON.parse(c.results_json) : {}
    }));
    res.json(parsed);
  });
});

app.post('/marketing-campaigns', (req, res) => {
  const {
    name,
    goal,
    platform,
    start_date,
    end_date,
    budget,
    status,
    owner_agent,
    summary,
    results_json
  } = req.body;

  db.run(`
    INSERT INTO marketing_campaigns (
      name, goal, platform, start_date, end_date,
      budget, status, owner_agent, summary, results_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
    [
      name,
      goal,
      platform,
      start_date,
      end_date,
      budget,
      status,
      owner_agent,
      summary,
      JSON.stringify(results_json || {})
    ],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    });
});

app.put('/marketing-campaigns/:id', (req, res) => {
  const {
    name,
    goal,
    platform,
    start_date,
    end_date,
    budget,
    status,
    owner_agent,
    summary,
    results_json
  } = req.body;

  db.run(`
    UPDATE marketing_campaigns SET
      name = ?, goal = ?, platform = ?, start_date = ?, end_date = ?,
      budget = ?, status = ?, owner_agent = ?, summary = ?, results_json = ?
    WHERE id = ?
  `,
    [
      name,
      goal,
      platform,
      start_date,
      end_date,
      budget,
      status,
      owner_agent,
      summary,
      JSON.stringify(results_json || {}),
      req.params.id
    ],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Campaign not found' });
      res.json({ message: 'Campaign updated successfully' });
    });
});

app.delete('/marketing-campaigns/:id', (req, res) => {
  db.run('DELETE FROM marketing_campaigns WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Campaign not found' });
    res.json({ message: 'Campaign deleted successfully' });
  });
});
// === PERSONA LIBRARY ===
app.get('/persona-library', (req, res) => {
  db.all('SELECT * FROM persona_library ORDER BY updated_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/persona-library', (req, res) => {
  const {
    name,
    pain_points,
    goals,
    triggers,
    tone,
    platforms,
    tags,
    updated_at = new Date().toISOString()
  } = req.body;

  db.run(`
    INSERT INTO persona_library (
      name, pain_points, goals, triggers, tone,
      platforms, tags, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `,
    [name, pain_points, goals, triggers, tone, platforms, tags, updated_at],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    });
});

// קישור בין פרסונות לקמפיינים
app.post('/campaigns/:campaignId/personas', (req, res) => {
  const { persona_ids } = req.body;
  const campaignId = req.params.campaignId;

  if (!Array.isArray(persona_ids)) {
    return res.status(400).json({ error: 'persona_ids must be an array' });
  }

  const stmt = db.prepare('INSERT OR IGNORE INTO marketing_campaigns_personas (campaign_id, persona_id) VALUES (?, ?)');

  for (const pid of persona_ids) {
    stmt.run([campaignId, pid]);
  }

  stmt.finalize(err => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Personas linked to campaign' });
  });
});

app.get('/campaigns/:campaignId/personas', (req, res) => {
  const campaignId = req.params.campaignId;
  db.all(`
    SELECT p.*
    FROM persona_library p
    JOIN marketing_campaigns_personas cp ON cp.persona_id = p.id
    WHERE cp.campaign_id = ?
  `, [campaignId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
// === TREND SCANNER LOGS ===
app.get('/trend-scanner-logs', (req, res) => {
  db.all('SELECT * FROM trend_scanner_logs ORDER BY date DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/trend-scanner-logs', (req, res) => {
  const {
    date,
    source,
    title,
    relevance_score,
    category,
    insight_text,
    used_in
  } = req.body;

  db.run(`
    INSERT INTO trend_scanner_logs (
      date, source, title, relevance_score,
      category, insight_text, used_in
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    date || new Date().toISOString(),
    source,
    title,
    relevance_score,
    category,
    insight_text,
    used_in
  ], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID });
  });
});

app.put('/trend-scanner-logs/:id', (req, res) => {
  const {
    date,
    source,
    title,
    relevance_score,
    category,
    insight_text,
    used_in
  } = req.body;

  db.run(`
    UPDATE trend_scanner_logs SET
      date = ?, source = ?, title = ?, relevance_score = ?,
      category = ?, insight_text = ?, used_in = ?
    WHERE id = ?
  `, [
    date,
    source,
    title,
    relevance_score,
    category,
    insight_text,
    used_in,
    req.params.id
  ], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Trend log not found' });
    res.json({ message: 'Trend log updated successfully' });
  });
});

app.delete('/trend-scanner-logs/:id', (req, res) => {
  db.run('DELETE FROM trend_scanner_logs WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Trend log not found' });
    res.json({ message: 'Trend log deleted successfully' });
  });
});
// === CAMPAIGN TESTS ===
app.get('/campaign-tests', (req, res) => {
  db.all(`
    SELECT ct.*, mc.name AS campaign_name
    FROM campaign_tests ct
    LEFT JOIN marketing_campaigns mc ON ct.campaign_id = mc.id
    ORDER BY tested_at DESC
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/campaign-tests', (req, res) => {
  const {
    campaign_id,
    test_type,
    version_a,
    version_b,
    result,
    tested_at,
    notes
  } = req.body;

  db.run(`
    INSERT INTO campaign_tests (
      campaign_id, test_type, version_a, version_b, result, tested_at, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    campaign_id,
    test_type,
    version_a,
    version_b,
    result,
    tested_at,
    notes
  ], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID });
  });
});

app.put('/campaign-tests/:id', (req, res) => {
  const {
    campaign_id,
    test_type,
    version_a,
    version_b,
    result,
    tested_at,
    notes
  } = req.body;

  db.run(`
    UPDATE campaign_tests SET
      campaign_id = ?, test_type = ?, version_a = ?, version_b = ?,
      result = ?, tested_at = ?, notes = ?
    WHERE id = ?
  `, [
    campaign_id,
    test_type,
    version_a,
    version_b,
    result,
    tested_at,
    notes,
    req.params.id
  ], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Test not found' });
    res.json({ message: 'Test updated successfully' });
  });
});

app.delete('/campaign-tests/:id', (req, res) => {
  db.run('DELETE FROM campaign_tests WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Test not found' });
    res.json({ message: 'Test deleted successfully' });
  });
});
// === CONTENT REMIXES ===
app.get('/content-remixes', (req, res) => {
  db.all(`
    SELECT cr.*, cp.title AS source_post_title
    FROM content_remixes cr
    LEFT JOIN content_posts cp ON cr.source_post_id = cp.id
    ORDER BY cr.created_at DESC
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/content-remixes', (req, res) => {
  const {
    source_post_id,
    platform,
    remix_type,
    title,
    content_text,
    media_link,
    created_at,
    notes
  } = req.body;

  db.run(`
    INSERT INTO content_remixes (
      source_post_id, platform, remix_type, title,
      content_text, media_link, created_at, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    source_post_id,
    platform,
    remix_type,
    title,
    content_text,
    media_link,
    created_at || new Date().toISOString(),
    notes
  ], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID });
  });
});

app.put('/content-remixes/:id', (req, res) => {
  const {
    source_post_id,
    platform,
    remix_type,
    title,
    content_text,
    media_link,
    created_at,
    notes
  } = req.body;

  db.run(`
    UPDATE content_remixes SET
      source_post_id = ?, platform = ?, remix_type = ?, title = ?,
      content_text = ?, media_link = ?, created_at = ?, notes = ?
    WHERE id = ?
  `, [
    source_post_id,
    platform,
    remix_type,
    title,
    content_text,
    media_link,
    created_at,
    notes,
    req.params.id
  ], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Remix not found' });
    res.json({ message: 'Remix updated successfully' });
  });
});

app.delete('/content-remixes/:id', (req, res) => {
  db.run('DELETE FROM content_remixes WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Remix not found' });
    res.json({ message: 'Remix deleted successfully' });
  });
});
// === SUPPORT REQUESTS ===
app.get('/support-requests', (req, res) => {
  db.all(`
    SELECT sr.*, c.full_name AS client_name, p.title AS project_title
    FROM support_requests sr
    LEFT JOIN contacts c ON sr.client_id = c.id
    LEFT JOIN projects p ON sr.project_id = p.id
    ORDER BY sr.created_at DESC
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/support-requests', (req, res) => {
  const {
    client_id,
    project_id,
    message,
    type,
    emotion,
    status = 'new',
    handled_by
  } = req.body;

  const now = new Date().toISOString();

  db.run(`
    INSERT INTO support_requests (
      client_id, project_id, message, type,
      emotion, status, handled_by,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    client_id,
    project_id,
    message,
    type,
    emotion,
    status,
    handled_by,
    now,
    now
  ], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID });
  });
});

app.put('/support-requests/:id', (req, res) => {
  const {
    client_id,
    project_id,
    message,
    type,
    emotion,
    status,
    handled_by
  } = req.body;

  const now = new Date().toISOString();

  db.run(`
    UPDATE support_requests SET
      client_id = ?, project_id = ?, message = ?, type = ?,
      emotion = ?, status = ?, handled_by = ?, updated_at = ?
    WHERE id = ?
  `, [
    client_id,
    project_id,
    message,
    type,
    emotion,
    status,
    handled_by,
    now,
    req.params.id
  ], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Support request not found' });
    res.json({ message: 'Support request updated successfully' });
  });
});

app.delete('/support-requests/:id', (req, res) => {
  db.run('DELETE FROM support_requests WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Support request not found' });
    res.json({ message: 'Support request deleted successfully' });
  });
});

// קבצים סטטיים ו־404
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found 😢' });
});

// 🚀 הפעלת השרת
app.listen(process.env.PORT || 5000, () => {
  console.log(`🚀 AgentCRM running on port ${process.env.PORT || 5000}`);
});
