'use strict';
/* Diagnostic ZeeRoo : tout reste dans la page jusqu'à l'envoi par e-mail (aucun serveur). */
const questions = {
  restaurant: [
    ['organisation', 'Comment recevez-vous vos commandes à emporter et en livraison ?', 'Téléphone, site, plateformes, sur place…'],
    ['frais', 'Que pensez-vous des commissions et frais que vous payez ?', 'Dites simplement ce qui vous convient ou vous gêne.'],
    ['paiement', 'Comment encaissez-vous vos commandes aujourd’hui ?', 'Carte, espèces, lien de paiement…'],
    ['frein', 'Qu’est-ce qui vous fait perdre le plus de temps ou de marge ?', 'Un exemple de votre quotidien suffit.'],
    ['objectif', 'Qu’aimeriez-vous améliorer en priorité ?', 'Votre objectif pour les prochains mois.'],
  ],
  livreur: [
    ['organisation', 'Comment trouvez-vous vos livraisons aujourd’hui ?', 'Applications, restaurants partenaires, clients directs…'],
    ['frais', 'Comment êtes-vous rémunéré et quels frais vous sont prélevés ?', 'Avec vos mots, sans calcul compliqué.'],
    ['paiement', 'Comment recevez-vous vos paiements aujourd’hui ?', 'Virement, espèces, plateforme…'],
    ['frein', 'Quelle est votre principale difficulté au quotidien ?', 'Attente, distance, rémunération, organisation…'],
    ['objectif', 'Qu’aimeriez-vous changer pour mieux travailler ?', 'Votre priorité pour les prochains mois.'],
  ],
};
/* Champs à choix : [id, libellé, options]. Les options qui orientent vers la formule Pro sont repérées par `pro`. */
const extras = {
  restaurant: [
    ['type', 'Votre établissement', ['Restaurant ou snack', 'Boulangerie ou pâtisserie', 'Dark kitchen (sans salle)', 'Autre']],
    ['livraison', 'La livraison aujourd’hui', ['Je livre avec mes propres livreurs', 'Je passe par des plateformes de livraison', 'Je ne livre pas encore, ça m’intéresse', 'Je ne fais que du retrait sur place']],
    ['horaires', 'Vos horaires de commande', ['Plutôt en journée', 'Journée et soirée', 'Jusqu’à tard ou la nuit']],
  ],
  livreur: [
    ['statut', 'Votre statut', ['Auto-entrepreneur', 'Société', 'Pas encore de statut']],
    ['vehicule', 'Votre véhicule', ['Vélo', 'Scooter ou moto', 'Voiture', 'À pied ou autre']],
    ['nuit', 'Livrez-vous la nuit (22 h – 6 h) ?', ['Oui', 'Parfois', 'Non'], 'Oui'],
    ['courses', 'Courses à la fois', ['Une seule me suffit', 'Je voudrais en prendre jusqu’à 2, quand c’est compatible'], 'Je voudrais en prendre jusqu’à 2, quand c’est compatible'],
  ],
};
/* Fonctions du restaurant : [id, libellé, réservée à la formule Pro ?] */
const features = [
  ['precommandes', 'Commandes programmées à l’avance', false],
  ['fidelite', 'Programme de fidélité (le 10e menu offert)', false],
  ['antigaspi', 'Paniers anti-gaspi', false],
  ['happy', 'Happy Hours', true],
  ['minisite', 'Mini-site dans l’annuaire et QR code', true],
  ['groupees', 'Commandes groupées pour les entreprises', true],
  ['stats', 'Statistiques avancées', true],
  ['campagne', 'Campagne mensuelle sur les réseaux ZEEROO', true],
];
const pricing = {
  restaurant: [['Établissement Start mensuel', 19.99, 'mois'], ['Établissement Start annuel', 199.99, 'an'], ['Établissement Pro mensuel', 29.99, 'mois'], ['Établissement Pro annuel', 299.99, 'an']],
  livreur: [['Livreur Start mensuel', 14.99, 'mois'], ['Livreur Start annuel', 149.99, 'an'], ['Livreur Pro mensuel', 24.99, 'mois'], ['Livreur Pro annuel', 249.99, 'an']],
};
const form = document.querySelector('form'), area = document.querySelector('#questions'), result = document.querySelector('#result');
const extrasBox = document.querySelector('#extras'), featuresBox = document.querySelector('#features-box'), featuresList = document.querySelector('#features');
const drafts = { restaurant: {}, livreur: {} };
let current = 'restaurant', planTouched = false;
const money = (n) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);
const profile = () => form.elements.profil.value;
const selectedPlan = () => pricing[profile()][Number(form.elements.plan.value)];
const planSummary = () => { const [label, price, period] = selectedPlan(); return `${label} : ${money(price)} HT / ${period}. 30 jours d’essai gratuit.`; };
const val = (id) => (form.elements[id] ? form.elements[id].value.trim() : '');
const checkedFeatures = () => features.filter(([id]) => form.elements['f_' + id]?.checked);

function suggestPro() {
  if (profile() === 'restaurant') return checkedFeatures().some(([, , pro]) => pro);
  return val('nuit') === 'Oui' || val('courses').startsWith('Je voudrais');
}
function renderPlans() {
  form.elements.plan.replaceChildren();
  pricing[current].forEach(([label, price, period], i) => {
    const o = document.createElement('option');
    o.value = String(i);
    o.textContent = `${label} — ${money(price)} HT / ${period}`;
    form.elements.plan.append(o);
  });
}
function field(id, label, options, preset) {
  const wrap = document.createElement('div');
  const l = document.createElement('label'); l.htmlFor = id; l.textContent = label;
  const s = document.createElement('select'); s.id = id; s.name = id;
  const none = document.createElement('option'); none.value = ''; none.textContent = 'Choisir…'; s.append(none);
  for (const text of options) { const o = document.createElement('option'); o.value = text; o.textContent = text; s.append(o); }
  s.value = drafts[current][id] ?? preset ?? '';
  wrap.append(l, s);
  return wrap;
}
function render() {
  renderPlans();
  planTouched = false;
  extrasBox.replaceChildren(...extras[current].map(([id, label, options, preset]) => field(id, label, options, preset)));
  featuresBox.hidden = current !== 'restaurant';
  featuresList.replaceChildren(...features.map(([id, label, pro]) => {
    const l = document.createElement('label'); l.className = 'check';
    const c = document.createElement('input'); c.type = 'checkbox'; c.name = 'f_' + id; c.checked = Boolean(drafts.restaurant['f_' + id]);
    const t = document.createElement('span'); t.textContent = label;
    l.append(c, t);
    if (pro) { const b = document.createElement('em'); b.textContent = 'Pro'; l.append(b); }
    return l;
  }));
  area.replaceChildren();
  for (const [id, label, hint] of questions[current]) {
    const l = document.createElement('label'); l.htmlFor = id; l.textContent = label;
    const t = document.createElement('textarea'); t.id = id; t.name = id; t.maxLength = 500; t.placeholder = hint; t.value = drafts[current][id] || '';
    area.append(l, t);
  }
  result.hidden = true;
}
function saveDraft() {
  for (const [id] of questions[current]) drafts[current][id] = form.elements[id].value;
  for (const [id] of extras[current]) drafts[current][id] = form.elements[id].value;
  if (current === 'restaurant') for (const [id] of features) drafts.restaurant['f_' + id] = form.elements['f_' + id].checked;
}
form.elements.profil.forEach((r) => r.addEventListener('change', () => { saveDraft(); current = profile(); render(); clearStatus(); }));
form.elements.plan.addEventListener('change', () => { planTouched = true; });
const snapshot = () => Object.fromEntries(questions[profile()].map(([id]) => [id, val(id)]));

function estimate() {
  const c = form.elements.cost.value;
  const [, price, period] = selectedPlan();
  const annual = period === 'mois' ? Math.round(price * 12 * 100) / 100 : price;
  const intro = planSummary() + ' Comparaison sur 12 mois payants, hors essai gratuit.';
  if (c === '') return intro + ' Indiquez vos frais mensuels pour obtenir un écart estimatif.';
  const delta = Number(c) * 12 - annual;
  return `${intro} Frais actuels déclarés : ${money(Number(c) * 12)} HT sur 12 mois. ZeeRoo : ${money(annual)} HT sur 12 mois. ${delta >= 0 ? 'Écart potentiel en votre faveur' : 'Surcoût estimé'} : ${money(Math.abs(delta))} HT.`;
}
function advice() {
  const pro = suggestPro();
  if (profile() === 'restaurant') {
    const wanted = checkedFeatures().filter(([, , p]) => p).map(([, label]) => label.toLowerCase());
    return pro
      ? `Formule conseillée : Établissement Pro, pour ${wanted.join(', ')}. Retrait, livraison, commandes programmées, fidélité et anti-gaspi sont déjà dans Start.`
      : 'Formule conseillée : Établissement Start. Elle comprend le retrait, la livraison avec vos livreurs, les commandes programmées, la fidélité et les paniers anti-gaspi. Vous pourrez passer en Pro à tout moment.';
  }
  return pro
    ? 'Formule conseillée : Livreur Pro, pour les livraisons de nuit et jusqu’à 2 courses compatibles à la fois.'
    : 'Formule conseillée : Livreur Start : une course à la fois, hors livraisons de nuit. Vous pourrez passer en Pro à tout moment.';
}
function compare() {
  if (!form.elements.cost.checkValidity()) { form.elements.cost.reportValidity(); return false; }
  if (!planTouched) form.elements.plan.value = String(suggestPro() ? 2 : 0);
  const a = snapshot();
  const resto = profile() === 'restaurant';
  const rows = [
    ['Organisation', a.organisation, resto ? 'Click & Collect coupe-file, commandes programmées et livraison locale avec vos livreurs, dans une seule application, sans commission ZeeRoo.' : 'Missions de vos restaurants partenaires : la première acceptée est la vôtre. Aucune commission ZeeRoo sur vos courses.'],
    ['Frais de plateforme', a.frais, planSummary()],
    ['Paiement', a.paiement, resto ? 'Vos clients paient directement avec votre lien de paiement ou en espèces ; vous confirmez la réception. ZeeRoo n’encaisse jamais l’argent des commandes.' : 'Le client vous paie directement, par votre lien de paiement ou en espèces ; vous confirmez la réception. ZeeRoo n’encaisse jamais vos courses.'],
  ];
  const tbody = document.querySelector('#comparison');
  tbody.replaceChildren();
  for (const row of rows) {
    const tr = document.createElement('tr');
    row.forEach((v, i) => { const cell = document.createElement(i === 0 ? 'th' : 'td'); if (i === 0) cell.scope = 'row'; cell.textContent = v || 'Non renseigné'; tr.append(cell); });
    tbody.append(tr);
  }
  document.querySelector('#advice').textContent = advice();
  document.querySelector('#estimate').textContent = estimate();
  document.querySelector('#priority').textContent = a.objectif ? `Votre priorité : ${a.objectif}. Notre retour permettra de vérifier si ZeeRoo répond à ce besoin.` : 'Votre difficulté et votre objectif seront étudiés dans notre retour personnalisé.';
  result.hidden = false;
  return true;
}
document.querySelector('#compare').addEventListener('click', () => { if (compare()) { result.focus(); result.scrollIntoView({ behavior: 'smooth', block: 'start' }); } });

function report() {
  const a = snapshot();
  const resto = profile() === 'restaurant';
  const profil = resto ? 'Restaurant, boulangerie ou dark kitchen' : 'Livreur indépendant';
  const wanted = resto ? checkedFeatures().map(([, label, pro]) => label + (pro ? ' (Pro)' : '')) : [];
  return [
    'DIAGNOSTIC ZeeRoo — ' + profil,
    'Nom : ' + val('name'),
    'E-mail : ' + val('email'),
    'Activité : ' + val('business'),
    'Ville / zone : ' + val('city'),
    '',
    'EN BREF',
    ...extras[profile()].map(([id, label]) => label + ' : ' + (val(id) || 'Non renseigné')),
    ...(resto ? ['Fonctions qui intéressent : ' + (wanted.join(', ') || 'Non renseigné')] : []),
    '',
    ...questions[profile()].map(([id, label]) => label + '\n' + (a[id] || 'Non renseigné') + '\n'),
    'COMPARAISON INDICATIVE',
    advice(),
    estimate(),
    'Zéro commission ZeeRoo. Transactions avec vos propres coordonnées de paiement. Stripe réservé aux abonnements ZeeRoo.',
    'À activité constante, si les frais déclarés sont intégralement remplacés. Hors frais de paiement et d’exploitation. Aucun gain net ni volume garanti.',
    '',
    'Je souhaite être recontacté au sujet de ce diagnostic.',
  ].join('\n');
}
function clearStatus() { document.querySelector('#status').textContent = ''; document.querySelector('#fallback').hidden = true; }
form.addEventListener('input', (e) => { clearStatus(); if (!result.hidden && e.target.id !== 'plan') compare(); });
form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!form.reportValidity()) return;
  compare();
  const subject = 'Diagnostic ZeeRoo — ' + (profile() === 'restaurant' ? 'Restaurant' : 'Livreur');
  window.location.href = 'mailto:contact@aiworkpay.fr?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(report());
  document.querySelector('#status').textContent = 'E-mail préparé. Validez l’envoi dans votre messagerie. Si elle ne s’ouvre pas, copiez le diagnostic et envoyez-le à contact@aiworkpay.fr.';
});
document.querySelector('#copy').addEventListener('click', async () => {
  if (!form.reportValidity()) return;
  const text = report();
  try {
    await navigator.clipboard.writeText(text);
    document.querySelector('#status').textContent = 'Diagnostic copié. Collez-le dans un e-mail à contact@aiworkpay.fr.';
  } catch {
    const t = document.querySelector('#fallback');
    t.value = text; t.hidden = false; t.focus(); t.select();
    document.querySelector('#status').textContent = 'Copiez le texte ci-dessous et envoyez-le à contact@aiworkpay.fr.';
  }
});
const requestedProfile = new URLSearchParams(window.location.search).get('profil');
if (requestedProfile === 'restaurant' || requestedProfile === 'livreur') {
  current = requestedProfile;
  form.querySelector('input[name=profil][value=' + requestedProfile + ']').checked = true;
}
render();
