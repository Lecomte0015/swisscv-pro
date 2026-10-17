// Suppression de compte (droit à l'effacement) et export des données (portabilité)
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createEnv } from './harness.mjs';

let t;
before(async () => { t = await createEnv(); });
after(async () => { await t.close(); });

const CV = 'Jean Testeur — comptable. '.repeat(20);

async function richUser(id, extra = {}) {
  const u = await t.seedUser({ id, email: id + '@test.invalid', balance: 10, ...extra });
  await t.DB.prepare("UPDATE users SET full_name = 'Jean Testeur', phone = '+41 79 000 00 00', supabase_id = ? WHERE id = ?").bind('sb-' + id, id).run();
  const tok = await t.makeToken(id, u.email);
  await t.call('POST', '/analyze-cv-text', { token: tok, body: { cvText: CV, filename: 'mon-cv.pdf' } });
  await t.call('POST', '/cv-builder/save', { token: tok, body: { name: 'Mon CV', data: { firstName: 'Jean' } } });
  await t.DB.prepare("INSERT INTO job_applications (id, user_id, job_title, company) VALUES (?, ?, 'Comptable', 'ACME')").bind('ja_' + id, id).run();
  return { ...u, tok };
}

test('[EFFACEMENT] confirmation obligatoire : sans « SUPPRIMER », rien ne bouge', async () => {
  const u = await richUser('del_user_00');
  assert.equal((await t.call('POST', '/account/delete', { token: u.tok, body: {} })).status, 400);
  assert.equal((await t.call('DELETE', '/delete-account', { token: u.tok })).status, 400);
  assert.equal((await t.userRow(u.id)).deleted_at, null);
});

test('[EFFACEMENT] données personnelles effacées, compte anonymisé, facturation conservée, emails envoyés', async () => {
  const u = await richUser('del_user_01');
  assert.ok((await t.qa('SELECT * FROM credit_transactions WHERE user_id = ?', u.id)).length >= 1);
  t.calls.reset();
  const r = await t.call('POST', '/account/delete', { token: u.tok, body: { confirm: 'SUPPRIMER' } });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  const row = await t.userRow(u.id);
  assert.ok(row.deleted_at > 0);
  assert.notEqual(row.email, 'del_user_01@test.invalid');
  assert.ok(row.email.endsWith('@deleted.invalid'), 'email anonymisé');
  assert.equal(row.full_name, null);
  assert.equal(row.phone, null);
  assert.equal(row.supabase_id, null);
  for (const tbl of ['cv_analyses', 'cv_builder_documents', 'job_applications', 'saved_searches']) {
    assert.equal((await t.qa('SELECT * FROM ' + tbl + ' WHERE user_id = ?', u.id)).length, 0, tbl);
  }
  assert.ok((await t.qa('SELECT * FROM credit_transactions WHERE user_id = ?', u.id)).length >= 1, 'transactions conservées (obligation légale)');
  const mails = t.calls.emails().map(c => JSON.parse(c.body));
  assert.ok(mails.some(m => JSON.stringify(m.to).includes('del_user_01@test.invalid') && /supprimé/.test(m.subject)), 'confirmation à la personne');
  const admin = mails.find(m => JSON.stringify(m.to).includes('contact@swisscv-pro.ch'));
  assert.ok(admin, 'information à l\'administrateur');
  assert.ok(!admin.html.includes('del_user_01@test.invalid'), 'pas d\'email complet dans la notification admin');
  assert.ok(admin.html.includes('sb-del_user_01'), 'identifiant Supabase à supprimer manuellement');
  // Le jeton n'ouvre plus rien : le compte est marqué supprimé
  assert.equal((await t.call('POST', '/account/delete', { token: u.tok, body: { confirm: 'SUPPRIMER' } })).status, 404);
});

test('[EFFACEMENT] abonnement résilié chez Stripe d\'abord ; si Stripe échoue, rien n\'est supprimé', async () => {
  const u = await richUser('del_user_02', { tier: 'premium', sub: 'sub_del_02', customer: 'cus_del_02' });
  t.state.stripeCancelStatus = 500;
  const fail = await t.call('POST', '/account/delete', { token: u.tok, body: { confirm: 'SUPPRIMER' } });
  t.state.stripeCancelStatus = 0;
  assert.equal(fail.status, 502);
  assert.equal((await t.userRow(u.id)).deleted_at, null);
  assert.equal((await t.qa('SELECT * FROM cv_analyses WHERE user_id = ?', u.id)).length, 1, 'données intactes');
  const ok = await t.call('POST', '/account/delete', { token: u.tok, body: { confirm: 'SUPPRIMER' } });
  assert.equal(ok.status, 200);
  assert.ok((t.state.stripeCancelled || []).includes('sub_del_02'));
  assert.equal((await t.userRow(u.id)).stripe_subscription_id, null);
});

test('[EFFACEMENT] propriétaire d\'équipe : équipe et dossiers supprimés ; conseiller : ses dossiers reviennent au cabinet', async () => {
  const owner = await t.seedUser({ id: 'del_own', email: 'del_own@test.invalid', tier: 'pro', balance: 100 });
  const otok = await t.makeToken(owner.id, owner.email);
  const team = await t.call('POST', '/teams/create', { token: otok, body: { name: 'Cabinet Effacement' } });
  const coach = await t.seedUser({ id: 'del_coach', email: 'del_coach@test.invalid' });
  const ctok = await t.makeToken(coach.id, coach.email);
  const inv = await t.call('POST', '/teams/invite', { token: otok, body: { email: coach.email } });
  await t.call('POST', '/teams/invitations/' + inv.data.invite_link.split('invite=')[1] + '/accept', { token: ctok });
  const cand = await t.call('POST', '/candidates', { token: ctok, body: { first_name: 'Ana', last_name: 'B', consent: true } });
  const candId = cand.data.candidate.id;
  await t.call('POST', '/analyze-cv-text', { token: ctok, body: { cvText: CV, candidate_id: candId } });
  // Le conseiller supprime son compte : le dossier reste au cabinet, attribué au propriétaire
  assert.equal((await t.call('POST', '/account/delete', { token: ctok, body: { confirm: 'SUPPRIMER' } })).status, 200);
  const c = await t.q('SELECT counsellor_id FROM candidates WHERE id = ?', candId);
  assert.equal(c.counsellor_id, owner.id);
  assert.equal((await t.qa('SELECT * FROM cv_analyses WHERE candidate_id = ?', candId)).length, 1, 'analyse du candidat conservée (donnée du cabinet)');
  assert.equal((await t.qa('SELECT * FROM team_members WHERE user_id = ?', coach.id)).length, 0);
  // Le propriétaire supprime son compte : l'équipe et le dossier disparaissent
  assert.equal((await t.call('POST', '/account/delete', { token: otok, body: { confirm: 'SUPPRIMER' } })).status, 200);
  assert.equal((await t.qa('SELECT * FROM teams WHERE id = ?', team.data.team_id)).length, 0);
  assert.equal((await t.qa('SELECT * FROM candidates WHERE id = ?', candId)).length, 0);
  assert.equal((await t.qa('SELECT * FROM cv_analyses WHERE candidate_id = ?', candId)).length, 0);
});

test('[EFFACEMENT] un compte administrateur ne peut pas être supprimé depuis le site', async () => {
  const a = await t.seedUser({ id: 'del_admin', email: 'del_admin@test.invalid' });
  await t.DB.prepare("UPDATE users SET role = 'admin' WHERE id = ?").bind(a.id).run();
  assert.equal((await t.call('POST', '/account/delete', { token: await t.makeToken(a.id, a.email), body: { confirm: 'SUPPRIMER' } })).status, 403);
});

test('[PORTABILITÉ] export : mes données personnelles, sans les dossiers candidats ni ceux des autres', async () => {
  const u = await richUser('exp_user_01');
  await richUser('exp_user_02');
  const r = await t.call('GET', '/profile/export', { token: u.tok });
  assert.equal(r.status, 200);
  assert.equal(r.data.account.email, 'exp_user_01@test.invalid');
  assert.equal(r.data.cv_analyses.length, 1);
  assert.equal(r.data.cv_documents.length, 1);
  assert.equal(r.data.job_applications.length, 1);
  assert.ok(!JSON.stringify(r.data).includes('exp_user_02'), 'aucune donnée d\'un autre compte');
  assert.equal((await t.call('GET', '/profile/export')).status, 401);
});
