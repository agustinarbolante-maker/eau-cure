const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'water_station.db');

let db;

const COMPANIES = [
  'HRD', 'HRD Canteen', 'I-Cube', 'Exterior', 'I-Cube 1st Floor Pantry',
  'HRD Logistics', 'DHR', 'DHR Logistics', 'Majestic', 'Majestic Energy Corp.',
  'Batching', 'CFD', 'CEZ 2', 'HTI', 'SCAD 5th Factory', 'SCAD', 'PV Tech',
  'WUKONG Expansion', 'Wukong 4th factory', 'Wukong Plastic Moulding',
  'Wukong Prep 4.0', 'Wukong Sawmill', 'Wukong CEZ 2 Warehouse Majestic',
  'Wukong Steel Majestic', 'MEC', 'Castem', 'Itabashi', 'S&S Phils',
  'Seintogether', 'Danam', 'Danam Canteen', 'Danam T', 'Danam Warehouse',
  'Wyntron', 'Wyntron Canteen', 'Wyntron Warehouse', 'Wyntron Stafhouse',
  'PVi', 'PVI Canteen', 'DKP', 'DKP Canteen', 'Dyna', 'Santech Neomax 1',
  'Santech Neomax 2', 'Santech Thermal', 'Santech Admin', 'Santech STAP',
  'Santech STAA', 'YKY', 'NX Logistics', 'YM Tech', 'Arkray', 'EN',
  'Warehouse Management', 'RCBC', 'GOLDRICH'
];

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
          if (err) {
            reject(err);
          } else {
            resolve();
          }
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

function getCompanies() {
  return COMPANIES;
}

module.exports = {
  initDB,
  getAllDeliveries,
  addDelivery,
  updateDelivery,
  deleteDelivery,
  getCompanies
};
