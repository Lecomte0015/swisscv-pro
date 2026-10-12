// Parcours d'achat Premium : mémorisation du plan choisi (checkout-intent.js) — logique pure, sans réseau
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const src = fs.readFileSync(path.resolve(here, '../../checkout-intent.js'), 'utf8');

function makeEnv(search = '', { broken = false } = {}) {
  const data = {};
  const localStorage = broken ? { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); }, removeItem() { throw new Error('blocked'); } } : {
    getItem: k => (k in data ? data[k] : null), setItem: (k, v) => { data[k] = String(v); }, removeItem: k => { delete data[k]; }
  };
  const window = { localStorage, location: { search } };
  new Function('window', src)(window);
  return { intent: window.swisscvIntent, data, window };
}
const KEY = 'swisscv_pending_plan';

test('[PARCOURS] ?plan=premium et ?plan=pro sont mémorisés', () => {
  for (const plan of ['premium', 'pro']) {
    const { intent } = makeEnv('?plan=' + plan);
    assert.equal(intent.captureFromUrl(), plan);
    assert.equal(intent.get(), plan);
  }
});

test('[NÉGATIF] valeurs hors liste blanche ignorées (enterprise, majuscules, script, vide, doublon)', () => {
  for (const q of ['?plan=enterprise', '?plan=PREMIUM', '?plan=%3Cscript%3E', '?plan=', '?plan=premium%20', '?x=1', '', '?plan[]=pro']) {
    const { intent, data } = makeEnv(q);
    assert.equal(intent.captureFromUrl(), null, q);
    assert.equal(intent.get(), null);
    assert.equal(data[KEY], undefined);
  }
});

test('[PARCOURS] un plan expiré (> 48 h) ou corrompu est ignoré et supprimé', () => {
  const { intent, data } = makeEnv('?plan=premium');
  intent.captureFromUrl();
  data[KEY] = JSON.stringify({ plan: 'premium', ts: Date.now() - 49 * 3600 * 1000 });
  assert.equal(intent.get(), null);
  assert.equal(data[KEY], undefined);
  data[KEY] = '{pas du json';
  assert.equal(intent.get(), null);
  data[KEY] = JSON.stringify({ plan: 'admin', ts: Date.now() });
  assert.equal(intent.get(), null, 'plan inconnu injecté dans le stockage');
});

test('[PARCOURS] après connexion : un compte gratuit va au paiement du plan choisi, les autres vont à leur page habituelle', () => {
  const free = makeEnv('?plan=premium'); free.intent.captureFromUrl();
  assert.equal(free.intent.nextPage('dashboard.html', 'free'), 'credits.html?checkout=premium');
  assert.equal(free.intent.nextPage('app.html', undefined), 'credits.html?checkout=premium', 'tier inconnu = gratuit');

  const already = makeEnv('?plan=premium'); already.intent.captureFromUrl();
  assert.equal(already.intent.nextPage('dashboard.html', 'premium'), 'dashboard.html', 'déjà Premium');
  assert.equal(already.intent.get(), null, 'intention consommée');

  const higher = makeEnv('?plan=premium'); higher.intent.captureFromUrl();
  assert.equal(higher.intent.nextPage('dashboard.html', 'pro'), 'dashboard.html', 'déjà Pro');

  const upgrade = makeEnv('?plan=pro'); upgrade.intent.captureFromUrl();
  assert.equal(upgrade.intent.nextPage('dashboard.html', 'premium'), 'credits.html?checkout=pro', 'Premium → Pro autorisé');

  const none = makeEnv('');
  assert.equal(none.intent.nextPage('app.html', 'free'), 'app.html', 'aucune intention : parcours inchangé');
});

test('[NÉGATIF] stockage bloqué (navigation privée stricte) : aucune exception, parcours normal', () => {
  const { intent } = makeEnv('?plan=premium', { broken: true });
  assert.equal(intent.captureFromUrl(), null);
  assert.equal(intent.get(), null);
  assert.equal(intent.nextPage('app.html', 'free'), 'app.html');
  intent.clear();
});

test('[PARCOURS] la destination est toujours une page interne fixe (pas de redirection ouverte)', () => {
  const { intent, data } = makeEnv('?plan=premium');
  intent.captureFromUrl();
  data[KEY] = JSON.stringify({ plan: 'premium', ts: Date.now(), next: 'https://evil.example' });
  assert.equal(intent.nextPage('app.html', 'free'), 'credits.html?checkout=premium');
});
