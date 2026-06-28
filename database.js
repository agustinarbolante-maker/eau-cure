const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'water_station.db');

let db;

function initDB() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        reject(err);
      } else {
        db.run(`
          CREATE TABLE IF NOT EXISTS deliveries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company TEXT NOT NULL,
            bottles_delivered INTEGER NOT NULL,
            bottles_returned INTEGER NOT NULL,
            dr_number TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `, (err) => {
          if (err) reject(err);
          else resolve();
        });
      }
    });
  });
}

function getAllDeliveries() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM deliveries ORDER BY timestamp DESC', (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

function addDelivery(company, bottlesDelivered, bottlesReturned, drNumber) {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO deliveries (company, bottles_delivered, bottles_returned, dr_number) VALUES (?, ?, ?, ?)',
      [company, bottlesDelivered, bottlesReturned, drNumber],
      function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
}

function updateDelivery(id, company, bottlesDelivered, bottlesReturned, drNumber) {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE deliveries SET company = ?, bottles_delivered = ?, bottles_returned = ?, dr_number = ? WHERE id = ?',
      [company, bottlesDelivered, bottlesReturned, drNumber, id],
      function(err) {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

function deleteDelivery(id) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM deliveries WHERE id = ?', [id], function(err) {
      if (err) reject(err);
      else resolve();
    });
  });
}

module.exports = {
  initDB,
  getAllDeliveries,
  addDelivery,
  updateDelivery,
  deleteDelivery
};
