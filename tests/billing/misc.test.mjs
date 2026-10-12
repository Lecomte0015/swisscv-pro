// Alerte double abonnement, route des rappels, en-têtes de sécurité
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createEnv, stripeObjects, PRICE_PRO } from './harness.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
let t;
before(async () => { t = await createEnv(); });
after(async () => { await t.close(); });

test('[DOUBLE ABO] un second abonnement actif sur un compte déjà abonné déclenche une alerte administrateur (rien n\'est résilié)', async () => {
  await t.seedUser({ id: 'dbl_user_01', customer: 'cus_dbl1', sub: 'sub_dbl_A', tier: 'premium', limit: 100, balance: 100 });
  t.calls.reset();
  await t.webhook('customer.subscription.created', stripeObjects.subscription({ id: 'sub_dbl_B', customer: 'cus_dbl1', price: PRICE_PRO }));
  const alerts = t.calls.emails().filter(c => /Double abonnement/.test(c.body));
  assert.equal(alerts.length, 1, 'une alerte attendue');
  assert.match(alerts[0].body, /sub_dbl_A/);
  assert.match(alerts[0].body, /sub_dbl_B/);
  const u = await t.userRow('dbl_user_01');
  assert.equal(u.subscription_tier, 'pro');
  assert.equal(u.stripe_subscription_id, 'sub_dbl_B');
  assert.ok(!t.state.calls.some(c => c.url.includes('api.stripe.com') && c.method === 'DELETE'), 'aucune résiliation automatique côté Stripe');
});

test('[DOUBLE ABO] mises à jour du même abonnement : aucune alerte', async () => {
  await t.seedUser({ id: 'dbl_user_02', customer: 'cus_dbl2', sub: 'sub_dbl_C', tier: 'premium', limit: 100, balance: 100 });
  t.calls.reset();
  for (let i = 0; i < 3; i++) await t.webhook('customer.subscription.updated', stripeObjects.subscription({ id: 'sub_dbl_C', customer: 'cus_dbl2' }));
  assert.equal(t.calls.emails().filter(c => /Double abonnement/.test(c.body)).length, 0);
});

test('[RAPPELS] /job-tracker/reminders : uniquement mes candidatures actives avec rappel échu ou proche, triées', async () => {
  await t.seedUser({ id: 'rem_user_01', email: 'rem1@test.invalid' });
  await t.seedUser({ id: 'rem_user_02', email: 'rem2@test.invalid' });
  const now = Math.floor(Date.now() / 1000);
  const ins = (id, uid, status, reminder, deleted = null) => t.DB.prepare('INSERT INTO job_applications (id, user_id, job_title, company, status, reminder_date, deleted_at) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(id, uid, 'Poste ' + id, 'ACME', status, reminder, deleted).run();
  await ins('a1', 'rem_user_01', 'postule', now - 86400);
  await ins('a2', 'rem_user_01', 'entretien', now + 3 * 86400);
  await ins('a3', 'rem_user_01', 'postule', now + 30 * 86400);
  await ins('a4', 'rem_user_01', 'refuse', now - 86400);
  await ins('a5', 'rem_user_01', 'postule', now - 86400, now);
  await ins('a6', 'rem_user_01', 'postule', null);
  await ins('b1', 'rem_user_02', 'postule', now - 86400);
  const tok = await t.makeToken('rem_user_01', 'rem1@test.invalid');
  const r = await t.call('GET', '/job-tracker/reminders', { token: tok });
  assert.equal(r.status, 200);
  assert.deepEqual(r.data.reminders.map(x => x.id), ['a1', 'a2']);
  assert.equal((await t.call('GET', '/job-tracker/reminders')).status, 401);
});

test('[EN-TÊTES] _headers : protections de base présentes, règles existantes conservées', () => {
  const h = fs.readFileSync(path.join(root, '_headers'), 'utf8');
  for (const needle of ['X-Content-Type-Options: nosniff', 'X-Frame-Options: SAMEORIGIN', 'Referrer-Policy: strict-origin-when-cross-origin', 'Permissions-Policy:', 'Strict-Transport-Security: max-age=31536000', '/templates/*.jpg']) {
    assert.ok(h.includes(needle), needle);
  }
});

test('[CONFIG] wrangler.toml : plus aucune configuration active ne pointe vers la base de production hors configuration principale', () => {
  const toml = fs.readFileSync(path.join(root, 'wrangler.toml'), 'utf8');
  const active = toml.split('\n').filter(l => !l.trim().startsWith('#'));
  assert.equal(active.filter(l => /database_id\s*=\s*"b3ec1eb9/.test(l)).length, 1, 'un seul database_id actif (la configuration principale)');
  assert.ok(!active.some(l => /\[env\./.test(l)), 'aucun environnement secondaire actif');
});
