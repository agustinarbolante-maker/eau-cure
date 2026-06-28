const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'data', 'water_station.db');
const BACKUP_DIR = path.join(__dirname, 'data', 'backups');
const BACKUP_RETENTION_DAYS = 30;

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

function getDeliveriesByFilters(company, startDate, endDate) {
  return new Promise((resolve, reject) => {
    let query = 'SELECT * FROM deliveries WHERE 1=1';
    const params = [];

    if (company && company.trim()) {
      query += ' AND company = ?';
      params.push(company);
    }

    if (startDate) {
      query += ' AND timestamp >= ?';
      params.push(startDate + 'T00:00:00');
    }

    if (endDate) {
      query += ' AND timestamp <= ?';
      params.push(endDate + 'T23:59:59');
    }

    query += ' ORDER BY timestamp DESC';

    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

function getStats(startDate, endDate) {
  return new Promise((resolve, reject) => {
    let query = 'SELECT COUNT(*) as total_deliveries, SUM(bottles_delivered) as total_delivered, SUM(bottles_returned) as total_returned FROM deliveries WHERE 1=1';
    const params = [];

    if (startDate) {
      query += ' AND timestamp >= ?';
      params.push(startDate + 'T00:00:00');
    }

    if (endDate) {
      query += ' AND timestamp <= ?';
      params.push(endDate + 'T23:59:59');
    }

    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function getCompanyStats(startDate, endDate) {
  return new Promise((resolve, reject) => {
    let query = `
      SELECT company, COUNT(*) as delivery_count,
             SUM(bottles_delivered) as total_delivered,
             SUM(bottles_returned) as total_returned
      FROM deliveries
      WHERE 1=1
    `;
    const params = [];

    if (startDate) {
      query += ' AND timestamp >= ?';
      params.push(startDate + 'T00:00:00');
    }

    if (endDate) {
      query += ' AND timestamp <= ?';
      params.push(endDate + 'T23:59:59');
    }

    query += ' GROUP BY company ORDER BY delivery_count DESC';

    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

function createBackupDirectory() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

function performBackup() {
  return new Promise((resolve, reject) => {
    try {
      createBackupDirectory();

      if (!fs.existsSync(DB_PATH)) {
        resolve({ success: false, message: 'Database file not found' });
        return;
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const backupFilename = `backup_${timestamp}.db`;
      const backupPath = path.join(BACKUP_DIR, backupFilename);

      fs.copyFileSync(DB_PATH, backupPath);
      cleanOldBackups();

      console.log(`Backup created: ${backupFilename}`);
      resolve({ success: true, filename: backupFilename, timestamp });
    } catch (err) {
      reject(err);
    }
  });
}

function cleanOldBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR);
    const now = Date.now();
    const maxAge = BACKUP_RETENTION_DAYS * 24 * 60 * 60 * 1000;

    files.forEach(file => {
      const filePath = path.join(BACKUP_DIR, file);
      const stat = fs.statSync(filePath);
      const age = now - stat.mtime.getTime();

      if (age > maxAge) {
        fs.unlinkSync(filePath);
        console.log(`Deleted old backup: ${file}`);
      }
    });
  } catch (err) {
    console.error('Error cleaning old backups:', err);
  }
}

function listBackups() {
  return new Promise((resolve, reject) => {
    try {
      createBackupDirectory();
      const files = fs.readdirSync(BACKUP_DIR);
      const backups = files
        .filter(f => f.startsWith('backup_') && f.endsWith('.db'))
        .map(f => {
          const filePath = path.join(BACKUP_DIR, f);
          const stat = fs.statSync(filePath);
          return {
            filename: f,
            created: stat.mtime.toISOString(),
            size: stat.size
          };
        })
        .sort((a, b) => new Date(b.created) - new Date(a.created));

      resolve(backups);
    } catch (err) {
      reject(err);
    }
  });
}

function restoreBackup(backupFilename) {
  return new Promise((resolve, reject) => {
    try {
      const backupPath = path.join(BACKUP_DIR, backupFilename);

      if (!fs.existsSync(backupPath)) {
        throw new Error('Backup file not found');
      }

      if (!backupFilename.startsWith('backup_') || !backupFilename.endsWith('.db')) {
        throw new Error('Invalid backup filename');
      }

      fs.copyFileSync(backupPath, DB_PATH);
      console.log(`Database restored from: ${backupFilename}`);
      resolve({ success: true, message: 'Database restored successfully' });
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  initDB,
  getAllDeliveries,
  addDelivery,
  updateDelivery,
  deleteDelivery,
  getCompanies,
  getDeliveriesByFilters,
  getStats,
  getCompanyStats,
  performBackup,
  listBackups,
  restoreBackup
};
