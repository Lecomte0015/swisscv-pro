// Non-régression du suivi marketing (étapes A à E de l'audit du 11.10.2026) après les correctifs de facturation
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { createEnv, stripeObjects, SECRETS } from './harness.mjs';

function adminJwt(userId, email) {
  const b64 = x => Buffer.from(x).toString('base64');
  const h = b64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const p = b64(JSON.stringify({ userId, email, adm: 1, role: 'admin', exp: Math.floor(Date.now() / 1000) + 3600 }));
  return h + '.' + p + '.' + crypto.createHmac('sha256', SECRETS.JWT_SECRET).update(h + '.' + p).digest('base64');
}

let t;
before(async () => { t = await createEnv(); });
after(async () => { await t.close(); });

test('[MARKETING] inscription : source/UTM enregistrées (normalisées) + événement signup', async () => {
  const r = await t.call('POST', '/auth/signup', { body: {
    email: 'attr1@test.invalid', password: 'x'.repeat(12),
    attribution: { utm_source: 'Facebook', utm_medium: 'Social', utm_campaign: 'Post Emploi', referrer_host: 'l.facebook.com', landing_path: '/pricing?secret=1' }
  } });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  const u = await t.q("SELECT first_source, first_medium, first_campaign, first_referrer_host, first_landing_path FROM users WHERE email = 'attr1@test.invalid'");
  assert.deepEqual({ ...u }, { first_source: 'facebook', first_medium: 'social', first_campaign: 'post emploi', first_referrer_host: 'l.facebook.com', first_landing_path: '/pricing' });
  assert.equal((await t.qa("SELECT * FROM funnel_events WHERE event_type = 'signup'")).length >= 1, true);
});

test('[MARKETING] attribution malformée ou hostile : inscription réussie, valeurs assainies', async () => {
  const r = await t.call('POST', '/auth/signup', { body: { email: 'attr2@test.invalid', password: 'x'.repeat(12), attribution: { utm_source: '<script>alert(1)</script>', referrer_host: 'a'.repeat(500), landing_path: 42 } } });
  assert.equal(r.status, 200);
  const u = await t.q("SELECT first_source, first_referrer_host, first_landing_path FROM users WHERE email = 'attr2@test.invalid'");
  assert.doesNotMatch(String(u.first_source), /[<>()]/);
  assert.ok(String(u.first_referrer_host || '').length <= 80);
  const r2 = await t.call('POST', '/auth/signup', { body: { email: 'attr3@test.invalid', password: 'x'.repeat(12), attribution: 'pas un objet' } });
  assert.equal(r2.status, 200);
  assert.equal((await t.q("SELECT first_source FROM users WHERE email = 'attr3@test.invalid'")).first_source, 'direct');
});

test('[MARKETING] /track : liste blanche, dédoublonnage, jamais d\'événement d\'achat venant du navigateur', async () => {
  const body = { event_type: 'pricing_viewed', anon_id: 'regression-anon-0001' };
  assert.equal((await t.call('POST', '/track', { body })).data.success, true);
  assert.equal((await t.call('POST', '/track', { body })).data.deduped, true);
  for (const bad of ['purchase', 'purchased', 'checkout_completed', 'signup', 'first_analysis']) {
    assert.equal((await t.call('POST', '/track', { body: { event_type: bad, anon_id: 'regression-anon-0001' } })).status, 400, bad);
  }
  assert.equal((await t.qa("SELECT * FROM funnel_events WHERE anon_id = 'regression-anon-0001'")).length, 1);
});

test('[MARKETING] /admin/metrics : conversion = clients Stripe réels / inscrits réels (internes et bannis exclus)', async () => {
  await t.seedUser({ id: 'm_admin', tier: 'premium', internal: true });
  await t.seedUser({ id: 'm_sys', internal: true });
  await t.seedUser({ id: 'm_cust1', tier: 'premium', sub: 'sub_m1', customer: 'cus_m1' });
  await t.seedUser({ id: 'm_cust2', tier: 'premium', sub: 'sub_m2', customer: 'cus_m2' });
  for (let i = 0; i < 6; i++) await t.seedUser({ id: 'm_free' + i });
  await t.DB.prepare("UPDATE users SET deleted_at = unixepoch() WHERE id = 'm_free5'").run();
  const real = (await t.q("SELECT COUNT(*) AS n FROM users WHERE is_internal = 0 AND deleted_at IS NULL")).n;
  await t.DB.prepare("UPDATE users SET role = 'admin' WHERE id = 'm_admin'").run();
  const r = await t.call('GET', '/admin/metrics', { token: adminJwt('m_admin', 'm_admin@test.invalid') });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.equal(r.data.paying_customers, 2);
  assert.equal(r.data.real_users, real);
  assert.equal(r.data.conversion_rate, Math.round(2 / real * 1000) / 10);
  assert.equal(r.data.mrr, 18);
  assert.equal(r.data.churn_rate, null);
});

test('[MARKETING] registre : paiement + résiliation enregistrés sans doublon, sans affecter les droits', async () => {
  await t.seedUser({ id: 'm_ledger', customer: 'cus_m_ledger' });
  await t.webhook('customer.subscription.created', stripeObjects.subscription({ id: 'sub_m_ledger', customer: 'cus_m_ledger' }), { id: 'evt_m_created' });
  await t.webhook('customer.subscription.created', stripeObjects.subscription({ id: 'sub_m_ledger', customer: 'cus_m_ledger' }), { id: 'evt_m_created' });
  await t.webhook('invoice.paid', stripeObjects.invoice({ id: 'in_m1', customer: 'cus_m_ledger', subscription: 'sub_m_ledger' }), { id: 'evt_m_paid' });
  await t.webhook('customer.subscription.deleted', stripeObjects.subscription({ id: 'sub_m_ledger', customer: 'cus_m_ledger', status: 'canceled' }), { id: 'evt_m_del' });
  assert.deepEqual((await t.qa("SELECT event FROM subscription_events WHERE user_id = 'm_ledger' ORDER BY rowid")).map(e => e.event), ['created', 'canceled']);
  assert.equal((await t.qa("SELECT * FROM payments WHERE user_id = 'm_ledger'")).length, 1);
  assert.equal((await t.userRow('m_ledger')).subscription_tier, 'free');
});

test('[MARKETING] paiements de crédits / Pack : une ligne de registre par achat confirmé, aucune pour un achat refusé', async () => {
  await t.seedUser({ id: 'm_buy', customer: 'cus_m_buy' });
  await t.webhook('checkout.session.completed', stripeObjects.creditSession({ id: 'cs_test_mbuy_0001', user_id: 'm_buy', customer: 'cus_m_buy' }));
  await t.webhook('checkout.session.completed', stripeObjects.creditSession({ id: 'cs_test_mbuy_0002', user_id: 'm_buy', customer: 'cus_m_buy', credits: 30, amount_total: 200 }));
  const rows = await t.qa("SELECT kind, amount FROM payments WHERE user_id = 'm_buy'");
  assert.ok(rows.some(r => r.kind === 'credit_purchase' && r.amount === 500));
});

test('[MARKETING] registre : une session annoncée par plusieurs événements (completed + async + rejeux) = UN seul paiement', async () => {
  await t.seedUser({ id: 'm_dupe', customer: 'cus_m_dupe' });
  const obj = stripeObjects.creditSession({ id: 'cs_test_mdupe_0001', user_id: 'm_dupe', customer: 'cus_m_dupe' });
  await t.webhook('checkout.session.completed', obj);
  await t.webhook('checkout.session.async_payment_succeeded', obj);
  await Promise.all(Array.from({ length: 6 }, () => t.webhook('checkout.session.completed', obj)));
  assert.equal((await t.qa("SELECT * FROM payments WHERE user_id = 'm_dupe'")).length, 1);
  const pack = stripeObjects.packSession({ id: 'cs_test_mdupe_pack', user_id: 'm_dupe', customer: 'cus_m_dupe' });
  await t.webhook('checkout.session.completed', pack);
  await t.webhook('checkout.session.async_payment_succeeded', pack);
  assert.equal((await t.qa("SELECT * FROM payments WHERE user_id = 'm_dupe' AND kind = 'job_pack'")).length, 1);
});
