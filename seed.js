const Database = require('better-sqlite3');

// התחברות למסד הנתונים
const db = new Database('./db/database.sqlite');

try {
  const stmt = db.prepare(`
    INSERT INTO users (name, email, role, api_key)
    VALUES (?, ?, ?, ?)
  `);

  stmt.run('Admin', 'admin@agentcrm.com', 'admin', 'my-secret-key');

  console.log('✅ Admin user inserted!');
} catch (err) {
  if (err.message.includes('UNIQUE')) {
    console.error('⚠️ User already exists.');
  } else {
    console.error('❌ Error inserting user:', err.message);
  }
} finally {
  db.close();
}
