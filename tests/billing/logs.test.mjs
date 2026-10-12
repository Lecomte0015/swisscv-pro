// Journaux : ni clé secrète ni adresse email complète pendant les flux de paiement et d'inscription
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createEnv, stripeObjects, SECRETS } from './harness.mjs';

let t;
before(async () => { t = await createEnv(); });
after(async () => { await t.close(); });

test('[LOGS] aucun secret ni email complet dans les journaux (achat, abonnement, facture, inscription, rejet de signature)', async () => {
  const captured = [];
  const orig = { log: console.log, error: console.error, warn: console.warn, info: console.info };
  for (const k of Object.keys(orig)) console[k] = (...a) => captured.push(a.map(x => (typeof x === 'string' ? x : JSON.stringify(x))).join(' '));
  try {
    await t.seedUser({ id: 'log_user_01', email: 'jean.dupont.logtest@test.invalid', customer: 'cus_log1' });
    await t.webhook('checkout.session.completed', { ...stripeObjects.creditSession({ id: 'cs_test_log_0001', user_id: 'log_user_01', customer: 'cus_log1' }), customer_email: 'jean.dupont.logtest@test.invalid' });
    await t.webhook('customer.subscription.created', stripeObjects.subscription({ id: 'sub_log1', customer: 'cus_log1' }));
    await t.webhook('invoice.paid', stripeObjects.invoice({ id: 'in_log1', customer: 'cus_log1', subscription: 'sub_log1' }));
    await t.webhook('checkout.session.completed', stripeObjects.creditSession({ id: 'cs_test_log_0002', user_id: 'log_user_01', customer: 'cus_log1', amount_total: 1 }));
    await t.webhook('invoice.paid', stripeObjects.invoice({ id: 'in_log2' }), { signature: 't=1,v1=bad' });
    await t.call('POST', '/auth/signup', { body: { email: 'nouveau.client.logtest@test.invalid', password: 'MotDePasse-Secret-123' } });
  } finally {
    Object.assign(console, orig);
  }
  const all = captured.join('\n');
  assert.ok(all.length > 0, 'des journaux doivent exister');
  for (const secret of Object.values(SECRETS)) assert.ok(!all.includes(secret), 'secret présent dans les logs');
  assert.ok(!all.includes('MotDePasse-Secret-123'), 'mot de passe présent dans les logs');
  assert.ok(!/jean\.dupont\.logtest@test\.invalid/.test(all), 'email complet (achat) dans les logs');
  assert.ok(!/nouveau\.client\.logtest@test\.invalid/.test(all), 'email complet (inscription) dans les logs');
});
