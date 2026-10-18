// Bonus feedback (une seule fois par compte) et conservation des crédits à l'usage
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createEnv } from './harness.mjs';

let t;
before(async () => { t = await createEnv(); });
after(async () => { await t.close(); });

const form = email => ({ email, blocker_reason: 'price', quality_rating: 'useful', usage_features: 'used', nps_score: 8, missing_feature: '', comment: '' });
const balance = async id => (await t.userRow(id)).credits_balance;

test('[FEEDBACK] le bonus de 5 crédits n\'est accordé qu\'une seule fois par compte (envois répétés)', async () => {
  await t.seedUser({ id: 'fb_user_01', email: 'fb1@test.invalid', balance: 3 });
  const first = await t.call('POST', '/feedback/submit', { body: form('fb1@test.invalid') });
  assert.equal(first.status, 201);
  assert.equal(first.data.credited, true);
  assert.equal(await balance('fb_user_01'), 8);
  for (let i = 0; i < 10; i++) {
    const r = await t.call('POST', '/feedback/submit', { body: form('fb1@test.invalid') });
    assert.equal(r.status, 201);
    assert.equal(r.data.credited, false);
  }
  assert.equal(await balance('fb_user_01'), 8, 'aucun crédit supplémentaire');
  assert.equal((await t.qa("SELECT * FROM feedback_responses WHERE user_id = 'fb_user_01' AND credited = 1")).length, 1);
  assert.equal((await t.qa("SELECT * FROM feedback_responses WHERE user_id = 'fb_user_01'")).length, 11, 'toutes les réponses restent enregistrées');
});

test('[NÉGATIF] 10 envois parallèles du formulaire : un seul crédit de 5', async () => {
  await t.seedUser({ id: 'fb_user_02', email: 'fb2@test.invalid', balance: 0 });
  await Promise.all(Array.from({ length: 10 }, () => t.call('POST', '/feedback/submit', { body: form('fb2@test.invalid') })));
  assert.equal(await balance('fb_user_02'), 5);
});

test('[FEEDBACK] e-mail inconnu : réponse enregistrée sans crédit ; e-mail invalide refusé ; autres comptes intacts', async () => {
  await t.seedUser({ id: 'fb_user_03', email: 'fb3@test.invalid', balance: 5 });
  const unknown = await t.call('POST', '/feedback/submit', { body: form('personne@test.invalid') });
  assert.equal(unknown.status, 201);
  assert.equal(unknown.data.credited, false);
  assert.equal((await t.call('POST', '/feedback/submit', { body: { ...form('pas-un-email') } })).status, 400);
  assert.equal(await balance('fb_user_03'), 5);
});

// ---------------------------------------------------------------- conservation à l'usage (réservation atomique)
const CV = 'Jean Dupont — ingénieur logiciel. '.repeat(20);
const parallel = (n, fn) => Promise.all(Array.from({ length: n }, fn));
const resetAi = () => { t.state.anthropicDelayMs = 0; t.state.anthropicCalls = 0; t.state.anthropicFail = false; t.state.anthropicFailOn = null; };

test('[USAGE] 1 crédit = UNE analyse, même lancée 8 fois en parallèle (un seul appel IA facturé)', async () => {
  resetAi();
  await t.seedUser({ id: 'race_user_01', email: 'race1@test.invalid', balance: 1 });
  t.state.anthropicDelayMs = 150;
  const tok = await t.makeToken('race_user_01', 'race1@test.invalid');
  const rs = await parallel(8, () => t.call('POST', '/analyze-cv-text', { token: tok, body: { cvText: CV, filename: 'cv.pdf' } }));
  assert.equal(rs.filter(r => r.status === 200).length, 1);
  assert.equal(rs.filter(r => r.status === 402).length, 7);
  assert.equal(t.state.anthropicCalls, 2, 'une seule analyse (2 appels IA moyennés) pour le seul crédit');
  assert.equal(await balance('race_user_01'), 0);
  assert.equal((await t.qa("SELECT * FROM credit_transactions WHERE user_id = 'race_user_01' AND action_type = 'cv_analysis'")).length, 1);
  resetAi();
});

test('[USAGE] 5 crédits, 12 analyses parallèles : exactement 5 réussissent, solde 0, jamais négatif', async () => {
  resetAi();
  await t.seedUser({ id: 'race_user_02', email: 'race2@test.invalid', balance: 5 });
  t.state.anthropicDelayMs = 100;
  const tok = await t.makeToken('race_user_02', 'race2@test.invalid');
  const rs = await parallel(12, () => t.call('POST', '/analyze-cv-text', { token: tok, body: { cvText: CV } }));
  assert.equal(rs.filter(r => r.status === 200).length, 5);
  assert.equal(await balance('race_user_02'), 0);
  resetAi();
});

test('[USAGE] échec de l\'IA : le crédit réservé est rendu (analyse, lettre, candidature 1-clic)', async () => {
  resetAi();
  await t.seedUser({ id: 'refund_user_01', email: 'refund1@test.invalid', balance: 10 });
  const tok = await t.makeToken('refund_user_01', 'refund1@test.invalid');
  t.state.anthropicFail = true;
  const a = await t.call('POST', '/analyze-cv-text', { token: tok, body: { cvText: CV } });
  const l = await t.call('POST', '/generate-cover-letter', { token: tok, body: { jobTitle: 'Dev', company: 'ACME', description: 'x' } });
  const g = await t.call('POST', '/ai/generate-application', { token: tok, body: { cvText: CV, jobTitle: 'Dev', company: 'ACME', jobDescription: 'x'.repeat(50) } });
  resetAi();
  assert.ok(a.status >= 400 && l.status >= 400 && g.status >= 400, [a.status, l.status, g.status].join('/'));
  assert.equal(await balance('refund_user_01'), 10, 'aucun crédit perdu sur échec');
  assert.equal((await t.qa("SELECT * FROM credit_transactions WHERE user_id = 'refund_user_01'")).length, 0);
});

test('[USAGE] lettre de motivation (2 crédits) et candidature 1-clic (3 crédits) : parallèle limité par le solde', async () => {
  resetAi();
  await t.seedUser({ id: 'race_user_03', email: 'race3@test.invalid', balance: 4 });
  const tok = await t.makeToken('race_user_03', 'race3@test.invalid');
  t.state.anthropicDelayMs = 100;
  const rs = await parallel(6, () => t.call('POST', '/generate-cover-letter', { token: tok, body: { jobTitle: 'Dev', company: 'ACME', description: 'x' } }));
  assert.equal(rs.filter(r => r.status === 200).length, 2, 'solde 4 / coût 2 = 2 lettres');
  assert.equal(await balance('race_user_03'), 0);
  await t.seedUser({ id: 'race_user_04', email: 'race4@test.invalid', balance: 3 });
  const tok4 = await t.makeToken('race_user_04', 'race4@test.invalid');
  const gs = await parallel(5, () => t.call('POST', '/ai/generate-application', { token: tok4, body: { cvText: CV, jobTitle: 'Dev', company: 'ACME', jobDescription: 'x'.repeat(50) } }));
  assert.equal(gs.filter(r => r.status === 200).length, 1, JSON.stringify(gs.map(r => r.status)));
  assert.equal(await balance('race_user_04'), 0);
  resetAi();
});

test('[USAGE] candidatures en masse : réservation du total, remboursement des échecs, facturation des seules réussites', async () => {
  resetAi();
  await t.seedUser({ id: 'bulk_user_01', email: 'bulk1@test.invalid', balance: 10 });
  const tok = await t.makeToken('bulk_user_01', 'bulk1@test.invalid');
  t.state.anthropicFailOn = n => n % 2 === 0; // une offre sur deux échoue
  const jobs = Array.from({ length: 4 }, (_, i) => ({ id: 'j' + i, title: 'Dev ' + i, company: 'ACME', description: 'x'.repeat(40) }));
  const r = await t.call('POST', '/ai/generate-bulk-applications', { token: tok, body: { cvText: CV, jobs } });
  resetAi();
  assert.equal(r.status, 200, JSON.stringify(r.data).slice(0, 200));
  const ok = r.data.success_count;
  assert.equal(await balance('bulk_user_01'), 10 - 2 * ok, 'seules les ' + ok + ' réussites sont facturées');
  assert.equal(r.data.credits_remaining, 10 - 2 * ok);
  // solde insuffisant pour le total : refus sans rien retirer
  await t.seedUser({ id: 'bulk_user_02', email: 'bulk2@test.invalid', balance: 3 });
  const tok2 = await t.makeToken('bulk_user_02', 'bulk2@test.invalid');
  const refused = await t.call('POST', '/ai/generate-bulk-applications', { token: tok2, body: { cvText: CV, jobs } });
  assert.equal(refused.status, 402);
  assert.equal(await balance('bulk_user_02'), 3);
});

test('[USAGE] consommation générique : 3 crédits, 10 requêtes parallèles → exactement 3 acceptées', async () => {
  await t.seedUser({ id: 'cons_user_01', email: 'cons1@test.invalid', balance: 3 });
  const tok = await t.makeToken('cons_user_01', 'cons1@test.invalid');
  const rs = await parallel(10, () => t.call('POST', '/credits/consume', { token: tok, body: { action_type: 'cv_analysis' } }));
  assert.equal(rs.filter(r => r.status === 200 && r.data.success).length, 3);
  assert.equal(await balance('cons_user_01'), 0);
});

test('[USAGE] téléchargement du CV généré : facturé UNE fois par document, même en parallèle ; remboursé si solde insuffisant', async () => {
  await t.seedUser({ id: 'cvb_user_01', email: 'cvb1@test.invalid', tier: 'premium', balance: 10, limit: 100 });
  const tok = await t.makeToken('cvb_user_01', 'cvb1@test.invalid');
  await t.DB.prepare("INSERT INTO cv_builder_documents (id, user_id, template_id, name, data, created_at, updated_at) VALUES ('doc_race_01', 'cvb_user_01', 'classique-1', 'CV', '{}', unixepoch(), unixepoch())").run();
  const rs = await parallel(8, () => t.call('POST', '/cv-builder/document/doc_race_01/charge-download', { token: tok }));
  assert.equal(rs.filter(r => r.status === 200 && r.data.already_charged === false).length, 1, 'une seule facturation');
  assert.equal(await balance('cvb_user_01'), 8, '2 crédits débités une seule fois');
  assert.equal((await t.qa("SELECT * FROM credit_transactions WHERE user_id = 'cvb_user_01' AND action_type = 'cv_template'")).length, 1);
  // solde insuffisant : la revendication est annulée, le document reste facturable plus tard
  await t.seedUser({ id: 'cvb_user_02', email: 'cvb2@test.invalid', tier: 'premium', balance: 1, limit: 100 });
  const tok2 = await t.makeToken('cvb_user_02', 'cvb2@test.invalid');
  await t.DB.prepare("INSERT INTO cv_builder_documents (id, user_id, template_id, name, data, created_at, updated_at) VALUES ('doc_poor_01', 'cvb_user_02', 'classique-1', 'CV', '{}', unixepoch(), unixepoch())").run();
  const poor = await t.call('POST', '/cv-builder/document/doc_poor_01/charge-download', { token: tok2 });
  assert.equal(poor.status, 402);
  assert.equal((await t.q("SELECT download_charged_at d FROM cv_builder_documents WHERE id = 'doc_poor_01'")).d, null);
  assert.equal(await balance('cvb_user_02'), 1);
});

test('[HONNÊTETÉ] réponse IA illisible : une nouvelle tentative, puis erreur, crédit rendu, AUCUNE analyse inventée enregistrée', async () => {
  resetAi();
  await t.seedUser({ id: 'garbage_user_01', email: 'garbage1@test.invalid', balance: 3 });
  const tok = await t.makeToken('garbage_user_01', 'garbage1@test.invalid');
  t.state.anthropicRaw = 'Désolé, je ne peux pas produire de JSON pour ce document.';
  const r = await t.call('POST', '/analyze-cv-text', { token: tok, body: { cvText: CV, filename: 'cv.pdf' } });
  t.state.anthropicRaw = null;
  assert.equal(r.status, 502);
  assert.equal(r.data.credits_refunded, true);
  assert.equal(t.state.anthropicCalls, 4, '2 séries de 2 appels');
  assert.equal(await balance('garbage_user_01'), 3, 'crédit rendu');
  assert.equal((await t.qa("SELECT * FROM cv_analyses WHERE user_id = 'garbage_user_01'")).length, 0, 'aucune analyse enregistrée');
  resetAi();
});

test('[HONNÊTETÉ] réponse IA incomplète (score manquant) puis correcte : la 2e tentative est utilisée', async () => {
  resetAi();
  await t.seedUser({ id: 'garbage_user_02', email: 'garbage2@test.invalid', balance: 3 });
  const tok = await t.makeToken('garbage_user_02', 'garbage2@test.invalid');
  let calls = 0;
  const note = n => ({ note: n, justification: 'x' });
  const realRaw = JSON.stringify({ criteria: { contenu: note(2), structure: note(3), chronologie: note(2), mots_cles: note(3), langues: note(1), coordonnees: note(4), redaction: note(3) }, strongPoints: [{ point: 'Profil d\'ingénieur logiciel clair', preuve: 'Jean Dupont — ingénieur logiciel' }], improvements: ['Préciser le niveau CECR de l\'anglais'], swissAdvice: 'Indiquer le permis si pertinent.', keywords: ['ingénieur logiciel'] });
  // Série 1 : les 2 appels renvoient une réponse incomplète ; série 2 : réponses correctes
  Object.defineProperty(t.state, 'anthropicRaw', { configurable: true, get() { calls = t.state.anthropicCalls; return calls <= 2 ? '{"strongPoints":["x"]}' : realRaw; } });
  const r = await t.call('POST', '/analyze-cv-text', { token: tok, body: { cvText: CV } });
  delete t.state.anthropicRaw;
  t.state.anthropicRaw = null;
  assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.equal(r.data.analysis.score, 63); // (25*2 + 15*3 + 15*2 + 15*3 + 10*1 + 10*4 + 10*3) / 4 = 62,5 -> calculé par le serveur, pas par l'IA
  assert.equal(await balance('garbage_user_02'), 2);
  resetAi();
});

// ---------- Moteur d'analyse v2 : garde-fous appliqués par le code ----------
const v2note = n => ({ note: n, justification: 'x' });
const v2crit = n => ({ contenu: v2note(n), structure: v2note(n), chronologie: v2note(n), mots_cles: v2note(n), langues: v2note(n), coordonnees: v2note(n), redaction: v2note(n) });

test('[V2] score et score ATS calculés par le serveur ; point fort sans citation réelle supprimé ; photo jamais en amélioration', async () => {
  resetAi();
  await t.seedUser({ id: 'v2_user_01', email: 'v2a@test.invalid', balance: 3 });
  const tok = await t.makeToken('v2_user_01', 'v2a@test.invalid');
  const crit = v2crit(2); crit.structure = v2note(4); crit.mots_cles = v2note(4);
  t.state.anthropicRaw = JSON.stringify({
    score: 99, atsScore: 99, criteria: crit,
    strongPoints: [
      { point: 'Profil d\'ingénieur logiciel', preuve: 'ingénieur logiciel' },
      { point: 'Diplôme reconnu par la Croix-Rouge suisse', preuve: 'diplôme reconnu par la Croix-Rouge suisse' },
      { point: 'Dix ans chez 12 employeurs', preuve: 'Jean Dupont' },
      { point: 'Niveaux de langue certifiés', preuve: 'Jean Dupont' }
    ],
    improvements: ['Ajouter une photo professionnelle', 'Indiquer votre date de naissance', 'Ajouter « Références et certificats de travail disponibles sur demande »', 'Détailler les projets réalisés'],
    swissAdvice: 'La photo est attendue en Suisse. Mentionnez les certificats de travail disponibles sur demande. Les certificats de travail sont importants.',
    keywords: ['ingénieur logiciel', 'Kubernetes', 'ingénieur logiciel']
  });
  const r = await t.call('POST', '/analyze-cv-text', { token: tok, body: { cvText: CV, hasPhoto: false } });
  t.state.anthropicRaw = null;
  assert.equal(r.status, 200, JSON.stringify(r.data));
  const a = r.data.analysis;
  assert.equal(a.score, 65, 'score calculé : (25*2+15*4+15*2+15*4+10*2+10*2+10*2)/4 = 65, jamais celui proposé par l\'IA');
  assert.equal(a.atsScore, 80, 'ATS calculé : (30*4+20*2+30*4+10*2+10*2)/4 = 80');
  assert.equal(a.engineVersion, 'v2');
  assert.equal(a.criteria.length, 7);
  assert.deepEqual(a.strongPoints, ['Profil d\'ingénieur logiciel (« ingénieur logiciel »)'], 'citation absente du CV ou chiffre inventé = point fort retiré ; la citation est montrée');
  assert.deepEqual(a.improvements, ['Détailler les projets réalisés'], 'photo et date de naissance retirées des améliorations');
  assert.equal((a.swissAdvice.match(/photo/gi) || []).length, 1, 'une seule mention de la photo');
  assert.match(a.swissAdvice, /facultatives/);
  assert.equal((a.swissAdvice.match(/certificats de travail/gi) || []).length, 1, 'certificats de travail : une seule mention, jamais en amélioration');
  assert.deepEqual(a.keywords, ['ingénieur logiciel'], 'mots-clés absents du CV et doublons retirés');
  resetAi();
});

test('[V2] aucun point fort vérifiable : nouvelle tentative puis erreur, crédit rendu', async () => {
  resetAi();
  await t.seedUser({ id: 'v2_user_02', email: 'v2b@test.invalid', balance: 2 });
  const tok = await t.makeToken('v2_user_02', 'v2b@test.invalid');
  t.state.anthropicRaw = JSON.stringify({ criteria: v2crit(3), strongPoints: [{ point: 'Inventé', preuve: 'texte qui ne figure nulle part' }], improvements: [], swissAdvice: 'x', keywords: [] });
  const r = await t.call('POST', '/analyze-cv-text', { token: tok, body: { cvText: CV } });
  t.state.anthropicRaw = null;
  assert.equal(r.status, 502);
  assert.equal(t.state.anthropicCalls, 4, '2 séries de 2 appels parallèles');
  assert.equal(await balance('v2_user_02'), 2);
  resetAi();
});

test('[V2] texte de CV trop court ou trop long refusé AVANT tout débit et tout appel IA', async () => {
  resetAi();
  await t.seedUser({ id: 'v2_user_03', email: 'v2c@test.invalid', balance: 2 });
  const tok = await t.makeToken('v2_user_03', 'v2c@test.invalid');
  const short = await t.call('POST', '/analyze-cv-text', { token: tok, body: { cvText: '   trop court   ' } });
  const none = await t.call('POST', '/analyze-cv-text', { token: tok, body: {} });
  const long = await t.call('POST', '/analyze-cv-text', { token: tok, body: { cvText: 'x'.repeat(30001) } });
  assert.equal(short.status, 400);
  assert.equal(none.status, 400);
  assert.equal(long.status, 413);
  assert.equal(t.state.anthropicCalls || 0, 0);
  assert.equal(await balance('v2_user_03'), 2);
  resetAi();
});

test('[V2] le CV est délimité dans le prompt et la température est fixée à 0', async () => {
  resetAi();
  await t.seedUser({ id: 'v2_user_04', email: 'v2d@test.invalid', balance: 2 });
  const tok = await t.makeToken('v2_user_04', 'v2d@test.invalid');
  t.calls.reset();
  const r = await t.call('POST', '/analyze-cv-text', { token: tok, body: { cvText: CV } });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  const sent = JSON.parse(t.state.calls.find(c => c.url.startsWith('https://api.anthropic.com')).body);
  assert.equal(sent.temperature, 0);
  assert.match(sent.messages[0].content, /<cv>\n[\s\S]*\n<\/cv>/);
  resetAi();
});

test('[V2] deux analyses en parallèle : la note de chaque critère est moyennée, le score recalculé', async () => {
  resetAi();
  await t.seedUser({ id: 'v2_user_05', email: 'v2e@test.invalid', balance: 2 });
  const tok = await t.makeToken('v2_user_05', 'v2e@test.invalid');
  const raw = k => JSON.stringify({ criteria: v2crit(k), strongPoints: [{ point: 'Profil d\'ingénieur logiciel', preuve: 'ingénieur logiciel' }], improvements: ['Détailler les projets'], swissAdvice: 'Conseil.', keywords: [] });
  Object.defineProperty(t.state, 'anthropicRaw', { configurable: true, get() { return t.state.anthropicCalls === 1 ? raw(2) : raw(3); } });
  const r = await t.call('POST', '/analyze-cv-text', { token: tok, body: { cvText: CV } });
  delete t.state.anthropicRaw;
  t.state.anthropicRaw = null;
  assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.equal(t.state.anthropicCalls, 2);
  assert.equal(r.data.analysis.analysisRuns, 2);
  assert.equal(r.data.analysis.criteria[0].note, 2.5);
  assert.equal(r.data.analysis.score, 63, 'moyenne 2,5/4 sur tous les critères = 62,5 arrondi');
  assert.equal(await balance('v2_user_05'), 1, 'toujours 1 seul crédit');
  resetAi();
});
