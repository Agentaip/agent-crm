// auth.js – גרסה עם better-sqlite3
const Database = require('better-sqlite3');

// ⬅️ התחברות למסד הנתונים שבתיקיית db
const db = new Database('./db/database.sqlite');

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  const token = authHeader.split(' ')[1]; // לדוגמה: Bearer abc123

  try {
    const stmt = db.prepare('SELECT * FROM users WHERE api_key = ?');
    const user = stmt.get(token);

    if (!user) {
      return res.status(403).json({ error: 'Invalid API Key' });
    }

    req.user = user; // שומר את המשתמש לזיהוי ברוטים אחרים
    next();
  } catch (err) {
    console.error('❌ Database error:', err.message);
    return res.status(500).json({ error: 'Database error' });
  }
}

module.exports = authMiddleware;
