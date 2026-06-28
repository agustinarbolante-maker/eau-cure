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
const companyStatsModal = document.getElementById('companyStatsModal');
const closeCompanyStatsModalBtn = document.getElementById('closeCompanyStatsModal');
const closeCompanyStatsModal2Btn = document.getElementById('closeCompanyStatsModal2');
const filterCompanySelect = document.getElementById('filterCompany');
const filterStartDateInput = document.getElementById('filterStartDate');
const filterEndDateInput = document.getElementById('filterEndDate');
const exportBtn = document.getElementById('exportBtn');
const printBtn = document.getElementById('printBtn');
const settingsHeaderBtn = document.getElementById('settingsHeaderBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettingsModalBtn = document.getElementById('closeSettingsModal');
const closeSettingsModal2Btn = document.getElementById('closeSettingsModal2');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const settingsDefaultCompany = document.getElementById('settingsDefaultCompany');
const settingsRowsPerPage = document.getElementById('settingsRowsPerPage');
const settingsAutoRefresh = document.getElementById('settingsAutoRefresh');
const deliveryTime = document.getElementById('deliveryTime');
const calendar = document.getElementById('calendar');
const calendarMonth = document.getElementById('calendarMonth');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const selectedDateFromCalendar = document.getElementById('selectedDateFromCalendar');
const formDateDisplay = document.getElementById('formDateDisplay');
const billingModal = document.getElementById('billingModal');
const closeBillingModalBtn = document.getElementById('closeBillingModal');
const closeBillingModal2Btn = document.getElementById('closeBillingModal2');
const billingCompanySelect = document.getElementById('billingCompany');
const billingStartDateInput = document.getElementById('billingStartDate');
const billingEndDateInput = document.getElementById('billingEndDate');
const billingContent = document.getElementById('billingContent');
const printBillingBtn = document.getElementById('printBillingBtn');
const downloadBillingPdfBtn = document.getElementById('downloadBillingPdfBtn');
const addCompanyModal = document.getElementById('addCompanyModal');
const closeAddCompanyModalBtn = document.getElementById('closeAddCompanyModal');
const closeAddCompanyModal2Btn = document.getElementById('closeAddCompanyModal2');
const addCompanyForm = document.getElementById('addCompanyForm');
const addCompanyMessage = document.getElementById('addCompanyMessage');

let currentCalendarDate = new Date();
let selectedDateForDeliveries = new Date();
const deliveryCountByDate = {};

deliveryForm.addEventListener('submit', handleFormSubmit);
editForm.addEventListener('submit', handleEditSubmit);
closeModalBtn.addEventListener('click', closeEditModal);
cancelEditBtn.addEventListener('click', closeEditModal);
backupBtn.addEventListener('click', openBackupModal);
closeBackupModalBtn.addEventListener('click', closeBackupModal);
closeBackupModal2Btn.addEventListener('click', closeBackupModal);
manualBackupBtn.addEventListener('click', createManualBackup);
closeCompanyStatsModalBtn.addEventListener('click', closeCompanyStatsModal);
closeCompanyStatsModal2Btn.addEventListener('click', closeCompanyStatsModal);
exportBtn.addEventListener('click', exportToCSV);
printBtn.addEventListener('click', printRecords);
settingsHeaderBtn.addEventListener('click', openSettingsModal);
closeSettingsModalBtn.addEventListener('click', closeSettingsModal);
closeSettingsModal2Btn.addEventListener('click', closeSettingsModal);
saveSettingsBtn.addEventListener('click', saveSettings);
prevMonthBtn.addEventListener('click', () => {
  currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
  renderCalendar();
});
nextMonthBtn.addEventListener('click', () => {
  currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
  renderCalendar();
});
closeBillingModalBtn.addEventListener('click', closeBillingModal);
closeBillingModal2Btn.addEventListener('click', closeBillingModal);
closeAddCompanyModalBtn.addEventListener('click', closeAddCompanyModal);
closeAddCompanyModal2Btn.addEventListener('click', closeAddCompanyModal);
printBillingBtn.addEventListener('click', printBillingStatement);
downloadBillingPdfBtn.addEventListener('click', downloadBillingPdf);
billingCompanySelect.addEventListener('change', generateBillingStatement);
billingStartDateInput.addEventListener('change', generateBillingStatement);
billingEndDateInput.addEventListener('change', generateBillingStatement);

async function fetchCompanies() {
  try {
    const response = await fetch(COMPANIES_API);
    if (!response.ok) throw new Error('Failed to fetch companies: ' + response.status);
    companies = await response.json();
    console.log('Companies loaded:', companies.length);
    populateCompanyDropdowns();
  } catch (err) {
    console.error('Error loading companies:', err);
    showMessage('Error loading companies: ' + err.message, 'error');
  }
}

function populateCompanyDropdowns() {
  const options = companies.map(company =>
    `<option value="${company}">${company}</option>`
  ).join('');

  companySelect.innerHTML = '<option value="">-- Select a Company --</option>' + options;
  editCompanySelect.innerHTML = '<option value="">-- Select a Company --</option>' + options;
  settingsDefaultCompany.innerHTML = '<option value="">None</option>' + options;
  populateFilterCompanyDropdown();
}

async function fetchDeliveries() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed to fetch deliveries');
    deliveries = await response.json();

    for (const key in deliveryCountByDate) {
      delete deliveryCountByDate[key];
    }

    deliveries.forEach(delivery => {
      const deliveryDate = new Date(delivery.timestamp);
      const dateStr = `${deliveryDate.getFullYear()}-${String(deliveryDate.getMonth() + 1).padStart(2, '0')}-${String(deliveryDate.getDate()).padStart(2, '0')}`;
      deliveryCountByDate[dateStr] = (deliveryCountByDate[dateStr] || 0) + 1;
    });

    renderTable();
    renderCalendar();
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
  const time = deliveryTime.value;

  const dateStr = selectedDateForDeliveries.toISOString().split('T')[0];
  const timestamp = new Date(`${dateStr}T${time}:00`).toISOString();

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company, bottlesDelivered, bottlesReturned, drNumber, timestamp })
    });

    if (!response.ok) throw new Error('Failed to add delivery');

    showMessage('Delivery added to ' + selectedDateForDeliveries.toLocaleDateString() + '!', 'success');
    deliveryForm.reset();
    fetchDeliveries();
    loadStats();
    renderCalendar();
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

function selectDateFromCalendar(date) {
  selectedDateForDeliveries = new Date(date);
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formatted = selectedDateForDeliveries.toLocaleDateString('en-US', options);

  selectedDateFromCalendar.textContent = formatted;
  formDateDisplay.textContent = formatted;
  renderCalendar();

  showMessage(`Selected date: ${formatted}`, 'success');
}

function renderCalendar() {
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();

  calendarMonth.textContent = new Date(year, month).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let html = '<div class="calendar-grid">';

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  dayNames.forEach(day => {
    html += `<div class="calendar-day-header">${day}</div>`;
  });

  for (let i = firstDay - 1; i >= 0; i--) {
    html += `<div class="calendar-day other-month"></div>`;
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isSelected = date.toDateString() === selectedDateForDeliveries.toDateString();
    const isToday = date.toDateString() === new Date().toDateString();

    const count = deliveryCountByDate[dateStr] || 0;
    const countBadge = count > 0 ? `<span class="delivery-count">${count}</span>` : '';

    html += `
      <div class="calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}" data-date="${dateStr}">
        <div class="day-number">${day}</div>
        ${countBadge}
      </div>
    `;
  }

  for (let day = 1; day <= (42 - daysInMonth - firstDay); day++) {
    html += `<div class="calendar-day other-month"></div>`;
  }

  html += '</div>';
  calendar.innerHTML = html;

  document.querySelectorAll('.calendar-day:not(.other-month)').forEach(dayEl => {
    dayEl.addEventListener('click', function() {
      const dateStr = this.getAttribute('data-date');
      if (dateStr) {
        selectDateFromCalendar(dateStr);
      }
    });
  });
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
  const delivery = deliveries.find(d => d.id === id);

  Swal.fire({
    title: 'Delete Delivery?',
    text: `Remove delivery for ${delivery.company}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete delivery');

        Swal.fire('Deleted!', 'Delivery deleted successfully.', 'success');
        fetchDeliveries();
      } catch (err) {
        Swal.fire('Error!', 'Failed to delete: ' + err.message, 'error');
      }
    }
  });
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
  Swal.fire({
    title: 'Restore Backup?',
    text: 'This will replace your current data with the selected backup. This action cannot be undone!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Yes, restore it!',
    cancelButtonText: 'Cancel'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/backups/restore/${filename}`, { method: 'POST' });
        if (!response.ok) throw new Error('Failed to restore backup');

        Swal.fire('Restored!', 'Database restored successfully. Reloading...', 'success');
        setTimeout(() => {
          fetchDeliveries();
          loadBackupList();
          loadStats();
        }, 1000);
      } catch (err) {
        Swal.fire('Error!', 'Failed to restore backup: ' + err.message, 'error');
      }
    }
  });
}

function downloadBackup(filename) {
  window.location.href = `/api/backups/download/${filename}`;
}

function populateFilterCompanyDropdown() {
  const options = companies.map(company =>
    `<option value="${company}">${company}</option>`
  ).join('');
  filterCompanySelect.innerHTML = '<option value="">All Companies</option>' + options;
}

async function applyFilters() {
  const company = filterCompanySelect.value;
  const startDate = filterStartDateInput.value;
  const endDate = filterEndDateInput.value;

  try {
    let url = '/api/deliveries?';
    if (company) url += `company=${encodeURIComponent(company)}&`;
    if (startDate) url += `startDate=${startDate}&`;
    if (endDate) url += `endDate=${endDate}&`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to filter deliveries');
    deliveries = await response.json();
    renderTable();

    await loadStats(startDate, endDate);
  } catch (err) {
    showMessage('Error filtering data: ' + err.message, 'error');
  }
}

function resetFilters() {
  filterCompanySelect.value = '';
  filterStartDateInput.value = '';
  filterEndDateInput.value = '';
  applyFilters();
}

async function loadStats(startDate, endDate) {
  try {
    let url = '/api/stats?';
    if (startDate) url += `startDate=${startDate}&`;
    if (endDate) url += `endDate=${endDate}&`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to load stats');
    const stats = await response.json();

    document.getElementById('totalDeliveries').textContent = stats.total_deliveries || 0;
    document.getElementById('totalDelivered').textContent = stats.total_delivered || 0;
    document.getElementById('totalReturned').textContent = stats.total_returned || 0;

    const net = (stats.total_delivered || 0) - (stats.total_returned || 0);
    document.getElementById('netBottles').textContent = net;
  } catch (err) {
    console.error('Error loading stats:', err);
  }
}

function filterQuickRange(range) {
  const end = new Date();
  const start = new Date();

  switch (range) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case 'week':
      start.setDate(end.getDate() - 7);
      break;
    case 'month':
      start.setMonth(end.getMonth() - 1);
      break;
    case 'all':
      filterStartDateInput.value = '';
      filterEndDateInput.value = '';
      applyFilters();
      return;
  }

  filterStartDateInput.value = start.toISOString().split('T')[0];
  filterEndDateInput.value = end.toISOString().split('T')[0];
  applyFilters();
}

function closeCompanyStatsModal() {
  companyStatsModal.classList.add('hidden');
}

async function openCompanyStatsModal() {
  companyStatsModal.classList.remove('hidden');
  try {
    const startDate = filterStartDateInput.value;
    const endDate = filterEndDateInput.value;

    let url = '/api/stats/companies?';
    if (startDate) url += `startDate=${startDate}&`;
    if (endDate) url += `endDate=${endDate}&`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to load company stats');
    const stats = await response.json();

    const tbody = document.getElementById('companyStatsBody');
    if (stats.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="loading">No data available</td></tr>';
      return;
    }

    tbody.innerHTML = stats.map(stat => `
      <tr>
        <td>${stat.company}</td>
        <td>${stat.delivery_count}</td>
        <td>${stat.total_delivered || 0}</td>
        <td>${stat.total_returned || 0}</td>
      </tr>
    `).join('');
  } catch (err) {
    showMessage('Error loading company stats: ' + err.message, 'error');
  }
}

async function exportToCSV() {
  try {
    const company = filterCompanySelect.value;
    const startDate = filterStartDateInput.value;
    const endDate = filterEndDateInput.value;

    let url = '/api/deliveries/export/csv?';
    if (company) url += `company=${encodeURIComponent(company)}&`;
    if (startDate) url += `startDate=${startDate}&`;
    if (endDate) url += `endDate=${endDate}&`;

    window.location.href = url;
    showMessage('CSV exported successfully!', 'success');
  } catch (err) {
    showMessage('Error exporting CSV: ' + err.message, 'error');
  }
}

function printRecords() {
  const printWindow = window.open('', '', 'height=600,width=800');
  const table = document.getElementById('deliveriesTable').outerHTML;
  const stats = `
    <h2>Delivery Summary</h2>
    <p><strong>Total Deliveries:</strong> ${document.getElementById('totalDeliveries').textContent}</p>
    <p><strong>Bottles Delivered:</strong> ${document.getElementById('totalDelivered').textContent}</p>
    <p><strong>Bottles Returned:</strong> ${document.getElementById('totalReturned').textContent}</p>
    <p><strong>Net Bottles:</strong> ${document.getElementById('netBottles').textContent}</p>
  `;

  const filters = `
    <h3>Filters Applied:</h3>
    <p>${filterCompanySelect.value ? 'Company: ' + filterCompanySelect.value + '<br>' : ''}
       ${filterStartDateInput.value ? 'From: ' + filterStartDateInput.value + '<br>' : ''}
       ${filterEndDateInput.value ? 'To: ' + filterEndDateInput.value : ''}</p>
  `;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Eau Cure - Delivery Records</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h2 { color: #667eea; margin-top: 20px; }
        h3 { color: #764ba2; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #667eea; color: white; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        p { line-height: 1.6; }
        .print-date { color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <h1>Eau Cure - Water Station Delivery Tracker</h1>
      <p class="print-date">Printed: ${new Date().toLocaleString()}</p>
      ${stats}
      ${filterCompanySelect.value || filterStartDateInput.value || filterEndDateInput.value ? filters : ''}
      ${table}
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
}

function loadSettings() {
  const settings = JSON.parse(localStorage.getItem('eauCureSettings') || '{}');
  settingsDefaultCompany.value = settings.defaultCompany || '';
  settingsRowsPerPage.value = settings.rowsPerPage || '10';
  settingsAutoRefresh.checked = settings.autoRefresh || false;
}

function openSettingsModal() {
  loadSettings();
  settingsModal.classList.remove('hidden');
}

function closeSettingsModal() {
  settingsModal.classList.add('hidden');
}

function saveSettings() {
  const settings = {
    defaultCompany: settingsDefaultCompany.value,
    rowsPerPage: settingsRowsPerPage.value,
    autoRefresh: settingsAutoRefresh.checked
  };

  localStorage.setItem('eauCureSettings', JSON.stringify(settings));

  if (settings.defaultCompany) {
    filterCompanySelect.value = settings.defaultCompany;
    applyFilters();
  }

  Swal.fire('Saved!', 'Settings saved successfully.', 'success');
  closeSettingsModal();
}

function openBillingModal() {
  billingModal.classList.remove('hidden');
  // Set default dates to current month
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  billingStartDateInput.value = firstDay.toISOString().split('T')[0];
  billingEndDateInput.value = lastDay.toISOString().split('T')[0];
  // Populate company dropdown
  billingCompanySelect.innerHTML = '<option value="">-- Select a Company --</option>';
  companies.forEach(company => {
    billingCompanySelect.innerHTML += `<option value="${company}">${company}</option>`;
  });
}

function closeBillingModal() {
  billingModal.classList.add('hidden');
  billingContent.innerHTML = '';
  printBillingBtn.style.display = 'none';
  downloadBillingPdfBtn.style.display = 'none';
}

async function generateBillingStatement() {
  const company = billingCompanySelect.value;
  const startDate = billingStartDateInput.value;
  const endDate = billingEndDateInput.value;

  if (!company || !startDate || !endDate) {
    showMessage('Please select a company and date range', 'error');
    return;
  }

  try {
    const response = await fetch(`/api/billing/${encodeURIComponent(company)}?startDate=${startDate}&endDate=${endDate}`);
    if (!response.ok) throw new Error('Failed to fetch billing statement');
    const data = await response.json();

    renderBillingStatement(data);
    printBillingBtn.style.display = 'inline-block';
    downloadBillingPdfBtn.style.display = 'inline-block';
  } catch (err) {
    showMessage('Error: ' + err.message, 'error');
  }
}

function renderBillingStatement(data) {
  const { company, unitPrice, deliveries, startDate, endDate } = data;

  let html = `<h3 style="text-align: center; margin-bottom: 20px;">Billing Statement</h3>`;
  html += `<div style="font-size: 13px; margin-bottom: 15px;">`;
  html += `<p><strong>Company:</strong> ${company}</p>`;
  html += `<p><strong>Period:</strong> ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}</p>`;
  html += `<p><strong>Unit Price:</strong> ₱${unitPrice.toFixed(2)} per bottle</p>`;
  html += `</div>`;

  if (deliveries.length === 0) {
    html += `<p style="text-align: center; color: #999;">No deliveries found for this period</p>`;
    billingContent.innerHTML = html;
    return;
  }

  html += `<table class="billing-table">`;
  html += `<thead><tr>`;
  html += `<th>Date</th><th>DR Number</th><th>Delivered</th><th>Returned</th><th>Net</th><th>Amount</th>`;
  html += `</tr></thead><tbody>`;

  let totalDelivered = 0, totalReturned = 0, totalAmount = 0;

  deliveries.forEach(delivery => {
    const date = new Date(delivery.timestamp).toLocaleDateString();
    const net = delivery.bottles_delivered - delivery.bottles_returned;
    const amount = net * unitPrice;

    totalDelivered += delivery.bottles_delivered;
    totalReturned += delivery.bottles_returned;
    totalAmount += amount;

    html += `<tr>`;
    html += `<td>${date}</td>`;
    html += `<td>${delivery.dr_number}</td>`;
    html += `<td>${delivery.bottles_delivered}</td>`;
    html += `<td>${delivery.bottles_returned}</td>`;
    html += `<td>${net}</td>`;
    html += `<td>₱${amount.toFixed(2)}</td>`;
    html += `</tr>`;
  });

  html += `</tbody></table>`;

  const totalNet = totalDelivered - totalReturned;
  html += `<div class="billing-summary">`;
  html += `<div class="billing-summary-row"><span>Total Delivered:</span><span>${totalDelivered}</span></div>`;
  html += `<div class="billing-summary-row"><span>Total Returned:</span><span>${totalReturned}</span></div>`;
  html += `<div class="billing-summary-row"><span>Total Net:</span><span>${totalNet}</span></div>`;
  html += `<div class="billing-summary-row"><span>Unit Price:</span><span>₱${unitPrice.toFixed(2)}</span></div>`;
  html += `<div class="billing-summary-row total"><span>TOTAL AMOUNT:</span><span>₱${totalAmount.toFixed(2)}</span></div>`;
  html += `</div>`;

  billingContent.innerHTML = html;
}

function printBillingStatement() {
  window.print();
}

function downloadBillingPdf() {
  const company = billingCompanySelect.value;
  const startDate = billingStartDateInput.value;
  const endDate = billingEndDateInput.value;
  const content = billingContent.innerHTML;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Billing Statement - ${company}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h3 { text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #667eea; color: white; }
        .billing-summary { background: #f8f9fa; padding: 20px; border-radius: 8px; }
        .billing-summary-row { display: flex; justify-content: space-between; padding: 10px 0; }
        .billing-summary-row.total { font-weight: bold; font-size: 16px; border-top: 2px solid #667eea; padding-top: 15px; }
      </style>
    </head>
    <body>
      ${content}
    </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `billing_${company}_${startDate}_${endDate}.html`;
  a.click();
  window.URL.revokeObjectURL(url);
}

function openAddCompanyModal() {
  addCompanyModal.classList.remove('hidden');
  addCompanyForm.reset();
  addCompanyMessage.innerHTML = '';
}

function closeAddCompanyModal() {
  addCompanyModal.classList.add('hidden');
  addCompanyForm.reset();
  addCompanyMessage.innerHTML = '';
}

async function submitAddCompany() {
  const name = document.getElementById('newCompanyName').value.trim();
  const price = document.getElementById('newCompanyPrice').value.trim();

  if (!name || !price) {
    addCompanyMessage.innerHTML = '<span style="color: #dc3545;">Please enter both name and price</span>';
    return;
  }

  try {
    const response = await fetch('/api/companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, unitPrice: parseFloat(price) })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add company');
    }

    const result = await response.json();
    addCompanyMessage.innerHTML = `<span style="color: #28a745;">${result.message}</span>`;

    await fetchCompanies();
    setTimeout(() => closeAddCompanyModal(), 1000);
  } catch (err) {
    addCompanyMessage.innerHTML = `<span style="color: #dc3545;">Error: ${err.message}</span>`;
  }
}

const today = new Date();
const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
selectDateFromCalendar(todayStr);

fetchCompanies();
fetchDeliveries();
