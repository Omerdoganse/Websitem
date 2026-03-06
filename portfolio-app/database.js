const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

// Connect to SQLite database
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        
        // Define and execute schema creation queries
        db.serialize(() => {
            // Users table (Admin)
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE,
                password_hash TEXT
            )`, (err) => {
                if (!err) {
                    // Seed initial admin user if not exists
                    seedAdmin();
                }
            });

            // About table
            db.run(`CREATE TABLE IF NOT EXISTS about (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content TEXT
            )`);

            // Skills table
            db.run(`CREATE TABLE IF NOT EXISTS skills (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                icon TEXT
            )`);

            // Projects table
            db.run(`CREATE TABLE IF NOT EXISTS projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT,
                description TEXT,
                image_url TEXT,
                link TEXT
            )`);

            // Messages table
            db.run(`CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                email TEXT,
                message TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);
        });
    }
});

function seedAdmin() {
    db.get("SELECT id FROM users WHERE username = ?", ["admin"], (err, row) => {
        if (!err && !row) {
            const saltRounds = 10;
            const defaultPassword = 'admin'; // For demo only! Needs changing in a real app.
            bcrypt.hash(defaultPassword, saltRounds, (err, hash) => {
                if (!err) {
                    db.run("INSERT INTO users (username, password_hash) VALUES (?, ?)", ["admin", hash], (err) => {
                        if (err) console.error("Error seeding admin:", err.message);
                        else console.log("Default admin created (username: admin, password: admin)");
                    });
                }
            });
        }
    });

    // Seed empty about content if missing
    db.get("SELECT id FROM about", [], (err, row) => {
        if (!err && !row) {
            db.run("INSERT INTO about (content) VALUES (?)", ["I am a Full-Stack Developer... Edit me from the Admin Panel!"]);
        }
    });
}

module.exports = db;
