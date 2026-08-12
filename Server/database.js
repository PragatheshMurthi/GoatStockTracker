const sqlite3 = require('sqlite3').verbose();

// Create and connect to a persistent local file-based database
const db = new sqlite3.Database('./local.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the local SQLite database.');
        
        // Initialize the expenses table matching your data columns
        db.run(`CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            amount REAL NOT NULL,
            date TEXT NOT NULL,
            description TEXT,
            attachment_data BLOB,
            attachment_name TEXT,
            attachment_type TEXT
        )`, (tableErr) => {
            if (tableErr) {
                console.error('Error creating table:', tableErr.message);
            } else {
                console.log('Expenses table ready.');
            }
        });
    }
});

module.exports = db;
