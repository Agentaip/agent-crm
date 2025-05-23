// auth.js
const sqlite3 = require('sqlite3').verbose();

// ⬅️ התחברות למסד הנתונים שבתיקיית db
const db = new sqlite3.Database('./db/database.sqlite');

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  const token = authHeader.split(' ')[1]; // לדוגמה: Bearer abc123

  db.get('SELECT * FROM users WHERE api_key = ?', [token], (err, user) => {
    if (err) {
      console.error('Database error:', err.message); // לוג שגיאה שימושי
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(403).json({ error: 'Invalid API Key' });
    }

    req.user = user; // שומר את המשתמש לזיהוי ברוטים אחרים
    next();
  });
}

module.exports = authMiddleware;
