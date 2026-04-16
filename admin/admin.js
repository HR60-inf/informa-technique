/**
 * INFORMA-TECHNIQUE R — admin.js
 * ─────────────────────────────────────────────────────────
 * Logique du panneau d'administration :
 *  - Authentification par mot de passe (côté client)
 *  - Gestion des vidéos (ajouter, modifier, supprimer)
 *  - Appels API vers php/videos.php
 *  - Affichage des messages de contact
 *  - Statistiques
 * ─────────────────────────────────────────────────────────
 *
 * MOT DE PASSE PAR DÉFAUT : admin2025
 * (à changer dans la constante ADMIN_PASSWORD ci-dessous)
 *
 * ⚠️ IMPORTANT : Ce mot de passe est côté client (JavaScript).
 * Pour une sécurité maximale, utilisez uniquement l'API PHP
 * avec le token défini dans php/videos.php (ADMIN_TOKEN).
 */

'use strict';

// ── CONFIGURATION ──────────────────────────────────────
const ADMIN_PASSWORD = 'admin2025'; // ← Changez ce mot de passe !
const API_BASE       = '../php/videos.php';
const ADMIN_TOKEN    = 'informa2025secret'; // Doit correspondre à php/videos.php
const SESSION_KEY    = 'itr_admin_logged';
// ────────────────────────────────────────────────────────

// Données locales (fallback si PHP non disponible)
let localVideos = [];
let editingId   = null;

/* ══════════════════════════════════════════
   AUTHENTIFICATION
══════════════════════════════════════════ */
function login(e) {
  e.preventDefault();
  const pw  = document.getElementById('adminPassword').value;
  const err = document.getElementById('loginError');

  if (pw === ADMIN_PASSWORD) {
    sessionStorage.setItem(SESSION_KEY, '1');
    document.getElementById('loginPage').style.display      = 'none';
    document.getElementById('adminDashboard').style.display = 'flex';
    initAdmin();
  } else {
    err.textContent = '❌ Mot de passe incorrect.';
    document.getElementById('adminPassword').value = '';
    document.getElementById('adminPassword').focus();
  }
}

function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  document.getElementById('loginPage').style.display      = 'flex';
  document.getElementById('adminDashboard').style.display = 'none';
}

/* ══════════════════════════════════════════
   NAVIGATION TABS
══════════════════════════════════════════ */
function showTab(name, el) {
  // Désactiver tous les tabs
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));

  // Activer le tab demandé
  const tab = document.getElementById('tab-' + name);
  if (tab) tab.classList.add('active');
  if (el) el.classList.add('active');

  // Actions spécifiques par tab
  if (name === 'add' && !editingId) resetForm();
  if (name === 'messages') loadMessages();
  if (name === 'stats') renderStats();
}

/* ══════════════════════════════════════════
   INITIALISATION
══════════════════════════════════════════ */
function initAdmin() {
  loadVideos();
  loadMessages();
}

/* ══════════════════════════════════════════
   CHARGEMENT DES VIDÉOS
══════════════════════════════════════════ */
async function loadVideos() {
  try {
    const response = await fetch('../data/videos.json?t=' + Date.now());
    if (!response.ok) throw new Error('Fichier introuvable');
    localVideos = await response.json();
    showToast('✅ ' + localVideos.length + ' vidéos chargées', 'success');
  } catch {
    localVideos = [];
    showToast('⚠️ Aucune vidéo trouvée dans data/videos.json', 'error');
  }
  renderAdminVideos();
  renderStats();
}

/* ══════════════════════════════════════════
   RENDU TABLE VIDÉOS
══════════════════════════════════════════ */
function renderAdminVideos() {
  const search = document.getElementById('adminSearch')?.value.toLowerCase() || '';
  const catFilter = document.getElementById('adminCatFilter')?.value || '';

  let filtered = localVideos.filter(v => {
    const matchSearch = !search
      || v.title.toLowerCase().includes(search)
      || (v.desc || '').toLowerCase().includes(search);
    const matchCat = !catFilter || v.category === catFilter;
    return matchSearch && matchCat;
  });

  const tbody = document.getElementById('adminTableBody');
  const count = document.getElementById('adminVideoCount');

  if (count) count.textContent = filtered.length + ' tutoriel' + (filtered.length > 1 ? 's' : '');

  const catNames = {
    securite: '🔒 Sécurité', navigateur: '🌐 Navigateur',
    crypto: '💰 Crypto', demarches: '📋 Démarches', astuces: '💡 Astuces'
  };
  const platClass = { youtube: 'yt', facebook: 'fb', tiktok: 'tt' };
  const platNames = { youtube: '📺 YouTube', facebook: '👤 Facebook', tiktok: '🎵 TikTok' };

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-table">Aucune vidéo trouvée</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(v => `
    <tr>
      <td style="color:var(--muted);font-size:12px">#${v.id}</td>
      <td>
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-size:20px">${v.emoji || '🎯'}</span>
          <span class="video-title-cell" title="${escHTML(v.title)}">${escHTML(v.title)}</span>
        </div>
      </td>
      <td><span class="cat-badge">${catNames[v.category] || v.category}</span></td>
      <td><span class="plat-badge ${platClass[v.platform] || ''}">${platNames[v.platform] || v.platform}</span></td>
      <td style="color:var(--muted);font-size:13px">${v.views || '—'}</td>
      <td>
        <div class="table-actions">
          <button class="btn-edit" onclick="editVideo(${v.id})">✏️ Modifier</button>
          <button class="btn-delete" onclick="deleteVideo(${v.id}, '${escHTML(v.title).slice(0,30)}...')">🗑️ Suppr.</button>
        </div>
      </td>
    </tr>
  `).join('');
}

/* ══════════════════════════════════════════
   AJOUTER / MODIFIER UNE VIDÉO
══════════════════════════════════════════ */
function editVideo(id) {
  const v = localVideos.find(x => x.id === id);
  if (!v) return;

  editingId = id;
  document.getElementById('formTitle').textContent = '✏️ Modifier la vidéo';
  document.getElementById('editId').value = id;

  document.getElementById('vTitle').value     = v.title || '';
  document.getElementById('vCategory').value  = v.category || '';
  document.getElementById('vPlatform').value  = v.platform || '';
  document.getElementById('vEmoji').value     = v.emoji || '';
  document.getElementById('vViews').value     = v.views || '';
  document.getElementById('vDate').value      = v.date || '';
  document.getElementById('vThumbnail').value = v.thumbnail || '';
  document.getElementById('vDesc').value      = v.desc || '';
  document.getElementById('vTags').value      = (v.tags || []).join(', ');
  document.getElementById('vYoutube').value   = v.links?.youtube  || '';
  document.getElementById('vFacebook').value  = v.links?.facebook || '';
  document.getElementById('vTiktok').value    = v.links?.tiktok   || '';

  showTab('add', document.querySelector('.sidebar-link[onclick*="add"]'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function saveVideo(e) {
  e.preventDefault();

  const feedback = document.getElementById('formFeedback');
  const saveBtn  = document.getElementById('saveBtn');

  feedback.className    = 'form-feedback';
  feedback.style.display = 'none';
  saveBtn.disabled      = true;
  saveBtn.textContent   = '⏳ Enregistrement...';

  const videoData = {
    title:     document.getElementById('vTitle').value.trim(),
    category:  document.getElementById('vCategory').value,
    platform:  document.getElementById('vPlatform').value,
    emoji:     document.getElementById('vEmoji').value.trim() || '🎯',
    views:     document.getElementById('vViews').value.trim() || '0',
    date:      document.getElementById('vDate').value.trim() || formatDate(),
    thumbnail: document.getElementById('vThumbnail').value.trim(),
    desc:      document.getElementById('vDesc').value.trim(),
    tags:      document.getElementById('vTags').value.split(',').map(t => t.trim()).filter(Boolean),
    links: {
      youtube:  document.getElementById('vYoutube').value.trim(),
      facebook: document.getElementById('vFacebook').value.trim(),
      tiktok:   document.getElementById('vTiktok').value.trim(),
    }
  };

  try {
    if (editingId) {
      const idx = localVideos.findIndex(v => v.id === editingId);
      if (idx !== -1) localVideos[idx] = { ...localVideos[idx], ...videoData };
    } else {
      const maxId = localVideos.length > 0 ? Math.max(...localVideos.map(v => v.id)) : 0;
      localVideos.push({ id: maxId + 1, ...videoData, created_at: new Date().toISOString() });
    }

    renderAdminVideos();
    renderStats();

    const msg = editingId ? '✅ Vidéo modifiée !' : '✅ Vidéo ajoutée !';
    feedback.textContent = msg;
    feedback.className = 'form-feedback success';
    feedback.style.display = 'block';
    showToast(msg, 'success');

    // Générer et télécharger le fichier videos.json mis à jour
    exportVideosJSON();

    setTimeout(() => {
      resetForm();
      showTab('videos', document.querySelector('.sidebar-link[onclick*="videos"]'));
    }, 2500);

  } catch (err) {
    feedback.textContent = '❌ ' + err.message;
    feedback.className = 'form-feedback error';
    feedback.style.display = 'block';
    showToast('❌ ' + err.message, 'error');
  } finally {
    saveBtn.disabled    = false;
    saveBtn.textContent = '💾 Enregistrer';
  }
}

/** Exporter videos.json et afficher instructions GitHub */
function exportVideosJSON() {
  const json = JSON.stringify(localVideos, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'videos.json';
  a.click();
  URL.revokeObjectURL(url);

  // Afficher bannière instructions
  showUploadBanner();
}

function showUploadBanner() {
  let banner = document.getElementById('uploadBanner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'uploadBanner';
    banner.style.cssText = `
      position:fixed; bottom:20px; left:50%; transform:translateX(-50%);
      background:#0d1525; border:2px solid #00c8ff; border-radius:16px;
      padding:20px 28px; max-width:480px; width:90%; z-index:9999;
      box-shadow:0 8px 32px rgba(0,200,255,0.2); color:#e8f0fe;
      font-family:'DM Sans',sans-serif; font-size:14px;
    `;
    document.body.appendChild(banner);
  }
  banner.innerHTML = `
    <div style="font-size:18px;font-weight:700;color:#00c8ff;margin-bottom:10px">
      📥 Fichier téléchargé : videos.json
    </div>
    <div style="color:#8ba3c7;margin-bottom:12px;line-height:1.6">
      Pour mettre à jour le site en ligne, uploade ce fichier sur GitHub :
    </div>
    <ol style="padding-left:18px;line-height:2;color:#e8f0fe">
      <li>Va sur <strong>github.com</strong> → dépôt <strong>informa-technique</strong></li>
      <li>Ouvre le dossier <strong>data/</strong></li>
      <li>Clique <strong>"Add file" → "Upload files"</strong></li>
      <li>Uploade <strong>videos.json</strong> → Commit</li>
    </ol>
    <button onclick="document.getElementById('uploadBanner').remove()"
      style="margin-top:14px;padding:8px 20px;background:#00c8ff;color:#000;
      border:none;border-radius:8px;font-weight:700;cursor:pointer;width:100%">
      ✅ Compris !
    </button>
  `;
}

function resetForm() {
  editingId = null;
  document.getElementById('formTitle').textContent = '➕ Ajouter une vidéo';
  document.getElementById('videoForm').reset();
  document.getElementById('editId').value = '';
  const fb = document.getElementById('formFeedback');
  fb.className = 'form-feedback';
  fb.style.display = 'none';
}

/* ══════════════════════════════════════════
   SUPPRIMER UNE VIDÉO
══════════════════════════════════════════ */
async function deleteVideo(id, title) {
  if (!confirm(`⚠️ Supprimer cette vidéo ?\n\n"${title}"\n\nCette action est irréversible.`)) return;

  localVideos = localVideos.filter(v => v.id !== id);
  renderAdminVideos();
  renderStats();
  showToast('✅ Vidéo supprimée !', 'success');
  exportVideosJSON();
}

/* ══════════════════════════════════════════
   MESSAGES DE CONTACT
══════════════════════════════════════════ */
async function loadMessages() {
  const list = document.getElementById('messagesList');
  const badge = document.getElementById('msgBadge');

  list.innerHTML = '<p class="empty-state">⏳ Chargement...</p>';

  try {
    const response = await fetch('../data/messages.json?t=' + Date.now());
    if (!response.ok) throw new Error('Fichier non trouvé');

    const messages = await response.json();

    if (!messages || messages.length === 0) {
      list.innerHTML = '<p class="empty-state">📭 Aucun message reçu pour l\'instant.</p>';
      if (badge) badge.textContent = '';
      return;
    }

    // Afficher les plus récents en premier
    const sorted = [...messages].reverse();
    const unread = sorted.filter(m => !m.lu).length;
    if (badge) badge.textContent = unread > 0 ? unread : '';

    list.innerHTML = sorted.map(m => `
      <div class="message-card ${m.lu ? '' : 'unread'}">
        <div class="message-header">
          <div>
            <div class="message-from">${escHTML(m.nom_complet || m.fname || 'Anonyme')}</div>
            <div class="message-email">${escHTML(m.email)}</div>
          </div>
          <div class="message-date">${formatDateTime(m.date)}</div>
        </div>
        <div class="message-subject">${escHTML(m.sujet_label || m.subject || 'Contact')}</div>
        <div class="message-body">${escHTML(m.message)}</div>
      </div>
    `).join('');

  } catch {
    list.innerHTML = `
      <p class="empty-state">
        📁 Aucun message trouvé.<br>
        <small style="margin-top:8px;display:block">Les messages seront sauvegardés dans <code>data/messages.json</code> quand quelqu'un remplira le formulaire de contact.</small>
      </p>`;
    if (badge) badge.textContent = '';
  }
}

/* ══════════════════════════════════════════
   STATISTIQUES
══════════════════════════════════════════ */
function renderStats() {
  const statsGrid = document.getElementById('statsGrid');
  const catProg   = document.getElementById('categoryProgress');
  const platProg  = document.getElementById('platformProgress');

  if (!statsGrid) return;

  const total = localVideos.length;

  const catCounts = {
    securite:  localVideos.filter(v => v.category === 'securite').length,
    navigateur:localVideos.filter(v => v.category === 'navigateur').length,
    crypto:    localVideos.filter(v => v.category === 'crypto').length,
    demarches: localVideos.filter(v => v.category === 'demarches').length,
    astuces:   localVideos.filter(v => v.category === 'astuces').length,
  };

  const platCounts = {
    youtube:  localVideos.filter(v => v.platform === 'youtube').length,
    facebook: localVideos.filter(v => v.platform === 'facebook').length,
    tiktok:   localVideos.filter(v => v.platform === 'tiktok').length,
  };

  // Stats globales
  statsGrid.innerHTML = `
    <div class="stat-card">
      <div class="stat-num">${total}</div>
      <div class="stat-label">Tutoriels total</div>
    </div>
    <div class="stat-card">
      <div class="stat-num">${catCounts.securite}</div>
      <div class="stat-label">🔒 Sécurité</div>
    </div>
    <div class="stat-card">
      <div class="stat-num">${catCounts.crypto}</div>
      <div class="stat-label">💰 Crypto</div>
    </div>
    <div class="stat-card">
      <div class="stat-num">${catCounts.demarches}</div>
      <div class="stat-label">📋 Démarches</div>
    </div>
    <div class="stat-card">
      <div class="stat-num">${catCounts.astuces}</div>
      <div class="stat-label">💡 Astuces</div>
    </div>
    <div class="stat-card">
      <div class="stat-num">${catCounts.navigateur}</div>
      <div class="stat-label">🌐 Navigateur</div>
    </div>
  `;

  // Barres de progression catégories
  const catItems = [
    ['🔒 Sécurité',   catCounts.securite],
    ['🌐 Navigateur', catCounts.navigateur],
    ['💰 Crypto',     catCounts.crypto],
    ['📋 Démarches',  catCounts.demarches],
    ['💡 Astuces',    catCounts.astuces],
  ];

  if (catProg) {
    catProg.innerHTML = catItems.map(([label, count]) => `
      <div class="progress-item">
        <div class="progress-label">${label}</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${total > 0 ? (count/total*100).toFixed(1) : 0}%"></div>
        </div>
        <div class="progress-count">${count}</div>
      </div>
    `).join('');
  }

  // Barres de progression plateformes
  const platItems = [
    ['📺 YouTube',  platCounts.youtube],
    ['👤 Facebook', platCounts.facebook],
    ['🎵 TikTok',  platCounts.tiktok],
  ];

  if (platProg) {
    platProg.innerHTML = platItems.map(([label, count]) => `
      <div class="progress-item">
        <div class="progress-label">${label}</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${total > 0 ? (count/total*100).toFixed(1) : 0}%"></div>
        </div>
        <div class="progress-count">${count}</div>
      </div>
    `).join('');
  }
}

/* ══════════════════════════════════════════
   TOAST ADMIN
══════════════════════════════════════════ */
let toastTimer = null;

function showToast(msg, type = '') {
  const t = document.getElementById('adminToast');
  t.textContent = msg;
  t.className   = 'admin-toast show' + (type ? ' ' + type : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3500);
}

/* ══════════════════════════════════════════
   UTILITAIRES
══════════════════════════════════════════ */
function escHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDate() {
  const d = new Date();
  return `le ${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
}

function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch { return dateStr; }
}

/* ══════════════════════════════════════════
   INITIALISATION
══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Vérifier si déjà connecté (session)
  if (sessionStorage.getItem(SESSION_KEY) === '1') {
    document.getElementById('loginPage').style.display      = 'none';
    document.getElementById('adminDashboard').style.display = 'flex';
    initAdmin();
  }

  // Focus automatique sur le champ mot de passe
  const pwField = document.getElementById('adminPassword');
  if (pwField) pwField.focus();
});