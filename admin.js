// ── Auth helpers (sessionStorage bloque dans l iframe GAS) ────
var ADMIN_API = 'https://sasp-nord-discord-bot.louisleurin.workers.dev';
var _memAuth = '';
function _authGet()   { try { return sessionStorage.getItem('sasp_admin_token'); } catch(e) { return _memAuth || null; } }
function _authSet(token) { _memAuth = token; try { sessionStorage.setItem('sasp_admin_token',token); } catch(e) {} }
function _authClear() { _memAuth = ''; try { sessionStorage.removeItem('sasp_admin_token'); } catch(e) {} }

// ── Auth ──────────────────────────────────────────────────────
function doLogin(e) {
  e.preventDefault();
  var btn  = document.getElementById('loginBtn');
  var txt  = document.getElementById('loginBtnTxt');
  var err  = document.getElementById('loginErr');
  var user = document.getElementById('loginUser').value.trim();
  var pass = document.getElementById('loginPass').value;
  if (!user || !pass) { err.classList.add('show'); return; }
  btn.disabled = true;
  txt.innerHTML = '<span class="spinner" style="display:inline-block;vertical-align:middle"></span> Verification...';
  err.classList.remove('show');
  fetch(ADMIN_API + '/admin/login', {
    method: 'POST',
    headers: {'content-type':'application/json'},
    body: JSON.stringify({username:user,password:pass})
  }).then(function(response){
    return response.json().then(function(data){ return {ok:response.ok,data:data}; });
  }).then(function(result){
    if (!result.ok || !result.data.success) throw new Error(result.data.error || 'Identifiants incorrects');
    _authSet(result.data.token);
    showDashboard();
  }).catch(function(error) {
      err.textContent = error.message || 'Erreur de connexion.';
      err.classList.add('show');
      btn.disabled = false;
      txt.textContent = 'Se connecter';
      document.getElementById('loginPass').value = '';
  });
}

function showDashboard() {
  document.getElementById('loginView').style.display     = 'none';
  document.getElementById('dashboardView').style.display = 'block';
  loadApplications();
}

function logout() {
  _authClear();
  document.getElementById('loginView').style.display     = 'flex';
  document.getElementById('dashboardView').style.display = 'none';
  document.getElementById('loginUser').value = '';
  document.getElementById('loginPass').value = '';
}

if (_authGet()) showDashboard();

// ── State ─────────────────────────────────────────────────────
var allApps = [], currentFilter = 'all', adminSearch = '';

// ── Load ──────────────────────────────────────────────────────
function loadApplications() {
  document.getElementById('tableContainer').innerHTML =
    '<div class="loader"><div class="spinner"></div> Chargement...</div>';
  google.script.run
    .withSuccessHandler(function(res) {
      try {
        if (res && res.success) {
          allApps = res.data || [];
          updateStats();
          renderTable(getFilteredApps());
        } else {
          document.getElementById('tableContainer').innerHTML =
            '<div class="empty-state"><p>Erreur serveur</p><p>' + (res ? esc(res.error) : 'Réponse vide') + '</p></div>';
        }
      } catch(err) {
        document.getElementById('tableContainer').innerHTML =
          '<div class="empty-state" style="color:var(--red)"><p>Erreur JS</p><pre style="font-size:.75rem;text-align:left">' + err.toString() + '</pre></div>';
      }
    })
    .withFailureHandler(function(err) {
      var tc = document.getElementById('tableContainer');
      if (tc) tc.innerHTML =
        '<div class="empty-state" style="color:var(--red)"><p>Erreur GAS</p><pre style="font-size:.75rem;text-align:left">' + (err ? err.toString() : 'inconnu') + '</pre></div>';
    })
    .getApplications();
}

// ── Stats ─────────────────────────────────────────────────────
function updateStats() {
  document.getElementById('statTotal').textContent    = allApps.length;
  document.getElementById('statPending').textContent  = allApps.filter(function(a){return a.statut==='En attente';}).length;
  document.getElementById('statAccepted').textContent = allApps.filter(function(a){return a.statut==='Acceptée';}).length;
  document.getElementById('statRefused').textContent  = allApps.filter(function(a){return a.statut==='Refusée';}).length;
}

// ── Filter ────────────────────────────────────────────────────
function filterApps(f, btn) {
  currentFilter = f;
  document.querySelectorAll('.ftab').forEach(function(b){ b.classList.remove('active'); });
  btn.classList.add('active');
  renderTable(getFilteredApps());
}

function setAdminSearch(value) {
  adminSearch = String(value || '').trim().toLowerCase();
  renderTable(getFilteredApps());
}

function getFilteredApps() {
  return allApps.filter(function(a) {
    if (currentFilter !== 'all' && a.statut !== currentFilter) return false;
    if (!adminSearch) return true;
    var score = a.scores && a.scores.global !== undefined ? a.scores.global : '';
    var haystack = [a.nomRP,a.prenomRP,a.pseudoDiscord,a.email,a.statut,score].join(' ').toLowerCase();
    return haystack.indexOf(adminSearch) !== -1;
  });
}

function switchAdminSection(section, btn) {
  document.getElementById('applicationsPanel').style.display = section === 'applications' ? 'block' : 'none';
  document.getElementById('recruitmentStatusPanel').style.display = section === 'status' ? 'block' : 'none';
  document.querySelectorAll('#adminTabApplications,#adminTabStatus').forEach(function(el){ el.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  if (section === 'status') loadRecruitmentStatus();
}

function paintRecruitmentStatus(status) {
  document.querySelectorAll('#recruitmentStatusControls [data-status]').forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.status === status);
  });
  var labels = {open:'Ouvert',limited:'Limité',closed:'Fermé'};
  document.getElementById('recruitmentStatusFeedback').textContent = 'Statut actuel : ' + (labels[status] || status);
}

function loadRecruitmentStatus() {
  google.script.run
    .withSuccessHandler(function(res){ if(res && res.success) paintRecruitmentStatus(res.status); })
    .withFailureHandler(function(){ document.getElementById('recruitmentStatusFeedback').textContent = 'Impossible de charger le statut.'; })
    .getRecruitmentStatus();
}

function saveRecruitmentStatus(status, btn) {
  localStorage.setItem('sasp_recruitment_status', status);
  paintRecruitmentStatus(status);
  document.getElementById('recruitmentStatusFeedback').textContent = 'Enregistrement...';
  google.script.run
    .withSuccessHandler(function(res){
      if (res && res.success) paintRecruitmentStatus(res.status);
      else document.getElementById('recruitmentStatusFeedback').textContent = 'Erreur lors de l’enregistrement.';
    })
    .withFailureHandler(function(){ document.getElementById('recruitmentStatusFeedback').textContent = 'Erreur lors de l’enregistrement.'; })
    .setRecruitmentStatus(status);
}

// ── Render table ──────────────────────────────────────────────
function renderTable(apps) {
  if (!apps || !apps.length) {
    document.getElementById('tableContainer').innerHTML =
      '<div class="empty-state"><p>Aucune candidature</p></div>';
    return;
  }
  var rows = apps.map(function(a) {
    var sc = a.scores || {};
    var g  = (sc.global !== '' && sc.global !== undefined) ? sc.global : '-';
    var rp = (sc.rp  !== '' && sc.rp  !== undefined) ? sc.rp  : '-';
    var hr = (sc.hrp !== '' && sc.hrp !== undefined) ? sc.hrp : '-';
    var vd = {'recommended':'V','interview':'?','refused':'X'}[sc.verdict] || '';
    return '<tr>' +
      '<td style="font-weight:600;color:var(--t0)">' + esc(a.nomRP) + ' ' + esc(a.prenomRP) + '</td>' +
      '<td style="font-family:monospace;font-size:.75rem;color:var(--t3)">' + esc(a.date) + '</td>' +
      '<td><span class="badge ' + statusCls(a.statut) + '">' + esc(a.statut) + '</span></td>' +
      '<td><span style="color:var(--blue);font-weight:600">' + g + '</span><span style="color:var(--t3);font-size:.78rem">/100</span>' +
          '<span style="color:var(--t3);font-size:.72rem"> (RP:' + rp + ' HRP:' + hr + ')</span></td>' +
      '<td><div class="act-btns">' +
        '<button class="btn btn-ghost btn-sm" onclick="openModal(\'' + a.id + '\')">Voir</button>' +
        '<button class="btn btn-green btn-sm" onclick="setStatus(\'' + a.id + '\',\'Acceptée\')">Validé</button>' +
        '<button class="btn btn-red   btn-sm" onclick="setStatus(\'' + a.id + '\',\'Refusée\')">Refusé</button>' +
        '<button class="btn btn-gray  btn-sm" onclick="setStatus(\'' + a.id + '\',\'Archivée\')">Archivé</button>' +
      '</div></td>' +
      '</tr>';
  }).join('');
  document.getElementById('tableContainer').innerHTML =
    '<div class="tbl-wrap"><table class="data-table"><thead><tr>' +
    '<th>Candidat</th><th>Date</th><th>Statut</th><th>Score</th><th>Actions</th>' +
    '</tr></thead><tbody>' + rows + '</tbody></table></div>';
}

// ── Status update ─────────────────────────────────────────────
function sendDiscordDecision(id, status) {
  var token = _authGet();
  if (!token) { logout(); return; }
  fetch(ADMIN_API + '/admin/decision', {
    method: 'POST',
    headers: {'content-type':'application/json','authorization':'Bearer ' + token},
    body: JSON.stringify({id:id,status:status})
  }).then(function(response){
    return response.json().then(function(data){ return {ok:response.ok,data:data}; });
  }).then(function(result){
    if (!result.ok || !result.data.success) throw new Error(result.data.error || 'Décision impossible');
    var app = allApps.find(function(x){ return x.id === id; });
    if (app) app.statut = status;
    updateStats();
    renderTable(getFilteredApps());
    alert(status === 'Acceptée' ? 'Acceptation envoyée dans le ticket.' : 'Refus envoyé. Le candidat pourra réessayer dans 24 h.');
  }).catch(function(error){
    if (/session/i.test(error.message || '')) logout();
    alert(error.message || 'Impossible d’envoyer la décision.');
  });
}

function setStatus(id, s) {
  if (s === 'Acceptée') { sendDiscordDecision(id, s); return; }
  if (s === 'Refusée') {
    if (confirm('Confirmer le refus ? Le candidat pourra déposer une nouvelle candidature dans 24 heures.')) {
      sendDiscordDecision(id, s);
    }
    return;
  }
  var previous = null;
  var app = allApps.find(function(x){ return x.id === id; });
  if (app) {
    previous = app.statut;
    app.statut = s;
  }
  updateStats();
  renderTable(getFilteredApps());

  google.script.run
    .withSuccessHandler(function(res) {
      if (!res.success) {
        if (app && previous !== null) app.statut = previous;
        updateStats();
        renderTable(getFilteredApps());
        alert(res && res.error ? res.error : 'Impossible de modifier le statut.');
      }
    })
    .withFailureHandler(function(err) {
      if (app && previous !== null) app.statut = previous;
      updateStats();
      renderTable(getFilteredApps());
      alert(err ? err.toString() : 'Impossible de modifier le statut.');
    })
    .updateStatus(id, s);
}

// ── Modal ─────────────────────────────────────────────────────
function openModal(id) {
  var app = allApps.find(function(a){ return a.id === id; });
  if (!app) return;
  document.getElementById('modalName').textContent = app.prenomRP + ' ' + app.nomRP;
  document.getElementById('modalContent').innerHTML = buildModal(app);
  document.getElementById('modalOverlay').classList.add('open');
}
function closeModal(e) {
  if (e.target === document.getElementById('modalOverlay'))
    document.getElementById('modalOverlay').classList.remove('open');
}

function buildModal(app) {
  var qDefs = [
    {k:'q1',q:'Que signifie SASP ?',ok:'San Andreas State Police',t:'HRP'},
    {k:'q2',q:'Voiture jaune - 4 occupants',ok:'Rien sauf element RP justifiant une intervention',t:'RP'},
    {k:'q3',q:'Ami Discord signale un braquage',ok:"J'ignore l'information car elle est HRP",t:'RP'},
    {k:'q4',q:'Seul face a 5 individus armes',ok:'Je coopere et privilegie ma survie',t:'FearRP'},
    {k:'q5',q:"Citoyen demande le nb d'agents",ok:'Je reste vague ou refuse de communiquer cette information',t:'HRP'},
    {k:'q6',q:'Perte de vue du vehicule',ok:'Je transmets la perte visuelle et relance les recherches',t:'RP'}
  ];

  var qcmHtml = qDefs.map(function(d) {
    var ans = (app.qcm && app.qcm[d.k]) || '-';
    var ok  = ans === d.ok;
    var nu  = ans === '-';
    var cls = nu ? 'neutral' : ok ? 'correct' : 'wrong';
    var ico = nu ? 'o' : ok ? 'V' : 'X';
    var col = ok ? 'var(--green)' : nu ? 'var(--t3)' : 'var(--red)';
    return '<div class="qcm-row ' + cls + '">' +
      '<span class="qcm-icon" style="color:' + col + '">' + ico + '</span>' +
      '<div><div class="qcm-q-lbl">' + esc(d.q) + ' <span style="font-size:.6rem;background:var(--bgCard);border:1px solid var(--border0);padding:1px 5px;border-radius:3px;color:var(--t3)">' + d.t + '</span></div>' +
      '<div class="qcm-a-lbl">' + esc(ans) + '</div>' +
      (!ok && !nu ? '<div style="font-size:.72rem;color:var(--green);margin-top:2px">Attendu : ' + esc(d.ok) + '</div>' : '') +
      '</div></div>';
  }).join('');

  var oq = app.openQuestions || {};
  var openKeys = [
    ['Qualites',oq.qualites],['Defauts',oq.defauts],
    ['Pourquoi le SASP ?',oq.pourquoiSASP],['Le RP pour vous',oq.rpPourVous],
    ['Description du metier',oq.descriptionMetier],['Grade vise',oq.gradeVise],
    ['Reaction critique',oq.reactionCritique],['Passions HRP',oq.passionsHRP],
    ['Si vous etiez un animal',oq.animal],['Pourquoi vous ?',oq.pourquoiVous]
  ];
  var openHtml = openKeys.map(function(kv){
    return '<div class="answer-block"><div class="answer-k">' + esc(kv[0]) + '</div><div class="answer-v">' + esc(kv[1]||'-') + '</div></div>';
  }).join('');

  var sit = app.situations || {};
  var sitHtml = [
    ['SITUATION 01 — Poursuite',sit.situation1],
    ['SITUATION 02 — Interpellation',sit.situation2],
    ['SITUATION 03 — Dilemme ethique',sit.situation3]
  ].map(function(kv){
    return '<div class="answer-block"><div class="answer-k" style="color:var(--blue)">' + esc(kv[0]) + '</div><div class="answer-v">' + esc(kv[1]||'-') + '</div></div>';
  }).join('');

  var analysis = app.scores ? renderVerdict(app.scores) : '<p style="color:var(--t3)">Analyse non disponible.</p>';

  return '<div class="modal-section">' +
    '<div class="modal-sec-ttl">Informations generales</div>' +
    '<div class="info-grid">' +
      '<div class="info-item"><div class="info-k">Nom RP</div><div class="info-v">'    + esc(app.nomRP)           + '</div></div>' +
      '<div class="info-item"><div class="info-k">Prenom RP</div><div class="info-v">' + esc(app.prenomRP)        + '</div></div>' +
      '<div class="info-item"><div class="info-k">Naissance</div><div class="info-v">' + esc(app.dateNaissanceRP) + '</div></div>' +
      '<div class="info-item"><div class="info-k">Tel RP</div><div class="info-v">'    + esc(app.telephoneRP)     + '</div></div>' +
      '<div class="info-item"><div class="info-k">Discord</div><div class="info-v">'   + esc(app.pseudoDiscord || app.email) + '</div></div>' +
      '<div class="info-item"><div class="info-k">Permis</div><div class="info-v">'    + esc(app.permisConduire)  + '</div></div>' +
      '<div class="info-item"><div class="info-k">Date</div><div class="info-v">'      + esc(app.date)            + '</div></div>' +
      '<div class="info-item"><div class="info-k">Statut</div><div class="info-v"><span class="badge ' + statusCls(app.statut) + '">' + esc(app.statut) + '</span></div></div>' +
    '</div>' +
    (app.experienceForces ? '<div class="answer-block" style="margin-top:12px"><div class="answer-k">Experience</div><div class="answer-v">' + esc(app.experienceForces) + '</div></div>' : '') +
    '</div>' +

    '<div class="modal-section">' +
    '<div class="modal-sec-ttl">Actions rapides</div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      '<button class="btn btn-green  btn-sm" onclick="setStatus(\'' + app.id + '\',\'Acceptée\');document.getElementById(\'modalOverlay\').classList.remove(\'open\')">Accepter</button>' +
      '<button class="btn btn-red    btn-sm" onclick="setStatus(\'' + app.id + '\',\'Refusée\');document.getElementById(\'modalOverlay\').classList.remove(\'open\')">Refuser</button>' +
      '<button class="btn btn-orange btn-sm" onclick="setStatus(\'' + app.id + '\',\'En attente\');document.getElementById(\'modalOverlay\').classList.remove(\'open\')">En attente</button>' +
      '<button class="btn btn-gray   btn-sm" onclick="setStatus(\'' + app.id + '\',\'Archivée\');document.getElementById(\'modalOverlay\').classList.remove(\'open\')">Archiver</button>' +
    '</div></div>' +

    '<div class="modal-section"><div class="modal-sec-ttl">Analyse automatique</div>' + analysis + '</div>' +
    '<div class="modal-section"><div class="modal-sec-ttl">Reponses QCM</div>' + qcmHtml + '</div>' +
    '<div class="modal-section"><div class="modal-sec-ttl">Questions ouvertes</div>' + openHtml + '</div>' +
    '<div class="modal-section"><div class="modal-sec-ttl">Mises en situation</div>' + sitHtml + '</div>';
}

// ── Helpers ───────────────────────────────────────────────────
function statusCls(s) {
  return {'En attente':'b-pending','Acceptée':'b-accepted','Refusée':'b-refused','Archivée':'b-archived'}[s] || 'b-pending';
}
function esc(s) {
  if (s == null) return '-';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
