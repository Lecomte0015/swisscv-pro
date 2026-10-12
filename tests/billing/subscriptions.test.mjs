// Abonnements : mises à jour, factures payées, résiliations, rattachement Payment Link, checkout Premium, renouvellement gratuit
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createEnv, stripeObjects, PRICE_PREMIUM, PRICE_PRO } from './harness.mjs';

let t;
before(async () => { t = await createEnv(); });
after(async () => { await t.close(); });

async function subscriber(id, extra = {}) {
  await t.seedUser({ id, customer: 'cus_' + id, sub: 'sub_' + id, tier: 'premium', balance: 100, limit: 100, ...extra });
  return { id, token: await t.makeToken(id, id + '@test.invalid') };
}
const row = id => t.userRow(id);
const sub = (id, o = {}) => stripeObjects.subscription({ id: 'sub_' + id, customer: 'cus_' + id, ...o });
const inv = (id, o = {}) => stripeObjects.invoice({ id: 'in_' + id, customer: 'cus_' + id, subscription: 'sub_' + id, ...o });

// ---------------------------------------------------------------- customer.subscription.updated
test('[ABO] simple modification (résiliation programmée, carte...) NE recharge PAS les crédits', async () => {
  await subscriber('u_upd', { balance: 40 });
  const r = await t.webhook('customer.subscription.updated', sub('u_upd', { cancel_at_period_end: true }));
  assert.equal(r.status, 200);
  assert.equal((await row('u_upd')).credits_balance, 40);
  for (let i = 0; i < 3; i++) await t.webhook('customer.subscription.updated', sub('u_upd', { cancel_at_period_end: true }));
  assert.equal((await row('u_upd')).credits_balance, 40, 'même répété');
  assert.equal((await row('u_upd')).subscription_tier, 'premium');
});

test('[ABO] résiliation en fin de période (updated) ≠ résiliation effective (deleted) : l\'accès est conservé jusqu\'à la fin', async () => {
  await subscriber('u_sched', { balance: 60 });
  await t.webhook('customer.subscription.updated', sub('u_sched', { cancel_at_period_end: true }));
  assert.equal((await row('u_sched')).subscription_tier, 'premium', 'accès conservé tant que deleted n\'est pas reçu');
  const ev = await t.qa("SELECT event FROM subscription_events WHERE user_id = 'u_sched'");
  assert.deepEqual(ev.map(e => e.event), ['cancel_scheduled']);
  await t.webhook('customer.subscription.deleted', sub('u_sched', { status: 'canceled' }));
  const after = await row('u_sched');
  assert.equal(after.subscription_tier, 'free');
  assert.equal(after.stripe_subscription_id, null);
  assert.equal(after.credits_monthly_limit, 5);
  const ev2 = await t.qa("SELECT event FROM subscription_events WHERE user_id = 'u_sched' ORDER BY created_at, rowid");
  assert.deepEqual(ev2.map(e => e.event), ['cancel_scheduled', 'canceled']);
});

test('[ABO] prix Stripe inconnu : AUCUNE rétrogradation ni changement', async () => {
  await subscriber('u_unk', { balance: 70 });
  await t.webhook('customer.subscription.updated', sub('u_unk', { price: 'price_unknown_xyz' }));
  const r = await row('u_unk');
  assert.equal(r.subscription_tier, 'premium');
  assert.equal(r.credits_balance, 70);
});

test('[ABO] statuts non actifs (incomplete, past_due, unpaid) n\'accordent ni ne retirent rien', async () => {
  await t.seedUser({ id: 'u_inc', customer: 'cus_u_inc' });
  await t.webhook('customer.subscription.created', sub('u_inc', { status: 'incomplete' }));
  assert.equal((await row('u_inc')).subscription_tier, 'free', 'paiement initial non abouti : pas d\'accès');
  await subscriber('u_pd', { balance: 50 });
  await t.webhook('customer.subscription.updated', sub('u_pd', { status: 'past_due' }));
  await t.webhook('customer.subscription.updated', sub('u_pd', { status: 'unpaid' }));
  assert.equal((await row('u_pd')).subscription_tier, 'premium');
  assert.equal((await row('u_pd')).credits_balance, 50);
});

test('[ABO] création : plan activé, crédits du plan SANS réduire un solde supérieur, un seul email de confirmation', async () => {
  await t.seedUser({ id: 'u_new', customer: 'cus_u_new', balance: 150 });
  t.calls.reset();
  await t.webhook('customer.subscription.created', sub('u_new'));
  const r = await row('u_new');
  assert.equal(r.subscription_tier, 'premium');
  assert.equal(r.credits_monthly_limit, 100);
  assert.equal(r.credits_balance, 150, 'les crédits déjà détenus ne sont pas écrasés');
  assert.equal(r.stripe_subscription_id, 'sub_u_new');
  await t.webhook('customer.subscription.updated', sub('u_new'));
  await t.webhook('customer.subscription.updated', sub('u_new'));
  const sent = (await t.qa("SELECT * FROM email_logs WHERE user_email = 'u_new@test.invalid' AND template_type = 'premium_confirmation'")).length;
  assert.equal(sent, 1, 'un seul email de bienvenue malgré les mises à jour');
});

test('[ABO] nouveau Premium depuis un solde bas : le solde monte au plan (100)', async () => {
  await t.seedUser({ id: 'u_low', customer: 'cus_u_low', balance: 2 });
  await t.webhook('customer.subscription.created', sub('u_low'));
  assert.equal((await row('u_low')).credits_balance, 100);
});

test('[ABO] passage Premium → Pro : limite 200, solde remonté à 200 ; retour Pro → Premium : aucun crédit retiré', async () => {
  await subscriber('u_pro', { balance: 40 });
  await t.webhook('customer.subscription.updated', sub('u_pro', { price: PRICE_PRO }));
  let r = await row('u_pro');
  assert.equal(r.subscription_tier, 'pro');
  assert.equal(r.credits_monthly_limit, 200);
  assert.equal(r.credits_balance, 200);
  await t.DB.prepare("UPDATE users SET credits_balance = 150 WHERE id = 'u_pro'").run();
  await t.webhook('customer.subscription.updated', sub('u_pro', { price: PRICE_PREMIUM }));
  r = await row('u_pro');
  assert.equal(r.subscription_tier, 'premium');
  assert.equal(r.credits_monthly_limit, 100);
  assert.equal(r.credits_balance, 150);
});

// ---------------------------------------------------------------- invoice.paid
test('[FACTURE] renouvellement mensuel payé : le solde remonte à l\'allocation du plan', async () => {
  await subscriber('i_cycle', { balance: 12 });
  await t.webhook('invoice.paid', inv('i_cycle'));
  assert.equal((await row('i_cycle')).credits_balance, 100);
});

test('[NÉGATIF] même invoice.paid rejoué : pas de seconde recharge (crédits dépensés entre-temps non rendus)', async () => {
  await subscriber('i_replay', { balance: 12 });
  const evt = 'evt_invoice_replay_1';
  await t.webhook('invoice.paid', inv('i_replay'), { id: evt });
  assert.equal((await row('i_replay')).credits_balance, 100);
  await t.DB.prepare("UPDATE users SET credits_balance = 30 WHERE id = 'i_replay'").run();
  await t.webhook('invoice.paid', inv('i_replay'), { id: evt });
  await t.webhook('invoice.paid', inv('i_replay'), { id: evt });
  assert.equal((await row('i_replay')).credits_balance, 30);
});

test('[NÉGATIF] invoice.paid en parallèle (même événement) : une seule recharge', async () => {
  await subscriber('i_race', { balance: 1 });
  await Promise.all(Array.from({ length: 6 }, () => t.webhook('invoice.paid', inv('i_race'), { id: 'evt_invoice_race_1' })));
  assert.equal((await t.qa("SELECT * FROM processed_stripe_events WHERE event_id = 'evt_invoice_race_1'")).length, 1);
  assert.equal((await row('i_race')).credits_balance, 100);
});

test('[NÉGATIF] factures sans droit aux crédits mensuels : proratisation, manuelle, ponctuelle (sans abonnement)', async () => {
  await subscriber('i_other', { balance: 10 });
  await t.webhook('invoice.paid', inv('i_other', { billing_reason: 'subscription_update' }));
  await t.webhook('invoice.paid', inv('i_other', { billing_reason: 'manual' }));
  await t.webhook('invoice.paid', inv('i_other', { billing_reason: null }));
  await t.webhook('invoice.paid', stripeObjects.invoice({ id: 'in_oneoff', customer: 'cus_i_other', subscription: null, billing_reason: 'manual' }));
  assert.equal((await row('i_other')).credits_balance, 10);
});

test('[FACTURE] un solde supérieur à l\'allocation (crédits achetés) n\'est jamais réduit par le renouvellement', async () => {
  await subscriber('i_keep', { balance: 130 });
  await t.webhook('invoice.paid', inv('i_keep'));
  assert.equal((await row('i_keep')).credits_balance, 130);
});

test('[FACTURE] un compte gratuit ne reçoit rien d\'un invoice.paid', async () => {
  await t.seedUser({ id: 'i_free', customer: 'cus_i_free', balance: 1 });
  await t.webhook('invoice.paid', inv('i_free'));
  assert.equal((await row('i_free')).credits_balance, 1);
});

test('[FACTURE] nouvelle forme d\'API Stripe (parent.subscription_details) reconnue', async () => {
  await subscriber('i_new', { balance: 3 });
  await t.webhook('invoice.paid', stripeObjects.invoice({ id: 'in_new', customer: 'cus_i_new', newShape: true, subscription: null }));
  // subscription: null + newShape => helper ajoute parent.subscription_details
  assert.equal((await row('i_new')).credits_balance, 100);
});

test('[REGISTRE] invoice.paid enregistre un paiement unique par événement (anti-doublon)', async () => {
  await subscriber('i_ledger', { balance: 3 });
  await t.webhook('invoice.paid', inv('i_ledger'), { id: 'evt_ledger_1' });
  await t.webhook('invoice.paid', inv('i_ledger'), { id: 'evt_ledger_1' });
  const rows = await t.qa("SELECT * FROM payments WHERE stripe_event_id = 'evt_ledger_1'");
  assert.equal(rows.length, 1);
  assert.equal(rows[0].amount, 900);
});

// ---------------------------------------------------------------- customer.subscription.deleted
test('[ABO] fin d\'un ANCIEN abonnement alors qu\'un autre est actif : aucune rétrogradation', async () => {
  await subscriber('d_old', { balance: 80 });
  await t.webhook('customer.subscription.deleted', stripeObjects.subscription({ id: 'sub_OLD_ended', customer: 'cus_d_old', status: 'canceled' }));
  const r = await row('d_old');
  assert.equal(r.subscription_tier, 'premium');
  assert.equal(r.stripe_subscription_id, 'sub_d_old');
  assert.equal(r.credits_balance, 80);
});

test('[ABO] résiliation effective : retour gratuit, crédits plafonnés à 5 sauf si le compte a acheté le Pack', async () => {
  await subscriber('d_free', { balance: 90 });
  await subscriber('d_pack', { balance: 90, pack: true });
  await t.webhook('customer.subscription.deleted', sub('d_free', { status: 'canceled' }));
  await t.webhook('customer.subscription.deleted', sub('d_pack', { status: 'canceled' }));
  assert.equal((await row('d_free')).credits_balance, 5);
  assert.equal((await row('d_pack')).credits_balance, 90);
  assert.equal((await row('d_pack')).subscription_tier, 'free');
});

test('[ABO] statut Stripe reflété dans subscription_status', async () => {
  await subscriber('d_status');
  await t.webhook('customer.subscription.updated', sub('d_status', { status: 'past_due' }));
  assert.equal((await row('d_status')).subscription_status, 'past_due');
});

// ---------------------------------------------------------------- Payment Link : rattachement par client_reference_id
test('[PAYMENT LINK] email différent chez Stripe : le compte payeur est retrouvé par client_reference_id et passe Premium', async () => {
  await t.seedUser({ id: 'pl_user_01', email: 'pl_user_01@test.invalid', balance: 4 });
  t.state.stripeCustomers['cus_pl_new'] = { id: 'cus_pl_new', email: 'autre-adresse@example.invalid' };
  t.state.stripeSubscriptions['sub_pl_new'] = stripeObjects.subscription({ id: 'sub_pl_new', customer: 'cus_pl_new' });
  // 1) l'événement d'abonnement arrive avant : aucun compte ne correspond → rien d'appliqué
  await t.webhook('customer.subscription.created', stripeObjects.subscription({ id: 'sub_pl_new', customer: 'cus_pl_new' }));
  assert.equal((await row('pl_user_01')).subscription_tier, 'free');
  // 2) la session de paiement arrive avec client_reference_id : rattachement + application de l'abonnement
  await t.webhook('checkout.session.completed', { id: 'cs_test_pl_0001', mode: 'subscription', payment_status: 'paid', customer: 'cus_pl_new', client_reference_id: 'pl_user_01', subscription: 'sub_pl_new', customer_email: 'autre-adresse@example.invalid', metadata: {} });
  const r = await row('pl_user_01');
  assert.equal(r.stripe_customer_id, 'cus_pl_new');
  assert.equal(r.subscription_tier, 'premium');
  assert.equal(r.credits_balance, 100);
});

test('[NÉGATIF] client_reference_id d\'un compte déjà lié à un AUTRE client Stripe : rattachement refusé', async () => {
  await t.seedUser({ id: 'pl_victim', customer: 'cus_victim_original' });
  t.state.stripeSubscriptions['sub_pl_evil'] = stripeObjects.subscription({ id: 'sub_pl_evil', customer: 'cus_evil' });
  await t.webhook('checkout.session.completed', { id: 'cs_test_pl_0002', mode: 'subscription', payment_status: 'paid', customer: 'cus_evil', client_reference_id: 'pl_victim', subscription: 'sub_pl_evil', metadata: {} });
  const r = await row('pl_victim');
  assert.equal(r.stripe_customer_id, 'cus_victim_original');
  assert.equal(r.subscription_tier, 'free');
});

// ---------------------------------------------------------------- création du checkout Premium
test('[PREMIUM] checkout : lien de paiement avec email et client_reference_id du compte authentifié', async () => {
  await t.seedUser({ id: 'k_ok' });
  const tok = await t.makeToken('k_ok', 'k_ok@test.invalid');
  const r = await t.call('POST', '/stripe/create-checkout', { token: tok, body: { plan: 'premium' } });
  assert.equal(r.status, 200);
  const u = new URL(r.data.url);
  assert.equal(u.hostname, 'buy.stripe.com');
  assert.equal(u.searchParams.get('client_reference_id'), 'k_ok');
  assert.equal(u.searchParams.get('prefilled_email'), 'k_ok@test.invalid');
});

test('[NÉGATIF] checkout Premium : plan invalide, non authentifié, déjà abonné au même plan ou supérieur', async () => {
  const sub1 = await subscriber('k_has');
  assert.equal((await t.call('POST', '/stripe/create-checkout', { token: sub1.token, body: { plan: 'enterprise' } })).status, 400);
  assert.equal((await t.call('POST', '/stripe/create-checkout', { body: { plan: 'premium' } })).status, 401);
  assert.equal((await t.call('POST', '/stripe/create-checkout', { token: sub1.token, body: { plan: 'premium' } })).status, 409, 'même plan');
  assert.equal((await t.call('POST', '/stripe/create-checkout', { token: sub1.token, body: { plan: 'pro' } })).status, 200, 'passage au plan supérieur autorisé');
  const proUser = await subscriber('k_pro', { tier: 'pro', limit: 200, balance: 200 });
  assert.equal((await t.call('POST', '/stripe/create-checkout', { token: proUser.token, body: { plan: 'premium' } })).status, 409, 'plan inférieur');
});

test('[PREMIUM] compte Premium posé à la main (sans abonnement Stripe) peut encore souscrire', async () => {
  await t.seedUser({ id: 'k_manual', tier: 'premium', limit: 100, balance: 100 });
  const tok = await t.makeToken('k_manual', 'k_manual@test.invalid');
  assert.equal((await t.call('POST', '/stripe/create-checkout', { token: tok, body: { plan: 'premium' } })).status, 200);
});

// ---------------------------------------------------------------- renouvellement du palier gratuit
function loadReset(source) {
  const m = source.match(/async function resetFreeTierCredits\(env\) \{[\s\S]*?\n\}\n(?=__name\(resetFreeTierCredits)/);
  assert.ok(m, 'fonction resetFreeTierCredits introuvable');
  return new Function('console', 'FREE_TIER_MONTHLY_CREDITS', m[0] + '\nreturn resetFreeTierCredits;')(console, 5);
}

test('[RENOUVELLEMENT] palier gratuit : remonte un solde bas à 5 mais NE RÉDUIT JAMAIS (Pack, achat, bonus feedback)', async () => {
  const old = Math.floor(Date.now() / 1000) - 40 * 86400;
  await t.seedUser({ id: 'r_low', balance: 0, lastReset: old });
  await t.seedUser({ id: 'r_pack', balance: 60, pack: true, lastReset: old });
  await t.seedUser({ id: 'r_bonus', balance: 9, lastReset: old });
  await t.seedUser({ id: 'r_bought', balance: 25, lastReset: old });
  await t.seedUser({ id: 'r_recent', balance: 1, lastReset: Math.floor(Date.now() / 1000) - 3 * 86400 });
  await t.seedUser({ id: 'r_premium', tier: 'premium', balance: 7, limit: 100, lastReset: old });
  await loadReset(t.source)(t.env);
  assert.equal((await row('r_low')).credits_balance, 5);
  assert.equal((await row('r_pack')).credits_balance, 60, 'les crédits du Pack ne doivent pas être effacés');
  assert.equal((await row('r_bonus')).credits_balance, 9);
  assert.equal((await row('r_bought')).credits_balance, 25);
  assert.equal((await row('r_recent')).credits_balance, 1, 'pas encore 30 jours');
  assert.equal((await row('r_premium')).credits_balance, 7, 'les abonnés ne sont pas concernés');
});

test('[RENOUVELLEMENT] une limite mensuelle gonflée par un ancien achat ne donne pas de recharge géante', async () => {
  const old = Math.floor(Date.now() / 1000) - 40 * 86400;
  await t.seedUser({ id: 'r_inflated', balance: 0, limit: 500, lastReset: old });
  await loadReset(t.source)(t.env);
  assert.equal((await row('r_inflated')).credits_balance, 5);
});
