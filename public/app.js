const API_URL = '/api/deliveries';
const COMPANIES_API = '/api/companies';
let deliveries = [];
let companies = [];
let editingId = null;

const deliveryForm = document.getElementById('deliveryForm');
const tableBody = document.getElementById('tableBody');
const formMessage = document.getElementById('formMessage');
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const closeModalBtn = document.getElementById('closeModal');
const cancelEditBtn = document.getElementById('cancelEdit');
const companySelect = document.getElementById('company');
const editCompanySelect = document.getElementById('editCompany');
const backupBtn = document.getElementById('backupBtn');
const backupModal = document.getElementById('backupModal');
const closeBackupModalBtn = document.getElementById('closeBackupModal');
const closeBackupModal2Btn = document.getElementById('closeBackupModal2');
const manualBackupBtn = document.getElementById('manualBackupBtn');
const backupList = document.getElementById('backupList');

deliveryForm.addEventListener('submit', handleFormSubmit);
editForm.addEventListener('submit', handleEditSubmit);
closeModalBtn.addEventListener('click', closeEditModal);
cancelEditBtn.addEventListener('click', closeEditModal);
backupBtn.addEventListener('click', openBackupModal);
closeBackupModalBtn.addEventListener('click', closeBackupModal);
closeBackupModal2Btn.addEventListener('click', closeBackupModal);
manualBackupBtn.addEventListener('click', createManualBackup);

async function fetchCompanies() {
  try {
    const response = await fetch(COMPANIES_API);
    if (!response.ok) throw new Error('Failed to fetch companies');
    companies = await response.json();
    populateCompanyDropdowns();
  } catch (err) {
    console.error('Error loading companies:', err);
  }
}

function populateCompanyDropdowns() {
  const options = companies.map(company =>
    `<option value="${company}">${company}</option>`
  ).join('');

  companySelect.innerHTML = '<option value="">-- Select a Company --</option>' + options;
  editCompanySelect.innerHTML = '<option value="">-- Select a Company --</option>' + options;
}

async function fetchDeliveries() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed to fetch deliveries');
    deliveries = await response.json();
    renderTable();
  } catch (err) {
    showMessage('Error loading deliveries: ' + err.message, 'error');
  }
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const company = document.getElementById('company').value;
  const bottlesDelivered = parseInt(document.getElementById('bottlesDelivered').value);
  const bottlesReturned = parseInt(document.getElementById('bottlesReturned').value);
  const drNumber = document.getElementById('drNumber').value;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company, bottlesDelivered, bottlesReturned, drNumber })
    });

    if (!response.ok) throw new Error('Failed to add delivery');

    showMessage('Delivery added successfully!', 'success');
    deliveryForm.reset();
    fetchDeliveries();
  } catch (err) {
    showMessage('Error: ' + err.message, 'error');
  }
}

function openEditModal(id) {
  const delivery = deliveries.find(d => d.id === id);
  if (!delivery) return;

  editingId = id;
  document.getElementById('editId').value = id;
  document.getElementById('editCompany').value = delivery.company;
  document.getElementById('editBottlesDelivered').value = delivery.bottles_delivered;
  document.getElementById('editBottlesReturned').value = delivery.bottles_returned;
  document.getElementById('editDrNumber').value = delivery.dr_number;

  editModal.classList.remove('hidden');
}

function closeEditModal() {
  editModal.classList.add('hidden');
  editingId = null;
}

async function handleEditSubmit(e) {
  e.preventDefault();

  const id = document.getElementById('editId').value;
  const company = document.getElementById('editCompany').value;
  const bottlesDelivered = parseInt(document.getElementById('editBottlesDelivered').value);
  const bottlesReturned = parseInt(document.getElementById('editBottlesReturned').value);
  const drNumber = document.getElementById('editDrNumber').value;

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company, bottlesDelivered, bottlesReturned, drNumber })
    });

    if (!response.ok) throw new Error('Failed to update delivery');

    showMessage('Delivery updated successfully!', 'success');
    closeEditModal();
    fetchDeliveries();
  } catch (err) {
    showMessage('Error: ' + err.message, 'error');
  }
}

async function deleteDelivery(id) {
  if (!confirm('Are you sure you want to delete this entry?')) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete delivery');

    showMessage('Delivery deleted successfully!', 'success');
    fetchDeliveries();
  } catch (err) {
    showMessage('Error: ' + err.message, 'error');
  }
}

function renderTable() {
  if (deliveries.length === 0) {
    tableBody.innerHTML = '<tr class="empty-state"><td colspan="7">No deliveries recorded yet</td></tr>';
    return;
  }

  tableBody.innerHTML = deliveries.map(delivery => {
    const timestamp = new Date(delivery.timestamp).toLocaleString();
    return `
      <tr>
        <td>${delivery.id}</td>
        <td>${delivery.company}</td>
        <td>${delivery.bottles_delivered}</td>
        <td>${delivery.bottles_returned}</td>
        <td>${delivery.dr_number}</td>
        <td>${timestamp}</td>
        <td class="actions">
          <button class="btn btn-edit" onclick="openEditModal(${delivery.id})">Edit</button>
          <button class="btn btn-delete" onclick="deleteDelivery(${delivery.id})">Delete</button>
        </td>
      </tr>
    `;
  }).join('');
}

function showMessage(msg, type) {
  formMessage.textContent = msg;
  formMessage.className = `form-message show ${type}`;
  setTimeout(() => {
    formMessage.classList.remove('show');
  }, 3000);
}

function openBackupModal() {
  backupModal.classList.remove('hidden');
  loadBackupList();
}

function closeBackupModal() {
  backupModal.classList.add('hidden');
}

async function loadBackupList() {
  try {
    backupList.innerHTML = '<p class="loading">Loading backups...</p>';
    const response = await fetch('/api/backups');
    if (!response.ok) throw new Error('Failed to load backups');
    const backups = await response.json();

    if (backups.length === 0) {
      backupList.innerHTML = '<p class="loading">No backups yet. Automatic backups run daily.</p>';
      return;
    }

    backupList.innerHTML = backups.map(backup => {
      const date = new Date(backup.created).toLocaleString();
      const sizeMB = (backup.size / 1024 / 1024).toFixed(2);
      return `
        <div class="backup-item">
          <div class="backup-info">
            <strong>${backup.filename}</strong>
            <br>
            <small>Created: ${date}</small>
            <br>
            <small>Size: ${sizeMB} MB</small>
          </div>
          <div class="backup-actions">
            <button class="btn btn-small btn-restore" onclick="restoreBackup('${backup.filename}')">Restore</button>
            <button class="btn btn-small btn-download" onclick="downloadBackup('${backup.filename}')">Download</button>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    backupList.innerHTML = `<p class="error">Error loading backups: ${err.message}</p>`;
  }
}

async function createManualBackup() {
  try {
    manualBackupBtn.disabled = true;
    manualBackupBtn.textContent = 'Creating...';

    const response = await fetch('/api/backups', { method: 'POST' });
    if (!response.ok) throw new Error('Failed to create backup');

    const result = await response.json();
    showMessage('Backup created successfully!', 'success');
    loadBackupList();
  } catch (err) {
    showMessage('Error creating backup: ' + err.message, 'error');
  } finally {
    manualBackupBtn.disabled = false;
    manualBackupBtn.textContent = 'Create Backup Now';
  }
}

async function restoreBackup(filename) {
  if (!confirm('⚠️ WARNING: This will replace your current data with the backup. Are you sure?')) {
    return;
  }

  try {
    const response = await fetch(`/api/backups/restore/${filename}`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to restore backup');

    showMessage('✅ Database restored successfully! Reloading data...', 'success');
    setTimeout(() => {
      fetchDeliveries();
      loadBackupList();
    }, 1000);
  } catch (err) {
    showMessage('Error restoring backup: ' + err.message, 'error');
  }
}

function downloadBackup(filename) {
  window.location.href = `/api/backups/download/${filename}`;
}

fetchCompanies();
fetchDeliveries();
