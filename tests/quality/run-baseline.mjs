// Mesure de la qualité de l'analyse de CV sur le jeu synthétique (cv-set.mjs).
// Exécute le VRAI Worker (index.js) avec une base D1 locale ; seul l'appel Anthropic part sur le réseau (en mode réel).
// Stripe, Resend et Supabase restent simulés. Aucune donnée n'est écrite en production.
//
//   node tests/quality/run-baseline.mjs --dry              vérifie la chaîne sans appel payant (réponse IA simulée)
//   node tests/quality/run-baseline.mjs                    20 CV + reproductibilité (5 CV × 3) ≈ 30 appels IA
//   node tests/quality/run-baseline.mjs --only=cv01,cv07   sous-ensemble, sans reproductibilité
//   options : --no-repeat · --label=avant-v2
//
// La clé est lue dans .dev.vars (ANTHROPIC_API_KEY=...), fichier gitignoré ; elle n'est jamais affichée ni écrite.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createEnv } from '../billing/harness.mjs';
import { CV_SET, REPEAT_IDS } from './cv-set.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v === undefined ? true : v]; }));
const DRY = !!args.dry;
const only = args.only ? String(args.only).split(',') : null;
const doRepeat = !args['no-repeat'] && !only;
const label = args.label || (DRY ? 'dry' : 'baseline');
const out = (s) => process.stdout.write(s + '\n');

function readKey() {
  const f = path.join(root, '.dev.vars');
  if (!fs.existsSync(f)) return null;
  const line = fs.readFileSync(f, 'utf8').split('\n').find(l => /^ANTHROPIC_API_KEY\s*=/.test(l));
  if (!line) return null;
  const v = line.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '');
  return v || null;
}

const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const anyMatch = (text, patterns) => patterns.some(p => new RegExp(p, 'i').test(text));

// Chiffres de l'analyse absents du CV (indice d'invention, à vérifier à la main)
function foreignNumbers(analysisText, cvText) {
  const cvNums = new Set((norm(cvText).match(/\d+(?:[.,]\d+)?/g) || []).map(n => n.replace(',', '.')));
  const found = (norm(analysisText).match(/\d+(?:[.,]\d+)?/g) || []).map(n => n.replace(',', '.'));
  const ignore = new Set(['0', '1', '2', '3', '100']);
  return [...new Set(found.filter(n => !cvNums.has(n) && !ignore.has(n)))];
}

function check(cv, a) {
  const strong = norm((a.strongPoints || []).join(' \n '));
  const adv = norm((a.improvements || []).join(' \n ') + ' \n ' + (a.swissAdvice || ''));
  const all = strong + ' \n ' + adv + ' \n ' + norm((a.keywords || []).join(' '));
  const defects = cv.defects.map(d => ({ id: d.id, desc: d.desc, detected: anyMatch(adv, d.patterns) }));
  const qualities = cv.qualities.map(q => ({ id: q.id, desc: q.desc, recognised: anyMatch(strong, q.patterns) }));
  const forbidden = cv.forbidden.filter(f => f.patterns.length && anyMatch(all, f.patterns)).map(f => ({ desc: f.desc, critical: !!f.critical }));
  const [lo, hi] = cv.scoreBand;
  return {
    defects, qualities, forbidden,
    scoreOutOfBand: typeof a.score === 'number' && (a.score < lo || a.score > hi),
    foreignNumbers: foreignNumbers(strong + ' ' + adv, cv.text),
    keywordsNotInCv: (a.keywords || []).filter(k => !norm(cv.text).includes(norm(k))),
    photoEcho: a.hasPhoto === cv.hasPhoto
  };
}

const FAKE = JSON.stringify({ score: 60, atsScore: 55, hasPhoto: false, strongPoints: ['Réponse simulée (mode --dry)'], improvements: ['Réponse simulée : aucun appel IA réel'], swissAdvice: 'Réponse simulée.', keywords: ['simulation'] });

async function main() {
  const key = DRY ? null : readKey();
  if (!DRY && !key) {
    out('BLOQUÉ : ANTHROPIC_API_KEY absente de .dev.vars. Ajoutez la ligne ANTHROPIC_API_KEY=... dans ce fichier (gitignoré), puis relancez.');
    process.exit(2);
  }
  const nodeFetch = globalThis.fetch;
  const t = await createEnv();
  if (DRY) t.state.anthropicRaw = FAKE;
  else {
    t.env.ANTHROPIC_API_KEY = key;
    const fake = globalThis.fetch;
    globalThis.fetch = (input, init) => {
      const url = typeof input === 'string' ? input : input.url;
      return url.startsWith('https://api.anthropic.com/') ? nodeFetch(input, init) : fake(input, init);
    };
  }
  await t.seedUser({ id: 'quality-runner', email: 'quality-runner@test.invalid', balance: 10000, limit: 10000, internal: true });
  const token = await t.makeToken('quality-runner', 'quality-runner@test.invalid');

  const cvs = CV_SET.filter(c => !only || only.includes(c.id));
  const jobs = [];
  for (const cv of cvs) {
    const runs = doRepeat && REPEAT_IDS.includes(cv.id) ? 3 : 1;
    for (let r = 1; r <= runs; r++) jobs.push({ cv, run: r });
  }
  out('Mesure « ' + label + ' » : ' + jobs.length + ' analyses (' + cvs.length + ' CV' + (doRepeat ? ', reproductibilité sur ' + REPEAT_IDS.length + ' CV × 3' : '') + ')' + (DRY ? ' — MODE SIMULÉ, aucun appel payant' : ''));

  const results = [];
  let next = 0;
  async function worker() {
    while (next < jobs.length) {
      const job = jobs[next++];
      const t0 = Date.now();
      const r = await t.call('POST', '/analyze-cv-text', { token, body: { cvText: job.cv.text, hasPhoto: job.cv.hasPhoto, filename: job.cv.id + '.pdf' } });
      const ms = Date.now() - t0;
      const a = r.data && r.data.analysis;
      results.push({ id: job.cv.id, run: job.run, status: r.status, ms, analysis: a || null, error: a ? null : (r.data && r.data.error) || 'réponse vide', checks: a ? check(job.cv, a) : null });
      out('  ' + job.cv.id + ' #' + job.run + ' → ' + r.status + (a ? ' score ' + a.score + ' / ATS ' + a.atsScore : ' ÉCHEC') + ' (' + Math.round(ms / 1000) + ' s)');
    }
  }
  await Promise.all([worker(), worker(), worker()]);
  results.sort((x, y) => x.id.localeCompare(y.id) || x.run - y.run);

  const usage = await t.q('SELECT COUNT(*) AS n, COALESCE(SUM(tokens_used),0) AS tokens, COALESCE(SUM(cost_estimate),0) AS cost FROM ai_usage');
  await t.close();

  const dir = path.join(here, 'results', new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-') + '-' + label);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'raw.json'), JSON.stringify({ label, dry: DRY, model: 'claude-sonnet-4-6 (index.js)', usage, results }, null, 2));
  fs.writeFileSync(path.join(dir, 'report.md'), report(cvs, results, usage));
  out('\nRésultats : ' + path.relative(root, dir) + '/report.md (appels IA : ' + usage.n + ', coût estimé : ' + Number(usage.cost).toFixed(3) + ' USD)');
}

function report(cvs, results, usage) {
  const L = [];
  L.push('# Mesure de la qualité de l\'analyse — ' + label + (DRY ? ' (MODE SIMULÉ : résultats sans valeur)' : ''));
  L.push('');
  L.push('CV **synthétiques** uniquement (voir `tests/quality/cv-set.mjs`). Le pré-tri ci-dessous est automatique (mots-clés) : la note se fait à la main avec `tests/quality/rubric.md`.');
  L.push('');
  L.push('Appels IA : ' + usage.n + ' · jetons : ' + usage.tokens + ' · coût estimé : ' + Number(usage.cost).toFixed(3) + ' USD');
  L.push('');
  const firsts = results.filter(r => r.run === 1);
  const ok = firsts.filter(r => r.analysis);
  const defects = ok.flatMap(r => r.checks.defects);
  const quals = ok.flatMap(r => r.checks.qualities);
  const crit = ok.filter(r => r.checks.forbidden.some(f => f.critical));
  L.push('## Synthèse automatique (1re exécution de chaque CV)');
  L.push('');
  L.push('| Indicateur | Valeur |');
  L.push('|---|---|');
  L.push('| Analyses réussies | ' + ok.length + ' / ' + firsts.length + ' |');
  L.push('| Défauts placés repérés (mots-clés) | ' + defects.filter(d => d.detected).length + ' / ' + defects.length + ' |');
  L.push('| Qualités reconnues (mots-clés) | ' + quals.filter(q => q.recognised).length + ' / ' + quals.length + ' |');
  L.push('| CV avec motif d\'erreur critique | ' + crit.length + (crit.length ? ' (' + crit.map(r => r.id).join(', ') + ')' : '') + ' |');
  L.push('| Score hors fourchette indicative | ' + ok.filter(r => r.checks.scoreOutOfBand).map(r => r.id).join(', ') + ' |');
  L.push('| hasPhoto conforme à la saisie | ' + ok.filter(r => r.checks.photoEcho).length + ' / ' + ok.length + ' |');
  L.push('');

  const reps = REPEAT_IDS.map(id => results.filter(r => r.id === id && r.analysis)).filter(g => g.length > 1);
  if (reps.length) {
    L.push('## Reproductibilité (même CV, plusieurs exécutions)');
    L.push('');
    L.push('| CV | Scores | Écart score | Scores ATS | Écart ATS |');
    L.push('|---|---|---|---|---|');
    for (const g of reps) {
      const s = g.map(r => r.analysis.score), a = g.map(r => r.analysis.atsScore);
      L.push('| ' + g[0].id + ' | ' + s.join(' · ') + ' | ' + (Math.max(...s) - Math.min(...s)) + ' | ' + a.join(' · ') + ' | ' + (Math.max(...a) - Math.min(...a)) + ' |');
    }
    L.push('');
    L.push('Comparer aussi à la main la **première amélioration** de chaque exécution (détail par CV ci-dessous).');
    L.push('');
  }

  L.push('## Détail par CV');
  for (const cv of cvs) {
    const runs = results.filter(r => r.id === cv.id);
    L.push('');
    L.push('### ' + cv.id + ' — ' + cv.label + (cv.hasPhoto ? ' (photo déclarée)' : ''));
    for (const r of runs) {
      L.push('');
      if (!r.analysis) { L.push('**Exécution ' + r.run + ' : ÉCHEC** (' + r.status + ') ' + r.error); continue; }
      const a = r.analysis, c = r.checks;
      L.push('**Exécution ' + r.run + '** — score ' + a.score + ' (fourchette indicative ' + cv.scoreBand.join('-') + ') · ATS ' + a.atsScore + ' · ' + Math.round(r.ms / 1000) + ' s');
      if (r.run > 1) { L.push('- 1re amélioration : ' + (a.improvements[0] || '')); continue; }
      L.push('');
      L.push('Points forts :'); a.strongPoints.forEach(p => L.push('- ' + p));
      L.push(''); L.push('Améliorations :'); a.improvements.forEach(p => L.push('- ' + p));
      L.push(''); L.push('Conseils suisses : ' + a.swissAdvice);
      L.push(''); L.push('Mots-clés : ' + (a.keywords || []).join(', '));
      L.push('');
      L.push('Pré-tri : défauts ' + c.defects.map(d => (d.detected ? '✔ ' : '✘ ') + d.desc).join(' · ') +
        (c.qualities.length ? ' | qualités ' + c.qualities.map(q => (q.recognised ? '✔ ' : '✘ ') + q.desc).join(' · ') : ''));
      if (c.forbidden.length) L.push('⚠️ Motifs interdits trouvés : ' + c.forbidden.map(f => (f.critical ? '[CRITIQUE] ' : '') + f.desc).join(' · ') + ' — à confirmer à la lecture');
      if (c.foreignNumbers.length) L.push('Chiffres absents du CV (vérifier qu\'ils ne sont pas inventés) : ' + c.foreignNumbers.join(', '));
      if (c.keywordsNotInCv.length) L.push('Mots-clés absents du texte du CV : ' + c.keywordsNotInCv.join(', '));
      L.push('');
      L.push('Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non');
    }
  }
  return L.join('\n') + '\n';
}

main().catch(e => { process.stderr.write('Erreur : ' + (e && e.stack || e) + '\n'); process.exit(1); });
