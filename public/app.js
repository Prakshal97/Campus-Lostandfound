// Reclaim — Clean & Simple Client Script

let currentUser = 'user_aanya';
let currentCategory = '';
let formCurrentStep = 1;

document.addEventListener('DOMContentLoaded', () => {
  const now = new Date();
  const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  const dateInput = document.getElementById('form-date');
  if (dateInput) dateInput.value = localIso;

  loadItems();
  loadAdminStats();
  loadNotifications();
});

function switchView(viewName) {
  const homeView = document.getElementById('view-home');
  const adminView = document.getElementById('view-admin');
  const navHome = document.getElementById('nav-home');
  const navAdmin = document.getElementById('nav-admin');

  if (viewName === 'admin') {
    homeView.style.display = 'none';
    adminView.style.display = 'block';
    navHome.classList.remove('active');
    navAdmin.classList.add('active');
    loadAdminStats();
    loadAdminQueue();
  } else {
    homeView.style.display = 'block';
    adminView.style.display = 'none';
    navAdmin.classList.remove('active');
    navHome.classList.add('active');
    loadItems();
  }
}

function changeUserRole(roleId) {
  currentUser = roleId;
  const roleNames = {
    'user_aanya': 'Aanya (Owner)',
    'user_rohan': 'Rohan (Finder)',
    'user_patil': 'Mr. Patil (Admin)'
  };
  showToast(`Role switched to: ${roleNames[roleId]}`);
  loadNotifications();
  loadItems();
  if (document.getElementById('view-admin').style.display !== 'none') {
    loadAdminStats();
    loadAdminQueue();
  }
}

async function loadItems() {
  try {
    const type = document.getElementById('filter-type').value;
    const location = document.getElementById('filter-location').value;
    const status = document.getElementById('filter-status').value;
    const search = document.getElementById('search-input').value.trim();

    let queryParams = new URLSearchParams();
    if (type) queryParams.append('type', type);
    if (location) queryParams.append('location', location);
    if (status) queryParams.append('status', status);
    if (currentCategory) queryParams.append('category', currentCategory);
    if (search) queryParams.append('q', search);

    const res = await fetch(`/api/v1/items?${queryParams.toString()}`);
    const data = await res.json();

    renderItemsGrid(data.items || []);
    
    const countLabel = document.getElementById('total-count-label');
    if (countLabel) {
      countLabel.textContent = `Showing ${data.total} items`;
    }
  } catch (err) {
    console.error('Error fetching items:', err);
  }
}

function renderItemsGrid(items) {
  const container = document.getElementById('items-grid');
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align:center; padding: 3rem 1rem; background:white; border-radius:var(--radius-lg); border:1px solid var(--border-color);">
        <div style="font-size:2.5rem; margin-bottom:0.5rem;">🔍</div>
        <h3 style="font-size:1.1rem;">No items found</h3>
        <p style="color:var(--text-muted); font-size:0.9rem;">Try adjusting filters or submit a new report.</p>
        <button class="btn btn-primary" style="margin-top:1rem;" onclick="openReportModal('lost')">Report an Item</button>
      </div>
    `;
    return;
  }

  container.innerHTML = items.map(item => {
    const relativeTime = getRelativeTime(item.createdAt);
    const badgeClass = `badge-${item.status.toLowerCase()}`;
    const zoneName = getZoneName(item.location);

    return `
      <div class="card">
        <div class="card-img-box">
          <img src="${item.imageUrl}" alt="${escapeHtml(item.title)}" class="card-img" onerror="this.src='/assets/placeholder_item.jpg'">
          ${item.isSensitive ? `
            <div style="position:absolute; inset:0; backdrop-filter:blur(10px); background:rgba(255,255,255,0.7); display:flex; align-items:center; justify-content:center; font-weight:600; font-size:0.85rem; color:var(--text-main);">
              🔒 Photo Masked
            </div>
          ` : ''}
          <span class="status-badge ${badgeClass}">${item.status}</span>
        </div>
        <div class="card-content">
          <div class="card-category">${escapeHtml(item.category)} • ${item.type.toUpperCase()}</div>
          <h3 class="card-title">${escapeHtml(item.title)}</h3>
          <p class="card-desc">${escapeHtml(item.description)}</p>

          <div class="card-footer">
            <span>📍 ${escapeHtml(zoneName)}</span>
            <span>⏱️ ${relativeTime}</span>
          </div>

          <div class="card-actions">
            <button class="btn btn-sm btn-secondary" style="flex:1;" onclick="openItemDetail('${item._id}')">
              Details
            </button>
            ${item.type === 'found' && item.status !== 'Returned' ? `
              <button class="btn btn-sm btn-primary" style="flex:1;" onclick="prepareClaim('${item._id}')">
                This is Mine
              </button>
            ` : `
              <button class="btn btn-sm btn-secondary" style="flex:1;" onclick="openItemDetail('${item._id}')">
                Matches
              </button>
            `}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function setCategoryFilter(category, btnElement) {
  currentCategory = category;
  document.querySelectorAll('.category-tags .tag-btn').forEach(p => p.classList.remove('active'));
  if (btnElement) btnElement.classList.add('active');
  loadItems();
}

let searchTimeout;
function onSearchInput() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    loadItems();
  }, 300);
}

// Stepped Report Modal
function openReportModal(type = 'lost') {
  document.getElementById('modal-report').classList.add('open');
  document.getElementById('form-type').value = type;
  onReportTypeChange(type);
  goToFormStep(1);
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('open');
}

function onReportTypeChange(type) {
  const foundFields = document.getElementById('found-only-fields');
  const modalTitle = document.getElementById('report-modal-title');
  if (type === 'found') {
    foundFields.style.display = 'block';
    modalTitle.textContent = 'Report Found Item';
  } else {
    foundFields.style.display = 'none';
    modalTitle.textContent = 'Report Lost Item';
  }
}

function goToFormStep(step) {
  formCurrentStep = step;
  [1, 2, 3].forEach(s => {
    const el = document.getElementById(`report-step-${s}`);
    const pill = document.getElementById(`step-pill-${s}`);
    if (s === step) {
      el.style.display = 'block';
      pill.classList.add('active');
    } else {
      el.style.display = 'none';
      if (s < step) pill.classList.add('active');
      else pill.classList.remove('active');
    }
  });
}

async function submitReportForm(e) {
  e.preventDefault();
  const form = document.getElementById('report-form');
  const formData = new FormData();

  formData.append('type', document.getElementById('form-type').value);
  formData.append('category', document.getElementById('form-category').value);
  formData.append('title', document.getElementById('form-title').value);
  formData.append('description', document.getElementById('form-description').value);
  formData.append('location', document.getElementById('form-location').value);
  formData.append('eventDate', document.getElementById('form-date').value);
  formData.append('custody', document.getElementById('form-custody').value);
  formData.append('verifyQuestion', document.getElementById('form-verify-q').value);
  formData.append('verifyAnswer', document.getElementById('form-verify-a').value);
  formData.append('isSensitive', document.getElementById('form-sensitive').checked);
  formData.append('reportedBy', currentUser);

  const fileInput = document.getElementById('form-photo');
  if (fileInput.files[0]) {
    formData.append('photo', fileInput.files[0]);
  }

  try {
    const res = await fetch('/api/v1/items', { method: 'POST', body: formData });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error ? data.error.message : 'Error submitting report');
      return;
    }

    closeModal('modal-report');
    form.reset();
    showToast('Item report created successfully!');
    if (data.matches && data.matches.length > 0) {
      openItemDetail(data.item._id);
    } else {
      loadItems();
    }
    loadAdminStats();
  } catch (err) {
    console.error('Error submitting form:', err);
  }
}

// Item Details & Match View
async function openItemDetail(id) {
  try {
    const res = await fetch(`/api/v1/items/${id}`);
    const data = await res.json();
    if (!res.ok) return;

    const { item, logs, claims, matches } = data;
    const modal = document.getElementById('modal-detail');
    const body = document.getElementById('detail-body');
    const title = document.getElementById('detail-title');

    title.textContent = item.title;

    body.innerHTML = `
      <div style="display:grid; grid-template-columns: 120px 1fr; gap:1rem; margin-bottom:1.25rem;">
        <img src="${item.imageUrl}" style="width:120px; height:120px; object-fit:cover; border-radius:var(--radius-md); border:1px solid var(--border-color);" onerror="this.src='/assets/placeholder_item.jpg'">
        <div>
          <div style="display:flex; gap:0.5rem; margin-bottom:0.25rem;">
            <span class="status-badge badge-${item.status.toLowerCase()}">${item.status}</span>
            <span style="font-size:0.75rem; background:var(--primary-light); color:var(--primary); padding:0.2rem 0.5rem; border-radius:12px; font-weight:700;">${item.type.toUpperCase()}</span>
          </div>
          <p style="color:var(--text-muted); font-size:0.9rem; margin-bottom:0.5rem;">${escapeHtml(item.description)}</p>
          <div style="font-size:0.85rem; color:var(--text-main);">
            <div><strong>Location:</strong> ${getZoneName(item.location)}</div>
            <div><strong>Custody:</strong> ${item.custody}</div>
          </div>
        </div>
      </div>

      <!-- Match Suggestions -->
      <div style="background:#f8fafc; border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1rem; margin-bottom:1.25rem;">
        <h4 style="font-size:0.95rem; margin-bottom:0.5rem; color:var(--primary);">🎯 Match Suggestions (${matches.length})</h4>
        ${matches.length === 0 ? `
          <p style="color:var(--text-muted); font-size:0.85rem;">No matches scoring above 50% threshold yet.</p>
        ` : matches.map(m => `
          <div style="background:white; border:1px solid var(--border-color); border-radius:var(--radius-md); padding:0.75rem; margin-bottom:0.5rem;">
            <div style="display:flex; justify-space-between; align-items:center; margin-bottom:0.25rem;">
              <strong style="font-size:0.9rem;">${escapeHtml(m.item.title)}</strong>
              <span style="background:var(--warning-light); color:#b45309; font-size:0.75rem; padding:0.2rem 0.5rem; border-radius:12px; font-weight:700;">${m.score}% Match</span>
            </div>
            <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:0.5rem;">${m.reasons.join(' • ')}</div>
            ${m.item.type === 'found' ? `
              <button class="btn btn-sm btn-primary" style="width:100%;" onclick="prepareClaim('${m.item._id}')">This is Mine (Claim Match)</button>
            ` : ''}
          </div>
        `).join('')}
      </div>

      <!-- Active Claim -->
      ${claims.length > 0 ? `
        <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:var(--radius-md); padding:1rem; margin-bottom:1.25rem;">
          <h4 style="font-size:0.95rem; color:var(--success); margin-bottom:0.5rem;">Claim Status: ${claims[0].status.toUpperCase()}</h4>
          ${claims[0].rawOtp ? `
            <div class="otp-box">
              <div style="font-size:0.8rem; color:var(--text-muted);">SECURITY HANDOVER OTP</div>
              <div class="otp-number">${claims[0].rawOtp}</div>
              <div style="font-size:0.8rem;">Present this 4-digit OTP at Security Desk</div>
            </div>
          ` : ''}
          ${claims[0].status === 'pending' && currentUser === 'user_patil' ? `
            <div style="display:flex; gap:0.5rem; margin-top:0.5rem;">
              <button class="btn btn-sm btn-primary" onclick="approveClaim('${claims[0]._id}')">Approve Claim & Issue OTP</button>
              <button class="btn btn-sm btn-secondary" onclick="rejectClaim('${claims[0]._id}')">Reject Claim</button>
            </div>
          ` : ''}
          ${claims[0].status === 'verified' && currentUser === 'user_patil' ? `
            <div style="margin-top:0.75rem;">
              <label style="font-size:0.85rem; font-weight:600;">Verify Handover OTP:</label>
              <div style="display:flex; gap:0.5rem; margin-top:0.35rem;">
                <input type="text" id="otp-input-${claims[0]._id}" class="form-input" placeholder="e.g. 4829" style="width:120px;" maxlength="4">
                <button class="btn btn-success btn-sm" onclick="verifyHandover('${claims[0]._id}')">Complete Handover</button>
              </div>
            </div>
          ` : ''}
        </div>
      ` : ''}

      <!-- Timeline -->
      <div>
        <h4 style="font-size:0.95rem; margin-bottom:0.5rem;">Activity History</h4>
        <div style="font-size:0.8rem; color:var(--text-muted); display:flex; flex-direction:column; gap:0.25rem;">
          ${logs.map(l => `
            <div style="background:#f8fafc; padding:0.4rem 0.6rem; border-radius:4px; display:flex; justify-space-between;">
              <span><strong>${l.action}</strong> by ${l.actor}</span>
              <span>${new Date(l.timestamp).toLocaleTimeString()}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    modal.classList.add('open');
  } catch (err) {
    console.error('Error opening detail:', err);
  }
}

// Claims
async function prepareClaim(itemId) {
  try {
    const res = await fetch(`/api/v1/items/${itemId}`);
    const data = await res.json();
    if (!res.ok) return;

    const item = data.item;
    document.getElementById('claim-item-id').value = item._id;

    const qContainer = document.getElementById('claim-q-container');
    const qLabel = document.getElementById('claim-q-label');
    if (item.verifyQuestion) {
      qContainer.style.display = 'block';
      qLabel.textContent = `Finder Question: "${item.verifyQuestion}"`;
    } else {
      qContainer.style.display = 'none';
    }

    closeModal('modal-detail');
    document.getElementById('modal-claim').classList.add('open');
  } catch (err) {
    console.error('Error preparing claim:', err);
  }
}

async function submitClaimForm(e) {
  e.preventDefault();
  const itemId = document.getElementById('claim-item-id').value;
  const answer = document.getElementById('claim-answer').value;
  const markDescription = document.getElementById('claim-mark').value;

  try {
    const res = await fetch(`/api/v1/items/${itemId}/claims`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claimant: currentUser, answer, markDescription })
    });

    const data = await res.json();
    if (!res.ok) return;

    closeModal('modal-claim');
    showToast('Claim submitted for verification.');
    openItemDetail(itemId);
    loadAdminStats();
  } catch (err) {
    console.error('Submit claim error:', err);
  }
}

async function approveClaim(claimId) {
  try {
    const res = await fetch(`/api/v1/claims/${claimId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve', decidedBy: currentUser })
    });

    const data = await res.json();
    if (!res.ok) return;

    showToast(`Claim Approved! Handover OTP: ${data.rawOtp}`);
    loadAdminStats();
    if (document.getElementById('modal-detail').classList.contains('open')) {
      openItemDetail(data.claim.item);
    }
  } catch (err) {
    console.error('Approve claim error:', err);
  }
}

async function rejectClaim(claimId) {
  try {
    const res = await fetch(`/api/v1/claims/${claimId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reject', decidedBy: currentUser })
    });
    if (res.ok) {
      showToast('Claim rejected.');
      loadAdminStats();
    }
  } catch (err) {
    console.error('Reject claim error:', err);
  }
}

async function verifyHandover(claimId) {
  const input = document.getElementById(`otp-input-${claimId}`);
  if (!input) return;
  const otp = input.value.trim();

  try {
    const res = await fetch(`/api/v1/claims/${claimId}/handover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp, actorId: currentUser })
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error ? data.error.message : 'Invalid OTP');
      return;
    }

    if (typeof confetti === 'function') {
      confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 } });
    }

    showToast('Item handover complete!');
    openItemDetail(data.item._id);
    loadItems();
    loadAdminStats();
  } catch (err) {
    console.error('Handover error:', err);
  }
}

// Admin Stats & Map
async function loadAdminStats() {
  try {
    const res = await fetch('/api/v1/admin/stats');
    const data = await res.json();
    if (!res.ok) return;

    const { stats } = data;
    const recEl = document.getElementById('stat-recovery');
    if (recEl) recEl.textContent = `${stats.recoveryRate}%`;
    const retEl = document.getElementById('stat-returned');
    if (retEl) retEl.textContent = stats.returnedCount;
    const deskEl = document.getElementById('stat-desk');
    if (deskEl) deskEl.textContent = stats.deskCount;

    renderCampusHeatmap(data.zones, stats.zoneCounts);
  } catch (err) {
    console.error('Error loading admin stats:', err);
  }
}

function renderCampusHeatmap(zones, zoneCounts = {}) {
  const svg = document.getElementById('campus-heatmap-svg');
  if (!svg || !zones) return;

  svg.innerHTML = `
    <rect width="1000" height="450" fill="#f8fafc" rx="8" />
    ${zones.map(z => {
      const cx = z.x * 10;
      const cy = z.y * 4.5;
      const count = zoneCounts[z.id] || 0;
      const color = count > 2 ? '#ef4444' : count > 0 ? '#f59e0b' : '#6366f1';

      return `
        <g style="cursor:pointer;" onclick="filterByHeatmapZone('${z.id}')">
          <circle cx="${cx}" cy="${cy}" r="22" fill="${color}" opacity="0.15" />
          <circle cx="${cx}" cy="${cy}" r="12" fill="white" stroke="${color}" stroke-width="2" />
          <text x="${cx}" y="${cy + 4}" font-size="11" font-weight="bold" fill="#0f172a" text-anchor="middle">${count}</text>
          <text x="${cx}" y="${cy + 32}" font-size="11" font-weight="600" fill="#475569" text-anchor="middle">${z.name}</text>
        </g>
      `;
    }).join('')}
  `;
}

function filterByHeatmapZone(zoneId) {
  document.getElementById('filter-location').value = zoneId;
  switchView('home');
  loadItems();
}

async function loadAdminQueue() {
  try {
    const res = await fetch('/api/v1/items');
    const data = await res.json();
    const items = data.items || [];
    const tbody = document.getElementById('admin-queue-tbody');
    if (!tbody) return;

    tbody.innerHTML = items.map(i => `
      <tr style="border-bottom:1px solid var(--border-color);">
        <td style="padding:0.6rem;">
          <strong>${escapeHtml(i.title)}</strong><br>
          <span style="font-size:0.75rem; color:var(--text-muted);">${i.category} • ${i.type}</span>
        </td>
        <td style="padding:0.6rem;">${getZoneName(i.location)}</td>
        <td style="padding:0.6rem;">${i.custody}</td>
        <td style="padding:0.6rem;"><span class="status-badge badge-${i.status.toLowerCase()}">${i.status}</span></td>
        <td style="padding:0.6rem;">
          <button class="btn btn-sm btn-secondary" onclick="openItemDetail('${i._id}')">Manage</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Error loading admin queue:', err);
  }
}

// Notifications & QR
async function loadNotifications() {
  try {
    const res = await fetch(`/api/v1/me/notifications?userId=${currentUser}`);
    const data = await res.json();
    const notifs = data.notifications || [];

    const badge = document.getElementById('notif-count');
    const unread = notifs.filter(n => !n.read).length;
    if (badge) badge.textContent = unread;

    const list = document.getElementById('notif-list');
    if (!list) return;

    if (notifs.length === 0) {
      list.innerHTML = `<div style="text-align:center; padding:1rem; color:var(--text-muted); font-size:0.85rem;">No notifications</div>`;
      return;
    }

    list.innerHTML = notifs.map(n => `
      <div style="background:#f8fafc; border:1px solid var(--border-color); border-radius:var(--radius-md); padding:0.75rem; margin-bottom:0.5rem; font-size:0.85rem; cursor:pointer;" onclick="openNotifItem('${n._id}', '${n.itemId}')">
        <strong style="display:block;">${n.title}</strong>
        <p style="color:var(--text-muted); font-size:0.8rem; margin-top:0.2rem;">${n.message}</p>
      </div>
    `).join('');
  } catch (err) {
    console.error('Error loading notifications:', err);
  }
}

function toggleNotifDrawer() {
  document.getElementById('notif-drawer').classList.toggle('open');
}

async function openNotifItem(notifId, itemId) {
  try {
    await fetch(`/api/v1/me/notifications/${notifId}/read`, { method: 'PATCH' });
    loadNotifications();
    toggleNotifDrawer();
    if (itemId) openItemDetail(itemId);
  } catch (err) {
    console.error('Error reading notification:', err);
  }
}

function openQrModal() {
  document.getElementById('modal-qr').classList.add('open');
  generateQrPoster('canteen');
}

function generateQrPoster(zoneId) {
  const names = { canteen: 'STUDENT CANTEEN', library: 'CENTRAL LIBRARY', lab_block: 'ENGINEERING LABS' };
  document.getElementById('qr-poster-zone-name').textContent = names[zoneId] || zoneId.toUpperCase();
}

async function resetDemoData() {
  try {
    const res = await fetch('/api/v1/admin/seed', { method: 'POST' });
    const data = await res.json();
    showToast('Demo data reset.');
    loadItems();
    loadAdminStats();
  } catch (err) {
    console.error('Reset error:', err);
  }
}

function showToast(msg) {
  const t = document.createElement('div');
  t.style.position = 'fixed';
  t.style.bottom = '20px';
  t.style.right = '20px';
  t.style.background = '#0f172a';
  t.style.color = 'white';
  t.style.padding = '0.6rem 1rem';
  t.style.borderRadius = '8px';
  t.style.fontSize = '0.85rem';
  t.style.zIndex = '10000';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
}

function getZoneName(id) {
  const map = { library: 'Central Library', canteen: 'Student Canteen', lab_block: 'Engineering Labs', sports_complex: 'Sports Complex', auditorium: 'Auditorium', admin_block: 'Admin Block' };
  return map[id] || id;
}

function getRelativeTime(isoDate) {
  if (!isoDate) return 'Recently';
  const diffSec = Math.floor((new Date() - new Date(isoDate)) / 1000);
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}
