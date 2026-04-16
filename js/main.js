/**
 * INFORMA-TECHNIQUE R — main.js
 * ─────────────────────────────────────────────────────────
 * Logique principale du site :
 *  - Navigation (scroll, menu hamburger, lien actif)
 *  - Filtres catégories & plateformes
 *  - Recherche en temps réel
 *  - Rendu des cartes vidéo
 *  - Modal vidéo
 *  - Formulaire de contact (AJAX → php/contact.php)
 *  - Toast notifications
 *  - Animations (IntersectionObserver)
 *  - Bouton scroll-to-top
 * ─────────────────────────────────────────────────────────
 */

'use strict';

/* ══════════════════════════════════════════
   STATE
══════════════════════════════════════════ */
let activeCategory = 'all';
let activePlatform = 'all';
let searchQuery    = '';
let visibleCount   = 6;
let videosData     = []; // Chargé depuis data/videos.json

/* ══════════════════════════════════════════
   NAVIGATION
══════════════════════════════════════════ */
function toggleMenu() {
  const menu = document.getElementById('mobileMenu');
  const btn  = document.getElementById('hamburgerBtn');
  menu.classList.toggle('open');
  btn.classList.toggle('open');
}

function closeMenu() {
  document.getElementById('mobileMenu').classList.remove('open');
  document.getElementById('hamburgerBtn').classList.remove('open');
}

// Scroll effects : navbar shadow + lien actif + bouton scroll-to-top
window.addEventListener('scroll', () => {
  const nav = document.getElementById('mainNav');
  const scrollTop = document.getElementById('scrollTop');
  const scrollY   = window.scrollY;

  // Ombre navbar
  if (scrollY > 50) nav.classList.add('scrolled');
  else              nav.classList.remove('scrolled');

  // Bouton retour en haut
  if (scrollY > 400) scrollTop.classList.add('visible');
  else               scrollTop.classList.remove('visible');

  // Lien actif dans la navbar
  const sections = ['accueil', 'categories', 'videos', 'reseaux', 'apropos', 'contact'];
  let current = 'accueil';

  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el && scrollY >= el.offsetTop - 120) current = id;
  });

  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.remove('active');
    if (a.getAttribute('href') === '#' + current) a.classList.add('active');
  });
}, { passive: true });

/* ══════════════════════════════════════════
   FILTRES CATÉGORIE
══════════════════════════════════════════ */
function filterVideos(cat, el) {
  activeCategory = cat;
  visibleCount   = 6;

  // Mise à jour des cartes catégorie
  document.querySelectorAll('.cat-card').forEach(c => c.classList.remove('active'));
  if (el) el.classList.add('active');
  else {
    const target = document.querySelector(`.cat-card[data-filter="${cat}"]`);
    if (target) target.classList.add('active');
  }

  renderVideos();

  // Scroll vers la section vidéos
  const videosSection = document.getElementById('videos');
  if (videosSection) {
    setTimeout(() => videosSection.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }
}

/* ══════════════════════════════════════════
   FILTRES PLATEFORME
══════════════════════════════════════════ */
function filterPlatform(plat, el) {
  activePlatform = plat;
  visibleCount   = 6;

  document.querySelectorAll('#platformFilters .filter-btn').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');

  renderVideos();
}

/* ══════════════════════════════════════════
   RECHERCHE
══════════════════════════════════════════ */
function searchVideos() {
  const input = document.getElementById('searchInput');
  const clear = document.getElementById('clearSearch');
  searchQuery   = input.value.toLowerCase().trim();
  visibleCount  = 6;

  // Afficher/masquer le bouton effacer
  if (clear) clear.style.display = searchQuery ? 'block' : 'none';

  renderVideos();
}

function clearSearch() {
  const input = document.getElementById('searchInput');
  const clear = document.getElementById('clearSearch');
  input.value = '';
  searchQuery = '';
  if (clear) clear.style.display = 'none';
  renderVideos();
}

/* ══════════════════════════════════════════
   FILTRAGE
══════════════════════════════════════════ */
function getFiltered() {
  return videosData.filter(v => {
    const matchCat    = activeCategory === 'all' || v.category === activeCategory;
    const matchPlat   = activePlatform === 'all' || v.platform === activePlatform;
    const matchSearch = !searchQuery
      || v.title.toLowerCase().includes(searchQuery)
      || v.desc.toLowerCase().includes(searchQuery)
      || v.tags.some(t => t.toLowerCase().includes(searchQuery));
    return matchCat && matchPlat && matchSearch;
  });
}

/* ══════════════════════════════════════════
   RENDU DES VIDÉOS
══════════════════════════════════════════ */
function renderVideos() {
  const filtered    = getFiltered();
  const grid        = document.getElementById('videosGrid');
  const noResults   = document.getElementById('noResults');
  const loadMoreBtn = document.getElementById('loadMoreBtn');

  // Mise à jour des compteurs par catégorie
  ['securite', 'navigateur', 'crypto', 'demarches', 'astuces'].forEach(cat => {
    const cnt = videosData.filter(v => v.category === cat).length;
    const el  = document.getElementById('count-' + cat);
    if (el) el.textContent = cnt + ' vidéo' + (cnt > 1 ? 's' : '');
  });

  const totalEl = document.getElementById('count-all');
  if (totalEl) totalEl.textContent = videosData.length + ' vidéos';

  // Affichage
  if (filtered.length === 0) {
    grid.innerHTML           = '';
    noResults.style.display  = 'block';
    loadMoreBtn.style.display = 'none';
    return;
  }

  noResults.style.display = 'none';

  const toShow = filtered.slice(0, visibleCount);
  grid.innerHTML = toShow.map(v => createVideoCard(v)).join('');

  loadMoreBtn.style.display = filtered.length > visibleCount ? 'block' : 'none';
}

function loadMore() {
  visibleCount += 6;
  renderVideos();
}

/* ══════════════════════════════════════════
   CRÉATION D'UNE CARTE VIDÉO
══════════════════════════════════════════ */
function createVideoCard(v) {
  const platformBadge = { youtube: 'badge-yt', facebook: 'badge-fb', tiktok: 'badge-tt' };
  const platformName  = { youtube: 'YouTube', facebook: 'Facebook', tiktok: 'TikTok' };
  const catName = {
    securite:  '🔒 Sécurité',
    navigateur:'🌐 Navigateur',
    crypto:    '💰 Crypto',
    demarches: '📋 Démarches',
    astuces:   '💡 Astuces'
  };

  const platLinks  = Object.entries(v.links).filter(([, url]) => url);
  const firstLink  = platLinks[0];

  const thumbContent = v.thumbnail
    ? `<img src="${escapeHTML(v.thumbnail)}" alt="${escapeHTML(v.title)}" loading="lazy">`
    : `<div class="video-thumb-placeholder">${v.emoji}</div>`;

  const watchAction = firstLink
    ? `window.open('${firstLink[1]}','_blank')`
    : `openModal(${v.id})`;

  return `
    <div class="video-card fade-up" onclick="openModal(${v.id})">
      <div class="video-thumb">
        ${thumbContent}
        <div class="play-btn">
          <div class="play-btn-circle">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
        <div class="video-platform-badge ${platformBadge[v.platform]}">${platformName[v.platform]}</div>
        <div class="video-category-badge">${catName[v.category] || v.category}</div>
      </div>
      <div class="video-info">
        <div class="video-title">${escapeHTML(v.title)}</div>
        <div class="video-meta">
          <span class="video-meta-item">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            ${escapeHTML(v.views)} vues
          </span>
          <span class="video-meta-item">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            ${escapeHTML(v.date)}
          </span>
        </div>
        <div class="video-actions">
          <button class="video-btn video-btn-watch"
            onclick="event.stopPropagation(); ${watchAction}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            Regarder
          </button>
          <button class="video-btn" onclick="event.stopPropagation(); openModal(${v.id})">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/>
              <circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            Liens
          </button>
        </div>
      </div>
    </div>`;
}

/* ══════════════════════════════════════════
   MODAL VIDÉO
══════════════════════════════════════════ */
function openModal(id) {
  const v = videosData.find(x => x.id === id);
  if (!v) return;

  document.getElementById('modalTitle').textContent = v.title;

  /* ── Icônes officielles ── */
  const platIcons = {
    youtube:  `<svg viewBox="0 0 90 63" fill="currentColor" width="18" height="13" style="flex-shrink:0"><path d="M88.1 9.8C87 5.8 84 2.7 80.1 1.6 73.1 0 45 0 45 0S16.9 0 9.9 1.6C6 2.7 3 5.8 1.9 9.8 0 17 0 31.5 0 31.5s0 14.5 1.9 21.7C3 57.2 6 60.3 9.9 61.4 16.9 63 45 63 45 63s28.1 0 35.1-1.6c3.9-1.1 6.9-4.2 8-8.2C90 46 90 31.5 90 31.5S90 17 88.1 9.8zM36 45V18l23.4 13.5L36 45z"/></svg>`,
    facebook: `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" style="flex-shrink:0"><path d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.336 22.336 0 0 0 14.201 3c-2.444 0-4.122 1.492-4.122 4.231v2.355H7.332v3.209h2.753v8.202h3.312z"/></svg>`,
    tiktok:   `<svg viewBox="0 0 2859 3333" fill="currentColor" width="14" height="14" style="flex-shrink:0"><path d="M2081 0c55 473 319 755 778 785v532c-266 26-499-61-770-225v995c0 1264-1378 1659-1933 753-356-583-138-1606 1004-1647v561c-87 14-180 36-265 65-254 86-398 247-358 531 77 544 1075 705 992-358V1h552z"/></svg>`
  };
  const platNames = { youtube: 'YouTube', facebook: 'Facebook', tiktok: 'TikTok' };
  const platClass = { youtube: 'yt', facebook: 'fb', tiktok: 'tt' };

  /* ── Lecteur vidéo intégré ── */
  const playerEl = document.getElementById('modalPlayer');
  const labelEl  = document.getElementById('modalPlatformsLabel');

  if (v.embedUrl) {
    // Convertir lien YouTube standard → URL d'intégration
    let src = v.embedUrl;
    const ytMatch = v.embedUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s?]+)/);
    if (ytMatch) {
      src = `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`;
    }
    playerEl.innerHTML = `<iframe
      src="${src}"
      frameborder="0"
      allowfullscreen
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      title="${escapeHTML(v.title)}"
    ></iframe>`;
    playerEl.style.display = 'block';
    labelEl.innerHTML = `<p class="modal-platforms-title">Regarder aussi sur :</p>`;
  } else {
    // Pas encore de vidéo intégrée → placeholder
    playerEl.innerHTML = `
      <div class="modal-no-embed">
        <div class="modal-no-embed-icon">${v.emoji}</div>
        <p>Regarder ce tutoriel sur :</p>
      </div>`;
    playerEl.style.display = 'block';
    labelEl.innerHTML = '';
  }

  /* ── Boutons plateformes ── */
  const links = Object.entries(v.links).filter(([, url]) => url);
  document.getElementById('modalPlatforms').innerHTML = links.length
    ? links.map(([k, url]) => `
        <a href="${url}" target="_blank" rel="noopener" class="modal-platform-btn ${platClass[k]} ${v.embedUrl ? 'small' : ''}">
          ${platIcons[k]} ${platNames[k]}
        </a>
      `).join('')
    : '<p style="color:var(--muted);font-size:13px">Aucun lien disponible pour l\'instant.</p>';

  /* ── Description & tags ── */
  document.getElementById('modalDesc').innerHTML = `
    <p>${escapeHTML(v.desc)}</p>
    <div class="modal-tags">
      ${v.tags.map(t => `<span class="modal-tag">#${escapeHTML(t)}</span>`).join('')}
    </div>`;

  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(e) {
  if (e.target === document.getElementById('modalOverlay')) closeModalDirect();
}

function closeModalDirect() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
  // Stopper la vidéo en effaçant l'iframe
  document.getElementById('modalPlayer').innerHTML = '';
}

// Fermer avec Échap
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModalDirect();
});

/* ══════════════════════════════════════════
   FORMULAIRE DE CONTACT (AJAX)
══════════════════════════════════════════ */
async function submitForm(e) {
  e.preventDefault();

  const fname   = document.getElementById('fname').value.trim();
  const lname   = document.getElementById('lname').value.trim();
  const email   = document.getElementById('email').value.trim();
  const subject = document.getElementById('subject').value;
  const message = document.getElementById('message').value.trim();

  const successEl = document.getElementById('formSuccess');
  const errorEl   = document.getElementById('formError');
  const submitBtn = document.getElementById('submitBtn');

  // Validation côté client
  if (!fname || !email || !message) {
    showToast('⚠️ Veuillez remplir tous les champs obligatoires');
    return;
  }

  if (!isValidEmail(email)) {
    showToast('⚠️ Adresse email invalide');
    return;
  }

  // État chargement
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner"></span> Envoi en cours...';
  successEl.style.display = 'none';
  errorEl.style.display   = 'none';

  try {
    const formData = new FormData();
    formData.append('fname',   fname);
    formData.append('lname',   lname);
    formData.append('email',   email);
    formData.append('subject', subject);
    formData.append('message', message);

    const response = await fetch('php/contact.php', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      successEl.textContent   = '✅ ' + data.message;
      successEl.style.display = 'block';
      showToast('✅ Message envoyé avec succès !');
      document.getElementById('contactForm').reset();
    } else {
      throw new Error(data.message || 'Erreur inconnue');
    }

  } catch (err) {
    // Fallback si PHP non disponible (mode dev/preview)
    if (err.message === 'Failed to fetch' || err.message.includes('fetch')) {
      // Simuler un succès en mode démo
      successEl.textContent   = '✅ Message enregistré ! (Mode démonstration — configurez PHP pour l\'envoi email)';
      successEl.style.display = 'block';
      showToast('✅ Message enregistré !');
      document.getElementById('contactForm').reset();
    } else {
      errorEl.textContent   = '❌ ' + err.message;
      errorEl.style.display = 'block';
      showToast('❌ Erreur lors de l\'envoi');
    }
  } finally {
    submitBtn.disabled  = false;
    submitBtn.innerHTML = 'Envoyer le message ✉️';
  }
}

/* ══════════════════════════════════════════
   TOAST NOTIFICATIONS
══════════════════════════════════════════ */
let toastTimer = null;

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3500);
}

/* ══════════════════════════════════════════
   ANIMATIONS (IntersectionObserver)
══════════════════════════════════════════ */
function initScrollAnimations() {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target); // Une seule animation
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
}

/* ══════════════════════════════════════════
   UTILITAIRES
══════════════════════════════════════════ */
function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ══════════════════════════════════════════
   INITIALISATION
══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  // Charger les vidéos depuis data/videos.json
  try {
    const res = await fetch('data/videos.json?t=' + Date.now());
    if (res.ok) {
      videosData = await res.json();
    } else {
      throw new Error('Fichier non trouvé');
    }
  } catch {
    // Fallback sur videos.js si disponible
    if (typeof videosDataStatic !== 'undefined') {
      videosData = videosDataStatic;
    }
  }

  // Rendu initial des vidéos
  renderVideos();

  // Animations au scroll
  initScrollAnimations();

  // Observer les nouvelles cartes injectées (MutationObserver)
  const grid = document.getElementById('videosGrid');
  if (grid) {
    const mo = new MutationObserver(() => {
      grid.querySelectorAll('.fade-up:not(.visible)').forEach(el => {
        setTimeout(() => el.classList.add('visible'), 50);
      });
    });
    mo.observe(grid, { childList: true });
  }

  // Fermer le menu mobile en cliquant en dehors
  document.addEventListener('click', e => {
    const menu = document.getElementById('mobileMenu');
    const btn  = document.getElementById('hamburgerBtn');
    if (menu.classList.contains('open') && !menu.contains(e.target) && !btn.contains(e.target)) {
      closeMenu();
    }
  });

  console.log('%c🛡️ Informa-Technique R', 'color:#00c8ff;font-size:18px;font-weight:bold;');
  console.log('%cSite chargé avec succès !', 'color:#8ba3c7;font-size:13px;');
});

/* ══════════════════════════════════════════
   MODALS PAIEMENT
══════════════════════════════════════════ */
const PAY_PHONE    = '0748477259';
const PAY_PHONE_INT = '33748477259'; // format international France
const BTC_ADDR  = '1DrnY1np5qb8Yf5wAmp348b15V5qB3H3GB';
const USDT_ADDR = 'TSHwT2hCpGso4SyMs8Wi5S5YtFC6RAaSuz';

function openPayModal(type) {
  const overlay = document.getElementById('payModalOverlay');
  const content = document.getElementById('payModalContent');

  if (type === 'paypal') {
    content.innerHTML = `
      <div class="pmod-header pmod-paypal">
        <svg viewBox="0 0 24 24" fill="white" width="28" height="28"><path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.59 3.025-2.566 6.243-8.558 6.243H9.828l-1.52 9.635h3.97c.524 0 .968-.382 1.05-.9l.893-5.659h2.19c4.247 0 7.56-1.72 8.533-6.665.404-2.038.05-3.564-1.722-4.367z"/></svg>
        <span>Payer via PayPal</span>
      </div>
      <p class="pmod-desc">Ouvre PayPal et envoie l'argent au numéro de téléphone :</p>
      <div class="pmod-address-row">
        <span class="pmod-address">${PAY_PHONE}</span>
        <button class="pmod-copy-btn" onclick="copyPay('${PAY_PHONE}', this)">Copier</button>
      </div>
      <a href="https://www.paypal.com/myaccount/transfer/homepage/pay" target="_blank" rel="noopener" class="pmod-open-btn pmod-paypal-btn">
        Ouvrir PayPal →
      </a>`;
  }

  else if (type === 'wero') {
    content.innerHTML = `
      <div class="pmod-header pmod-wero">
        <span style="font-size:26px;font-weight:900;color:#6600cc;">W</span>
        <span style="font-size:20px;font-weight:700;">ero</span>
      </div>
      <p class="pmod-desc">Ouvre l'application Wero et envoie au numéro :</p>
      <div class="pmod-address-row">
        <span class="pmod-address">${PAY_PHONE}</span>
        <button class="pmod-copy-btn" onclick="copyPay('${PAY_PHONE}', this)">Copier</button>
      </div>
      <a href="wero://pay?phone=%2B${PAY_PHONE_INT}" class="pmod-open-btn pmod-wero-btn"
         onclick="setTimeout(()=>window.open('https://wero-wallet.eu','_blank'),1200)">
        Ouvrir Wero →
      </a>
      <p style="font-size:11px;color:var(--muted);margin-top:10px;text-align:center;">
        Si Wero ne s'ouvre pas, télécharge l'app puis envoie au numéro ci-dessus.
      </p>`;
  }

  else if (type === 'crypto') {
    content.innerHTML = `
      <div class="pmod-header pmod-crypto">
        <span style="font-size:24px;">₿</span>
        <span>Paiement Crypto</span>
      </div>
      <div class="pmod-crypto-tabs">
        <button class="pmod-tab active" onclick="showCryptoTab('btc', this)">₿ Bitcoin (BTC)</button>
        <button class="pmod-tab" onclick="showCryptoTab('usdt', this)">₮ Tether (USDT)</button>
      </div>
      <div id="cryptoTabBtc" class="pmod-crypto-panel">
        <p class="pmod-desc">Adresse Bitcoin (BTC) :</p>
        <div class="pmod-address-row">
          <span class="pmod-address pmod-addr-small">${BTC_ADDR}</span>
          <button class="pmod-copy-btn" onclick="copyPay('${BTC_ADDR}', this)">Copier</button>
        </div>
        <div id="qr-btc" class="pmod-qr"></div>
      </div>
      <div id="cryptoTabUsdt" class="pmod-crypto-panel" style="display:none">
        <p class="pmod-desc">Adresse USDT (TRC-20) :</p>
        <div class="pmod-address-row">
          <span class="pmod-address pmod-addr-small">${USDT_ADDR}</span>
          <button class="pmod-copy-btn" onclick="copyPay('${USDT_ADDR}', this)">Copier</button>
        </div>
        <div id="qr-usdt" class="pmod-qr"></div>
      </div>`;

    // Générer les QR codes après rendu
    setTimeout(() => {
      generateQR('qr-btc',  BTC_ADDR);
      generateQR('qr-usdt', USDT_ADDR);
    }, 100);
  }

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function generateQR(elId, text) {
  const el = document.getElementById(elId);
  if (!el || typeof QRCode === 'undefined') return;
  el.innerHTML = '';
  new QRCode(el, {
    text: text,
    width: 180,
    height: 180,
    colorDark: '#000000',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.M
  });
}

function showCryptoTab(tab, btn) {
  document.getElementById('cryptoTabBtc').style.display  = tab === 'btc'  ? 'block' : 'none';
  document.getElementById('cryptoTabUsdt').style.display = tab === 'usdt' ? 'block' : 'none';
  document.querySelectorAll('.pmod-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function copyPay(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.textContent;
    btn.textContent = '✓ Copié !';
    btn.style.background = '#22c55e';
    setTimeout(() => { btn.textContent = orig; btn.style.background = ''; }, 2000);
  });
}

function closePayModal(e) {
  if (e.target === document.getElementById('payModalOverlay')) closePayModalDirect();
}
function closePayModalDirect() {
  document.getElementById('payModalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}