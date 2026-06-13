// ===========================
// ACENTURA CARDS — ADMIN JS
// ===========================

const ADMIN_PASSWORD = 'acentura2025'; // Change this to whatever HR wants
const SESSION_KEY = 'acentura_admin';
const BASE_URL = window.location.origin;

let allEmployees = [];
let editingId = null;
let selectedFile = null;

// ===========================
// AUTH
// ===========================

function checkSession() {
  if (sessionStorage.getItem(SESSION_KEY) === 'true') {
    showPanel();
  }
}

function handleLogin() {
  const val = document.getElementById('adminPassword').value;
  if (val === ADMIN_PASSWORD) {
    sessionStorage.setItem(SESSION_KEY, 'true');
    showPanel();
  } else {
    document.getElementById('loginError').textContent = 'Incorrect password. Try again.';
  }
}

function handleLogout() {
  sessionStorage.removeItem(SESSION_KEY);
  location.reload();
}

function showPanel() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('adminPanel').classList.remove('hidden');
  loadEmployees();
}

// ===========================
// LOAD EMPLOYEES
// ===========================

async function loadEmployees() {
  const tbody = document.getElementById('employeeTableBody');
  tbody.innerHTML = `<tr><td colspan="7" class="loading-row">Loading...</td></tr>`;

  // Fetch ALL employees including inactive (admin needs to see all)
  const res = await fetch(`${SUPABASE_URL}/rest/v1/employees?order=full_name.asc`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  });
  allEmployees = await res.json();

  document.getElementById('employeeCount').textContent = allEmployees.length;
  renderTable(allEmployees);
}

function renderTable(employees) {
  const tbody = document.getElementById('employeeTableBody');

  if (employees.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="loading-row">No employees found.</td></tr>`;
    return;
  }

  tbody.innerHTML = employees.map(emp => `
    <tr>
      <td>
        ${emp.photo_url
          ? `<img src="${emp.photo_url}" class="emp-photo" alt="${emp.full_name}" />`
          : `<div class="emp-photo-placeholder">👤</div>`
        }
      </td>
      <td>
        <strong>${emp.full_name}</strong><br/>
        <small style="color: var(--grey)">${emp.slug}</small>
      </td>
      <td>${emp.role}</td>
      <td>${emp.department}</td>
      <td>${emp.email}</td>
      <td>
        <span class="status-badge ${emp.is_active ? 'status-active' : 'status-inactive'}">
          ${emp.is_active ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td>
        <div class="action-btns">
          <button class="btn-edit" onclick="openModal('edit', '${emp.id}')">Edit</button>
          ${emp.is_active
            ? `<button class="btn-deactivate" onclick="toggleActive('${emp.id}', false)">Deactivate</button>`
            : `<button class="btn-activate" onclick="toggleActive('${emp.id}', true)">Activate</button>`
          }
        </div>
      </td>
    </tr>
  `).join('');
}

// ===========================
// SEARCH / FILTER
// ===========================

function filterEmployees() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  const filtered = allEmployees.filter(e =>
    e.full_name.toLowerCase().includes(q) ||
    e.role.toLowerCase().includes(q) ||
    e.department.toLowerCase().includes(q)
  );
  renderTable(filtered);
}

// ===========================
// MODAL
// ===========================

function openModal(mode, id = null) {
  editingId = id;
  selectedFile = null;
  document.getElementById('employeeModal').classList.remove('hidden');
  document.getElementById('qrSection').classList.add('hidden');
  document.getElementById('photoPreview').classList.add('hidden');
  document.getElementById('photoPlaceholder').classList.remove('hidden');
  document.getElementById('photoPreview').src = '';
  clearForm();

  if (mode === 'edit' && id) {
    const emp = allEmployees.find(e => e.id === id);
    document.getElementById('modalTitle').textContent = 'Edit Employee';
    document.getElementById('fieldName').value = emp.full_name;
    document.getElementById('fieldSlug').value = emp.slug;
    document.getElementById('fieldRole').value = emp.role;
    document.getElementById('fieldDepartment').value = emp.department;
    document.getElementById('fieldEmail').value = emp.email;
    document.getElementById('fieldPhone').value = emp.phone;
    document.getElementById('fieldLinkedIn').value = emp.linkedin_url || '';

    if (emp.photo_url) {
      document.getElementById('photoPreview').src = emp.photo_url;
      document.getElementById('photoPreview').classList.remove('hidden');
      document.getElementById('photoPlaceholder').classList.add('hidden');
    }

    // Show QR code
    document.getElementById('qrSection').classList.remove('hidden');
    document.getElementById('qrCode').innerHTML = '';
    new QRCode(document.getElementById('qrCode'), {
      text: `${BASE_URL}/${emp.slug}`,
      width: 160,
      height: 160,
      colorDark: '#0A1F52',
      colorLight: '#ffffff'
    });

  } else {
    document.getElementById('modalTitle').textContent = 'Add Employee';
  }
}

function closeModal() {
  document.getElementById('employeeModal').classList.add('hidden');
  editingId = null;
  selectedFile = null;
}

function clearForm() {
  ['fieldName','fieldSlug','fieldRole','fieldDepartment','fieldEmail','fieldPhone','fieldLinkedIn']
    .forEach(id => document.getElementById(id).value = '');
}

// ===========================
// SLUG AUTO-GENERATE
// ===========================

function generateSlug() {
  const name = document.getElementById('fieldName').value;
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
  document.getElementById('fieldSlug').value = slug;
}

// ===========================
// PHOTO UPLOAD
// ===========================

function handlePhotoSelect(event) {
  selectedFile = event.target.files[0];
  if (!selectedFile) return;
  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById('photoPreview').src = e.target.result;
    document.getElementById('photoPreview').classList.remove('hidden');
    document.getElementById('photoPlaceholder').classList.add('hidden');
  };
  reader.readAsDataURL(selectedFile);
}

// ===========================
// SAVE EMPLOYEE
// ===========================

async function saveEmployee() {
  const btn = document.getElementById('modalSaveBtn');
  btn.textContent = 'Saving...';
  btn.disabled = true;

  const name = document.getElementById('fieldName').value.trim();
  const slug = document.getElementById('fieldSlug').value.trim();
  const role = document.getElementById('fieldRole').value.trim();
  const department = document.getElementById('fieldDepartment').value.trim();
  const email = document.getElementById('fieldEmail').value.trim();
  const phone = document.getElementById('fieldPhone').value.trim();
  const linkedin_url = document.getElementById('fieldLinkedIn').value.trim();

  if (!name || !slug || !role || !department || !email || !phone) {
    alert('Please fill in all required fields.');
    btn.textContent = 'Save Employee';
    btn.disabled = false;
    return;
  }

  let photo_url = null;

  // Upload photo if selected
  if (selectedFile) {
    const ext = selectedFile.name.split('.').pop();
    const path = `${slug}-${Date.now()}.${ext}`;
    photo_url = await sbStorageUpload('employee-photos', path, selectedFile);
  } else if (editingId) {
    const existing = allEmployees.find(e => e.id === editingId);
    photo_url = existing?.photo_url || null;
  }

  const data = { full_name: name, slug, role, department, email, phone, linkedin_url, photo_url };

  if (editingId) {
    await sbUpdate('employees', data, `id=eq.${editingId}`);
  } else {
    await sbInsert('employees', data);
  }

  btn.textContent = 'Save Employee';
  btn.disabled = false;
  closeModal();
  loadEmployees();
}

// ===========================
// TOGGLE ACTIVE
// ===========================

async function sbStorageUpload(bucket, path, file) {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': file.type,
      'x-upsert': 'true'
    },
    body: file
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Upload error:', errorText);
    return null;
  }

  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}