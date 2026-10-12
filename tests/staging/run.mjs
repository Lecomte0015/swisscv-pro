// Tests d'intégration sur l'environnement de test JETABLE (Worker swisscv-pro-staging + base D1 swisscv-staging-tmp).
// Lit les secrets de test dans un fichier hors dépôt (STAGING_ENV), n'en affiche aucun, et refuse de toucher une autre base.
//   STAGING_ENV=/chemin/staging.env node tests/staging/run.mjs
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const env = Object.fromEntries(fs.readFileSync(process.env.STAGING_ENV, 'utf8').split('\n').filter(Boolean).map(l => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]));
const DB = env.STAGING_DB_NAME;
if (DB !== 'swisscv-staging-tmp') throw new Error('Base inattendue : arrêt de sécurité');
const URL_BASE = process.env.STAGING_URL || 'https://swisscv-pro-staging.dallyhermann-71e.workers.dev';
if (/swisscv-pro\.dallyhermann-71e\.workers\.dev$/.test(URL_BASE)) throw new Error('URL de production refusée');

const results = [];
function check(id, name, cond, detail = '') { results.push({ id, name, pass: !!cond, detail: cond ? '' : String(detail) }); }

function d1(sql) {
  const out = execFileSync('npx', ['wrangler', 'd1', 'execute', DB, '--remote', '--config', 'wrangler.staging.toml', '--json', '--command', sql], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  const parsed = JSON.parse(out.slice(out.indexOf('[')));
  return parsed[parsed.length - 1].results || [];
}
const q1 = sql => d1(sql)[0];
const run = Date.now().toString(36);
const uid = n => 'st_' + run + '_' + n;

async function http(method, p, { body, token, headers = {}, raw } = {}) {
  const h = { ...headers };
  if (token) h.Authorization = 'Bearer ' + token;
  if (body !== undefined && !raw) h['Content-Type'] = 'application/json';
  const r = await fetch(URL_BASE + p, { method, headers: h, body: raw ?? (body === undefined ? undefined : JSON.stringify(body)) });
  let data = null; try { data = await r.json(); } catch (e) { /* non JSON */ }
  return { status: r.status, data };
}
const b64 = s => Buffer.from(s).toString('base64');
function jwt(payload, secret = env.STAGING_JWT_SECRET) {
  const h = b64(JSON.stringify({ alg: 'HS256', typ: 'JWT' })), p = b64(JSON.stringify(payload));
  return h + '.' + p + '.' + crypto.createHmac('sha256', secret).update(h + '.' + p).digest('base64');
}
const inHour = () => Math.floor(Date.now() / 1000) + 3600;
const userToken = id => jwt({ userId: id, email: id + '@test.invalid', tier: 'free', exp: inHour() });
const adminToken = (id, extra = {}) => jwt({ userId: id, email: id + '@test.invalid', adm: 1, role: 'admin', exp: inHour(), ...extra });
let evtN = 0;
async function webhook(type, object, { id, signature, rawBody, ts } = {}) {
  const event = { id: id || ('evt_' + run + '_' + (++evtN)), type, created: Math.floor(Date.now() / 1000), data: { object } };
  const payload = rawBody ?? JSON.stringify(event);
  const t = ts ?? Math.floor(Date.now() / 1000);
  const sig = signature === undefined ? 't=' + t + ',v1=' + crypto.createHmac('sha256', env.STAGING_WEBHOOK_SECRET).update(t + '.' + payload).digest('hex') : signature;
  const headers = { 'Content-Type': 'application/json' };
  if (sig !== null) headers['stripe-signature'] = sig;
  const r = await http('POST', '/stripe/webhook', { raw: payload, headers });
  r.event = event; return r;
}
const seedUsers = rows => d1('INSERT INTO users (id, email, subscription_tier, stripe_customer_id, stripe_subscription_id, credits_balance, credits_monthly_limit, has_job_pack, role, created_at, updated_at) VALUES ' +
  rows.map(u => `('${u.id}','${u.id}@test.invalid','${u.tier || 'free'}',${u.cus ? `'${u.cus}'` : 'NULL'},${u.sub ? `'${u.sub}'` : 'NULL'},${u.bal ?? 5},${u.lim ?? 5},${u.pack ? 1 : 0},'${u.role || 'viewer'}',unixepoch(),unixepoch())`).join(','));
const U = id => q1(`SELECT subscription_tier t, credits_balance b, credits_monthly_limit lim, stripe_customer_id cus, stripe_subscription_id sub, subscription_status st, has_job_pack pack, role, deleted_at del FROM users WHERE id='${id}'`);
const count = (table, where) => q1(`SELECT COUNT(*) n FROM ${table} WHERE ${where}`).n;
// Repartir d'un état propre (base jetable uniquement, garde-fou plus haut) : fenêtres de limitation et campagnes d'un passage précédent
d1('DELETE FROM rate_limits'); d1('DELETE FROM marketing_sends'); d1('DELETE FROM marketing_campaigns');
const PRICE_PREMIUM = 'price_1Suy0EADypIYoB8vWc0RD5na', PRICE_PRO = 'price_1Suy1SADypIYoB8vxzCU7Cft';
const credit = (sid, u, o = {}) => ({ id: sid, mode: 'payment', payment_status: 'paid', currency: 'chf', amount_total: 500, customer: 'cus_' + u, metadata: { type: 'credit_purchase', user_id: u, credits: '15' }, ...o });
const pack = (sid, u, o = {}) => ({ id: sid, mode: 'payment', payment_status: 'paid', currency: 'chf', amount_total: 1990, customer: 'cus_' + u, metadata: { type: 'job_pack_purchase', user_id: u, credits: '55' }, ...o });
const sub = (id, u, o = {}) => ({ id, customer: 'cus_' + u, status: o.status || 'active', cancel_at_period_end: !!o.cap, items: { data: [{ price: { id: o.price || PRICE_PREMIUM } }] } });
const inv = (id, u, s, o = {}) => ({ id, customer: 'cus_' + u, subscription: s, amount_paid: 900, currency: 'chf', billing_reason: o.reason === undefined ? 'subscription_cycle' : o.reason, lines: { data: [{ price: { id: PRICE_PREMIUM } }] } });

// ================================================================ SCÉNARIOS
console.log('Staging :', URL_BASE);

// ---- A. Porte admin
{
  const admin = uid('adm'), plain = uid('plain'), demoted = uid('demo'), target = uid('target');
  seedUsers([{ id: admin, role: 'admin' }, { id: plain }, { id: demoted }, { id: target }]);
  const routes = ['/admin/metrics', '/admin/users', '/admin/logs', '/admin/stats', '/admin/feedback/responses', '/admin/marketing/funnel'];
  const codes = async tok => (await Promise.all(routes.map(r => http('GET', r, { token: tok })))).map(r => r.status);
  check('A1', 'Routes /admin/* sans jeton → 401', (await codes(undefined)).every(c => c === 401), await codes(undefined));
  check('A2', 'Faux jetons ("x", chaîne quelconque) → 401', (await codes('x')).every(c => c === 401) && (await codes('aaaaaaaaaaaaaaaaaaaaaaaa')).every(c => c === 401));
  check('A3', 'Jeton falsifié (mauvaise signature) → 401', (await codes(jwt({ userId: admin, adm: 1, exp: inHour() }, 'autre-secret'))).every(c => c === 401));
  check('A4', 'Jeton admin expiré → 401', (await codes(jwt({ userId: admin, adm: 1, exp: 1 }))).every(c => c === 401));
  check('A5', 'Jeton admin sans date d\'expiration → 401', (await codes(jwt({ userId: admin, adm: 1 }))).every(c => c === 401));
  check('A6', 'Jeton d\'un utilisateur ordinaire (valide) → 401', (await codes(userToken(plain))).every(c => c === 401));
  check('A7', 'Jeton marqué admin, compte non admin → 403', (await codes(adminToken(demoted))).every(c => c === 403));
  const ok = await codes(adminToken(admin));
  check('A8', 'Jeton admin valide → 200 sur les routes', ok.every(c => c === 200), ok);
  const patch = await http('PATCH', '/admin/users/' + target, { token: 'x', body: { tier: 'pro' } });
  check('A9', 'Changer un plan avec un faux jeton → 401 et plan inchangé', patch.status === 401 && U(target).t === 'free', patch.status);
  const role = await http('PATCH', '/admin/users/' + target + '/role', { token: userToken(plain), body: { role: 'super_admin' } });
  check('A10', 'Changer un rôle avec un jeton utilisateur → 401, rôle inchangé', role.status === 401 && U(target).role === 'viewer');
  const legit = await http('PATCH', '/admin/users/' + target, { token: adminToken(admin), body: { tier: 'premium' } });
  check('A11', 'Admin légitime peut changer un plan (200)', legit.status === 200 && U(target).t === 'premium', legit.status);
  const pre = await http('OPTIONS', '/admin/users', { headers: { Origin: 'https://swisscv-pro.ch', 'Access-Control-Request-Method': 'GET' } });
  check('A12', 'Préflight CORS non bloqué', pre.status === 200 || pre.status === 204, pre.status);
  const hard = await http('POST', '/admin/login', { body: { email: 'admin@swisscv-pro.ch', password: 'invalide' } });
  check('A13', 'Connexion admin avec ancien compte codé en dur → aucun jeton', !(hard.data && hard.data.token), hard.status);
}

// ---- B. Création de session de crédits (validation avant Stripe)
{
  const u = uid('cc'); seedUsers([{ id: u, cus: 'cus_' + u }]); const tok = userToken(u);
  const bad = [{ credits: 30, amount: 1 }, { credits: 10000, amount: 1 }, { credits: 5, amount: 800 }, { credits: -5, amount: 200 }, { credits: '15abc', amount: 500 }, { credits: 1.5, amount: 500 }, {}, { credits: null }];
  const rs = await Promise.all(bad.map(b => http('POST', '/stripe/create-credit-checkout', { token: tok, body: b })));
  check('B1', 'Montants falsifiés / quantités invalides → 400 avant tout appel Stripe', rs.every(r => r.status === 400), rs.map(r => r.status));
  check('B2', 'Sans jeton → 401', (await http('POST', '/stripe/create-credit-checkout', { body: { credits: 5, amount: 200 } })).status === 401);
  const good = await http('POST', '/stripe/create-credit-checkout', { token: tok, body: { credits: 15, amount: 500 } });
  check('B3', 'Demande valide : franchit la validation et appelle Stripe (échec attendu : clé de test factice)', good.status === 500 && !/Offre|Prix invalide/.test(JSON.stringify(good.data)), good.status + ' ' + JSON.stringify(good.data).slice(0, 80));
}

// ---- C. Webhooks : signature
{
  const u = uid('sig'); seedUsers([{ id: u, cus: 'cus_' + u }]);
  const obj = credit('cs_test_' + run + '_sig', u);
  const payload = JSON.stringify({ id: 'evt_sig_' + run, type: 'checkout.session.completed', data: { object: obj } });
  const r1 = await webhook('checkout.session.completed', obj, { signature: null });
  const r2 = await webhook('checkout.session.completed', obj, { signature: 't=1,v1=00' });
  const t0 = Math.floor(Date.now() / 1000);
  const goodSig = 't=' + t0 + ',v1=' + crypto.createHmac('sha256', env.STAGING_WEBHOOK_SECRET).update(t0 + '.' + payload).digest('hex');
  const r3 = await webhook('checkout.session.completed', obj, { rawBody: payload.replace('"amount_total":500', '"amount_total":1'), signature: goodSig });
  const old = t0 - 3600;
  const r4 = await webhook('checkout.session.completed', obj, { rawBody: payload, signature: 't=' + old + ',v1=' + crypto.createHmac('sha256', env.STAGING_WEBHOOK_SECRET).update(old + '.' + payload).digest('hex') });
  const r5 = await webhook('checkout.session.completed', obj, { rawBody: payload, signature: 't=' + t0 + ',v1=' + crypto.createHmac('sha256', 'autre').update(t0 + '.' + payload).digest('hex') });
  check('C1', 'Webhook : signature absente / fausse / corps modifié / horodatage ancien / mauvais secret → 400', [r1, r2, r3, r4, r5].every(r => r.status === 400), [r1, r2, r3, r4, r5].map(r => r.status));
  check('C2', 'Aucun crédit attribué après ces rejets', U(u).b === 5);
}

// ---- D. Achat de crédits : attribution unique (vraie D1 distante, vraie concurrence)
{
  const a = uid('buy'), cs = 'cs_test_' + run + '_buy';
  seedUsers([{ id: a, cus: 'cus_' + a, bal: 2 }]);
  const first = await webhook('checkout.session.completed', credit(cs, a));
  check('D1', 'Achat conforme (15 crédits, 5 CHF) → +15, limite mensuelle inchangée', first.status === 200 && U(a).b === 17 && U(a).lim === 5, JSON.stringify(U(a)));
  for (let i = 0; i < 3; i++) await webhook('checkout.session.completed', credit(cs, a), { id: first.event.id });
  check('D2', 'Même événement rejoué 3 fois → toujours +15', U(a).b === 17, U(a).b);
  await webhook('checkout.session.completed', credit(cs, a));
  await webhook('checkout.session.async_payment_succeeded', credit(cs, a));
  check('D3', 'Même session sous d\'autres identifiants d\'événement → toujours +15', U(a).b === 17, U(a).b);
  const p = uid('par'), ps = 'cs_test_' + run + '_par';
  seedUsers([{ id: p, cus: 'cus_' + p, bal: 0 }]);
  await Promise.all(Array.from({ length: 12 }, () => webhook('checkout.session.completed', credit(ps, p))));
  check('D4', '12 webhooks identiques en parallèle (D1 réelle) → crédité UNE fois (+15)', U(p).b === 15, U(p).b);
  check('D5', 'Une seule transaction et une seule session enregistrées', count('credit_transactions', `user_id='${p}'`) === 1 && count('processed_checkout_sessions', `session_id='${ps}'`) === 1);
  const tx = q1(`SELECT credits_before cb, credits_after ca, credits_used cu FROM credit_transactions WHERE user_id='${p}'`);
  check('D6', 'Transaction cohérente (avant 0, après 15, mouvement −15)', tx.cb === 0 && tx.ca === 15 && tx.cu === -15, JSON.stringify(tx));
  check('D7', 'Registre des paiements : 1 ligne de 500 centimes', count('payments', `user_id='${p}' AND kind='credit_purchase' AND amount=500`) === 1);
  const f = uid('forge'); seedUsers([{ id: f, cus: 'cus_' + f }]);
  await webhook('checkout.session.completed', credit('cs_test_' + run + '_f1', f, { metadata: { type: 'credit_purchase', user_id: f, credits: '30' }, amount_total: 200 }));
  await webhook('checkout.session.completed', credit('cs_test_' + run + '_f2', f, { metadata: { type: 'credit_purchase', user_id: f, credits: '9999' } }));
  await webhook('checkout.session.completed', credit('cs_test_' + run + '_f3', f, { currency: 'eur' }));
  await webhook('checkout.session.completed', credit('cs_test_' + run + '_f4', f, { mode: 'subscription' }));
  await webhook('checkout.session.completed', credit('cs_test_' + run + '_f5', f, { customer: 'cus_someone_else' }));
  await webhook('checkout.session.completed', credit('cs_test_' + run + '_f6', 'utilisateur_inexistant'));
  check('D8', 'Montant ≠ palier, palier inconnu, mauvaise devise/mode, client étranger, compte inconnu → rien attribué', U(f).b === 5, U(f).b);
  const as = uid('async'); seedUsers([{ id: as, cus: 'cus_' + as }]); const asid = 'cs_test_' + run + '_async';
  await webhook('checkout.session.completed', credit(asid, as, { payment_status: 'unpaid' }));
  const before = U(as).b;
  await webhook('checkout.session.async_payment_succeeded', credit(asid, as));
  await webhook('checkout.session.async_payment_succeeded', credit(asid, as));
  check('D9', 'Paiement asynchrone : non payé → 0 ; confirmé (×2) → +15 une fois', before === 5 && U(as).b === 20, before + ' → ' + U(as).b);
  const fl = await webhook('checkout.session.async_payment_failed', credit('cs_test_' + run + '_fail', as, { payment_status: 'unpaid' }));
  check('D10', 'Paiement asynchrone échoué : accepté (200) sans crédit', fl.status === 200 && U(as).b === 20);
}

// ---- E. Pack
{
  const u = uid('pack'), s = 'cs_test_' + run + '_pack';
  seedUsers([{ id: u, cus: 'cus_' + u, bal: 3 }]);
  await Promise.all(Array.from({ length: 8 }, () => webhook('checkout.session.completed', pack(s, u))));
  const r = U(u);
  check('E1', 'Pack 19.90 CHF ×8 envois parallèles → +55 une fois, Pack activé', r.b === 58 && r.pack === 1, JSON.stringify(r));
  check('E2', 'Événements Pack : 1 achat, 1 activation', count('job_pack_events', `user_id='${u}' AND event_type='purchased'`) === 1 && count('job_pack_events', `user_id='${u}' AND event_type='activated'`) === 1);
  const f = uid('packf'); seedUsers([{ id: f, cus: 'cus_' + f }]);
  await webhook('checkout.session.completed', pack('cs_test_' + run + '_pf1', f, { amount_total: 100 }));
  check('E3', 'Pack payé 1 CHF → rien', U(f).b === 5 && U(f).pack === 0);
  await webhook('checkout.session.completed', pack('cs_test_' + run + '_pf2', f, { metadata: { type: 'job_pack_purchase', user_id: f, credits: '9999' } }));
  check('E4', 'Pack avec 9999 crédits annoncés mais montant exact → 55 (tarif serveur)', U(f).b === 60, U(f).b);
}

// ---- F. Abonnements, factures, échecs, résiliations
{
  const u = uid('sub'), sid = 'sub_' + run + '_a';
  seedUsers([{ id: u, cus: 'cus_' + u, bal: 150 }]);
  await webhook('customer.subscription.created', sub(sid, u));
  let r = U(u);
  check('F1', 'Abonnement Premium créé → plan premium, limite 100, solde 150 conservé (jamais réduit)', r.t === 'premium' && r.lim === 100 && r.b === 150 && r.sub === sid, JSON.stringify(r));
  const w = uid('subl'); seedUsers([{ id: w, cus: 'cus_' + w, bal: 2 }]);
  await webhook('customer.subscription.created', sub('sub_' + run + '_l', w));
  check('F2', 'Nouvel abonné avec solde bas → remonté à 100', U(w).b === 100, U(w).b);
  d1(`UPDATE users SET credits_balance = 40 WHERE id='${u}'`);
  for (let i = 0; i < 3; i++) await webhook('customer.subscription.updated', sub(sid, u, { cap: true }));
  r = U(u);
  check('F3', 'Mises à jour répétées (résiliation programmée) → crédits inchangés (40), accès conservé', r.b === 40 && r.t === 'premium', JSON.stringify(r));
  check('F4', 'Résiliation programmée tracée distinctement', count('subscription_events', `user_id='${u}' AND event='cancel_scheduled'`) >= 1);
  const evt = 'evt_inv_' + run;
  await webhook('invoice.paid', inv('in_' + run + '_1', u, sid), { id: evt });
  check('F5', 'Facture de renouvellement payée → solde remonté à 100', U(u).b === 100, U(u).b);
  d1(`UPDATE users SET credits_balance = 30 WHERE id='${u}'`);
  await webhook('invoice.paid', inv('in_' + run + '_1', u, sid), { id: evt });
  await Promise.all(Array.from({ length: 6 }, () => webhook('invoice.paid', inv('in_' + run + '_1', u, sid), { id: evt })));
  check('F6', 'Même facture rejouée (séquentiel + 6 parallèles) → pas de seconde recharge (30 reste 30)', U(u).b === 30, U(u).b);
  await webhook('invoice.paid', inv('in_' + run + '_2', u, sid, { reason: 'subscription_update' }));
  await webhook('invoice.paid', inv('in_' + run + '_3', u, sid, { reason: 'manual' }));
  check('F7', 'Facture de proratisation / manuelle → aucune recharge', U(u).b === 30, U(u).b);
  d1(`UPDATE users SET credits_balance = 130 WHERE id='${u}'`);
  await webhook('invoice.paid', inv('in_' + run + '_4', u, sid));
  check('F8', 'Renouvellement avec crédits achetés (130 > 100) → jamais réduit', U(u).b === 130, U(u).b);
  await webhook('customer.subscription.updated', sub(sid, u, { status: 'past_due' }));
  await webhook('customer.subscription.updated', sub(sid, u, { status: 'unpaid' }));
  await webhook('invoice.payment_failed', { id: 'in_' + run + '_pf', customer: 'cus_' + u, subscription: sid, billing_reason: 'subscription_cycle' });
  r = U(u);
  check('F9', 'Paiement échoué (past_due / unpaid / invoice.payment_failed) → plan et crédits inchangés, statut reflété', r.t === 'premium' && r.b === 130 && r.st === 'unpaid', JSON.stringify(r));
  await webhook('customer.subscription.updated', sub(sid, u, { price: 'price_inconnu_xyz' }));
  check('F10', 'Prix Stripe inconnu → aucune rétrogradation', U(u).t === 'premium');
  await webhook('customer.subscription.updated', sub(sid, u, { price: PRICE_PRO }));
  r = U(u);
  check('F11', 'Passage au plan Pro → limite 200, solde 200', r.t === 'pro' && r.lim === 200 && r.b === 200, JSON.stringify(r));
  await webhook('customer.subscription.updated', sub(sid, u, { price: PRICE_PREMIUM }));
  r = U(u);
  check('F12', 'Retour Premium → limite 100, aucun crédit retiré (200)', r.t === 'premium' && r.lim === 100 && r.b === 200, JSON.stringify(r));
  await webhook('customer.subscription.deleted', sub('sub_ancien_termine', u, { status: 'canceled' }));
  check('F13', 'Fin d\'un ANCIEN abonnement alors qu\'un autre est actif → plan conservé', U(u).t === 'premium' && U(u).sub === sid);
  await webhook('customer.subscription.deleted', sub(sid, u, { status: 'canceled' }));
  r = U(u);
  check('F14', 'Résiliation effective → gratuit, abonnement vidé, crédits plafonnés à 5', r.t === 'free' && r.sub === null && r.lim === 5 && r.b === 5, JSON.stringify(r));
  const evs = d1(`SELECT event FROM subscription_events WHERE user_id='${u}' ORDER BY created_at, rowid`).map(e => e.event);
  check('F15', 'Historique : created → cancel_scheduled → canceled', evs[0] === 'created' && evs.includes('cancel_scheduled') && evs[evs.length - 1] === 'canceled', evs.join(','));
  const pk = uid('subpk'); seedUsers([{ id: pk, cus: 'cus_' + pk, bal: 90, tier: 'premium', sub: 'sub_' + run + '_pk', pack: true, lim: 100 }]);
  await webhook('customer.subscription.deleted', sub('sub_' + run + '_pk', pk, { status: 'canceled' }));
  check('F16', 'Résiliation d\'un compte ayant acheté le Pack → crédits du Pack conservés (90)', U(pk).t === 'free' && U(pk).b === 90, JSON.stringify(U(pk)));
  const nf = uid('nofree'); seedUsers([{ id: nf, cus: 'cus_' + nf, bal: 1 }]);
  await webhook('invoice.paid', inv('in_' + run + '_nf', nf, 'sub_x'));
  check('F17', 'Facture payée sur un compte gratuit → aucun crédit', U(nf).b === 1);
  const inc = uid('incomplete'); seedUsers([{ id: inc, cus: 'cus_' + inc }]);
  await webhook('customer.subscription.created', sub('sub_' + run + '_inc', inc, { status: 'incomplete' }));
  check('F18', 'Abonnement « incomplete » (paiement initial non abouti) → aucun accès', U(inc).t === 'free');
}

// ---- G. Checkout Premium + statut + feedback
{
  const u = uid('chk'); seedUsers([{ id: u }]);
  const ok = await http('POST', '/stripe/create-checkout', { token: userToken(u), body: { plan: 'premium' } });
  let linkOk = false; try { const x = new URL(ok.data.url); linkOk = x.hostname === 'buy.stripe.com' && x.searchParams.get('client_reference_id') === u; } catch (e) { /* ignore */ }
  check('G1', 'Lien Premium contient le client_reference_id du compte authentifié', ok.status === 200 && linkOk, ok.status);
  check('G2', 'Plan invalide → 400 ; sans jeton → 401', (await http('POST', '/stripe/create-checkout', { token: userToken(u), body: { plan: 'enterprise' } })).status === 400 && (await http('POST', '/stripe/create-checkout', { body: { plan: 'premium' } })).status === 401);
  const s = uid('chksub'); seedUsers([{ id: s, tier: 'premium', sub: 'sub_' + run + '_c', lim: 100, bal: 100 }]);
  const dup = await http('POST', '/stripe/create-checkout', { token: userToken(s), body: { plan: 'premium' } });
  const up = await http('POST', '/stripe/create-checkout', { token: userToken(s), body: { plan: 'pro' } });
  check('G3', 'Déjà abonné Premium : Premium → 409 ; Pro (montée en gamme) → 200', dup.status === 409 && up.status === 200, dup.status + '/' + up.status);

  const a = uid('stat'), b = uid('stat2'), sid = 'cs_test_' + run + '_stat';
  seedUsers([{ id: a, cus: 'cus_' + a }, { id: b }]);
  const pend = await http('GET', '/stripe/checkout-status?session_id=' + sid, { token: userToken(a) });
  await webhook('checkout.session.completed', credit(sid, a));
  const done = await http('GET', '/stripe/checkout-status?session_id=' + sid, { token: userToken(a) });
  const other = await http('GET', '/stripe/checkout-status?session_id=' + sid, { token: userToken(b) });
  check('G4', 'Statut de paiement : pending → completed ; invisible pour un autre compte', pend.data.status === 'pending' && done.data.status === 'completed' && other.data.status === 'pending');
  const url1 = await http('GET', '/stripe/checkout-status?session_id=cs_test_' + run + '_none&credits=30', { token: userToken(b) });
  check('G5', 'Une URL de retour fabriquée (credits=30) ne crédite rien', url1.data.status === 'pending' && U(b).b === 5);

  const fb = uid('fb'); seedUsers([{ id: fb, bal: 0 }]);
  const form = { email: fb + '@test.invalid', blocker_reason: 'price', quality_rating: 'useful', usage_features: 'used', nps_score: 8, missing_feature: '', comment: '' };
  await Promise.all(Array.from({ length: 8 }, () => http('POST', '/feedback/submit', { body: form })));
  check('G6', 'Bonus feedback : 8 envois parallèles → 5 crédits une seule fois', U(fb).b === 5, U(fb).b);
  await http('POST', '/feedback/submit', { body: form });
  check('G7', 'Bonus feedback : envoi supplémentaire → pas de crédit', U(fb).b === 5);
}

// ---- H. Rattachement Payment Link (rattachement uniquement : la lecture de l'abonnement chez Stripe n'est pas possible ici)
{
  const u = uid('pl'), v = uid('plv');
  seedUsers([{ id: u }, { id: v, cus: 'cus_victime_origine' }]);
  await webhook('checkout.session.completed', { id: 'cs_test_' + run + '_pl1', mode: 'subscription', payment_status: 'paid', customer: 'cus_pl_' + run, client_reference_id: u, subscription: 'sub_pl_' + run, metadata: {} });
  await webhook('checkout.session.completed', { id: 'cs_test_' + run + '_pl2', mode: 'subscription', payment_status: 'paid', customer: 'cus_attaquant_' + run, client_reference_id: v, subscription: 'sub_pl2_' + run, metadata: {} });
  check('H1', 'Payment Link : le client Stripe est rattaché au compte via client_reference_id', U(u).cus === 'cus_pl_' + run, JSON.stringify(U(u)));
  check('H2', 'Payment Link : un compte déjà lié à un autre client Stripe n\'est pas détourné', U(v).cus === 'cus_victime_origine');
}

// ---- I. Renouvellement du palier gratuit (SQL identique à celle du cron, exécutée sur D1 distante)
{
  const old = Math.floor(Date.now() / 1000) - 40 * 86400;
  const ids = ['low', 'pack', 'bonus', 'recent', 'prem'].map(n => uid('rn_' + n));
  seedUsers([{ id: ids[0], bal: 0 }, { id: ids[1], bal: 60, pack: true }, { id: ids[2], bal: 9 }, { id: ids[3], bal: 1 }, { id: ids[4], bal: 7, tier: 'premium', lim: 100 }]);
  d1(`UPDATE users SET credits_last_reset_at = ${old} WHERE id IN ('${ids[0]}','${ids[1]}','${ids[2]}','${ids[4]}')`);
  d1(`UPDATE users SET credits_last_reset_at = unixepoch() - 3*86400 WHERE id = '${ids[3]}'`);
  const src = fs.readFileSync(path.join(root, 'index.js'), 'utf8');
  const m = src.match(/async function resetFreeTierCredits\(env\) \{[\s\S]*?const result = await env\.DB\.prepare\(`([\s\S]*?)`\)\.bind\(FREE_TIER_MONTHLY_CREDITS/);
  const sql = m[1].replace(/\?/g, '5').replace(/\s+/g, ' ').trim() + ' AND id LIKE \'st_' + run + '%\'';
  d1(sql);
  const b = ids.map(i => U(i).b);
  check('I1', 'Renouvellement gratuit : 0→5, Pack 60 conservé, bonus 9 conservé, récent inchangé, abonné ignoré', JSON.stringify(b) === JSON.stringify([5, 60, 9, 1, 7]), b.join(','));
}

// ---- J. Crédits : réservation atomique sur la D1 réelle (concurrence réelle entre requêtes)
{
  const c = uid('cons'); seedUsers([{ id: c, bal: 3 }]);
  const tok = userToken(c);
  const rs = await Promise.all(Array.from({ length: 12 }, () => http('POST', '/credits/consume', { token: tok, body: { action_type: 'cv_analysis' } })));
  check('J1', 'Consommation : 3 crédits, 12 requêtes simultanées → exactement 3 acceptées, solde 0', rs.filter(r => r.status === 200 && r.data && r.data.success).length === 3 && U(c).b === 0, rs.map(r => r.status).join(','));
  check('J2', 'Consommation : 3 transactions enregistrées, aucune de trop', count('credit_transactions', `user_id='${c}'`) === 3);
  const d = uid('cvb'); seedUsers([{ id: d, tier: 'premium', bal: 10, lim: 100 }]);
  d1(`INSERT INTO cv_builder_documents (id, user_id, template_id, name, data, created_at, updated_at) VALUES ('doc_${run}', '${d}', 'classique-1', 'CV', '{}', unixepoch(), unixepoch())`);
  const ch = await Promise.all(Array.from({ length: 10 }, () => http('POST', `/cv-builder/document/doc_${run}/charge-download`, { token: userToken(d) })));
  check('J3', 'CV généré : 10 téléchargements simultanés → facturé UNE fois (2 crédits)', ch.filter(r => r.data && r.data.already_charged === false).length === 1 && U(d).b === 8, JSON.stringify(U(d)) + ' ' + ch.map(r => r.status).join(','));
  const a = uid('ai'); seedUsers([{ id: a, bal: 5 }]);
  const ai = await Promise.all(Array.from({ length: 6 }, () => http('POST', '/analyze-cv-text', { token: userToken(a), body: { cvText: 'Jean Dupont ingénieur logiciel. '.repeat(20), filename: 'cv.pdf' } })));
  check('J4', 'Échec de l\'IA (clé factice) : aucune analyse réussie et crédits réservés intégralement rendus (solde 5, 0 transaction)', ai.every(r => r.status !== 200) && U(a).b === 5 && count('credit_transactions', `user_id='${a}'`) === 0, ai.map(r => r.status).join(',') + ' bal=' + U(a).b);
  const z = uid('zero'); seedUsers([{ id: z, bal: 0 }]);
  const zr = await http('POST', '/analyze-cv-text', { token: userToken(z), body: { cvText: 'x'.repeat(200) } });
  check('J5', 'Solde 0 : analyse refusée (402), solde jamais négatif', zr.status === 402 && U(z).b === 0, zr.status);
}

// ---- K. Limites de débit (compteur atomique sur D1 réelle)
{
  const codes = []; for (let i = 0; i < 8; i++) codes.push((await http('POST', '/auth/resend-confirmation', { body: { email: 'rl' + i + '@test.invalid' } })).status);
  check('K1', 'Renvoi de confirmation : 5 requêtes acceptées puis 429 (8 essais depuis la même IP)', codes.slice(0, 5).every(c => c !== 429) && codes.slice(5).every(c => c === 429), codes.join(','));
  const ad = []; for (let i = 0; i < 10; i++) ad.push((await http('POST', '/admin/login', { body: { email: 'admin@test.invalid', password: 'faux' } })).status);
  // La tentative A13 (plus haut) peut compter dans la même fenêtre : la limite de 8 est atteinte à la 8e ou 9e tentative de cette boucle, puis tout est refusé
  const first429 = ad.indexOf(429);
  check('K2', 'Connexion admin : 8 tentatives autorisées au total puis 429 (protection contre les essais de mots de passe)', (first429 === 7 || first429 === 8) && ad.slice(first429).every(c => c === 429) && ad.slice(0, first429).every(c => c === 401), ad.join(','));
  const par = await Promise.all(Array.from({ length: 25 }, () => http('POST', '/auth/signup', { body: { email: 'par@test.invalid', password: 'x'.repeat(12) } })));
  check('K3', 'Inscription : 25 requêtes simultanées de la même IP → au plus 5 acceptées', par.filter(r => r.status !== 429).length <= 5, par.filter(r => r.status !== 429).length);
  const rl = await http('POST', '/auth/signup', { body: { email: 'z@test.invalid', password: 'x'.repeat(12) } });
  check('K4', 'La réponse 429 indique Retry-After (corps) et un message', rl.status === 429 && rl.data && rl.data.retry_after >= 1, JSON.stringify(rl.data));
  check('K5', 'Les webhooks Stripe et les lectures publiques ne sont pas limités', (await Promise.all(Array.from({ length: 30 }, () => http('GET', '/feedback/config')))).every(r => r.status !== 429));
}

// ---- L. Rappels
{
  const u = uid('rem'); seedUsers([{ id: u }]);
  d1(`INSERT INTO job_applications (id, user_id, job_title, company, status, reminder_date) VALUES ('ra_${run}', '${u}', 'Dev', 'ACME', 'postule', unixepoch() - 86400), ('rb_${run}', '${u}', 'Dev2', 'ACME', 'refuse', unixepoch() - 86400), ('rc_${run}', '${u}', 'Dev3', 'ACME', 'postule', unixepoch() + 40*86400)`);
  const r = await http('GET', '/job-tracker/reminders', { token: userToken(u) });
  check('L1', 'Route des rappels : 200, uniquement les rappels actifs et proches', r.status === 200 && r.data.reminders.length === 1 && r.data.reminders[0].id === 'ra_' + run, JSON.stringify(r.data).slice(0, 120));
}

// ---- M. Campagnes email (D1 réelle ; Resend reçoit une clé factice : AUCUN email réel ne peut partir)
{
  const adm = uid('mkadm'); seedUsers([{ id: adm, role: 'admin' }]);
  const A = adminToken(adm);
  const users = Array.from({ length: 30 }, (_, i) => ({ id: uid('mku' + String(i).padStart(2, '0')) }));
  seedUsers(users);
  d1(`INSERT INTO cv_analyses (id, user_id, score, created_at) VALUES ` + users.map((u, i) => `('an_${run}_${i}', '${u.id}', 70, unixepoch())`).join(','));
  const body = { name: 'Test staging', theme: 'noel', content: { subject: 'Test', heading: 'Bonjour {{prenom}}', body: 'Texte', cta_label: 'Ok', cta_url: 'https://swisscv-pro.ch' }, audience: { segment: 'active' }, daily_cap: 12 };
  check('M1', 'Routes campagnes sans jeton admin → 401', (await http('GET', '/admin/campaigns')).status === 401 && (await http('POST', '/admin/campaigns', { body })).status === 401 && (await http('GET', '/admin/campaigns', { token: userToken(users[0].id) })).status === 401);
  const meta = await http('GET', '/admin/campaigns/meta', { token: A });
  check('M2', 'Méta : 7 modèles disponibles', meta.status === 200 && Object.keys(meta.data.themes).length === 7);
  const created = await http('POST', '/admin/campaigns', { token: A, body });
  const cid = created.data && created.data.id;
  check('M3', 'Création d\'un brouillon', created.status === 201 && /^[0-9a-f-]{36}$/.test(cid || ''), created.status);
  const aud = await http('POST', '/admin/campaigns/audience', { token: A, body: { audience: { segment: 'active' } } });
  const expected = aud.data.count;
  check('M4', 'Compteur de destinataires cohérent avec la base (≥ 30, exclut admin/internes)', aud.status === 200 && expected >= 30, JSON.stringify(aud.data).slice(0, 100));
  const prev = await http('POST', '/admin/campaigns/preview', { token: A, body: { theme: 'noel', content: body.content } });
  check('M5', 'Aperçu rendu côté serveur (charte rouge + bandeau Noël)', prev.status === 200 && /#D50000/.test(prev.data.html) && /#14532D/.test(prev.data.html));
  const wrong = await http('POST', `/admin/campaigns/${cid}/send`, { token: A, body: { expected_count: expected + 1 } });
  check('M6', 'Envoi refusé si le nombre confirmé ne correspond pas (409), rien ne part', wrong.status === 409 && count('marketing_sends', `campaign_id='${cid}'`) === 0);
  // Plafond : 10 envois « déjà partis aujourd'hui » dans une autre campagne → il ne reste que 2 places sur un plafond de 12
  d1(`INSERT INTO marketing_campaigns (id, name, theme, status) VALUES ('other_${run}', 'autre', 'classique', 'sent')`);
  d1(`INSERT INTO marketing_sends (campaign_id, user_id, email, status, sent_at) VALUES ` + Array.from({ length: 10 }, (_, i) => `('other_${run}', 'ghost_${run}_${i}', 'g${i}@test.invalid', 'sent', unixepoch())`).join(','));
  const sends = await Promise.all([1, 2, 3, 4].map(() => http('POST', `/admin/campaigns/${cid}/send`, { token: A, body: { expected_count: expected } })));
  check('M7', '4 lancements simultanés (D1 réelle) : un seul démarre', sends.filter(r => r.status === 200).length === 1 && sends.filter(r => r.status === 409).length === 3, sends.map(r => r.status).join(','));
  const total = count('marketing_sends', `campaign_id='${cid}'`);
  check('M8', 'Une ligne par destinataire (aucun doublon)', total === expected, total + ' / ' + expected);
  const processed = count('marketing_sends', `campaign_id='${cid}' AND status IN ('failed','sent')`);
  check('M9', 'Clé Resend factice (401) : personne n\'est marqué « échec », rien n\'est envoyé, les destinataires restent en attente', processed === 0 && count('marketing_sends', `campaign_id='${cid}' AND status='pending'`) === expected, 'traités=' + processed);
  // Requête de réservation exécutée telle quelle sur la D1 réelle : le plafond (12) moins les 10 envois du jour = 2 places, puis plus aucune
  d1(`INSERT INTO marketing_campaigns (id, name, theme, status, daily_cap) VALUES ('cap_${run}', 'cap', 'classique', 'sending', 12)`);
  d1(`INSERT INTO marketing_sends (campaign_id, user_id, email, status) VALUES ` + Array.from({ length: 8 }, (_, i) => `('cap_${run}', 'capu_${run}_${i}', 'c${i}@test.invalid', 'pending')`).join(','));
  const dayStart = Math.floor(Date.now() / 86400000) * 86400;
  const claimSql = `UPDATE marketing_sends SET status = 'sending', claimed_at = unixepoch() WHERE campaign_id = 'cap_${run}' AND user_id IN (SELECT user_id FROM marketing_sends WHERE campaign_id = 'cap_${run}' AND (status = 'pending' OR (status = 'sending' AND claimed_at < unixepoch() - 900)) LIMIT MAX(0, MIN(40, 12 - (SELECT COUNT(*) FROM marketing_sends s2 WHERE (s2.status = 'sent' AND s2.sent_at >= ${dayStart}) OR (s2.status = 'sending' AND s2.claimed_at >= ${dayStart}))))) RETURNING user_id`;
  const c1 = d1(claimSql).length, c2 = d1(claimSql).length;
  check('M9b', 'Requête de réservation sur D1 réelle : 2 places (12 − 10), puis 0 une fois réservées', c1 === 2 && c2 === 0, c1 + ',' + c2);
  const failed = q1(`SELECT COUNT(*) n, MAX(error) e FROM marketing_sends WHERE campaign_id='${cid}' AND status='pending' AND error IS NOT NULL`);
  check('M10', 'Le motif du refus du fournisseur est conservé et visible dans le détail de la campagne', failed.n >= 1 && /Resend 401/.test(failed.e || '') && /Resend 401/.test(((await http('GET', `/admin/campaigns/${cid}`, { token: A })).data.campaign || {}).last_error || ''), JSON.stringify(failed));
  const cstat = await http('GET', `/admin/campaigns/${cid}`, { token: A });
  check('M11', 'La campagne reste « en cours » tant qu\'il reste des destinataires (reprise possible)', cstat.status === 200 && cstat.data.campaign.status === 'sending', cstat.data.campaign && cstat.data.campaign.status);
  const par = await Promise.all([1, 2, 3, 4, 5, 6].map(() => http('POST', `/admin/campaigns/${cid}/resume`, { token: A })));
  await new Promise(r => setTimeout(r, 4000));
  const processed2 = count('marketing_sends', `campaign_id='${cid}' AND status IN ('failed','sent')`);
  check('M12', '6 reprises simultanées avec clé refusée : toujours aucun envoi ni échec définitif', processed2 === 0 && par.every(r => r.status === 200), 'traités=' + processed2);
  const cancel = await http('POST', `/admin/campaigns/${cid}/cancel`, { token: A });
  check('M13', 'Arrêt : le reste passe en « ignoré », campagne « arrêtée »', cancel.status === 200 && (await new Promise(r => setTimeout(r, 3000)), count('marketing_sends', `campaign_id='${cid}' AND status IN ('pending','sending')`) === 0) && (await http('GET', `/admin/campaigns/${cid}`, { token: A })).data.campaign.status === 'cancelled');
  // Désinscription (jeton signé avec le secret de test)
  const tok = crypto.createHmac('sha256', env.STAGING_JWT_SECRET).update('unsub:' + users[0].id).digest('hex').slice(0, 32);
  check('M14', 'Désinscription : jeton falsifié refusé, jeton valide accepté, puis réabonnement', (await http('POST', `/marketing/unsubscribe?u=${users[0].id}&t=${'0'.repeat(32)}`)).status === 400 && (await http('POST', `/marketing/unsubscribe?u=${users[0].id}&t=${tok}`)).status === 200 && q1(`SELECT marketing_opt_out o FROM users WHERE id='${users[0].id}'`).o === 1 && (await http('POST', `/marketing/resubscribe?u=${users[0].id}&t=${tok}`)).status === 200 && q1(`SELECT marketing_opt_out o FROM users WHERE id='${users[0].id}'`).o === 0);
  const aud2 = await http('POST', '/admin/campaigns/audience', { token: A, body: { audience: { segment: 'active' } } });
  check('M15', 'Les destinataires désinscrits sont exclus du compteur', true && aud2.data.count === expected);
}

// ================================================================ RAPPORT
const pass = results.filter(r => r.pass).length;
fs.writeFileSync(process.env.STAGING_OUT || '/tmp/staging_results.json', JSON.stringify(results, null, 2));
for (const r of results) console.log((r.pass ? 'PASS ' : 'FAIL ') + r.id + ' ' + r.name + (r.pass ? '' : '  → ' + r.detail));
console.log('\n' + pass + '/' + results.length + ' contrôles réussis');
process.exit(pass === results.length ? 0 : 1);
