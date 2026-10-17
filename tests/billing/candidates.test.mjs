// Dossiers candidats (plan Pro, lot 2) : visibilité, consentement, rattachement des outils, isolement, suppression, purge 12 mois
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createEnv } from './harness.mjs';

let t;
before(async () => { t = await createEnv(); });
after(async () => { await t.close(); });

const CV = 'Marie Candidate — vendeuse expérimentée. '.repeat(20);
const resetAi = () => { t.state.anthropicDelayMs = 0; t.state.anthropicCalls = 0; t.state.anthropicFail = false; t.state.anthropicFailOn = null; };
let n = 0;

// Équipe : propriétaire Pro, admin, 2 conseillers
async function setup() {
  const k = ++n;
  const owner = await t.seedUser({ id: 'cown_' + k, email: 'cown' + k + '@test.invalid', tier: 'pro', balance: 200, limit: 200 });
  const otok = await t.makeToken(owner.id, owner.email);
  const team = await t.call('POST', '/teams/create', { token: otok, body: { name: 'Cabinet C' + k } });
  const people = { owner: { id: owner.id, tok: otok } };
  for (const [key, role] of [['admin', 'admin'], ['c1', 'member'], ['c2', 'member']]) {
    const id = 'c' + key + '_' + k, email = id + '@test.invalid';
    await t.seedUser({ id, email, balance: 0 });
    const inv = await t.call('POST', '/teams/invite', { token: otok, body: { email, role } });
    const tok = await t.makeToken(id, email);
    const acc = await t.call('POST', '/teams/invitations/' + inv.data.invite_link.split('invite=')[1] + '/accept', { token: tok });
    assert.equal(acc.status, 200);
    people[key] = { id, tok };
  }
  return { k, teamId: team.data.team_id, ...people };
}
const newCandidate = (tok, extra = {}) => t.call('POST', '/candidates', { token: tok, body: { first_name: 'Marie', last_name: 'Dupont', email: 'marie@exemple.ch', target_job: 'Vendeuse', consent: true, ...extra } });

test('[DOSSIER] consentement obligatoire ; réservé aux équipes ; enregistrement de l\'attestation', async () => {
  const s = await setup();
  assert.equal((await t.call('POST', '/candidates', { token: s.c1.tok, body: { first_name: 'A', last_name: 'B' } })).status, 400, 'sans consentement');
  assert.equal((await t.call('POST', '/candidates', { token: s.c1.tok, body: { first_name: '', last_name: 'B', consent: true } })).status, 400);
  const solo = await t.seedUser({ id: 'solo_c', email: 'solo_c@test.invalid', tier: 'premium' });
  assert.equal((await newCandidate(await t.makeToken(solo.id, solo.email))).status, 403, 'hors équipe');
  const r = await newCandidate(s.c1.tok);
  assert.equal(r.status, 200);
  const row = await t.q('SELECT * FROM candidates WHERE id = ?', r.data.candidate.id);
  assert.equal(row.counsellor_id, s.c1.id);
  assert.equal(row.consent_by, s.c1.id);
  assert.ok(row.consent_at > 0 && row.consent_version);
});

test('[VISIBILITÉ] le conseiller et la direction voient le dossier ; un autre conseiller non', async () => {
  const s = await setup();
  const id = (await newCandidate(s.c1.tok)).data.candidate.id;
  for (const who of ['c1', 'owner', 'admin']) {
    const r = await t.call('GET', '/candidates/' + id, { token: s[who].tok });
    assert.equal(r.status, 200, who);
  }
  assert.equal((await t.call('GET', '/candidates/' + id, { token: s.c2.tok })).status, 404);
  assert.equal((await t.call('PUT', '/candidates/' + id, { token: s.c2.tok, body: { status: 'archive' } })).status, 404);
  assert.equal((await t.call('DELETE', '/candidates/' + id, { token: s.c2.tok })).status, 404);
  const listC2 = await t.call('GET', '/candidates', { token: s.c2.tok });
  assert.equal(listC2.data.candidates.length, 0);
  const listOwner = await t.call('GET', '/candidates', { token: s.owner.tok });
  assert.equal(listOwner.data.candidates.length, 1);
  // Une autre équipe ne voit rien
  const other = await setup();
  assert.equal((await t.call('GET', '/candidates/' + id, { token: other.owner.tok })).status, 404);
});

test('[OUTILS] analyse, lettre, candidature 1 clic et CV rattachés au dossier ; historique personnel intact', async () => {
  resetAi();
  const s = await setup();
  const id = (await newCandidate(s.c1.tok)).data.candidate.id;
  const before = await t.call('GET', '/analyses/history', { token: s.c1.tok });
  const a = await t.call('POST', '/analyze-cv-text', { token: s.c1.tok, body: { cvText: CV, filename: 'cv-marie.pdf', candidate_id: id } });
  assert.equal(a.status, 200, JSON.stringify(a.data));
  const l = await t.call('POST', '/generate-cover-letter', { token: s.c1.tok, body: { jobTitle: 'Vendeuse', company: 'Migros', description: 'x', candidate_id: id } });
  assert.equal(l.status, 200);
  assert.ok(l.data.candidate_document_id);
  const g = await t.call('POST', '/ai/generate-application', { token: s.c1.tok, body: { cvText: CV, jobTitle: 'Vendeuse', company: 'Coop', jobDescription: 'x'.repeat(50), candidate_id: id } });
  assert.equal(g.status, 200);
  const cv = await t.call('POST', '/cv-builder/save', { token: s.c1.tok, body: { name: 'CV Marie', template_id: 'classique-1', data: { firstName: 'Marie' }, candidate_id: id } });
  assert.equal(cv.status, 200);
  const d = await t.call('GET', '/candidates/' + id, { token: s.owner.tok });
  assert.equal(d.data.analyses.length, 1);
  assert.equal(d.data.analyses[0].filename, 'cv-marie.pdf');
  assert.equal(d.data.documents.length, 2);
  assert.deepEqual(d.data.documents.map(x => x.kind).sort(), ['application', 'letter']);
  assert.equal(d.data.documents.find(x => x.kind === 'letter').content.letter.length > 0, true);
  assert.equal(d.data.cv_documents.length, 1);
  // Isolement : rien dans l'historique / les CV / les alertes du conseiller
  const hist = await t.call('GET', '/analyses/history', { token: s.c1.tok });
  if (before.status === 200) assert.equal(JSON.stringify(hist.data).includes('cv-marie.pdf'), false, 'analyse du candidat absente de l\'historique personnel');
  const myCvs = await t.call('GET', '/cv-builder/list', { token: s.c1.tok });
  assert.equal(myCvs.data.documents.length, 0);
  const candCvs = await t.call('GET', '/cv-builder/list?candidate_id=' + id, { token: s.c1.tok });
  assert.equal(candCvs.data.documents.length, 1);
  assert.equal((await t.qa("SELECT * FROM saved_searches WHERE user_id = ?", s.c1.id)).length, 0, 'aucune alerte emploi créée pour le conseiller');
  // La direction peut ouvrir et modifier le CV du candidat ; le conseiller c2 non
  assert.equal((await t.call('GET', '/cv-builder/document/' + cv.data.id, { token: s.owner.tok })).status, 200);
  assert.equal((await t.call('GET', '/cv-builder/document/' + cv.data.id, { token: s.c2.tok })).status, 404);
  assert.equal((await t.call('POST', '/cv-builder/save', { token: s.c2.tok, body: { id: cv.data.id, name: 'x', data: {} } })).status, 404);
  // Crédits : pris sur le pot commun de l'équipe (1 + 2 + 3)
  assert.equal((await t.userRow(s.owner.id)).credits_balance, 194);
  resetAi();
});

test('[OUTILS] un conseiller ne peut pas utiliser un outil pour le dossier d\'un collègue (aucun crédit débité)', async () => {
  resetAi();
  const s = await setup();
  const id = (await newCandidate(s.c1.tok)).data.candidate.id;
  const r = await t.call('POST', '/analyze-cv-text', { token: s.c2.tok, body: { cvText: CV, candidate_id: id } });
  assert.equal(r.status, 403);
  const l = await t.call('POST', '/generate-cover-letter', { token: s.c2.tok, body: { jobTitle: 'X', company: 'Y', description: 'x', candidate_id: id } });
  assert.equal(l.status, 403);
  assert.equal((await t.userRow(s.owner.id)).credits_balance, 200, 'aucun crédit consommé');
  assert.equal(t.state.anthropicCalls || 0, 0, 'aucun appel IA');
});

test('[NOTES & SUIVI] notes, candidatures suivies, réattribution par la direction', async () => {
  const s = await setup();
  const id = (await newCandidate(s.c1.tok)).data.candidate.id;
  assert.equal((await t.call('POST', '/candidates/' + id + '/notes', { token: s.c1.tok, body: { note: 'Premier entretien OK' } })).status, 200);
  assert.equal((await t.call('POST', '/candidates/' + id + '/notes', { token: s.c1.tok, body: { note: '   ' } })).status, 400);
  const app = await t.call('POST', '/candidates/' + id + '/applications', { token: s.c1.tok, body: { job_title: 'Vendeuse', company: 'Manor', job_url: 'https://exemple.ch/offre', status: 'postule' } });
  assert.equal(app.status, 200);
  assert.equal((await t.call('POST', '/candidates/' + id + '/applications', { token: s.c1.tok, body: { job_title: 'X', company: 'Y', job_url: 'javascript:alert(1)' } })).status, 400);
  assert.equal((await t.call('PUT', '/candidates/' + id + '/applications/' + app.data.id, { token: s.c1.tok, body: { status: 'entretien' } })).status, 200);
  assert.equal((await t.call('PUT', '/candidates/' + id + '/applications/' + app.data.id, { token: s.c1.tok, body: { status: 'nimporte' } })).status, 400);
  const d = await t.call('GET', '/candidates/' + id, { token: s.c1.tok });
  assert.equal(d.data.notes.length, 1);
  assert.equal(d.data.applications[0].status, 'entretien');
  // Réattribution : le conseiller ne peut pas, la direction oui
  assert.equal((await t.call('PUT', '/candidates/' + id, { token: s.c1.tok, body: { counsellor_id: s.c2.id } })).status, 403);
  assert.equal((await t.call('PUT', '/candidates/' + id, { token: s.admin.tok, body: { counsellor_id: s.c2.id } })).status, 200);
  assert.equal((await t.call('GET', '/candidates/' + id, { token: s.c2.tok })).status, 200, 'c2 voit maintenant le dossier');
  assert.equal((await t.call('GET', '/candidates/' + id, { token: s.c1.tok })).status, 404, 'c1 ne le voit plus');
});

test('[SUPPRESSION] supprimer un dossier efface tout ce qui y est rattaché, rien d\'autre', async () => {
  resetAi();
  const s = await setup();
  const id = (await newCandidate(s.c1.tok)).data.candidate.id;
  await t.call('POST', '/analyze-cv-text', { token: s.c1.tok, body: { cvText: CV, candidate_id: id } });
  await t.call('POST', '/analyze-cv-text', { token: s.c1.tok, body: { cvText: CV } });
  await t.call('POST', '/generate-cover-letter', { token: s.c1.tok, body: { jobTitle: 'V', company: 'M', description: 'x', candidate_id: id } });
  await t.call('POST', '/cv-builder/save', { token: s.c1.tok, body: { name: 'CV', data: {}, candidate_id: id } });
  await t.call('POST', '/candidates/' + id + '/notes', { token: s.c1.tok, body: { note: 'n' } });
  await t.call('POST', '/candidates/' + id + '/applications', { token: s.c1.tok, body: { job_title: 'V', company: 'M' } });
  assert.equal((await t.call('DELETE', '/candidates/' + id, { token: s.c1.tok })).status, 200);
  for (const [table, col] of [['cv_analyses', 'candidate_id'], ['cv_builder_documents', 'candidate_id'], ['candidate_documents', 'candidate_id'], ['candidate_notes', 'candidate_id'], ['candidate_applications', 'candidate_id'], ['candidates', 'id']]) {
    assert.equal((await t.qa('SELECT * FROM ' + table + ' WHERE ' + col + ' = ?', id)).length, 0, table);
  }
  assert.equal((await t.qa('SELECT * FROM cv_analyses WHERE user_id = ? AND candidate_id IS NULL', s.c1.id)).length, 1, 'analyse personnelle conservée');
  resetAi();
});

test('[CONSERVATION] avertissement 30 jours avant, suppression après 12 mois d\'inactivité ; une activité relance le délai', async () => {
  const s = await setup();
  const old = (await newCandidate(s.c1.tok, { first_name: 'Ancien' })).data.candidate.id;
  const soon = (await newCandidate(s.c1.tok, { first_name: 'Bientôt' })).data.candidate.id;
  const fresh = (await newCandidate(s.c1.tok, { first_name: 'Récent' })).data.candidate.id;
  const day = 86400, now = Math.floor(Date.now() / 1000);
  await t.DB.prepare('UPDATE candidates SET last_activity_at = ? WHERE id = ?').bind(now - 366 * day, old).run();
  await t.DB.prepare('UPDATE candidates SET last_activity_at = ? WHERE id = ?').bind(now - 340 * day, soon).run();
  t.calls.reset();
  await t.runScheduled();
  assert.equal((await t.qa('SELECT * FROM candidates WHERE id = ?', old)).length, 0, 'dossier inactif depuis 12 mois supprimé');
  const warned = await t.q('SELECT deletion_warned_at FROM candidates WHERE id = ?', soon);
  assert.ok(warned.deletion_warned_at > 0, 'avertissement enregistré');
  const retention = t.calls.emails().map(c => JSON.parse(c.body)).filter(b => String(b.subject || '').startsWith('Dossiers candidats'));
  assert.equal(retention.length, 1, 'un email récapitulatif au conseiller');
  assert.ok(retention[0].html.includes('Bientôt'));
  assert.ok(!retention[0].html.includes('Récent'));
  assert.equal((await t.q('SELECT deletion_warned_at FROM candidates WHERE id = ?', fresh)).deletion_warned_at, null);
  // Une note relance le délai et efface l'avertissement
  await t.call('POST', '/candidates/' + soon + '/notes', { token: s.c1.tok, body: { note: 'toujours suivi' } });
  const after = await t.q('SELECT deletion_warned_at, last_activity_at FROM candidates WHERE id = ?', soon);
  assert.equal(after.deletion_warned_at, null);
  assert.ok(after.last_activity_at >= now);
});

test('[ÉQUIPE] supprimer l\'équipe supprime ses dossiers candidats', async () => {
  const s = await setup();
  const id = (await newCandidate(s.c1.tok)).data.candidate.id;
  await t.call('POST', '/candidates/' + id + '/notes', { token: s.c1.tok, body: { note: 'n' } });
  assert.equal((await t.call('DELETE', '/teams/' + s.teamId, { token: s.owner.tok })).status, 200);
  assert.equal((await t.qa('SELECT * FROM candidates WHERE id = ?', id)).length, 0);
  assert.equal((await t.qa('SELECT * FROM candidate_notes WHERE candidate_id = ?', id)).length, 0);
});

test('[GÉNÉRATEUR] un conseiller (compte gratuit) d\'une équipe Pro active peut télécharger un CV', async () => {
  resetAi();
  const s = await setup();
  const id = (await newCandidate(s.c1.tok)).data.candidate.id;
  const cv = await t.call('POST', '/cv-builder/save', { token: s.c1.tok, body: { name: 'CV', data: {}, candidate_id: id } });
  const r = await t.call('POST', '/cv-builder/document/' + cv.data.id + '/charge-download', { token: s.c1.tok });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.equal((await t.userRow(s.owner.id)).credits_balance, 198, '2 crédits pris à l\'équipe');
  const bal = await t.call('GET', '/credits/balance', { token: s.c1.tok });
  assert.equal(bal.data.team.active, true);
});
