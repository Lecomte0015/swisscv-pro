// Achats de crédits : création de session (prix serveur) et webhook (attribution unique et conditionnelle)
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createEnv, stripeObjects } from './harness.mjs';

let t;
before(async () => { t = await createEnv(); });
after(async () => { await t.close(); });

async function newUser(id, extra = {}) {
  await t.seedUser({ id, customer: 'cus_' + id, ...extra });
  return { id, token: await t.makeToken(id, id + '@test.invalid') };
}
const creditsOf = async id => (await t.userRow(id)).credits_balance;
const checkoutBody = (creditsPack, uid, sid, over = {}) => stripeObjects.creditSession({ id: sid, user_id: uid, customer: 'cus_' + uid, ...over, credits: creditsPack });

// ---------------------------------------------------------------- création de session
test('[CRÉDITS] session créée avec le prix et les crédits du SERVEUR pour chaque palier valide', async () => {
  const u = await newUser('c_valid');
  for (const [credits, cents] of [[5, 200], [15, 500], [30, 800]]) {
    t.calls.reset();
    const r = await t.call('POST', '/stripe/create-credit-checkout', { token: u.token, body: { credits, amount: cents } });
    assert.equal(r.status, 200, 'palier ' + credits);
    const b = t.calls.stripeCheckoutBodies()[0];
    assert.equal(b.get('line_items[0][price_data][unit_amount]'), String(cents));
    assert.equal(b.get('metadata[credits]'), String(credits));
    assert.equal(b.get('metadata[user_id]'), 'c_valid');
    assert.match(b.get('success_url'), /^https:\/\/swisscv-pro\.ch\/credits\.html\?success=true/);
    assert.match(b.get('cancel_url'), /^https:\/\/swisscv-pro\.ch\//);
    assert.equal(b.get('mode'), 'payment');
  }
});

test('[CRÉDITS] montant seul ignoré : sans "amount", le tarif serveur s\'applique', async () => {
  const u = await newUser('c_noamount');
  t.calls.reset();
  const r = await t.call('POST', '/stripe/create-credit-checkout', { token: u.token, body: { credits: 15 } });
  assert.equal(r.status, 200);
  assert.equal(t.calls.stripeCheckoutBodies()[0].get('line_items[0][price_data][unit_amount]'), '500');
});

test('[NÉGATIF] montant falsifié (30 crédits pour 1 centime) refusé, aucune session Stripe créée', async () => {
  const u = await newUser('c_tamper1');
  t.calls.reset();
  const r = await t.call('POST', '/stripe/create-credit-checkout', { token: u.token, body: { credits: 30, amount: 1 } });
  assert.equal(r.status, 400);
  assert.equal(t.calls.stripeCheckoutBodies().length, 0);
});

test('[NÉGATIF] palier inexistant / énorme refusé (10000 crédits, 1 centime)', async () => {
  const u = await newUser('c_tamper2');
  t.calls.reset();
  const r = await t.call('POST', '/stripe/create-credit-checkout', { token: u.token, body: { credits: 10000, amount: 1 } });
  assert.equal(r.status, 400);
  assert.equal(t.calls.stripeCheckoutBodies().length, 0);
});

test('[NÉGATIF] prix d\'un palier appliqué à un autre (5 crédits au prix de 30, et inversement) refusé', async () => {
  const u = await newUser('c_tamper3');
  t.calls.reset();
  assert.equal((await t.call('POST', '/stripe/create-credit-checkout', { token: u.token, body: { credits: 30, amount: 200 } })).status, 400);
  assert.equal((await t.call('POST', '/stripe/create-credit-checkout', { token: u.token, body: { credits: 5, amount: 800 } })).status, 400);
  assert.equal(t.calls.stripeCheckoutBodies().length, 0);
});

test('[NÉGATIF] quantités invalides refusées (0, négatif, décimal, texte, tableau, objet, null, absent, __proto__)', async () => {
  const u = await newUser('c_invalid');
  t.calls.reset();
  const bad = [0, -5, 1.5, '15abc', '15.0', '015', ' 15', '1e1', [15], { a: 1 }, null, undefined, true, '__proto__', 'constructor', 'toString', NaN, Infinity];
  for (const credits of bad) {
    const body = credits === undefined ? { amount: 500 } : { credits, amount: 500 };
    const r = await t.call('POST', '/stripe/create-credit-checkout', { token: u.token, body });
    assert.equal(r.status, 400, 'doit être refusé : ' + JSON.stringify(credits));
  }
  assert.equal(t.calls.stripeCheckoutBodies().length, 0);
});

test('[NÉGATIF] sans authentification : 401, avec un jeton falsifié : 401', async () => {
  assert.equal((await t.call('POST', '/stripe/create-credit-checkout', { body: { credits: 5, amount: 200 } })).status, 401);
  const u = await newUser('c_badtoken');
  const forged = u.token.slice(0, -4) + 'AAAA';
  assert.equal((await t.call('POST', '/stripe/create-credit-checkout', { token: forged, body: { credits: 5, amount: 200 } })).status, 401);
});

// ---------------------------------------------------------------- webhook : signature
test('[NÉGATIF] webhook sans signature, mauvaise signature, mauvais secret ou horodatage ancien : refusé, aucun crédit', async () => {
  const u = await newUser('w_sig');
  const obj = checkoutBody(15, 'w_sig', 'cs_test_sig_0001');
  assert.equal((await t.webhook('checkout.session.completed', obj, { signature: null })).status, 400);
  assert.equal((await t.webhook('checkout.session.completed', obj, { signature: 't=1,v1=deadbeef' })).status, 400);
  const body = JSON.stringify({ id: 'evt_x1', type: 'checkout.session.completed', data: { object: obj } });
  assert.equal((await t.webhook('checkout.session.completed', obj, { rawBody: body, signature: t.signStripe(body, { secret: 'whsec_autre' }) })).status, 400);
  assert.equal((await t.webhook('checkout.session.completed', obj, { rawBody: body, signature: t.signStripe(body, { ts: Math.floor(Date.now() / 1000) - 3600 }) })).status, 400);
  // signature valide mais corps modifié après signature
  const tampered = body.replace('"amount_total":500', '"amount_total":1');
  assert.equal((await t.webhook('checkout.session.completed', obj, { rawBody: tampered, signature: t.signStripe(body) })).status, 400);
  assert.equal(await creditsOf('w_sig'), 5);
});

// ---------------------------------------------------------------- webhook : attribution
test('[CRÉDITS] paiement confirmé et conforme : +15 crédits, transaction tracée, limite mensuelle inchangée', async () => {
  const u = await newUser('w_ok', { balance: 2 });
  const r = await t.webhook('checkout.session.completed', checkoutBody(15, 'w_ok', 'cs_test_ok_0001'));
  assert.equal(r.status, 200);
  assert.equal(await creditsOf('w_ok'), 17);
  assert.equal((await t.userRow('w_ok')).credits_monthly_limit, 5, 'un achat ne doit pas relever la limite mensuelle');
  const tx = await t.qa("SELECT * FROM credit_transactions WHERE user_id = 'w_ok'");
  assert.equal(tx.length, 1);
  assert.equal(tx[0].action_type, 'credit_purchase');
  assert.equal(tx[0].credits_before, 2);
  assert.equal(tx[0].credits_after, 17);
  assert.equal((await t.qa("SELECT * FROM processed_checkout_sessions WHERE session_id = 'cs_test_ok_0001'")).length, 1);
});

test('[NÉGATIF] même événement rejoué 3 fois : crédité une seule fois', async () => {
  await newUser('w_replay');
  const obj = checkoutBody(15, 'w_replay', 'cs_test_replay_0001');
  const first = await t.webhook('checkout.session.completed', obj, { id: 'evt_replay_same' });
  assert.equal(first.status, 200);
  await t.webhook('checkout.session.completed', obj, { id: 'evt_replay_same' });
  await t.webhook('checkout.session.completed', obj, { id: 'evt_replay_same' });
  assert.equal(await creditsOf('w_replay'), 20);
  assert.equal((await t.qa("SELECT * FROM credit_transactions WHERE user_id = 'w_replay'")).length, 1);
});

test('[NÉGATIF] même session renvoyée sous un autre identifiant d\'événement : crédité une seule fois', async () => {
  await newUser('w_replay2');
  const obj = checkoutBody(30, 'w_replay2', 'cs_test_replay_0002', { amount_total: 800 });
  await t.webhook('checkout.session.completed', obj);
  await t.webhook('checkout.session.completed', obj);
  await t.webhook('checkout.session.async_payment_succeeded', obj);
  assert.equal(await creditsOf('w_replay2'), 35);
});

test('[NÉGATIF] 8 webhooks identiques en parallèle : crédité une seule fois (pas de course)', async () => {
  await newUser('w_race');
  const obj = checkoutBody(15, 'w_race', 'cs_test_race_0001');
  await Promise.all(Array.from({ length: 8 }, () => t.webhook('checkout.session.completed', obj)));
  assert.equal(await creditsOf('w_race'), 20);
  assert.equal((await t.qa("SELECT * FROM credit_transactions WHERE user_id = 'w_race'")).length, 1);
});

test('[NÉGATIF] session falsifiée : crédits annoncés ≠ montant payé (30 crédits pour 2 CHF) : rien attribué', async () => {
  await newUser('w_forge1');
  const r = await t.webhook('checkout.session.completed', checkoutBody(30, 'w_forge1', 'cs_test_forge_0001', { amount_total: 200 }));
  assert.equal(r.status, 200, 'doit répondre 200 pour que Stripe cesse de réessayer');
  assert.equal(await creditsOf('w_forge1'), 5);
});

test('[NÉGATIF] palier inconnu dans les métadonnées (9999 crédits) : rien attribué', async () => {
  await newUser('w_forge2');
  await t.webhook('checkout.session.completed', checkoutBody(9999, 'w_forge2', 'cs_test_forge_0002', { amount_total: 500 }));
  assert.equal(await creditsOf('w_forge2'), 5);
});

test('[NÉGATIF] paiement non confirmé (unpaid) : rien ; puis confirmation asynchrone : crédité une seule fois', async () => {
  await newUser('w_async');
  await t.webhook('checkout.session.completed', checkoutBody(15, 'w_async', 'cs_test_async_0001', { payment_status: 'unpaid' }));
  assert.equal(await creditsOf('w_async'), 5, 'aucun crédit tant que le paiement n\'est pas confirmé');
  const paid = checkoutBody(15, 'w_async', 'cs_test_async_0001');
  await t.webhook('checkout.session.async_payment_succeeded', paid);
  await t.webhook('checkout.session.async_payment_succeeded', paid);
  assert.equal(await creditsOf('w_async'), 20);
});

test('[NÉGATIF] mauvaise devise, mauvais mode, client Stripe étranger, utilisateur inconnu : rien attribué', async () => {
  await newUser('w_misc');
  await t.webhook('checkout.session.completed', checkoutBody(15, 'w_misc', 'cs_test_misc_1', { currency: 'eur' }));
  await t.webhook('checkout.session.completed', { ...checkoutBody(15, 'w_misc', 'cs_test_misc_2'), mode: 'subscription' });
  await t.webhook('checkout.session.completed', checkoutBody(15, 'w_misc', 'cs_test_misc_3', { customer: 'cus_someone_else' }));
  const ghost = await t.webhook('checkout.session.completed', checkoutBody(15, 'user_does_not_exist', 'cs_test_misc_4'));
  assert.equal(ghost.status, 200);
  assert.equal(await creditsOf('w_misc'), 5);
});

test('[NÉGATIF] sessions sans type ou avec type inattendu n\'attribuent rien', async () => {
  await newUser('w_type');
  await t.webhook('checkout.session.completed', { ...checkoutBody(15, 'w_type', 'cs_test_type_1'), metadata: { user_id: 'w_type', credits: '15' } });
  await t.webhook('checkout.session.completed', { ...checkoutBody(15, 'w_type', 'cs_test_type_2'), metadata: { type: 'credit_grant', user_id: 'w_type', credits: '15' } });
  assert.equal(await creditsOf('w_type'), 5);
});

// ---------------------------------------------------------------- Pack
test('[PACK] paiement conforme : +55 crédits, Pack activé, une seule fois même en parallèle', async () => {
  await newUser('p_ok', { balance: 3 });
  const obj = stripeObjects.packSession({ id: 'cs_test_pack_ok1', user_id: 'p_ok', customer: 'cus_p_ok' });
  await Promise.all([1, 2, 3, 4, 5].map(() => t.webhook('checkout.session.completed', obj)));
  const u = await t.userRow('p_ok');
  assert.equal(u.credits_balance, 58);
  assert.equal(u.has_job_pack, 1);
  assert.equal((await t.qa("SELECT * FROM job_pack_events WHERE user_id = 'p_ok' AND event_type = 'purchased'")).length, 1);
  assert.equal((await t.qa("SELECT * FROM job_pack_events WHERE user_id = 'p_ok' AND event_type = 'activated'")).length, 1);
});

test('[NÉGATIF] Pack payé 1 CHF ou avec 9999 crédits annoncés : rien attribué / seulement 55 si le montant est exact', async () => {
  await newUser('p_forge');
  await t.webhook('checkout.session.completed', stripeObjects.packSession({ id: 'cs_test_pack_f1', user_id: 'p_forge', customer: 'cus_p_forge', amount_total: 100 }));
  assert.equal(await creditsOf('p_forge'), 5);
  assert.equal((await t.userRow('p_forge')).has_job_pack, 0);
  await t.webhook('checkout.session.completed', stripeObjects.packSession({ id: 'cs_test_pack_f2', user_id: 'p_forge', customer: 'cus_p_forge', credits: 9999 }));
  assert.equal(await creditsOf('p_forge'), 60, 'le montant exact donne les 55 crédits du tarif, jamais la quantité annoncée');
});

// ---------------------------------------------------------------- statut de paiement
test('[STATUT] /stripe/checkout-status : pending avant webhook, completed après, invisible pour un autre utilisateur', async () => {
  const a = await newUser('s_a');
  const b = await newUser('s_b');
  const sid = 'cs_test_status_0001';
  assert.equal((await t.call('GET', '/stripe/checkout-status?session_id=' + sid, { token: a.token })).data.status, 'pending');
  await t.webhook('checkout.session.completed', checkoutBody(15, 's_a', sid));
  const ok = await t.call('GET', '/stripe/checkout-status?session_id=' + sid, { token: a.token });
  assert.equal(ok.data.status, 'completed');
  assert.equal(ok.data.credits, 15);
  assert.equal((await t.call('GET', '/stripe/checkout-status?session_id=' + sid, { token: b.token })).data.status, 'pending');
  assert.equal((await t.call('GET', '/stripe/checkout-status?session_id=bad', { token: a.token })).status, 400);
  assert.equal((await t.call('GET', '/stripe/checkout-status?session_id=' + sid)).status, 401);
});

test('[STATUT] une URL de succès ne crédite rien : visiter /credits success ne modifie pas le solde', async () => {
  await newUser('s_url');
  // Le serveur n'expose aucune route qui crédite sur la base d'un retour de redirection.
  const before = await creditsOf('s_url');
  for (const p of ['/credits.html?success=true&credits=30', '/stripe/success?credits=30', '/stripe/checkout-status?session_id=cs_test_none_0001&credits=30']) {
    await t.call('GET', p);
  }
  assert.equal(await creditsOf('s_url'), before);
});
