// SOBAT HIJAU - Main Application Logic with Firebase

let servicesData = [];
let currentTrackingListener = null;

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
  setupEventListeners();
});

// Initialize application
function initializeApp() {
  loadStatistics();
  loadServices();
  updateCurrentYear();
}

// Load real-time statistics from Firestore
function loadStatistics() {
  db.collection('statistics').doc('current').onSnapshot((doc) => {
    if (doc.exists) {
      const data = doc.data();
      updateStatisticsUI(data);
    } else {
      console.warn('Statistics document not found');
    }
  }, (error) => {
    console.error('Error loading statistics:', error);
  });
}

// Update statistics UI
function updateStatisticsUI(data) {
  const totalRequestsEl = document.querySelector('[data-stat="totalRequests"]');
  const totalCompletedEl = document.querySelector('[data-stat="totalCompleted"]');
  
  if (totalRequestsEl) {
    animateCounter(totalRequestsEl, data.totalRequests || 0);
  }
  
  if (totalCompletedEl) {
    animateCounter(totalCompletedEl, data.totalCompleted || 0);
  }
  
  // Update completion rate if element exists
  const completionRateEl = document.querySelector('[data-stat="completionRate"]');
  if (completionRateEl && data.completionRate) {
    completionRateEl.textContent = `${data.completionRate}% penyelesaian tepat waktu`;
  }
}

// Animate counter
function animateCounter(element, target) {
  const current = parseInt(element.textContent.replace(/\D/g, '')) || 0;
  if (current === target) return;
  
  const duration = 1000;
  const startTime = performance.now();
  
  function update(currentTime) {
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const value = Math.floor(current + (target - current) * progress);
    element.textContent = value.toLocaleString('id-ID');
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}

// Load enabled services from Firestore
async function loadServices() {
  try {
    const snapshot = await db.collection('services')
      .where('enabled', '==', true)
      .orderBy('order')
      .get();
    
    servicesData = [];
    snapshot.forEach(doc => {
      servicesData.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    populateServiceDropdown();
  } catch (error) {
    console.error('Error loading services:', error);
    const dropdown = document.getElementById('service-type');
    if (dropdown) {
      dropdown.innerHTML = '<option value="" disabled selected>Error memuat layanan</option>';
    }
  }
}

// Populate service dropdown
function populateServiceDropdown() {
  const dropdown = document.getElementById('service-type');
  if (!dropdown) return;
  
  dropdown.innerHTML = '<option value="" disabled selected>Pilih layanan</option>';
  
  servicesData.forEach(service => {
    const option = document.createElement('option');
    option.value = service.id;
    option.textContent = service.name;
    option.dataset.serviceName = service.name;
    option.dataset.icon = service.icon;
    dropdown.appendChild(option);
  });
}

// Setup event listeners
function setupEventListeners() {
  // Modal controls
  const modal = document.getElementById('request-modal');
  const requestForm = document.getElementById('request-form');
  
  document.querySelectorAll('[data-open-modal]').forEach(button => {
    button.addEventListener('click', () => {
      const service = button.dataset.service || '';
      openModal(service);
    });
  });
  
  document.querySelectorAll('[data-close-modal]').forEach(element => {
    element.addEventListener('click', closeModal);
  });
  
  // Form submission
  if (requestForm) {
    requestForm.addEventListener('submit', handleFormSubmit);
  }
  
  // Tracking
  const trackButton = document.getElementById('track-button');
  const trackingInput = document.getElementById('tracking-number');
  
  if (trackButton) {
    trackButton.addEventListener('click', handleTracking);
  }
  
  if (trackingInput) {
    trackingInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleTracking();
      }
    });
  }
}

// Open modal
function openModal(serviceId = '') {
  const modal = document.getElementById('request-modal');
  const serviceSelect = document.getElementById('service-type');
  
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
  
  if (serviceSelect && serviceId) {
    serviceSelect.value = serviceId;
  } else if (serviceSelect) {
    serviceSelect.selectedIndex = 0;
  }
}

// Close modal
function closeModal() {
  const modal = document.getElementById('request-modal');
  const requestForm = document.getElementById('request-form');
  const requestFeedback = document.getElementById('request-feedback');
  
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
  
  if (requestForm) {
    requestForm.reset();
  }
  
  if (requestFeedback) {
    requestFeedback.classList.add('hidden');
  }
}

// Handle form submission
async function handleFormSubmit(event) {
  event.preventDefault();
  
  const submitButton = event.target.querySelector('button[type="submit"]');
  const originalButtonText = submitButton.textContent;
  
  try {
    // Disable button and show loading
    submitButton.disabled = true;
    submitButton.textContent = 'Mengirim...';
    
    // Get form data
    const formData = {
      name: document.getElementById('applicant-name').value.trim(),
      email: document.getElementById('applicant-email').value.trim(),
      serviceType: document.getElementById('service-type').value,
      notes: document.getElementById('applicant-notes').value.trim()
    };
    
    // Get service name
    const serviceOption = document.querySelector(`#service-type option[value="${formData.serviceType}"]`);
    formData.serviceName = serviceOption ? serviceOption.dataset.serviceName : formData.serviceType;
    
    // Submit to Firestore
    const regNumber = await submitRequest(formData);
    
    // Show success message
    const requestFeedback = document.getElementById('request-feedback');
    if (requestFeedback) {
      requestFeedback.classList.remove('hidden');
      requestFeedback.textContent = `Permohonan berhasil! Nomor registrasi Anda: ${regNumber}. Petugas kami akan menghubungi dalam 1x24 jam.`;
    }
    
    // Close modal after delay
    setTimeout(() => {
      closeModal();
      
      // Scroll to tracking section and auto-fill
      const trackingInput = document.getElementById('tracking-number');
      if (trackingInput) {
        trackingInput.value = regNumber;
        document.getElementById('tracking').scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => handleTracking(), 500);
      }
    }, 3000);
    
  } catch (error) {
    console.error('Error submitting request:', error);
    
    const requestFeedback = document.getElementById('request-feedback');
    if (requestFeedback) {
      requestFeedback.classList.remove('hidden');
      requestFeedback.classList.add('text-rose-300');
      requestFeedback.textContent = 'Terjadi kesalahan. Silakan coba lagi.';
    }
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
  }
}

// Submit request to Firestore
async function submitRequest(formData) {
  // Generate registration number
  const year = new Date().getFullYear();
  const counterRef = db.collection('counters').doc('requests');
  
  // Use transaction to ensure unique registration numbers
  const regNumber = await db.runTransaction(async (transaction) => {
    const counterDoc = await transaction.get(counterRef);
    const count = counterDoc.exists ? (counterDoc.data().count + 1) : 1;
    const regNum = `REG-${year}-${String(count).padStart(4, '0')}`;
    
    // Update counter
    transaction.set(counterRef, { count: count, year: year }, { merge: true });
    
    // Create request document
    const requestRef = db.collection('requests').doc(regNum);
    transaction.set(requestRef, {
      registrationNumber: regNum,
      applicantName: formData.name,
      email: formData.email,
      phone: formData.phone || '',
      serviceType: formData.serviceType,
      serviceName: formData.serviceName,
      notes: formData.notes || '',
      status: 'pending',
      statusText: 'Permohonan Diterima',
      assignedOfficer: '',
      estimatedCompletion: '',
      timeline: [{
        date: new Date().toISOString(),
        step: 'Permohonan Diterima',
        completed: true,
        current: true
      }],
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    return regNum;
  });
  
  return regNumber;
}

// Handle tracking
function handleTracking() {
  const trackingInput = document.getElementById('tracking-number');
  if (!trackingInput) return;
  
  const regNumber = trackingInput.value.trim().toUpperCase();
  
  if (!regNumber) {
    const trackingResult = document.getElementById('tracking-result');
    if (trackingResult) {
      trackingResult.innerHTML = '<p class="text-center text-rose-200">Masukkan nomor registrasi terlebih dahulu.</p>';
    }
    return;
  }
  
  trackRequest(regNumber);
}

// Track request with real-time listener
function trackRequest(regNumber) {
  const resultDiv = document.getElementById('tracking-result');
  if (!resultDiv) return;
  
  // Clear previous listener if exists
  if (currentTrackingListener) {
    currentTrackingListener();
    currentTrackingListener = null;
  }
  
  // Show loading
  resultDiv.innerHTML = '<p class="text-center text-white/60">Mencari data...</p>';
  
  // Setup real-time listener
  currentTrackingListener = db.collection('requests').doc(regNumber).onSnapshot((doc) => {
    if (doc.exists) {
      renderTrackingResult(doc.data());
    } else {
      resultDiv.innerHTML = `
        <div class="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-5 text-center text-sm">
          <p class="font-semibold text-rose-200">Data tidak ditemukan</p>
          <p class="mt-2 text-white/70">Nomor <span class="font-mono">${regNumber}</span> belum terdaftar atau masih diproses inputnya.</p>
        </div>`;
    }
  }, (error) => {
    console.error('Error tracking request:', error);
    resultDiv.innerHTML = '<p class="text-center text-rose-200">Terjadi kesalahan saat melacak permohonan.</p>';
  });
}

// Render tracking result
function renderTrackingResult(data) {
  const resultDiv = document.getElementById('tracking-result');
  if (!resultDiv) return;
  
  const timeline = data.timeline || [];
  
  resultDiv.innerHTML = `
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="text-xs uppercase tracking-[0.4em] text-emerald-200">Status Saat Ini</p>
        <p class="mt-2 text-2xl font-display">${data.statusText || data.status || 'Pending'}</p>
      </div>
      <span class="rounded-full bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">${data.registrationNumber}</span>
    </div>
    <div class="mt-6 grid gap-4 text-sm text-white/80">
      <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p class="text-white/60">Pemohon</p>
        <p class="font-semibold text-white">${data.applicantName || '-'}</p>
      </div>
      <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p class="text-white/60">Jenis Layanan</p>
        <p class="font-semibold text-white">${data.serviceName || data.serviceType || '-'}</p>
      </div>
      ${data.assignedOfficer ? `
      <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p class="text-white/60">Petugas Penanggung Jawab</p>
        <p class="font-semibold text-white">${data.assignedOfficer}</p>
      </div>` : ''}
      ${data.estimatedCompletion ? `
      <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p class="text-white/60">Estimasi Penyelesaian</p>
        <p class="font-semibold text-white">${formatDate(data.estimatedCompletion)}</p>
      </div>` : ''}
    </div>
    ${timeline.length > 0 ? `
    <div class="mt-6">
      <p class="text-xs uppercase tracking-[0.4em] text-emerald-200">Timeline Progres</p>
      <ul class="mt-3 space-y-3">
        ${timeline.map((item, index) => `
          <li class="flex items-center gap-3 rounded-2xl border ${item.completed ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-white/10 bg-slate-950/60'} px-4 py-3">
            <span class="flex h-8 w-8 items-center justify-center rounded-full ${item.completed ? 'bg-emerald-500/20 text-emerald-200' : 'bg-white/10 text-white/60'} text-sm font-semibold">
              ${item.completed ? '<i class="fa-solid fa-check"></i>' : (index + 1)}
            </span>
            <div class="flex-1">
              <span class="${item.completed ? 'text-white' : 'text-white/60'}">${item.step}</span>
              ${item.date ? `<p class="text-xs text-white/40 mt-1">${formatDate(item.date)}</p>` : ''}
            </div>
            ${item.current ? '<span class="rounded-full bg-emerald-400/20 px-3 py-1 text-xs text-emerald-200">Sedang Berjalan</span>' : ''}
          </li>`).join('')}
      </ul>
    </div>` : ''}
  `;
}

// Format date
function formatDate(dateString) {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
}

// Update current year in footer
function updateCurrentYear() {
  const yearSpan = document.getElementById('current-year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
}
