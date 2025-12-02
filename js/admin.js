// SOBAT HIJAU - Admin Panel Logic

let currentUser = null;
let allRequests = [];
let allServices = [];

// Initialize admin panel
document.addEventListener('DOMContentLoaded', () => {
  checkAuthState();
  setupEventListeners();
});

// Check authentication state
function checkAuthState() {
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      // Check if user is admin
      const adminDoc = await db.collection('admins').doc(user.uid).get();
      
      if (adminDoc.exists && adminDoc.data().role === 'admin') {
        currentUser = { uid: user.uid, ...adminDoc.data() };
        showDashboard();
        loadDashboardData();
      } else {
        // Not an admin
        auth.signOut();
        showLogin();
        showError('Akses ditolak. Anda bukan admin.');
      }
    } else {
      showLogin();
    }
  });
}

// Setup event listeners
function setupEventListeners() {
  // Login form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  // Logout button
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', handleLogout);
  }
  
  // Tab navigation
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });
  
  // Filter status
  const filterStatus = document.getElementById('filter-status');
  if (filterStatus) {
    filterStatus.addEventListener('change', filterRequests);
  }
  
  // Edit request form
  const editRequestForm = document.getElementById('edit-request-form');
  if (editRequestForm) {
    editRequestForm.addEventListener('submit', handleUpdateRequest);
  }
}

// Handle login
async function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errorEl = document.getElementById('login-error');
  
  try {
    await auth.signInWithEmailAndPassword(email, password);
    errorEl.classList.add('hidden');
  } catch (error) {
    console.error('Login error:', error);
    errorEl.classList.remove('hidden');
    errorEl.textContent = 'Email atau password salah.';
  }
}

// Handle logout
async function handleLogout() {
  try {
    await auth.signOut();
    showLogin();
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// Show login screen
function showLogin() {
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('admin-dashboard').classList.add('hidden');
}

// Show dashboard
function showDashboard() {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('admin-dashboard').classList.remove('hidden');
  
  if (currentUser) {
    document.getElementById('admin-email').textContent = currentUser.email;
  }
}

// Show error
function showError(message) {
  const errorEl = document.getElementById('login-error');
  if (errorEl) {
    errorEl.classList.remove('hidden');
    errorEl.textContent = message;
  }
}

// Switch tab
function switchTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.remove('active', 'border-emerald-400', 'text-emerald-300');
    tab.classList.add('border-transparent', 'text-white/60');
  });
  
  const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
  if (activeTab) {
    activeTab.classList.remove('border-transparent', 'text-white/60');
    activeTab.classList.add('active', 'border-emerald-400', 'text-emerald-300');
  }
  
  // Update content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.add('hidden');
  });
  
  const activeContent = document.getElementById(`tab-${tabName}`);
  if (activeContent) {
    activeContent.classList.remove('hidden');
  }
  
  // Load tab-specific data
  if (tabName === 'requests') {
    loadRequests();
  } else if (tabName === 'services') {
    loadServices();
  }
}

// Load dashboard data
function loadDashboardData() {
  loadOverview();
  loadRecentRequests();
}

// Load overview statistics
function loadOverview() {
  db.collection('requests').onSnapshot((snapshot) => {
    const requests = [];
    snapshot.forEach(doc => {
      requests.push({ id: doc.id, ...doc.data() });
    });
    
    const total = requests.length;
    const pending = requests.filter(r => r.status === 'pending').length;
    const completed = requests.filter(r => r.status === 'completed').length;
    
    document.getElementById('overview-total').textContent = total;
    document.getElementById('overview-pending').textContent = pending;
    document.getElementById('overview-completed').textContent = completed;
    
    allRequests = requests;
  });
}

// Load recent requests
function loadRecentRequests() {
  db.collection('requests')
    .orderBy('createdAt', 'desc')
    .limit(5)
    .onSnapshot((snapshot) => {
      const container = document.getElementById('recent-requests');
      container.innerHTML = '';
      
      if (snapshot.empty) {
        container.innerHTML = '<p class="text-center text-white/60">Belum ada permohonan</p>';
        return;
      }
      
      snapshot.forEach(doc => {
        const data = doc.data();
        const item = document.createElement('div');
        item.className = 'flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4';
        item.innerHTML = `
          <div>
            <p class="font-semibold">${data.registrationNumber}</p>
            <p class="text-sm text-white/60">${data.applicantName} - ${data.serviceName}</p>
          </div>
          <span class="rounded-full px-3 py-1 text-xs ${getStatusClass(data.status)}">${getStatusText(data.status)}</span>
        `;
        container.appendChild(item);
      });
    });
}

// Load all requests
function loadRequests() {
  db.collection('requests')
    .orderBy('createdAt', 'desc')
    .onSnapshot((snapshot) => {
      const requests = [];
      snapshot.forEach(doc => {
        requests.push({ id: doc.id, ...doc.data() });
      });
      
      allRequests = requests;
      renderRequests(requests);
    });
}

// Filter requests
function filterRequests() {
  const filterValue = document.getElementById('filter-status').value;
  
  let filtered = allRequests;
  if (filterValue !== 'all') {
    filtered = allRequests.filter(r => r.status === filterValue);
  }
  
  renderRequests(filtered);
}

// Render requests
function renderRequests(requests) {
  const container = document.getElementById('requests-list');
  container.innerHTML = '';
  
  if (requests.length === 0) {
    container.innerHTML = '<p class="text-center text-white/60">Tidak ada permohonan</p>';
    return;
  }
  
  requests.forEach(request => {
    const item = document.createElement('div');
    item.className = 'rounded-2xl border border-white/10 bg-slate-900/70 p-6';
    item.innerHTML = `
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-3">
            <span class="rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-200">${request.registrationNumber}</span>
            <span class="rounded-full px-3 py-1 text-xs ${getStatusClass(request.status)}">${getStatusText(request.status)}</span>
          </div>
          <h3 class="text-lg font-semibold">${request.applicantName}</h3>
          <p class="text-sm text-white/60 mt-1">${request.serviceName}</p>
          <p class="text-sm text-white/60">Email: ${request.email}</p>
          ${request.assignedOfficer ? `<p class="text-sm text-white/60">Petugas: ${request.assignedOfficer}</p>` : ''}
          ${request.notes ? `<p class="text-sm text-white/70 mt-2">${request.notes}</p>` : ''}
          <p class="text-xs text-white/40 mt-3">Dibuat: ${formatDate(request.createdAt)}</p>
        </div>
        <button
          onclick="openEditRequestModal('${request.id}')"
          class="rounded-xl border border-white/20 px-4 py-2 text-sm transition hover:border-emerald-300 hover:text-emerald-200"
        >
          <i class="fa-solid fa-pen-to-square mr-2"></i>Edit
        </button>
      </div>
    `;
    container.appendChild(item);
  });
}

// Load services
function loadServices() {
  db.collection('services')
    .orderBy('order')
    .onSnapshot((snapshot) => {
      const services = [];
      snapshot.forEach(doc => {
        services.push({ id: doc.id, ...doc.data() });
      });
      
      allServices = services;
      renderServices(services);
    });
}

// Render services
function renderServices(services) {
  const container = document.getElementById('services-list');
  container.innerHTML = '';
  
  if (services.length === 0) {
    container.innerHTML = '<p class="text-center text-white/60">Belum ada layanan</p>';
    return;
  }
  
  services.forEach(service => {
    const item = document.createElement('div');
    item.className = 'rounded-2xl border border-white/10 bg-slate-900/70 p-6';
    item.innerHTML = `
      <div class="flex items-start justify-between">
        <div class="flex gap-4">
          <div class="rounded-xl bg-emerald-500/10 p-3 text-2xl text-emerald-300">
            <i class="fa-solid ${service.icon}"></i>
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold">${service.name}</h3>
            <p class="text-sm text-white/60 mt-1">${service.description}</p>
            <p class="text-xs text-white/40 mt-2">Order: ${service.order}</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <label class="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              ${service.enabled ? 'checked' : ''}
              onchange="toggleService('${service.id}', this.checked)"
              class="peer sr-only"
            />
            <div class="peer h-6 w-11 rounded-full bg-slate-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-emerald-500 peer-checked:after:translate-x-full"></div>
          </label>
          <span class="text-sm ${service.enabled ? 'text-emerald-300' : 'text-white/40'}">${service.enabled ? 'Aktif' : 'Nonaktif'}</span>
        </div>
      </div>
    `;
    container.appendChild(item);
  });
}

// Toggle service enabled/disabled
async function toggleService(serviceId, enabled) {
  try {
    await db.collection('services').doc(serviceId).update({
      enabled: enabled,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Error toggling service:', error);
    alert('Gagal mengubah status layanan');
  }
}

// Open edit request modal
function openEditRequestModal(requestId) {
  const request = allRequests.find(r => r.id === requestId);
  if (!request) return;
  
  document.getElementById('edit-request-id').value = request.id;
  document.getElementById('edit-status').value = request.status || 'pending';
  document.getElementById('edit-officer').value = request.assignedOfficer || '';
  document.getElementById('edit-estimated').value = request.estimatedCompletion || '';
  
  const modal = document.getElementById('edit-request-modal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

// Close edit request modal
function closeEditRequestModal() {
  const modal = document.getElementById('edit-request-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

// Handle update request
async function handleUpdateRequest(event) {
  event.preventDefault();
  
  const requestId = document.getElementById('edit-request-id').value;
  const status = document.getElementById('edit-status').value;
  const officer = document.getElementById('edit-officer').value.trim();
  const estimated = document.getElementById('edit-estimated').value;
  
  try {
    const updateData = {
      status: status,
      statusText: getStatusText(status),
      assignedOfficer: officer,
      estimatedCompletion: estimated,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // Update timeline based on status
    const request = allRequests.find(r => r.id === requestId);
    if (request && request.timeline) {
      const timeline = [...request.timeline];
      
      // Mark current step as completed and add new step if status changed
      if (status === 'in-progress' && !timeline.some(t => t.step === 'Sedang Diproses')) {
        timeline.forEach(t => t.current = false);
        timeline.push({
          date: new Date().toISOString(),
          step: 'Sedang Diproses',
          completed: false,
          current: true
        });
      } else if (status === 'completed') {
        timeline.forEach(t => {
          t.completed = true;
          t.current = false;
        });
        if (!timeline.some(t => t.step === 'Selesai')) {
          timeline.push({
            date: new Date().toISOString(),
            step: 'Selesai',
            completed: true,
            current: false
          });
        }
      }
      
      updateData.timeline = timeline;
    }
    
    await db.collection('requests').doc(requestId).update(updateData);
    
    closeEditRequestModal();
    alert('Permohonan berhasil diperbarui');
  } catch (error) {
    console.error('Error updating request:', error);
    alert('Gagal memperbarui permohonan');
  }
}

// Get status class
function getStatusClass(status) {
  switch (status) {
    case 'pending':
      return 'bg-yellow-500/20 text-yellow-300';
    case 'in-progress':
      return 'bg-blue-500/20 text-blue-300';
    case 'completed':
      return 'bg-emerald-500/20 text-emerald-300';
    case 'rejected':
      return 'bg-rose-500/20 text-rose-300';
    default:
      return 'bg-white/10 text-white/60';
  }
}

// Get status text
function getStatusText(status) {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'in-progress':
      return 'Sedang Diproses';
    case 'completed':
      return 'Selesai';
    case 'rejected':
      return 'Ditolak';
    default:
      return status;
  }
}

// Format date
function formatDate(timestamp) {
  if (!timestamp) return '-';
  
  try {
    let date;
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      date = new Date(timestamp);
    }
    
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return '-';
  }
}

// Make functions available globally for onclick handlers
window.toggleService = toggleService;
window.openEditRequestModal = openEditRequestModal;
window.closeEditRequestModal = closeEditRequestModal;
