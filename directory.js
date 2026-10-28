/* Global public directory. Referencing a business never creates an affiliate. */
(() => {
  'use strict';
  const config = globalThis.ZEEROO_DIRECTORY_CONFIG;
  const list = document.getElementById('public-directory-list');
  if (!list || !config) return;
  const search = document.getElementById('public-directory-search');
  const query = document.getElementById('directory-query');
  const city = document.getElementById('directory-city');
  const status = document.getElementById('directory-status');
  const previous = document.getElementById('directory-previous');
  const next = document.getElementById('directory-next');
  const pageLabel = document.getElementById('directory-page');
  const dialog = document.getElementById('directory-claim-dialog');
  const loginForm = document.getElementById('directory-login-form');
  const claimForm = document.getElementById('directory-claim-form');
  const loginPanel = document.getElementById('directory-login-panel');
  const claimStatus = document.getElementById('directory-claim-status');
  const identity = document.getElementById('directory-identity');
  let page = 0, version = 0, selected = null, authClient = null, user = null, claimComplete = false;
  const node = (tag, text) => { const e = document.createElement(tag); if (text !== undefined) e.textContent = String(text); return e; };
  const rpc = async (name, args) => {
    const response = await fetch(`${config.url}/rest/v1/rpc/${name}`, { method: 'POST', headers: { apikey: config.publishableKey, 'Content-Type': 'application/json' }, body: JSON.stringify(args) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Service temporairement indisponible.');
    return data;
  };
  function safeMiniUrl(value) {
    if (!value || typeof value !== 'string') return null;
    try { const url = new URL(value, location.origin); return url.protocol === 'https:' && ['zeeroo.fr', 'www.zeeroo.fr', 'app.zeeroo.fr', location.hostname].includes(url.hostname) && !url.username && !url.password ? url.href : null; } catch { return null; }
  }
  function renderAuth() {
    loginPanel.hidden = !!user;
    claimForm.hidden = !user;
    identity.hidden = !user;
    identity.textContent = user ? `Connecté : ${user.email}` : '';
    document.getElementById('directory-signout').hidden = !user;
  }
  function openClaim(record) {
    selected = record;
    claimComplete = false;
    claimForm.reset();
    claimForm.querySelector('[type=submit]').disabled = false;
    claimStatus.textContent = '';
    document.getElementById('directory-claim-name').textContent = record.display_name;
    document.getElementById('directory-claim-address').textContent = `${record.address_line} · SIRET ${record.siret}`;
    renderAuth();
    dialog.showModal();
  }
  function renderRows(rows) {
    list.replaceChildren();
    for (const row of rows) {
      const item = node('li'); item.className = 'public-directory-row';
      const info = node('div'); info.className = 'public-directory-info';
      info.append(node('h3', row.display_name), node('p', row.address_line));
      const meta = node('p', `${row.postal_code} ${row.city} · Restauration rapide`); meta.className = 'public-directory-meta';
      const source = node('a', `SIRET ${row.siret}`); source.href = `https://annuaire-entreprises.data.gouv.fr/etablissement/${encodeURIComponent(row.siret)}`; source.target = '_blank'; source.rel = 'noopener noreferrer'; source.className = 'public-directory-source';
      info.append(meta, source);
      const actions = node('div'); actions.className = 'public-directory-row-actions';
      const mini = safeMiniUrl(row.mini_site_url);
      if (mini) { const link = node('a', 'Voir le mini-site'); link.className = 'btn primary small'; link.href = mini; actions.append(link); }
      if (!row.is_claimed) { const button = node('button', 'Revendiquer cet établissement'); button.type = 'button'; button.className = 'btn ghost small'; button.onclick = () => openClaim(row); actions.append(button); }
      else { const label = node('span', 'Établissement revendiqué'); label.className = 'public-directory-claimed'; actions.append(label); }
      const signup = node('a', 'S’inscrire sur ZEEROO'); signup.href = 'https://app.zeeroo.fr/sign-up'; signup.className = 'public-directory-signup'; actions.append(signup);
      item.append(info, actions); list.append(item);
    }
  }
  async function load(n = 0) {
    const current = ++version; page = n;
    status.textContent = 'Chargement de l’annuaire…'; list.setAttribute('aria-busy', 'true'); previous.disabled = true; next.disabled = true;
    try {
      const data = await rpc('search_pro_directory', { p_query: query.value.trim(), p_city: city.value, p_offset: n * 25 });
      if (current !== version) return;
      renderRows(data.rows);
      status.textContent = `${new Intl.NumberFormat('fr-FR').format(data.total)} établissement(s) référencé(s)${data.total === 0 ? ' — aucun résultat pour cette recherche.' : ''}`;
      pageLabel.textContent = data.total ? `Page ${n + 1} sur ${Math.ceil(data.total / 25)}` : 'Aucun résultat';
      previous.disabled = n === 0; next.disabled = (n + 1) * 25 >= data.total;
    } catch {
      if (current !== version) return;
      list.replaceChildren(); pageLabel.textContent = '';
      status.textContent = 'L’annuaire est temporairement indisponible. Réessayez avec le bouton Rechercher.';
    } finally { if (current === version) list.setAttribute('aria-busy', 'false'); }
  }
  search.onsubmit = event => { event.preventDefault(); load(0); };
  city.onchange = () => load(0);
  previous.onclick = () => load(Math.max(0, page - 1));
  next.onclick = () => load(page + 1);
  document.getElementById('directory-claim-close').onclick = () => dialog.close();
  dialog.addEventListener('close', () => { loginForm.elements.password.value = ''; });
  loginForm.onsubmit = async event => {
    event.preventDefault(); const submit = loginForm.querySelector('[type=submit]'); submit.disabled = true; claimStatus.textContent = 'Connexion…';
    const form = new FormData(loginForm);
    try {
      if (!authClient) {
        const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.3/+esm');
        authClient = createClient(config.url, config.publishableKey, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
      }
      const { data, error } = await authClient.auth.signInWithPassword({ email: String(form.get('email')).trim(), password: String(form.get('password')) });
      if (error) throw error;
      if (!data.user?.email_confirmed_at) throw new Error('Confirmez votre adresse e-mail pour continuer.');
      user = data.user; claimStatus.textContent = ''; renderAuth(); claimForm.querySelector('input').focus();
    } catch { claimStatus.textContent = 'Connexion impossible. Vérifiez vos identifiants et la confirmation de votre adresse e-mail.'; }
    finally { loginForm.elements.password.value = ''; submit.disabled = false; }
  };
  document.getElementById('directory-signout').onclick = async () => {
    try { await authClient?.auth.signOut({ scope: 'local' }); } finally { user = null; renderAuth(); claimStatus.textContent = ''; }
  };
  claimForm.onsubmit = async event => {
    event.preventDefault(); if (!user || !selected || claimComplete) return;
    const submit = claimForm.querySelector('[type=submit]'); if (submit.disabled) return; submit.disabled = true;
    claimStatus.textContent = 'Enregistrement de votre demande…'; const form = new FormData(claimForm); const target = selected;
    try {
      const { data, error } = await authClient.rpc('request_directory_claim', { p_siret: target.siret, p_capacity: String(form.get('capacity')).trim(), p_note: String(form.get('note')).trim(), p_phone: String(form.get('phone')).trim() || null });
      if (error) throw error;
      if (selected !== target) return;
      claimComplete = true;
      claimStatus.textContent = `Demande enregistrée sous la référence ${data}. Elle sera examinée avant toute validation. Vous pouvez poursuivre votre inscription professionnelle sur app.zeeroo.fr.`;
      claimStatus.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
    } catch (error) { if (selected === target) claimStatus.textContent = error.message || 'Demande impossible. Reconnectez-vous puis réessayez.'; }
    finally { if (selected === target) submit.disabled = claimComplete; }
  };
  rpc('pro_directory_cities', {}).then(rows => { for (const row of rows) { const option = node('option', row.city); option.value = row.city; city.append(option); } }).catch(() => { city.disabled = true; });
  load(0);
})();
