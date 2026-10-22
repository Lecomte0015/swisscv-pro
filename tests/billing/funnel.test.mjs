// Mesure du parcours (audit du 18.10.2026, lot 4) : événements sans contenu de CV, dédoublonnage, version du moteur,
// retour sous 7 jours et entonnoir produit de la page admin Marketing.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { createEnv, SECRETS } from './harness.mjs';

let t, adminTok;
const CV = 'Lucie Mesure — comptable expérimentée. '.repeat(10);
function adminJwt(userId, email) {
  const b64 = x => Buffer.from(x).toString('base64');
  const h = b64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const p = b64(JSON.stringify({ userId, email, adm: 1, role: 'admin', exp: Math.floor(Date.now() / 1000) + 3600 }));
  return h + '.' + p + '.' + crypto.createHmac('sha256', SECRETS.JWT_SECRET).update(h + '.' + p).digest('base64');
}
const events = (type, userId) => t.qa('SELECT * FROM funnel_events WHERE event_type = ?' + (userId ? ' AND user_id = ?' : ''), ...(userId ? [type, userId] : [type]));

before(async () => {
  t = await createEnv();
  await t.seedUser({ id: 'fn_admin', email: 'fn_admin@test.invalid', internal: true });
  await t.DB.prepare("UPDATE users SET role = 'admin' WHERE id = 'fn_admin'").run();
  adminTok = adminJwt('fn_admin', 'fn_admin@test.invalid');
});
after(async () => { await t.close(); });

test('[MESURE] /track accepte les nouvelles étapes, refuse les autres, ne garde que plan et lieu', async () => {
  const anon = 'anon-mesure-0001';
  for (const ev of ['home_viewed', 'home_cta_clicked', 'analysis_started', 'results_viewed', 'locked_item_clicked', 'cv_downloaded']) {
    const r = await t.call('POST', '/track', { body: { event_type: ev, anon_id: anon, place: 'hero' } });
    assert.equal(r.status, 200, ev);
  }
  const bad = await t.call('POST', '/track', { body: { event_type: 'analysis_completed', anon_id: anon } });
  assert.equal(bad.status, 400, 'les étapes serveur ne peuvent pas venir du navigateur');
  await t.call('POST', '/track', { body: { event_type: 'locked_item_clicked', anon_id: 'anon-mesure-0002', place: 'Améliorations <script>', cvText: CV, extra: 'x' } });
  const row = (await t.qa("SELECT metadata FROM funnel_events WHERE anon_id = 'anon-mesure-0002'"))[0];
  assert.equal(row.metadata, null, 'lieu invalide ignoré, aucun champ libre enregistré');
});

test('[MESURE] dédoublonnage par jour, par étape ET par lieu', async () => {
  const anon = 'anon-mesure-0003';
  await t.call('POST', '/track', { body: { event_type: 'locked_item_clicked', anon_id: anon, place: 'improvements' } });
  const again = await t.call('POST', '/track', { body: { event_type: 'locked_item_clicked', anon_id: anon, place: 'improvements' } });
  await t.call('POST', '/track', { body: { event_type: 'locked_item_clicked', anon_id: anon, place: 'ats' } });
  assert.equal(again.data.deduped, true);
  const rows = await t.qa("SELECT json_extract(metadata, '$.place') AS place FROM funnel_events WHERE anon_id = ? ORDER BY place", anon);
  assert.deepEqual(rows.map(r => r.place), ['ats', 'improvements']);
});

test('[MESURE] analyse réussie : version du moteur enregistrée, événement serveur sans contenu de CV', async () => {
  await t.seedUser({ id: 'fn_user_01', email: 'fn1@test.invalid', balance: 3 });
  const tok = await t.makeToken('fn_user_01', 'fn1@test.invalid');
  const r = await t.call('POST', '/analyze-cv-text', { token: tok, body: { cvText: CV, filename: 'cv-lucie.pdf' } });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.equal((await t.q("SELECT engine_version v FROM cv_analyses WHERE user_id = 'fn_user_01'")).v, 'v2');
  const ev = await events('analysis_completed', 'fn_user_01');
  assert.equal(ev.length, 1);
  const meta = JSON.parse(ev[0].metadata);
  assert.equal(meta.engine, 'v2');
  assert.equal(typeof meta.score, 'number');
  assert.ok(!/Lucie|comptable|cv-lucie/i.test(ev[0].metadata), 'aucun contenu ni nom de fichier dans la mesure');
  const list = await t.call('GET', '/analyses/history', { token: tok });
  assert.equal(list.data.analyses.length, 1);
  assert.equal(list.data.analyses[0].engineVersion, 'v2', 'l\'historique sait distinguer l\'ancien calcul');
});

test('[MESURE] analyse échouée : événement analysis_failed, crédit rendu', async () => {
  await t.seedUser({ id: 'fn_user_02', email: 'fn2@test.invalid', balance: 2 });
  const tok = await t.makeToken('fn_user_02', 'fn2@test.invalid');
  t.state.anthropicRaw = 'pas du JSON';
  const r = await t.call('POST', '/analyze-cv-text', { token: tok, body: { cvText: CV } });
  t.state.anthropicRaw = null;
  assert.equal(r.status, 502);
  assert.equal((await events('analysis_failed', 'fn_user_02')).length, 1);
  assert.equal((await t.userRow('fn_user_02')).credits_balance, 2);
});

test('[MESURE] admin : entonnoir produit (totaux non doublés par lieu) et retour sous 7 jours', async () => {
  const now = Math.floor(Date.now() / 1000);
  const day = 86400;
  // revenu : 1re analyse il y a 10 jours, 2e analyse 3 jours après
  await t.seedUser({ id: 'fn_ret_yes', email: 'ret1@test.invalid', createdAt: now - 12 * day });
  await t.seedUser({ id: 'fn_ret_no', email: 'ret2@test.invalid', createdAt: now - 12 * day });
  const ins = (id, user, at) => t.DB.prepare("INSERT INTO cv_analyses (id, user_id, score, ats_score, strong_points, improvements, swiss_advice, keywords, created_at) VALUES (?, ?, 60, 60, '[]', '[]', '', '[]', ?)").bind(id, user, at).run();
  await ins('fn_a1', 'fn_ret_yes', now - 10 * day);
  await ins('fn_a2', 'fn_ret_yes', now - 7 * day);
  await ins('fn_a3', 'fn_ret_no', now - 10 * day);
  await ins('fn_a4', 'fn_ret_no', now - 10 * day + 3600); // même jour : ne compte pas comme un retour
  // une même personne clique depuis deux lieux
  await t.call('POST', '/track', { body: { event_type: 'home_cta_clicked', anon_id: 'anon-mesure-0009', place: 'hero' } });
  await t.call('POST', '/track', { body: { event_type: 'home_cta_clicked', anon_id: 'anon-mesure-0009', place: 'nav' } });

  const r = await t.call('GET', '/admin/marketing/funnel?from=2025-01-01', { token: adminTok });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.ok(r.data.cohort.returned_7d >= 1);
  const yes = await t.q("SELECT COUNT(*) n FROM cv_analyses WHERE user_id = 'fn_ret_yes'");
  assert.equal(yes.n, 2);
  const cta = r.data.product_totals.find(x => x.event_type === 'home_cta_clicked');
  const ctaByPlace = r.data.product_funnel.filter(x => x.event_type === 'home_cta_clicked');
  assert.ok(ctaByPlace.length >= 2, 'détail par lieu');
  const sumByPlace = ctaByPlace.reduce((s, x) => s + x.visitors, 0);
  assert.equal(cta.visitors, sumByPlace - 1, 'la personne qui a cliqué depuis deux lieux ne compte qu\'une fois dans le total');
  assert.ok(r.data.product_totals.find(x => x.event_type === 'analysis_completed'));
});

test('[MESURE] retour sous 7 jours : seul le compte revenu un autre jour est compté', async () => {
  const now = Math.floor(Date.now() / 1000);
  const from = new Date((now - 13 * 86400) * 1000).toISOString().slice(0, 10);
  const to = new Date((now - 11 * 86400) * 1000).toISOString().slice(0, 10);
  const r = await t.call('GET', '/admin/marketing/funnel?from=' + from + '&to=' + to, { token: adminTok });
  assert.equal(r.status, 200);
  assert.equal(r.data.cohort.signups, 2);
  assert.equal(r.data.cohort.activated, 2, 'les deux ont analysé 2 jours après l\'inscription');
  assert.equal(r.data.cohort.returned_7d, 1);
});

test('[TABLEAU DE BORD] répartition des plans : recharges de crédits et Pack comptés à part dans le plan gratuit', async () => {
  await t.seedUser({ id: 'rp_free_only', email: 'rp1@test.invalid' });
  await t.seedUser({ id: 'rp_free_credits', email: 'rp2@test.invalid' });
  await t.seedUser({ id: 'rp_free_pack', email: 'rp3@test.invalid', pack: true });
  await t.seedUser({ id: 'rp_premium_credits', email: 'rp4@test.invalid', tier: 'premium' });
  const buy = (id, u) => t.DB.prepare("INSERT INTO credit_transactions (id, user_id, action_type, credits_used, credits_before, credits_after, created_at) VALUES (?, ?, 'credit_purchase', -5, 0, 5, unixepoch())").bind(id, u).run();
  await buy('rp_t1', 'rp_free_credits');
  await buy('rp_t2', 'rp_free_credits');
  await buy('rp_t3', 'rp_premium_credits');
  const before = await t.call('GET', '/admin/stats', { token: adminTok });
  assert.equal(before.status, 200, JSON.stringify(before.data));
  const s = before.data.stats;
  assert.equal(s.free_credit_buyers, 1, 'un compte gratuit qui a acheté 2 recharges compte une fois');
  assert.equal(s.free_pack_buyers, 1);
  assert.equal(s.credit_buyers_all_plans, 2, 'le Premium qui a acheté une recharge compte dans le total tous plans');
  assert.equal(s.credit_purchases, 3);
  assert.equal(s.credits_sold, 15);
  assert.ok(s.free_users >= s.free_credit_buyers + s.free_pack_buyers);
});

test('[RÉSULTATS COMPLETS] gratuit tronqué ; acheteur de crédits, Pack, Premium et membre d\'équipe : complets', async () => {
  const CVX = 'Paul Résultats — magasinier expérimenté. '.repeat(10);
  const check = async (id, opts, expected) => {
    await t.seedUser({ id, email: id + '@test.invalid', balance: 5, ...opts });
    const tok = await t.makeToken(id, id + '@test.invalid');
    return { tok, id, expected };
  };
  const free = await check('fr_free', {}, false);
  const buyer = await check('fr_buyer', {}, true);
  await t.DB.prepare("INSERT INTO credit_transactions (id, user_id, action_type, credits_used, credits_before, credits_after, created_at) VALUES ('fr_t1', 'fr_buyer', 'credit_purchase', -5, 0, 5, unixepoch())").run();
  const pack = await check('fr_pack', { pack: true }, true);
  const prem = await check('fr_prem', { tier: 'premium' }, true);
  for (const c of [free, buyer, pack, prem]) {
    const me = await t.call('GET', '/auth/me', { token: c.tok });
    assert.equal(me.data.user.full_results, c.expected, c.id + ' /auth/me');
    const a = await t.call('POST', '/analyze-cv-text', { token: c.tok, body: { cvText: CVX } });
    assert.equal(a.status, 200, JSON.stringify(a.data));
    assert.equal(a.data.fullResults, c.expected, c.id + ' analyse');
    const h = await t.call('GET', '/analyses/history', { token: c.tok });
    assert.equal(h.data.fullResults, c.expected, c.id + ' historique');
  }
});
