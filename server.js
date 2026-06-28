const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/companies', (req, res) => {
  try {
    const companies = db.getCompanies();
    res.json(companies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/deliveries', async (req, res) => {
  try {
    const deliveries = await db.getAllDeliveries();
    res.json(deliveries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/deliveries', async (req, res) => {
  try {
    const { company, bottlesDelivered, bottlesReturned, drNumber } = req.body;
    
    if (!company || bottlesDelivered === undefined || bottlesReturned === undefined || !drNumber) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    const id = await db.addDelivery(company, bottlesDelivered, bottlesReturned, drNumber);
    res.json({ id, message: 'Delivery added successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/deliveries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { company, bottlesDelivered, bottlesReturned, drNumber } = req.body;
    
    if (!company || bottlesDelivered === undefined || bottlesReturned === undefined || !drNumber) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    await db.updateDelivery(id, company, bottlesDelivered, bottlesReturned, drNumber);
    res.json({ message: 'Delivery updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/deliveries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteDelivery(id);
    res.json({ message: 'Delivery deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/backups', async (req, res) => {
  try {
    const backups = await db.listBackups();
    res.json(backups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/backups', async (req, res) => {
  try {
    const result = await db.performBackup();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/backups/restore/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const result = await db.restoreBackup(filename);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/backups/download/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const backupPath = path.join(__dirname, 'data', 'backups', filename);

    if (!filename.startsWith('backup_') || !filename.endsWith('.db')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    if (!require('fs').existsSync(backupPath)) {
      return res.status(404).json({ error: 'Backup not found' });
    }

    res.download(backupPath);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function start() {
  try {
    await db.initDB();
    console.log('Database initialized');

    await db.performBackup();
    console.log('Initial backup created');

    setInterval(async () => {
      try {
        await db.performBackup();
      } catch (err) {
        console.error('Scheduled backup failed:', err);
      }
    }, 24 * 60 * 60 * 1000);

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
