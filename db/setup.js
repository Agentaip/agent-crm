const Database = require('better-sqlite3');
const fs = require('fs');

// הגדר את הנתיב למסד הנתונים
const dbPath = './db/database.sqlite';

// התחברות למסד הנתונים
const db = new Database(dbPath);

// קריאת קובץ הסכימה
const schema = fs.readFileSync('./db/schema.sql', 'utf8');

try {
  // הרצת הסכמה
  db.exec(schema);
  console.log('✅ Database schema created successfully.');

  // הדפסת שמות הטבלאות
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log("📋 Tables in database:");
  tables.forEach(row => console.log(" -", row.name));
} catch (err) {
  console.error('❌ Error:', err.message);
} finally {
  db.close();
}
