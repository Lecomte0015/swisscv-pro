// Campagnes email marketing : rendu, destinataires, désinscription, envoi par lots, reprise, plafond, concurrence
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { createEnv, SECRETS } from './harness.mjs';

let t, adminTok;
before(async () => {
  t = await createEnv();
  await t.seedUser({ id: 'mkt_admin_01', email: 'mkt_admin@test.invalid' });
  await t.DB.prepare("UPDATE users SET role = 'admin', is_internal = 1, full_name = 'Hermann Test' WHERE id = 'mkt_admin_01'").run();
  adminTok = adminJwt('mkt_admin_01', 'mkt_admin@test.invalid');
});
after(async () => { await t.close(); });

function adminJwt(userId, email) {
  const b64 = x => Buffer.from(x).toString('base64');
  const h = b64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const p = b64(JSON.stringify({ userId, email, adm: 1, role: 'admin', exp: Math.floor(Date.now() / 1000) + 3600 }));
  return h + '.' + p + '.' + crypto.createHmac('sha256', SECRETS.JWT_SECRET).update(h + '.' + p).digest('base64');
}
const unsubToken = userId => crypto.createHmac('sha256', SECRETS.JWT_SECRET).update('unsub:' + userId).digest('hex').slice(0, 32);
const api = (m, p, body) => t.call(m, p, { token: adminTok, body });
const content = (o = {}) => ({ subject: 'Joyeuses fêtes {{prenom}}', preheader: 'Un petit mot', heading: 'Bonjour {{prenom}} !', body: 'Premier paragraphe.\n\nSecond paragraphe.', cta_label: 'Ouvrir', cta_url: 'https://swisscv-pro.ch/app', ...o });
async function seedUsers(prefix, n, { analyses = true, tier = 'free', extra = '' } = {}) {
  const ids = [];
  for (let i = 0; i < n; i++) {
    const id = prefix + '_' + String(i).padStart(2, '0');
    await t.seedUser({ id, email: id + '@test.invalid', tier });
    await t.DB.prepare('UPDATE users SET full_name = ? WHERE id = ?').bind(['Alice', 'Bruno', 'Chloé', 'David', 'Élise', 'Fabien', 'Gaëlle', 'Hugo'][i % 8] + ' Nom', id).run();
    if (analyses) await t.DB.prepare('INSERT INTO cv_analyses (id, user_id, score, created_at) VALUES (?, ?, 70, unixepoch())').bind('an_' + id, id).run();
    ids.push(id);
  }
  return ids;
}
const batches = () => t.state.calls.filter(c => c.url === 'https://api.resend.com/emails/batch').map(c => JSON.parse(c.body));
const recipientsSent = () => batches().flat().map(m => m.to[0]);
const newCampaign = async (o = {}) => (await api('POST', '/admin/campaigns', { name: 'Test', theme: 'classique', content: content(), audience: { segment: 'active' }, daily_cap: 80, ...o })).data.id;
const resetNet = () => { t.calls.reset(); t.state.resendStatus = 0; };
async function wipeUsers() {
  await t.DB.prepare("DELETE FROM marketing_sends").run();
  await t.DB.prepare("DELETE FROM marketing_campaigns").run();
  await t.DB.prepare("DELETE FROM cv_analyses").run();
  await t.DB.prepare("DELETE FROM users WHERE id != 'mkt_admin_01'").run();
}

// ---------------------------------------------------------------- accès
test('[CAMPAGNES] toutes les routes admin exigent un jeton admin', async () => {
  const id = '00000000-0000-4000-8000-000000000000';
  for (const [m, p] of [['GET', '/admin/campaigns'], ['GET', '/admin/campaigns/meta'], ['POST', '/admin/campaigns'], ['POST', '/admin/campaigns/audience'], ['POST', '/admin/campaigns/preview'], ['GET', '/admin/campaigns/' + id], ['POST', '/admin/campaigns/' + id + '/send'], ['POST', '/admin/campaigns/' + id + '/test']]) {
    const b = m === 'GET' ? undefined : {};
    assert.equal((await t.call(m, p, { body: b })).status, 401, m + ' ' + p);
    assert.equal((await t.call(m, p, { token: await t.makeToken('x', 'x@test.invalid'), body: b })).status, 401, m + ' ' + p + ' jeton utilisateur');
  }
});

test('[CAMPAGNES] méta : 7 modèles (Pâques, Noël, Nouvel An, Saint-Valentin, offre...) avec textes par défaut', async () => {
  const r = await api('GET', '/admin/campaigns/meta');
  assert.equal(r.status, 200);
  assert.deepEqual(Object.keys(r.data.themes).sort(), ['annonce', 'classique', 'noel', 'nouvel_an', 'offre', 'paques', 'saint_valentin']);
  for (const th of Object.values(r.data.themes)) { assert.ok(th.defaults.subject && th.defaults.heading && th.defaults.body); }
  assert.ok(r.data.segments.active && r.data.segments.registered_all);
});

// ---------------------------------------------------------------- rendu
test('[RENDU] charte SwissCV (rouge, logo, bouton), variables, code promo, désinscription ; contenu échappé', async () => {
  const r = await api('POST', '/admin/campaigns/preview', { theme: 'noel', content: content({ code: 'NOEL10', code_note: 'Valable jusqu\'au 31 décembre', heading: 'Joyeux Noël {{prenom}} <script>alert(1)</script>' }) });
  assert.equal(r.status, 200);
  const h = r.data.html;
  assert.match(h, /SwissCV Pro/);
  assert.match(h, /#D50000/);                      // bouton aux couleurs de la marque
  assert.match(h, /#14532D/);                      // bandeau saisonnier (Noël)
  assert.match(h, /font-family:Inter/);
  assert.match(h, /Camille/);                      // variable prénom
  assert.match(h, /NOEL10/);
  assert.match(h, /Se désinscrire/);
  assert.doesNotMatch(h, /<script>alert/);         // injection neutralisée
  assert.match(h, /&lt;script&gt;/);
  assert.equal(r.data.subject, 'Joyeuses fêtes Camille');
});

test('[RENDU] validations : lien non https, bouton incomplet, code invalide refusés', async () => {
  for (const bad of [{ cta_url: 'http://exemple.ch' }, { cta_url: 'javascript:alert(1)' }, { cta_label: '', cta_url: 'https://swisscv-pro.ch' }, { cta_label: 'Ok', cta_url: '' }, { code: 'CODE AVEC ESPACE' }, { code: '<b>x</b>' }]) {
    const r = await api('POST', '/admin/campaigns/preview', { theme: 'classique', content: content(bad) });
    assert.equal(r.status, 400, JSON.stringify(bad));
  }
});

// ---------------------------------------------------------------- destinataires
test('[AUDIENCE] exclut désinscrits, bannis, comptes internes, compte système ; segments corrects', async () => {
  await wipeUsers();
  const active = await seedUsers('audience_act', 4);
  await seedUsers('audience_noan', 2, { analyses: false });
  const paid = await seedUsers('audience_paid', 2, { tier: 'premium' });
  await seedUsers('audience_out', 1);
  await seedUsers('audience_ban', 1);
  await seedUsers('audience_int', 1);
  await t.DB.prepare("UPDATE users SET marketing_opt_out = 1 WHERE id = 'audience_out_00'").run();
  await t.DB.prepare("UPDATE users SET deleted_at = unixepoch() WHERE id = 'audience_ban_00'").run();
  await t.DB.prepare("UPDATE users SET is_internal = 1 WHERE id = 'audience_int_00'").run();
  await t.DB.prepare("INSERT INTO users (id, email, created_at, updated_at) VALUES ('contact-form', 'contact-form@test.invalid', unixepoch(), unixepoch())").run();
  await t.DB.prepare("UPDATE cv_analyses SET created_at = unixepoch() - 90 * 86400 WHERE user_id = 'audience_act_03'").run();
  const count = async seg => (await api('POST', '/admin/campaigns/audience', { audience: { segment: seg, inactive_days: 30 } })).data;
  assert.equal((await count('active')).count, 4 + 2 + 0, 'actifs = 4 gratuits + 2 abonnés avec analyse (les exclus n\'y sont pas)');
  assert.equal((await count('free_active')).count, 4);
  assert.equal((await count('paid')).count, 2);
  assert.equal((await count('inactive')).count, 1, 'un seul actif sans analyse depuis 30 jours');
  assert.equal((await count('registered_all')).count, 4 + 2 + 2, 'tous sauf désinscrit, banni, interne, compte système');
  const sample = (await count('active')).sample;
  assert.ok(sample.every(s => /\*\*\*@/.test(s)), 'adresses masquées dans l\'aperçu');
  assert.equal((await count('segment_inconnu')).audience.segment, 'active', 'segment inconnu = repli sûr');
});

// ---------------------------------------------------------------- brouillons
test('[BROUILLON] créer, lire, modifier, supprimer ; un brouillon seulement', async () => {
  const id = await newCampaign({ name: 'Brouillon A' });
  const got = await api('GET', '/admin/campaigns/' + id);
  assert.equal(got.data.campaign.status, 'draft');
  assert.equal((await api('PUT', '/admin/campaigns/' + id, { name: 'Renommé', theme: 'paques', content: content({ subject: 'Nouveau sujet' }), audience: { segment: 'paid' }, daily_cap: 50 })).status, 200);
  const upd = (await api('GET', '/admin/campaigns/' + id)).data.campaign;
  assert.equal(upd.name, 'Renommé'); assert.equal(upd.theme, 'paques'); assert.equal(upd.audience.segment, 'paid'); assert.equal(upd.daily_cap, 50);
  assert.equal((await api('DELETE', '/admin/campaigns/' + id)).status, 200);
  assert.equal((await api('GET', '/admin/campaigns/' + id)).status, 404);
  assert.equal((await api('POST', '/admin/campaigns', { name: '', content: content() })).status, 400, 'nom obligatoire');
});

// ---------------------------------------------------------------- test d'envoi
test('[TEST] l\'email de test part uniquement vers l\'administrateur connecté, avec [TEST] dans le sujet', async () => {
  resetNet();
  const id = await newCampaign();
  const r = await api('POST', '/admin/campaigns/' + id + '/test');
  assert.equal(r.status, 200);
  const sent = batches().flat();
  assert.equal(sent.length, 1);
  assert.deepEqual(sent[0].to, ['mkt_admin@test.invalid']);
  assert.match(sent[0].subject, /^\[TEST\]/);
  assert.match(sent[0].html, /Hermann/);
});

// ---------------------------------------------------------------- envoi réel
test('[ENVOI] confirmation du nombre exact ; un envoi = un email par personne, avec en-têtes de désinscription valides', async () => {
  await wipeUsers(); resetNet();
  const ids = await seedUsers('send_user', 5);
  await seedUsers('send_optout', 1); await t.DB.prepare("UPDATE users SET marketing_opt_out = 1 WHERE id = 'send_optout_00'").run();
  const id = await newCampaign({ theme: 'paques' });
  const wrong = await api('POST', '/admin/campaigns/' + id + '/send', { expected_count: 99 });
  assert.equal(wrong.status, 409);
  assert.equal(batches().length, 0, 'rien ne part si le nombre ne correspond pas');
  assert.equal((await api('GET', '/admin/campaigns/' + id)).data.campaign.status, 'draft');
  const ok = await api('POST', '/admin/campaigns/' + id + '/send', { expected_count: 5 });
  assert.equal(ok.status, 200, JSON.stringify(ok.data));
  const sentTo = recipientsSent().sort();
  assert.deepEqual(sentTo, ids.map(i => i + '@test.invalid').sort());
  assert.ok(!sentTo.includes('send_optout_00@test.invalid'));
  const first = batches().flat()[0];
  assert.equal(first.from, 'SwissCV Pro <bonjour@swisscv-pro.ch>');
  assert.ok(first.text && first.text.length > 20, 'version texte présente');
  assert.match(first.headers['List-Unsubscribe-Post'], /One-Click/);
  const m = /<([^>]+)>/.exec(first.headers['List-Unsubscribe']);
  const u = new URL(m[1]);
  assert.equal(u.searchParams.get('t'), unsubToken(u.searchParams.get('u')), 'jeton de désinscription valide');
  assert.match(first.subject, /Joyeuses fêtes (Alice|Bruno|Chloé|David|Élise)/);
  const camp = (await api('GET', '/admin/campaigns/' + id)).data.campaign;
  assert.equal(camp.status, 'sent');
  assert.equal(camp.stats.sent, 5);
  assert.equal((await t.qa("SELECT * FROM email_logs WHERE template_type = ?", 'marketing:' + id)).length, 5, 'envois tracés pour le suivi ouvertures/clics');
  assert.ok((await t.qa("SELECT * FROM admin_logs WHERE action = 'campaign.send'")).length >= 1, 'action journalisée');
  assert.equal((await api('POST', '/admin/campaigns/' + id + '/send', { expected_count: 5 })).status, 409, 'on ne relance pas une campagne envoyée');
});

test('[NÉGATIF] deux lancements simultanés : un seul démarre, chaque personne reçoit UN seul email', async () => {
  await wipeUsers(); resetNet();
  await seedUsers('double_user', 12);
  const id = await newCampaign();
  const rs = await Promise.all([1, 2, 3, 4].map(() => api('POST', '/admin/campaigns/' + id + '/send', { expected_count: 12 })));
  assert.equal(rs.filter(r => r.status === 200).length, 1);
  assert.equal(rs.filter(r => r.status === 409).length, 3);
  const to = recipientsSent();
  assert.equal(to.length, 12);
  assert.equal(new Set(to).size, 12, 'aucun doublon');
});

test('[NÉGATIF] reprises simultanées pendant l\'envoi : toujours un seul email par personne', async () => {
  await wipeUsers(); resetNet();
  await seedUsers('resume_user', 30);
  const id = await newCampaign({ daily_cap: 10 });
  await api('POST', '/admin/campaigns/' + id + '/send', { expected_count: 30 });
  assert.equal(recipientsSent().length, 10, 'plafond journalier respecté');
  await t.DB.prepare("UPDATE marketing_sends SET sent_at = sent_at - 90000 WHERE status = 'sent'").run();
  await Promise.all([1, 2, 3, 4, 5].map(() => api('POST', '/admin/campaigns/' + id + '/resume')));
  const to = recipientsSent();
  assert.equal(to.length, 20, '10 de la veille + 10 d\'aujourd\'hui');
  assert.equal(new Set(to).size, 20);
});

test('[PLAFOND] au plafond journalier la campagne reste « en cours » puis se termine les jours suivants', async () => {
  await wipeUsers(); resetNet();
  await seedUsers('cap_user', 7);
  const id = await newCampaign({ daily_cap: 3 });
  await api('POST', '/admin/campaigns/' + id + '/send', { expected_count: 7 });
  let c = (await api('GET', '/admin/campaigns/' + id)).data.campaign;
  assert.equal(c.status, 'sending'); assert.equal(c.stats.sent, 3); assert.equal(c.stats.pending, 4);
  for (let day = 0; day < 2; day++) {
    await t.DB.prepare("UPDATE marketing_sends SET sent_at = sent_at - 90000 WHERE status = 'sent'").run();
    await api('POST', '/admin/campaigns/' + id + '/resume');
  }
  c = (await api('GET', '/admin/campaigns/' + id)).data.campaign;
  assert.equal(c.status, 'sent'); assert.equal(c.stats.sent, 7);
  assert.equal(new Set(recipientsSent()).size, 7);
});

// ---------------------------------------------------------------- pannes du fournisseur
test('[PANNE] lot refusé temporairement (429) : personne n\'est perdu ni dupliqué, reprise ensuite', async () => {
  await wipeUsers(); resetNet();
  await seedUsers('panne_user', 6);
  const id = await newCampaign();
  t.state.resendStatus = 429;
  await api('POST', '/admin/campaigns/' + id + '/send', { expected_count: 6 });
  let c = (await api('GET', '/admin/campaigns/' + id)).data.campaign;
  assert.equal(c.status, 'sending'); assert.equal(c.stats.sent, 0); assert.equal(c.stats.pending, 6);
  t.state.resendStatus = 0;
  await api('POST', '/admin/campaigns/' + id + '/resume');
  c = (await api('GET', '/admin/campaigns/' + id)).data.campaign;
  assert.equal(c.status, 'sent'); assert.equal(c.stats.sent, 6);
});

test('[PANNE] refus définitif (400) : marqué en échec, jamais réessayé en boucle', async () => {
  await wipeUsers(); resetNet();
  await seedUsers('fail_user', 3);
  const id = await newCampaign();
  t.state.resendStatus = 422;
  await api('POST', '/admin/campaigns/' + id + '/send', { expected_count: 3 });
  t.state.resendStatus = 0;
  const c = (await api('GET', '/admin/campaigns/' + id)).data.campaign;
  assert.equal(c.stats.failed, 3);
  assert.equal(c.status, 'sent', 'terminée, avec 3 échecs visibles');
  t.calls.reset();
  await api('POST', '/admin/campaigns/' + id + '/resume');
  assert.equal(batches().length, 0);
});

test('[PANNE] clé du fournisseur refusée (401) : personne n\'est marqué en échec, l\'incident est visible, reprise ensuite', async () => {
  await wipeUsers(); resetNet();
  await seedUsers('key_user', 5);
  const id = await newCampaign();
  t.state.resendStatus = 401;
  await api('POST', '/admin/campaigns/' + id + '/send', { expected_count: 5 });
  let c = (await api('GET', '/admin/campaigns/' + id)).data.campaign;
  assert.equal(c.status, 'sending'); assert.equal(c.stats.failed, 0); assert.equal(c.stats.pending, 5);
  assert.match(c.last_error || '', /Resend 401/);
  assert.equal(batches().length <= 1, true, 'un seul essai, pas de boucle');
  t.state.resendStatus = 0;
  await api('POST', '/admin/campaigns/' + id + '/resume');
  c = (await api('GET', '/admin/campaigns/' + id)).data.campaign;
  assert.equal(c.status, 'sent'); assert.equal(c.stats.sent, 5); assert.equal(c.last_error, null);
});

// ---------------------------------------------------------------- arrêt et désinscription
test('[ARRÊT] « Arrêter » stoppe les envois restants ; une désinscription survenue en cours d\'envoi est respectée', async () => {
  await wipeUsers(); resetNet();
  const ids = await seedUsers('stop_user', 6);
  const id = await newCampaign({ daily_cap: 2 });
  await api('POST', '/admin/campaigns/' + id + '/send', { expected_count: 6 });
  assert.equal(recipientsSent().length, 2);
  // une personne en attente se désinscrit avant la reprise
  const pending = (await t.qa("SELECT user_id FROM marketing_sends WHERE campaign_id = ? AND status = 'pending' ORDER BY user_id", id)).map(r => r.user_id);
  const gone = pending[0];
  assert.equal((await t.call('POST', '/marketing/unsubscribe?u=' + gone + '&t=' + unsubToken(gone))).status, 200);
  await t.DB.prepare("UPDATE marketing_sends SET sent_at = sent_at - 90000 WHERE status = 'sent'").run();
  await api('POST', '/admin/campaigns/' + id + '/resume');
  assert.ok(!recipientsSent().includes(gone + '@test.invalid'), 'la personne désinscrite ne reçoit rien');
  const sk = await t.q("SELECT status FROM marketing_sends WHERE campaign_id = ? AND user_id = ?", id, gone);
  assert.equal(sk.status, 'skipped');
  // arrêt
  const id2 = await newCampaign({ daily_cap: 1 });
  await api('POST', '/admin/campaigns/' + id2 + '/send', { expected_count: 5 });
  assert.equal((await api('POST', '/admin/campaigns/' + id2 + '/cancel')).status, 200);
  const c2 = (await api('GET', '/admin/campaigns/' + id2)).data.campaign;
  assert.equal(c2.status, 'cancelled'); assert.ok(c2.stats.skipped >= 3);
  assert.equal((await api('POST', '/admin/campaigns/' + id2 + '/resume')).status, 409);
});

test('[DÉSINSCRIPTION] jeton signé : valide désinscrit, falsifié ou d\'un autre compte refusé ; réabonnement possible ; mode « un clic »', async () => {
  await wipeUsers();
  await seedUsers('unsub_user', 2);
  const tok = unsubToken('unsub_user_00');
  assert.equal((await t.call('POST', '/marketing/unsubscribe?u=unsub_user_00&t=' + 'a'.repeat(32))).status, 400);
  assert.equal((await t.call('POST', '/marketing/unsubscribe?u=unsub_user_01&t=' + tok)).status, 400, 'jeton d\'un autre compte');
  assert.equal((await t.call('POST', '/marketing/unsubscribe?u=unsub_user_00')).status, 400);
  assert.equal((await t.userRow('unsub_user_00')).marketing_opt_out, 0);
  assert.equal((await t.call('GET', '/marketing/status?u=unsub_user_00&t=' + tok)).data.unsubscribed, false);
  // « un clic » (en-tête List-Unsubscribe-Post) : corps de formulaire, paramètres dans l'adresse
  const one = await t.call('POST', '/marketing/unsubscribe?u=unsub_user_00&t=' + tok, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'List-Unsubscribe=One-Click' });
  assert.equal(one.status, 200);
  assert.equal((await t.userRow('unsub_user_00')).marketing_opt_out, 1);
  assert.equal((await t.call('GET', '/marketing/status?u=unsub_user_00&t=' + tok)).data.unsubscribed, true);
  assert.equal((await t.call('POST', '/marketing/resubscribe', { body: { u: 'unsub_user_00', t: tok } })).status, 200);
  assert.equal((await t.userRow('unsub_user_00')).marketing_opt_out, 0);
  assert.equal((await t.userRow('unsub_user_01')).marketing_opt_out, 0, 'les autres comptes ne sont pas touchés');
});

test('[DÉSINSCRIPTION] la route est limitée en débit (anti-abus)', async () => {
  let limited = 0;
  for (let i = 0; i < 35; i++) {
    const r = await t.call('POST', '/marketing/unsubscribe?u=zzzz_user_00&t=bad', { headers: { 'CF-Connecting-IP': '203.0.113.77' } });
    if (r.status === 429) limited++;
  }
  assert.ok(limited >= 4, 'limitations observées : ' + limited);
});

test('[ROUTES EXISTANTES] la campagne « sondage feedback » et les autres routes admin restent atteignables', async () => {
  const r = await api('POST', '/admin/campaigns/feedback-survey', {});
  assert.notEqual(r.status, 401); assert.notEqual(r.status, 404);
});
