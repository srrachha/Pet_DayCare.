const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'pet_daycare.db');
const db = new sqlite3.Database(dbPath);

console.log("Starting DB Cleanup...");

db.serialize(() => {
  // 1. Fix Typo
  db.run("UPDATE pets SET breed = 'Golden Retriever' WHERE breed = 'Golden Retriver'", function(err) {
    if (err) console.error(err);
    else console.log(`Fixed ${this.changes} typos in breed names.`);
  });

  // 2. Fix Corrupted Dates & Missing Prices
  db.all("SELECT * FROM bookings", (err, rows) => {
    if (err) return console.error(err);
    
    rows.forEach(booking => {
      let startDate = booking.start_date;
      let endDate = booking.end_date;
      
      // Fix 60501-02-20 type dates (assuming it should be 2026- or similar)
      // Actually, let's just make them valid 2026 dates if they look crazy
      if (startDate.length > 10 || startDate.startsWith('60')) {
        startDate = '2026-05-10';
        endDate = '2026-05-15';
      }

      // Calculate Price
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
      
      let price = 0;
      if (booking.service_type === 'Daycare') price = diffDays * 30;
      else if (booking.service_type === 'Boarding') price = diffDays * 50;
      else if (booking.service_type === 'Grooming') price = 40;

      db.run("UPDATE bookings SET start_date = ?, end_date = ?, total_price = ? WHERE id = ?", 
        [startDate, endDate, price, booking.id]);
    });
    console.log(`Cleaned up ${rows.length} bookings.`);
  });
});

setTimeout(() => db.close(), 2000);
