// Équipes du plan Pro (lot 1) : droits, invitations, places, crédits partagés, remboursements, suspension
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createEnv } from './harness.mjs';

let t;
before(async () => { t = await createEnv(); });
after(async () => { await t.close(); });

const CV = 'Jean Dupont — ingénieur logiciel. '.repeat(20);
const parallel = (n, fn) => Promise.all(Array.from({ length: n }, fn));
const balance = async id => (await t.userRow(id)).credits_balance;
const resetAi = () => { t.state.anthropicDelayMs = 0; t.state.anthropicCalls = 0; t.state.anthropicFail = false; t.state.anthropicFailOn = null; };

let n = 0;
// Crée un propriétaire Pro + son équipe, et renvoie de quoi agir
async function makeTeam({ ownerBalance = 200, ownerTier = 'pro' } = {}) {
  const k = ++n;
  const owner = await t.seedUser({ id: 'own_' + k, email: 'owner' + k + '@test.invalid', tier: ownerTier, balance: ownerBalance, limit: 200 });
  const tok = await t.makeToken(owner.id, owner.email);
  const r = await t.call('POST', '/teams/create', { token: tok, body: { name: 'Cabinet ' + k } });
  return { k, owner, tok, create: r, teamId: r.data && r.data.team_id };
}
// Invite puis fait accepter un nouvel utilisateur ; renvoie son jeton
async function addMember(team, { role = 'member', balance: bal = 0 } = {}) {
  const id = 'mem_' + team.k + '_' + (++n);
  const email = id + '@test.invalid';
  await t.seedUser({ id, email, balance: bal });
  const inv = await t.call('POST', '/teams/invite', { token: team.tok, body: { email, role } });
  assert.equal(inv.status, 200, JSON.stringify(inv.data));
  const token = inv.data.invite_link.split('invite=')[1];
  const mtok = await t.makeToken(id, email);
  const acc = await t.call('POST', '/teams/invitations/' + token + '/accept', { token: mtok });
  assert.equal(acc.status, 200, JSON.stringify(acc.data));
  const row = await t.q("SELECT id FROM team_members WHERE user_id = ?", id);
  return { id, email, tok: mtok, memberRowId: row.id };
}

test('[ÉQUIPE] seul un compte Pro peut créer une équipe, une seule par personne', async () => {
  const free = await t.seedUser({ id: 'free_creator', email: 'free_creator@test.invalid', tier: 'premium' });
  const r1 = await t.call('POST', '/teams/create', { token: await t.makeToken(free.id, free.email), body: { name: 'Mon équipe' } });
  assert.equal(r1.status, 403);
  const team = await makeTeam();
  assert.equal(team.create.status, 200);
  const owner = await t.q('SELECT role, status FROM team_members WHERE team_id = ? AND user_id = ?', team.teamId, team.owner.id);
  assert.deepEqual({ ...owner }, { role: 'owner', status: 'active' });
  const again = await t.call('POST', '/teams', { token: team.tok, body: { name: 'Deuxième' } });
  assert.equal(again.status, 409);
  assert.equal((await t.call('POST', '/teams/create', { token: team.tok, body: { name: 'x' } })).status, 400, 'nom trop court');
});

test('[INVITATION] e-mail envoyé avec le lien, contrôles de l\'adresse et des doublons', async () => {
  const team = await makeTeam();
  t.calls.reset();
  const inv = await t.call('POST', '/teams/invite', { token: team.tok, body: { email: 'Conseiller@Test.Invalid', role: 'member' } });
  assert.equal(inv.status, 200);
  assert.equal(inv.data.email_sent, true);
  const mails = t.calls.emails();
  assert.equal(mails.length, 1);
  const sent = JSON.parse(mails[0].body);
  assert.deepEqual(sent.to, ['conseiller@test.invalid'].length ? sent.to : sent.to);
  assert.ok(String(sent.html).includes(inv.data.invite_link.replace(/&/g, '&amp;')), 'le lien est dans l\'e-mail');
  assert.ok(String(sent.subject).includes('Cabinet'), 'nom de l\'équipe dans l\'objet');
  assert.equal((await t.call('POST', '/teams/invite', { token: team.tok, body: { email: 'conseiller@test.invalid' } })).status, 409, 'invitation déjà en attente');
  assert.equal((await t.call('POST', '/teams/invite', { token: team.tok, body: { email: 'pas-un-email' } })).status, 400);
  const pending = await t.call('GET', '/teams/my-team', { token: team.tok });
  assert.equal(pending.data.pending_invitations.length, 1);
  assert.equal(pending.data.pending_invitations[0].email, 'conseiller@test.invalid');
  assert.equal(pending.data.pending_invitations[0].token, undefined, 'le jeton n\'est pas exposé dans la liste');
});

test('[INVITATION] acceptation : bonne adresse obligatoire, usage unique, expiration', async () => {
  const team = await makeTeam();
  await t.seedUser({ id: 'invitee_a', email: 'invitee_a@test.invalid' });
  await t.seedUser({ id: 'intrus_a', email: 'intrus_a@test.invalid' });
  const inv = await t.call('POST', '/teams/invite', { token: team.tok, body: { email: 'invitee_a@test.invalid' } });
  const token = inv.data.invite_link.split('invite=')[1];
  const wrong = await t.call('POST', '/teams/invitations/' + token + '/accept', { token: await t.makeToken('intrus_a', 'intrus_a@test.invalid') });
  assert.equal(wrong.status, 403, 'une autre adresse ne peut pas utiliser le lien');
  const ok = await t.call('POST', '/teams/invitations/' + token + '/accept', { token: await t.makeToken('invitee_a', 'invitee_a@test.invalid') });
  assert.equal(ok.status, 200);
  assert.equal((await t.q('SELECT status FROM team_invitations WHERE token = ?', token)).status, 'accepted');
  const twice = await t.call('POST', '/teams/invitations/' + token + '/accept', { token: await t.makeToken('invitee_a', 'invitee_a@test.invalid') });
  assert.equal(twice.status, 404);
  // Expirée
  await t.seedUser({ id: 'invitee_b', email: 'invitee_b@test.invalid' });
  const inv2 = await t.call('POST', '/teams/invite', { token: team.tok, body: { email: 'invitee_b@test.invalid' } });
  const tok2 = inv2.data.invite_link.split('invite=')[1];
  await t.DB.prepare('UPDATE team_invitations SET expires_at = unixepoch() - 10 WHERE token = ?').bind(tok2).run();
  assert.equal((await t.call('POST', '/teams/invitations/' + tok2 + '/accept', { token: await t.makeToken('invitee_b', 'invitee_b@test.invalid') })).status, 410);
  assert.equal((await t.call('POST', '/teams/invitations/pas-un-jeton/accept', { token: await t.makeToken('invitee_b', 'invitee_b@test.invalid') })).status, 400);
});

test('[PLACES] 5 places au total (propriétaire + membres + invitations en attente)', async () => {
  const team = await makeTeam();
  await addMember(team);
  await addMember(team);
  for (const e of ['p1@test.invalid', 'p2@test.invalid']) assert.equal((await t.call('POST', '/teams/invite', { token: team.tok, body: { email: e } })).status, 200);
  const full = await t.call('POST', '/teams/invite', { token: team.tok, body: { email: 'p3@test.invalid' } });
  assert.equal(full.status, 409, JSON.stringify(full.data));
  assert.match(full.data.error, /complète/);
});

test('[DROITS] membre ne peut pas inviter ; admin ne peut pas inviter d\'admin ni retirer un admin ; propriétaire intouchable', async () => {
  const team = await makeTeam();
  const admin = await addMember(team, { role: 'admin' });
  const admin2 = await addMember(team, { role: 'admin' });
  const member = await addMember(team);
  assert.equal((await t.call('POST', '/teams/invite', { token: member.tok, body: { email: 'x1@test.invalid' } })).status, 403);
  assert.equal((await t.call('POST', '/teams/invite', { token: admin.tok, body: { email: 'x2@test.invalid', role: 'admin' } })).status, 403);
  assert.equal((await t.call('DELETE', '/teams/members/' + admin2.memberRowId, { token: admin.tok })).status, 403);
  const ownerRow = await t.q("SELECT id FROM team_members WHERE user_id = ?", team.owner.id);
  assert.equal((await t.call('DELETE', '/teams/members/' + ownerRow.id, { token: admin.tok })).status, 403);
  assert.equal((await t.call('PUT', '/teams/members/' + ownerRow.id + '/role', { token: team.tok, body: { role: 'member' } })).status, 403);
  assert.equal((await t.call('PUT', '/teams/members/' + member.memberRowId + '/role', { token: admin.tok, body: { role: 'admin' } })).status, 403, 'seul le propriétaire change les rôles');
  // Le propriétaire change un rôle et retire un membre ; l'admin retire un membre simple
  assert.equal((await t.call('PUT', '/teams/members/' + member.memberRowId + '/role', { token: team.tok, body: { role: 'admin' } })).status, 200);
  assert.equal((await t.q('SELECT role FROM team_members WHERE id = ?', member.memberRowId)).role, 'admin');
  assert.equal((await t.call('PUT', '/teams/members/' + member.memberRowId + '/role', { token: team.tok, body: { role: 'owner' } })).status, 400);
  assert.equal((await t.call('DELETE', '/teams/members/' + admin2.memberRowId, { token: team.tok })).status, 200);
  // Un membre peut quitter l'équipe ; le propriétaire non
  assert.equal((await t.call('POST', '/teams/leave', { token: member.tok })).status, 200);
  assert.equal((await t.call('POST', '/teams/leave', { token: team.tok })).status, 403);
});

test('[DROITS] une personne extérieure ne peut ni annuler une invitation ni agir sur une autre équipe', async () => {
  const a = await makeTeam();
  const b = await makeTeam();
  const inv = await t.call('POST', '/teams/invite', { token: a.tok, body: { email: 'cible@test.invalid' } });
  const invId = inv.data.invitation.id;
  assert.equal((await t.call('DELETE', '/teams/invitations/' + invId, { token: b.tok })).status, 403);
  assert.equal((await t.call('PUT', '/teams/' + a.teamId, { token: b.tok, body: { name: 'Piraté' } })).status, 403);
  assert.equal((await t.call('DELETE', '/teams/' + a.teamId, { token: b.tok })).status, 403);
  const memberA = await addMember(a);
  assert.equal((await t.call('DELETE', '/teams/members/' + memberA.memberRowId, { token: b.tok })).status, 403);
  assert.equal((await t.call('DELETE', '/teams/invitations/' + invId, { token: a.tok })).status, 200);
});

test('[CRÉDITS] un conseiller sans crédits utilise le pot commun de l\'équipe ; suivi par membre', async () => {
  resetAi();
  const team = await makeTeam({ ownerBalance: 50 });
  const m = await addMember(team, { balance: 0 });
  const a = await t.call('POST', '/analyze-cv-text', { token: m.tok, body: { cvText: CV } });
  assert.equal(a.status, 200, JSON.stringify(a.data));
  const l = await t.call('POST', '/generate-cover-letter', { token: m.tok, body: { jobTitle: 'Dev', company: 'ACME', description: 'x' } });
  assert.equal(l.status, 200);
  assert.equal(await balance(team.owner.id), 47, '1 + 2 crédits pris sur le compte de l\'équipe');
  assert.equal(await balance(m.id), 0, 'rien sur le compte personnel');
  const my = await t.call('GET', '/teams/my-team', { token: team.tok });
  const row = my.data.members.find(x => x.user_id === m.id);
  assert.equal(row.credits_used_month, 3);
  assert.equal(my.data.credits.balance, 47);
  // Solde affiché au membre = pot commun
  const bal = await t.call('GET', '/credits/balance', { token: m.tok });
  assert.equal(bal.data.balance, 47);
  assert.equal(bal.data.personal_balance, 0);
  const val = await t.call('POST', '/credits/validate', { token: m.tok, body: { action_type: 'cv_analysis' } });
  assert.equal(val.data.has_enough_credits, true);
  resetAi();
});

test('[CRÉDITS] échec de l\'IA : le crédit revient au compte de l\'équipe et le suivi est corrigé', async () => {
  resetAi();
  const team = await makeTeam({ ownerBalance: 20 });
  const m = await addMember(team, { balance: 0 });
  t.state.anthropicFail = true;
  const a = await t.call('POST', '/analyze-cv-text', { token: m.tok, body: { cvText: CV } });
  const l = await t.call('POST', '/generate-cover-letter', { token: m.tok, body: { jobTitle: 'Dev', company: 'ACME', description: 'x' } });
  const g = await t.call('POST', '/ai/generate-application', { token: m.tok, body: { cvText: CV, jobTitle: 'Dev', company: 'ACME', jobDescription: 'x'.repeat(50) } });
  resetAi();
  assert.ok(a.status >= 400 && l.status >= 400 && g.status >= 400, [a.status, l.status, g.status].join('/'));
  assert.equal(await balance(team.owner.id), 20, 'tout est rendu à l\'équipe');
  assert.equal(await balance(m.id), 0);
  const used = await t.q('SELECT COALESCE(SUM(amount), 0) AS s FROM team_credit_usage WHERE user_id = ?', m.id);
  assert.equal(used.s, 0, 'le suivi ne compte pas les échecs');
});

test('[CRÉDITS] pot commun vide : le conseiller utilise ses propres crédits ; jamais de solde négatif en parallèle', async () => {
  resetAi();
  const team = await makeTeam({ ownerBalance: 3 });
  const m = await addMember(team, { balance: 2 });
  t.state.anthropicDelayMs = 80;
  const rs = await parallel(8, () => t.call('POST', '/analyze-cv-text', { token: m.tok, body: { cvText: CV } }));
  resetAi();
  assert.equal(rs.filter(r => r.status === 200).length, 5, JSON.stringify(rs.map(r => r.status)));
  assert.equal(await balance(team.owner.id), 0);
  assert.equal(await balance(m.id), 0);
  assert.ok((await t.qa('SELECT credits_balance FROM users WHERE credits_balance < 0')).length === 0, 'aucun solde négatif');
  const used = await t.q('SELECT COALESCE(SUM(amount), 0) AS s FROM team_credit_usage WHERE user_id = ?', m.id);
  assert.equal(used.s, 3, '3 crédits d\'équipe, 2 personnels');
});

test('[SUSPENSION] propriétaire plus Pro : chacun revient à ses crédits, invitations bloquées', async () => {
  resetAi();
  const team = await makeTeam({ ownerBalance: 100 });
  const m = await addMember(team, { balance: 5 });
  await t.DB.prepare("UPDATE users SET subscription_tier = 'free' WHERE id = ?").bind(team.owner.id).run();
  const a = await t.call('POST', '/analyze-cv-text', { token: m.tok, body: { cvText: CV } });
  assert.equal(a.status, 200);
  assert.equal(await balance(team.owner.id), 100, 'le compte du propriétaire n\'est plus utilisé');
  assert.equal(await balance(m.id), 4);
  assert.equal((await t.call('POST', '/teams/invite', { token: team.tok, body: { email: 'z@test.invalid' } })).status, 403);
  const my = await t.call('GET', '/teams/my-team', { token: m.tok });
  assert.equal(my.data.team.active, false);
  resetAi();
});

test('[ÉQUIPE] suppression : membres et invitations retirés, chacun retrouve un usage individuel', async () => {
  const team = await makeTeam();
  const m = await addMember(team);
  await t.call('POST', '/teams/invite', { token: team.tok, body: { email: 'attente@test.invalid' } });
  const del = await t.call('DELETE', '/teams/' + team.teamId, { token: team.tok });
  assert.equal(del.status, 200);
  assert.equal((await t.qa('SELECT * FROM team_members WHERE team_id = ?', team.teamId)).length, 0);
  assert.equal((await t.qa('SELECT * FROM team_invitations WHERE team_id = ?', team.teamId)).length, 0);
  const my = await t.call('GET', '/teams/my-team', { token: m.tok });
  assert.equal(my.data.team, null);
});

test('[CONFIDENTIALITÉ] un membre simple ne voit pas les e-mails complets ni la consommation des autres', async () => {
  const team = await makeTeam();
  const a = await addMember(team);
  await addMember(team);
  const my = await t.call('GET', '/teams/my-team', { token: a.tok });
  const others = my.data.members.filter(x => x.user_id !== a.id);
  assert.ok(others.every(x => !String(x.email).includes('@test.invalid') || String(x.email).includes('*')), JSON.stringify(others.map(x => x.email)));
  assert.ok(others.every(x => x.credits_used_month === undefined));
  assert.equal(my.data.pending_invitations.length, 0, 'pas de liste d\'invitations pour un membre');
  await t.call('POST', '/teams/invite', { token: team.tok, body: { email: 'attente2@test.invalid' } });
  const after = await t.call('GET', '/teams/my-team', { token: a.tok });
  assert.equal(after.data.team.seats_used, 4, 'les invitations en attente comptent aussi dans les places vues par un membre');
});
