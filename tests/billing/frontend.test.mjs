// Pages de retour de paiement : aucune preuve tirée de l'URL, vérification serveur, pas de boucle de redirection
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');

function extractFn(html, name) {
  const start = html.indexOf('async function ' + name);
  assert.ok(start >= 0, name + ' introuvable');
  let i = html.indexOf('{', start), depth = 0;
  for (; i < html.length; i++) { if (html[i] === '{') depth++; else if (html[i] === '}') { depth--; if (depth === 0) break; } }
  return html.slice(start, i + 1);
}

function sandbox(extra = {}) {
  const log = { notifications: [], calls: [], urlOps: [], upgrade: [], cleared: 0 };
  const ctx = {
    console, setTimeout: fn => { fn(); return 0; }, Number, encodeURIComponent, URLSearchParams, Promise,
    window: { location: { search: '', pathname: '/credits.html' }, history: { replaceState: (...a) => log.urlOps.push(a) } },
    document: { title: 'x' },
    showNotification: (m, t) => log.notifications.push({ m, t }),
    loadCreditData: () => log.calls.push('loadCreditData'),
    upgradePlan: p => log.upgrade.push({ p, urlOpsSoFar: log.urlOps.length }),
    swisscvIntent: { clear: () => { log.cleared++; } },
    authenticatedFetch: async () => { throw new Error('non défini'); },
    ...extra
  };
  ctx.window.history.replaceState = (...a) => log.urlOps.push(a);
  ctx.window.swisscvIntent = ctx.swisscvIntent;
  return { ctx: vm.createContext(ctx), log };
}

const credits = read('credits.html');

test('[RETOUR] ?checkout=premium (compte gratuit) : paramètre retiré AVANT la redirection, un seul appel de paiement', async () => {
  const { ctx, log } = sandbox();
  ctx.window.location.search = '?checkout=premium';
  ctx.authenticatedFetch = async () => ({ json: async () => ({ success: true, tier: 'free' }) });
  vm.runInContext(extractFn(credits, 'maybeAutoCheckout'), ctx);
  await vm.runInContext('maybeAutoCheckout()', ctx);
  assert.equal(log.upgrade.length, 1);
  assert.equal(log.upgrade[0].p, 'premium');
  assert.ok(log.upgrade[0].urlOpsSoFar >= 1, 'replaceState doit précéder upgradePlan (pas de boucle au retour arrière depuis Stripe)');
  assert.equal(log.cleared, 1);
});

test('[RETOUR] déjà Premium/Pro : aucun nouveau paiement', async () => {
  for (const tier of ['premium', 'pro']) {
    const { ctx, log } = sandbox();
    ctx.window.location.search = '?checkout=premium';
    ctx.authenticatedFetch = async () => ({ json: async () => ({ success: true, tier }) });
    vm.runInContext(extractFn(credits, 'maybeAutoCheckout'), ctx);
    await vm.runInContext('maybeAutoCheckout()', ctx);
    assert.equal(log.upgrade.length, 0, tier);
    assert.equal(log.notifications.length, 1);
  }
});

test('[NÉGATIF] ?checkout invalide, absent, ou plan inconnu : rien ne se passe', async () => {
  for (const q of ['', '?checkout=enterprise', '?checkout=PREMIUM', '?checkout=', '?checkout=premium%27%3Balert(1)', '?success=true']) {
    const { ctx, log } = sandbox();
    ctx.window.location.search = q;
    vm.runInContext(extractFn(credits, 'maybeAutoCheckout'), ctx);
    await vm.runInContext('maybeAutoCheckout()', ctx);
    assert.equal(log.upgrade.length, 0, q);
    assert.equal(log.urlOps.length, 0, q);
  }
});

test('[RETOUR] lecture du solde impossible : on tente quand même, le serveur revérifie (409 si déjà abonné)', async () => {
  const { ctx, log } = sandbox();
  ctx.window.location.search = '?checkout=pro';
  ctx.authenticatedFetch = async () => { throw new Error('réseau'); };
  vm.runInContext(extractFn(credits, 'maybeAutoCheckout'), ctx);
  await vm.runInContext('maybeAutoCheckout()', ctx);
  assert.deepEqual(log.upgrade.map(u => u.p), ['pro']);
});

test('[NÉGATIF] retour ?success=true : jamais « paiement réussi » tant que le serveur ne confirme pas', async () => {
  const { ctx, log } = sandbox();
  ctx.authenticatedFetch = async () => ({ json: async () => ({ success: true, status: 'pending' }) });
  vm.runInContext(extractFn(credits, 'verifyCheckoutReturn'), ctx);
  await vm.runInContext("verifyCheckoutReturn('cs_test_pending_0001')", ctx);
  const texts = log.notifications.map(n => n.m).join(' | ');
  assert.doesNotMatch(texts, /ajouté|réussi|confirmé :/i, 'aucune affirmation de succès');
  assert.match(log.notifications.at(-1).m, /en cours de confirmation/);
  assert.equal(log.notifications.at(-1).t, 'warning');
});

test('[RETOUR] confirmation serveur : le nombre de crédits affiché vient de la réponse serveur, jamais de l\'URL', async () => {
  const { ctx, log } = sandbox();
  let n = 0;
  ctx.authenticatedFetch = async () => ({ json: async () => (++n < 3 ? { success: true, status: 'pending' } : { success: true, status: 'completed', credits: 15 }) });
  vm.runInContext(extractFn(credits, 'verifyCheckoutReturn'), ctx);
  await vm.runInContext("verifyCheckoutReturn('cs_test_done_0001')", ctx);
  assert.match(log.notifications.at(-1).m, /Paiement confirmé : 15 crédits/);
  assert.ok(log.calls.includes('loadCreditData'));
});

test('[NÉGATIF] retour sans session_id (URL fabriquée) : message neutre, aucune affirmation', async () => {
  const { ctx, log } = sandbox();
  vm.runInContext(extractFn(credits, 'verifyCheckoutReturn'), ctx);
  await vm.runInContext('verifyCheckoutReturn(null)', ctx);
  assert.doesNotMatch(log.notifications.map(n => n.m).join(' '), /ajouté|réussi/i);
});

test('[NÉGATIF] l\'ancien message construit depuis ?credits= (injection HTML possible) a disparu de credits.html', () => {
  assert.doesNotMatch(credits, /params\.get\('credits'\)/);
  assert.doesNotMatch(credits, /Achat réussi/);
});

// ---------------------------------------------------------------- pages de succès Premium
function runSuccessPage(file, { token, tiers }) {
  const html = read(file);
  const m = html.match(/<script>\s*\/\/ Cette page n'accorde aucun droit[\s\S]*?<\/script>/);
  assert.ok(m, file + ' : script de vérification introuvable');
  const code = m[0].replace(/^<script>/, '').replace(/<\/script>$/, '');
  const els = { successTitle: { textContent: '' }, successText: { textContent: '' } };
  const store = token ? { swisscv_token: token } : {};
  let i = 0;
  const ctx = vm.createContext({
    console, JSON, Object, Promise,
    setTimeout: fn => { fn(); return 0; },
    document: { getElementById: id => els[id] },
    localStorage: { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = v; } },
    fetch: async () => ({ json: async () => ({ success: true, user: { tier: tiers[Math.min(i++, tiers.length - 1)] } }) })
  });
  return { run: () => vm.runInContext(code, ctx), els, store };
}

for (const file of ['success.html', 'succes/index.html']) {
  test('[SUCCÈS] ' + file + ' : arrivée sur l\'URL sans plan Premium confirmé = jamais « bienvenue » ni drapeau premium', async () => {
    const p = runSuccessPage(file, { token: 'tok', tiers: ['free'] });
    await p.run();
    assert.match(p.els.successTitle.textContent, /en cours de confirmation/);
    assert.equal(p.store.swisscv_premium, undefined);
    assert.equal(p.store.swisscv_user, undefined);
  });
  test('[SUCCÈS] ' + file + ' : plan confirmé par le serveur après quelques tentatives → message de bienvenue', async () => {
    const p = runSuccessPage(file, { token: 'tok', tiers: ['free', 'free', 'premium'] });
    await p.run();
    assert.match(p.els.successTitle.textContent, /Bienvenue chez SwissCV Pro Premium/);
    assert.equal(JSON.parse(p.store.swisscv_user).tier, 'premium');
  });
  test('[SUCCÈS] ' + file + ' : visiteur non connecté = invitation à se connecter, aucune affirmation de paiement', async () => {
    const p = runSuccessPage(file, { token: null, tiers: ['free'] });
    await p.run();
    assert.match(p.els.successTitle.textContent, /Connectez-vous/);
  });
}

test('[SUCCÈS] plus aucun drapeau client « swisscv_premium » posé par une page de succès', () => {
  for (const f of ['success.html', 'succes/index.html']) assert.doesNotMatch(read(f), /setItem\('swisscv_premium'/);
  assert.doesNotMatch(read('modeles-cv/index.html'), /getItem\('swisscv_premium'\)/);
});

test('[URLS STRIPE] plus aucune URL de retour vers pages.dev dans le Worker', () => {
  const src = fs.readFileSync(path.resolve(process.env.WORKER_PATH || path.join(root, 'index.js')), 'utf8');
  assert.doesNotMatch(src, /swisscv-pro\.pages\.dev/);
});
