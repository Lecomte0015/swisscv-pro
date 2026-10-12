// Recherche d'offres : RapidAPI n'est appelé que si une clé est configurée ; Adzuna reste la source de repli
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createEnv } from './harness.mjs';

let t;
before(async () => { t = await createEnv(); });
after(async () => { await t.close(); });

const rapidCalls = () => t.state.calls.filter(c => /rapidapi\.com/.test(c.url));
const adzunaCalls = () => t.state.calls.filter(c => /api\.adzuna\.com/.test(c.url));

test('[OFFRES] sans clé RapidAPI : aucune requête vers RapidAPI, Adzuna est interrogé', async () => {
  delete t.env.RAPIDAPI_KEY;
  t.calls.reset();
  const r = await t.call('GET', '/jobs/search?what=ingenieur&where=Geneve');
  assert.equal(r.status, 200, JSON.stringify(r.data).slice(0, 150));
  assert.equal(rapidCalls().length, 0, 'RapidAPI ne doit pas être appelé');
  assert.ok(adzunaCalls().length >= 1, 'Adzuna doit être interrogé');
});

test('[OFFRES] avec une clé RapidAPI configurée : les sources RapidAPI sont de nouveau appelées', async () => {
  t.env.RAPIDAPI_KEY = 'cle-de-test';
  t.calls.reset();
  const r = await t.call('GET', '/jobs/search?what=ingenieur&where=Geneve');
  delete t.env.RAPIDAPI_KEY;
  assert.equal(r.status, 200);
  assert.ok(rapidCalls().length >= 1, 'RapidAPI doit être appelé quand une clé existe');
});

test('[OFFRES] la clé n\'est envoyée qu\'à RapidAPI, jamais à un autre service', async () => {
  t.env.RAPIDAPI_KEY = 'cle-de-test-unique-123';
  t.calls.reset();
  await t.call('GET', '/jobs/search?what=comptable&where=Zurich');
  delete t.env.RAPIDAPI_KEY;
  const leaked = t.state.calls.filter(c => !/rapidapi\.com/.test(c.url) && JSON.stringify(c).includes('cle-de-test-unique-123'));
  assert.equal(leaked.length, 0);
});
