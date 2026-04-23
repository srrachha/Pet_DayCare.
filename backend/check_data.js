const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'pet_daycare.db');
const db = new sqlite3.Database(dbPath);

console.log("--- PETS ---");
db.all("SELECT * FROM pets", (err, rows) => {
  console.log(JSON.stringify(rows));
  console.log("--- BOOKINGS ---");
  db.all("SELECT * FROM bookings", (err, rows) => {
    console.log(JSON.stringify(rows));
    db.close();
  });
});
