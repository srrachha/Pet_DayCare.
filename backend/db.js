const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'pet_daycare.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('admin', 'user')) NOT NULL
    )`);

    // Pets table
    db.run(`CREATE TABLE IF NOT EXISTS pets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      owner_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      breed TEXT,
      age INTEGER,
      special_instructions TEXT,
      vaccination_status TEXT DEFAULT 'Missing',
      vaccination_expiry TEXT,
      FOREIGN KEY (owner_id) REFERENCES users (id)
    )`);

    // Check if vaccination columns exist, if not add them (for existing dbs)
    db.all(`PRAGMA table_info(pets)`, (err, rows) => {
      const columns = rows.map(r => r.name);
      if (!columns.includes('vaccination_status')) {
        db.run(`ALTER TABLE pets ADD COLUMN vaccination_status TEXT DEFAULT 'Missing'`);
      }
      if (!columns.includes('vaccination_expiry')) {
        db.run(`ALTER TABLE pets ADD COLUMN vaccination_expiry TEXT`);
      }
    });

    // Bookings table
    db.run(`CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pet_id INTEGER NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      status TEXT CHECK(status IN ('pending', 'confirmed', 'cancelled', 'completed')) DEFAULT 'pending',
      service_type TEXT DEFAULT 'Daycare',
      total_price REAL,
      FOREIGN KEY (pet_id) REFERENCES pets (id)
    )`);

    // Check if service_type column exists
    db.all(`PRAGMA table_info(bookings)`, (err, rows) => {
      const columns = rows.map(r => r.name);
      if (!columns.includes('service_type')) {
        db.run(`ALTER TABLE bookings ADD COLUMN service_type TEXT DEFAULT 'Daycare'`);
      }
    });

    // Pet Status table (Real-time updates)
    db.run(`CREATE TABLE IF NOT EXISTS pet_status (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER NOT NULL,
      status_update TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (booking_id) REFERENCES bookings (id)
    )`);

    // Payments table
    db.run(`CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      status TEXT CHECK(status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
      stripe_payment_intent_id TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (booking_id) REFERENCES bookings (id)
    )`);

    // Messages table
    db.run(`CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      receiver_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users (id),
      FOREIGN KEY (receiver_id) REFERENCES users (id)
    )`);

    // Reviews table
    db.run(`CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER NOT NULL,
      rating INTEGER CHECK(rating >= 1 AND rating <= 5) NOT NULL,
      comment TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (booking_id) REFERENCES bookings (id)
    )`);
  });
}

module.exports = db;
