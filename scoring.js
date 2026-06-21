// ════════════════════════════════════════════════════════════
// SASP NORD — Moteur de notation automatique
// ════════════════════════════════════════════════════════════

const CORRECT_ANSWERS = {
  q1: 'San Andreas State Police',
  q2: 'Rien sauf élément RP justifiant une intervention',
  q3: "J'ignore l'information car elle est HRP",
  q4: 'Je coopère et privilégie ma survie',
  q5: 'Je reste vague ou refuse de communiquer cette information',
  q6: 'Je transmets la perte visuelle et relance les recherches'
};

// Règles de notation RP (base 50)
const RP_RULES = {
  q2: {
    'Rien sauf élément RP justifiant une intervention': +18,
    'Je la contrôle immédiatement':                    -12,
    "Je la prends en chasse":                          -18,
    "J'appelle tous les agents disponibles":            -6
  },
  q3: {
    "J'ignore l'information car elle est HRP": +20,
    'Je me rends sur place':                   -22,
    'Je préviens mes collègues':               -18,
    'Je prépare une embuscade':                -25
  },
  q4: {
    'Je coopère et privilégie ma survie': +18,
    "J'ouvre le feu":                    -25,
    'Je tente de fuir':                   +5,
    'Je sors mon Taser':                 -14
  },
  q6: {
    'Je transmets la perte visuelle et relance les recherches': +14,
    'Je continue à connaître sa position':                     -25,
    'Je le retrouve par intuition':                            -18,
    'Je regarde son stream':                                   -25
  }
};

// Règles de notation HRP (base 60)
const HRP_RULES = {
  q1: {
    'San Andreas State Police':       +12,
    'San Andreas Special Patrol':     -4,
    'State Agency Security Patrol':   -4,
    'San Andreas Sheriff Patrol':     -4
  },
  q5: {
    'Je reste vague ou refuse de communiquer cette information': +12,
    'Je donne le nombre exact':                                  -10,
    'Je donne les matricules':                                   -14,
    'Je donne leur position':                                    -18
  }
};

// Forces détectables
const FORCES_MAP = {
  q2_correct: 'Bonne maîtrise du contexte RP — absence de métagaming situationnel',
  q3_correct: 'Respect strict du cadre RP — ignore les informations HRP en jeu',
  q4_correct: 'Excellente compréhension du FearRP — instinct de survie réaliste',
  q4_flee:    'Conscience du danger — comportement globalement réaliste face à la menace',
  q5_correct: 'Sens de la confidentialité opérationnelle — discrétion tactique',
  q6_correct: 'Gestion professionnelle des poursuites — anti-powergaming démontré',
  q1_correct: 'Bonne connaissance de la lore et de l\'organisation SASP'
};

// Faiblesses détectables
const FAIBLESSES_MAP = {
  q2_meta1:   'Intervention sans motif RP valable — risque de métagaming passif',
  q2_meta2:   'Comportement agressif sans justification RP — métagaming avéré',
  q2_meta3:   'Réaction disproportionnée sans élément justificatif RP',
  q3_meta1:   'Métagaming grave — utilisation d\'une information HRP in-game',
  q3_meta2:   'Métagaming — diffusion d\'information HRP à des collègues en jeu',
  q3_meta3:   'Métagaming très grave — exploitation d\'avantage HRP pour ambush',
  q4_nofear:  'Non-respect du FearRP — comportement suicidaire et irréaliste',
  q4_nofear2: 'Sous-estimation grave du danger — FearRP très insuffisant',
  q5_leak1:   'Manque de discrétion sur les informations tactiques en service',
  q5_leak2:   'Divulgation d\'informations sensibles sur le personnel en service',
  q5_leak3:   'Grave manquement à la sécurité — divulgation de positions d\'agents',
  q6_power1:  'Powergaming — connaissance impossible de la position du véhicule',
  q6_power2:  'Powergaming — intuition surnaturelle impossible dans le contexte RP',
  q6_meta:    'Métagaming très grave — utilisation du stream pour gain d\'avantage tactique',
  q1_wrong:   'Méconnaissance de l\'acronyme et de l\'organisation SASP'
};

function calculateScores(qcm, openQuestions) {
  let rpScore  = 50;
  let hrpScore = 60;
  const forces     = [];
  const faiblesses = [];

  // ── RP scoring ──────────────────────────────────────────────
  Object.entries(RP_RULES).forEach(([q, answers]) => {
    const selected = qcm[q];
    if (selected && answers[selected] !== undefined) {
      rpScore += answers[selected];
    }
  });

  // ── HRP scoring ─────────────────────────────────────────────
  Object.entries(HRP_RULES).forEach(([q, answers]) => {
    const selected = qcm[q];
    if (selected && answers[selected] !== undefined) {
      hrpScore += answers[selected];
    }
  });

  // ── HRP bonus : complétude des questions libres ──────────────
  if (openQuestions) {
    const fields = Object.values(openQuestions);
    const filled = fields.filter(v => v && v.trim().length > 40).length;
    hrpScore += Math.round(filled * 2.5); // max +25
  }

  // ── Forces ──────────────────────────────────────────────────
  if (qcm.q1 === CORRECT_ANSWERS.q1) forces.push(FORCES_MAP.q1_correct);
  else faiblesses.push(FAIBLESSES_MAP.q1_wrong);

  if (qcm.q2 === CORRECT_ANSWERS.q2)         forces.push(FORCES_MAP.q2_correct);
  else if (qcm.q2 === 'Je la contrôle immédiatement')       faiblesses.push(FAIBLESSES_MAP.q2_meta1);
  else if (qcm.q2 === 'Je la prends en chasse')              faiblesses.push(FAIBLESSES_MAP.q2_meta2);
  else if (qcm.q2 === "J'appelle tous les agents disponibles") faiblesses.push(FAIBLESSES_MAP.q2_meta3);

  if (qcm.q3 === CORRECT_ANSWERS.q3)         forces.push(FORCES_MAP.q3_correct);
  else if (qcm.q3 === 'Je me rends sur place')               faiblesses.push(FAIBLESSES_MAP.q3_meta1);
  else if (qcm.q3 === 'Je préviens mes collègues')           faiblesses.push(FAIBLESSES_MAP.q3_meta2);
  else if (qcm.q3 === 'Je prépare une embuscade')            faiblesses.push(FAIBLESSES_MAP.q3_meta3);

  if (qcm.q4 === CORRECT_ANSWERS.q4)         forces.push(FORCES_MAP.q4_correct);
  else if (qcm.q4 === 'Je tente de fuir')                    forces.push(FORCES_MAP.q4_flee);
  else if (qcm.q4 === "J'ouvre le feu")                      faiblesses.push(FAIBLESSES_MAP.q4_nofear);
  else if (qcm.q4 === 'Je sors mon Taser')                   faiblesses.push(FAIBLESSES_MAP.q4_nofear2);

  if (qcm.q5 === CORRECT_ANSWERS.q5)         forces.push(FORCES_MAP.q5_correct);
  else if (qcm.q5 === 'Je donne le nombre exact')            faiblesses.push(FAIBLESSES_MAP.q5_leak1);
  else if (qcm.q5 === 'Je donne les matricules')             faiblesses.push(FAIBLESSES_MAP.q5_leak2);
  else if (qcm.q5 === 'Je donne leur position')              faiblesses.push(FAIBLESSES_MAP.q5_leak3);

  if (qcm.q6 === CORRECT_ANSWERS.q6)         forces.push(FORCES_MAP.q6_correct);
  else if (qcm.q6 === 'Je continue à connaître sa position') faiblesses.push(FAIBLESSES_MAP.q6_power1);
  else if (qcm.q6 === 'Je le retrouve par intuition')        faiblesses.push(FAIBLESSES_MAP.q6_power2);
  else if (qcm.q6 === 'Je regarde son stream')               faiblesses.push(FAIBLESSES_MAP.q6_meta);

  // ── Normalisation ────────────────────────────────────────────
  rpScore  = Math.max(0, Math.min(100, rpScore));
  hrpScore = Math.max(0, Math.min(100, hrpScore));

  const globalScore = Math.round(rpScore * 0.6 + hrpScore * 0.4);

  let verdict;
  if (globalScore >= 70)      verdict = 'recommended';
  else if (globalScore >= 50) verdict = 'interview';
  else                        verdict = 'refused';

  return {
    rp: Math.round(rpScore),
    hrp: Math.round(hrpScore),
    global: globalScore,
    verdict,
    forces,
    faiblesses
  };
}

// Rendu du verdict en HTML
function renderVerdict(scores) {
  const map = {
    recommended: { cls: 'green',  icon: '🟢', txt: 'Recommandé — Profil RP solide' },
    interview:   { cls: 'yellow', icon: '🟡', txt: 'Entretien conseillé — À évaluer en entretien' },
    refused:     { cls: 'red',    icon: '🔴', txt: 'Refus conseillé — Profil insuffisant' }
  };
  const v = map[scores.verdict] || map.refused;
  return `
    <div class="verdict-box ${v.cls}">
      <span class="verdict-icon">${v.icon}</span>
      <span class="verdict-txt">${v.txt}</span>
    </div>
    <div class="score-grid">
      <div class="score-box"><div class="score-lbl">Note RP</div><div class="score-val rp">${scores.rp}<span style="font-size:.9rem;color:var(--t3)">/100</span></div></div>
      <div class="score-box"><div class="score-lbl">Note HRP</div><div class="score-val hrp">${scores.hrp}<span style="font-size:.9rem;color:var(--t3)">/100</span></div></div>
      <div class="score-box"><div class="score-lbl">Score Global</div><div class="score-val global">${scores.global}<span style="font-size:.9rem;color:var(--t3)">/100</span></div></div>
    </div>
    <div class="analysis-grid">
      <div class="analysis-block">
        <div class="analysis-ttl f">✔ Forces détectées</div>
        ${scores.forces.length
          ? scores.forces.map(f => `<div class="analysis-item f">${f}</div>`).join('')
          : '<div class="analysis-item" style="color:var(--t3)">Aucune force notable détectée</div>'}
      </div>
      <div class="analysis-block">
        <div class="analysis-ttl w">✘ Faiblesses détectées</div>
        ${scores.faiblesses.length
          ? scores.faiblesses.map(f => `<div class="analysis-item w">${f}</div>`).join('')
          : '<div class="analysis-item" style="color:var(--t3)">Aucune faiblesse notable détectée</div>'}
      </div>
    </div>`;
}