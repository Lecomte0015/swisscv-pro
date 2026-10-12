// Limites de débit : routes publiques sensibles
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createEnv } from './harness.mjs';

let t;
before(async () => { t = await createEnv(); });
after(async () => { await t.close(); });
const ip = n => ({ 'CF-Connecting-IP': n });

test('[DÉBIT] inscription : la 6e requête de la même IP en 1 h est refusée (429 + Retry-After), une autre IP passe', async () => {
  const codes = [];
  for (let i = 0; i < 7; i++) codes.push((await t.call('POST', '/auth/signup', { headers: ip('203.0.113.10'), body: { email: 'rl' + i + '@test.invalid', password: 'x'.repeat(12) } })).status);
  assert.deepEqual(codes.map(c => c === 429), [false, false, false, false, false, true, true], codes.join(','));
  const other = await t.call('POST', '/auth/signup', { headers: ip('203.0.113.11'), body: { email: 'rl-autre@test.invalid', password: 'x'.repeat(12) } });
  assert.notEqual(other.status, 429);
  const limited = await t.call('POST', '/auth/signup', { headers: ip('203.0.113.10'), body: { email: 'rl9@test.invalid', password: 'x'.repeat(12) } });
  assert.equal(limited.status, 429);
  assert.ok(limited.data.retry_after >= 1 && limited.data.retry_after <= 3600);
});

test('[DÉBIT] connexion admin : 9e tentative en 15 min refusée (protège contre l\'essai de mots de passe)', async () => {
  const codes = [];
  for (let i = 0; i < 10; i++) codes.push((await t.call('POST', '/admin/login', { headers: ip('203.0.113.20'), body: { email: 'admin@test.invalid', password: 'faux' } })).status);
  assert.equal(codes.filter(c => c === 429).length, 2, codes.join(','));
  assert.equal(codes[7] === 429, false);
  assert.equal(codes[8], 429);
});

test('[DÉBIT] formulaires publics : feedback (10/h), contact (5/h), tickets (10/h), /track (120/min)', async () => {
  const feed = []; for (let i = 0; i < 12; i++) feed.push((await t.call('POST', '/feedback/submit', { headers: ip('203.0.113.30'), body: { email: 'x@test.invalid', blocker_reason: 'price' } })).status);
  assert.equal(feed.filter(c => c === 429).length, 2, feed.join(','));
  const contact = []; for (let i = 0; i < 7; i++) contact.push((await t.call('POST', '/contact', { headers: ip('203.0.113.31'), body: {} })).status);
  assert.equal(contact.filter(c => c === 429).length, 2, contact.join(','));
  const track = []; for (let i = 0; i < 125; i++) track.push((await t.call('POST', '/track', { headers: ip('203.0.113.32'), body: { event_type: 'pricing_viewed' } })).status);
  assert.equal(track.filter(c => c === 429).length, 5);
});

test('[DÉBIT] une route non listée, un GET, ou un webhook Stripe ne sont jamais limités', async () => {
  for (let i = 0; i < 60; i++) {
    assert.notEqual((await t.call('GET', '/feedback/config', { headers: ip('203.0.113.40') })).status, 429);
    assert.notEqual((await t.webhook('invoice.paid', { id: 'in_x', customer: 'c', subscription: 's', billing_reason: 'manual' })).status, 429);
  }
});

test('[DÉBIT] la fenêtre se renouvelle : après expiration le compteur repart à 1', async () => {
  for (let i = 0; i < 9; i++) await t.call('POST', '/contact', { headers: ip('203.0.113.50'), body: {} });
  assert.equal((await t.call('POST', '/contact', { headers: ip('203.0.113.50'), body: {} })).status, 429);
  await t.DB.prepare("UPDATE rate_limits SET window_start = window_start - 7200 WHERE bucket_key = 'contact:203.0.113.50'").run();
  assert.notEqual((await t.call('POST', '/contact', { headers: ip('203.0.113.50'), body: {} })).status, 429);
});

test('[DÉBIT] panne du compteur (table absente) : les requêtes passent (fail-open), rien n\'est bloqué', async () => {
  await t.DB.prepare('DROP TABLE rate_limits').run();
  for (let i = 0; i < 8; i++) assert.notEqual((await t.call('POST', '/contact', { headers: ip('203.0.113.60'), body: {} })).status, 429);
  await t.DB.prepare('CREATE TABLE rate_limits (bucket_key TEXT PRIMARY KEY, window_start INTEGER NOT NULL, count INTEGER NOT NULL)').run();
});

test('[DÉBIT] 30 requêtes simultanées de la même IP : exactement 5 acceptées (compteur atomique)', async () => {
  const rs = await Promise.all(Array.from({ length: 30 }, () => t.call('POST', '/auth/resend-confirmation', { headers: ip('203.0.113.70'), body: { email: 'z@test.invalid' } })));
  assert.equal(rs.filter(r => r.status !== 429).length, 5);
});
