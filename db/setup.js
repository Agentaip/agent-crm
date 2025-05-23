const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const dbPath = './db/database.sqlite';
const db = new sqlite3.Database(dbPath);

// קרא את schema.sql
const schema = fs.readFileSync('./db/schema.sql', 'utf8');

// הרץ את הסכמה
db.exec(schema, (err) => {
  if (err) {
    console.error('❌ Error creating schema:', err.message);
  } else {
    console.log('✅ Database schema created successfully.');
    // הדפס את כל הטבלאות הקיימות כדי לוודא
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows) => {
      if (err) {
        console.error("❌ Failed to list tables:", err.message);
      } else {
        console.log("📋 Tables in database:");
        rows.forEach(row => console.log(" -", row.name));
      }
      db.close();
    });
  }
});
