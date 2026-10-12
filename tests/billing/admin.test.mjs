// Porte d'entrée /admin/* : jeton signé obligatoire, rôle revérifié, plus d'identifiants codés en dur
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { createEnv, SECRETS } from './harness.mjs';

let t;
before(async () => { t = await createEnv(); });
after(async () => { await t.close(); });

function jwt(payload, secret = SECRETS.JWT_SECRET) {
  const b64 = s => Buffer.from(s).toString('base64');
  const h = b64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const p = b64(JSON.stringify(payload));
  return h + '.' + p + '.' + crypto.createHmac('sha256', secret).update(h + '.' + p).digest('base64');
}
const future = () => Math.floor(Date.now() / 1000) + 3600;

async function seedAdmin(id, role = 'admin') {
  await t.seedUser({ id, email: id + '@test.invalid' });
  await t.DB.prepare('UPDATE users SET role = ? WHERE id = ?').bind(role, id).run();
  return jwt({ userId: id, email: id + '@test.invalid', adm: 1, role, exp: future() });
}

const ADMIN_GET_ROUTES = ['/admin/metrics', '/admin/stats', '/admin/users', '/admin/logs', '/admin/feedback/responses', '/admin/feedback/config', '/admin/marketing/funnel', '/admin/support/tickets'];

test('[NÉGATIF] aucune route /admin/* ne répond sans jeton admin valide (absent, "Bearer x", texte quelconque)', async () => {
  for (const route of ADMIN_GET_ROUTES) {
    assert.equal((await t.call('GET', route)).status, 401, route + ' sans jeton');
    assert.equal((await t.call('GET', route, { token: 'x' })).status, 401, route + ' Bearer x');
    assert.equal((await t.call('GET', route, { token: 'aaaaaaaaaaaaaaaaaaaaaaaa' })).status, 401, route + ' jeton quelconque');
  }
});

test('[NÉGATIF] impossible de changer un plan, un rôle ou de bannir sans jeton admin (élévation de privilèges)', async () => {
  await t.seedUser({ id: 'victim_user_01' });
  const attempts = [
    ['PATCH', '/admin/users/victim_user_01', { tier: 'pro' }],
    ['PATCH', '/admin/users/victim_user_01/role', { role: 'super_admin' }],
    ['DELETE', '/admin/users/victim_user_01', undefined],
    ['POST', '/admin/users/victim_user_01/cancel-subscription', {}],
    ['POST', '/admin/campaigns/feedback-survey', {}]
  ];
  for (const [m, route, body] of attempts) {
    assert.equal((await t.call(m, route, { token: 'x', body })).status, 401, m + ' ' + route);
    assert.equal((await t.call(m, route, { body })).status, 401, m + ' ' + route + ' sans en-tête');
  }
  const u = await t.userRow('victim_user_01');
  assert.equal(u.subscription_tier, 'free');
  assert.equal(u.role, 'viewer');
  assert.equal(u.deleted_at, null);
});

test('[NÉGATIF] jeton falsifié (mauvaise signature), expiré, ou sans claim admin : refusé', async () => {
  await seedAdmin('adm_forge_01');
  const forged = jwt({ userId: 'adm_forge_01', email: 'x', adm: 1, exp: future() }, 'autre-secret');
  const expired = jwt({ userId: 'adm_forge_01', email: 'x', adm: 1, exp: Math.floor(Date.now() / 1000) - 10 });
  const noAdm = jwt({ userId: 'adm_forge_01', email: 'x', exp: future() });
  for (const [name, tok] of [['falsifié', forged], ['expiré', expired], ['sans claim admin', noAdm]]) {
    assert.equal((await t.call('GET', '/admin/metrics', { token: tok })).status, 401, name);
  }
});

test('[NÉGATIF] le jeton d\'un utilisateur ordinaire (même valide) ne donne aucun accès admin', async () => {
  await t.seedUser({ id: 'plain_user_01' });
  const userToken = await t.makeToken('plain_user_01', 'plain_user_01@test.invalid');
  assert.equal((await t.call('GET', '/admin/users', { token: userToken })).status, 401);
});

test('[NÉGATIF] jeton marqué admin mais compte sans rôle admin (ou rétrogradé, ou banni) : 403', async () => {
  await t.seedUser({ id: 'fake_adm_01' });
  const tok = jwt({ userId: 'fake_adm_01', email: 'fake_adm_01@test.invalid', adm: 1, exp: future() });
  assert.equal((await t.call('GET', '/admin/metrics', { token: tok })).status, 403, 'rôle viewer');
  const good = await seedAdmin('adm_demote_01');
  assert.equal((await t.call('GET', '/admin/metrics', { token: good })).status, 200);
  await t.DB.prepare("UPDATE users SET role = 'viewer' WHERE id = 'adm_demote_01'").run();
  assert.equal((await t.call('GET', '/admin/metrics', { token: good })).status, 403, 'rétrogradé : effet immédiat');
  const banned = await seedAdmin('adm_banned_01');
  await t.DB.prepare('UPDATE users SET deleted_at = unixepoch() WHERE id = ?').bind('adm_banned_01').run();
  assert.equal((await t.call('GET', '/admin/metrics', { token: banned })).status, 403, 'banni');
});

test('[ADMIN] un jeton admin valide accède aux routes et peut modifier un plan (avec journal d\'audit)', async () => {
  const tok = await seedAdmin('adm_ok_01', 'super_admin');
  await t.seedUser({ id: 'target_user_01' });
  for (const route of ['/admin/metrics', '/admin/marketing/funnel']) assert.equal((await t.call('GET', route, { token: tok })).status, 200, route);
  const r = await t.call('PATCH', '/admin/users/target_user_01', { token: tok, body: { tier: 'premium' } });
  assert.equal(r.status, 200);
  assert.equal((await t.userRow('target_user_01')).subscription_tier, 'premium');
});

test('[ADMIN] le préflight CORS reste accessible sans jeton', async () => {
  const res = await t.call('OPTIONS', '/admin/users', { headers: { Origin: 'https://swisscv-pro.ch', 'Access-Control-Request-Method': 'GET' } });
  assert.equal(res.status, 200);
});

// ---------------------------------------------------------------- connexion admin
test('[LOGIN ADMIN] identifiants Supabase valides + rôle admin : jeton signé 12 h utilisable sur /admin/*', async () => {
  await t.seedUser({ id: 'adm_login_01', email: 'adm_login_01@test.invalid' });
  await t.DB.prepare("UPDATE users SET role = 'admin' WHERE id = 'adm_login_01'").run();
  const r = await t.call('POST', '/admin/login', { body: { email: 'adm_login_01@test.invalid', password: 'pw-ok-test' } });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.equal(r.data.admin.role, 'admin');
  const claims = JSON.parse(Buffer.from(r.data.token.split('.')[1], 'base64').toString());
  assert.equal(claims.adm, 1);
  assert.ok(claims.exp - Math.floor(Date.now() / 1000) <= 12 * 3600 + 5);
  assert.equal((await t.call('GET', '/admin/metrics', { token: r.data.token })).status, 200);
});

test('[NÉGATIF] connexion admin : mauvais mot de passe, compte non admin, identifiants codés en dur d\'origine : refusés', async () => {
  await t.seedUser({ id: 'adm_login_02', email: 'adm_login_02@test.invalid' });
  await t.DB.prepare("UPDATE users SET role = 'admin' WHERE id = 'adm_login_02'").run();
  assert.equal((await t.call('POST', '/admin/login', { body: { email: 'adm_login_02@test.invalid', password: 'faux' } })).status, 401);
  await t.seedUser({ id: 'plain_login_01', email: 'plain_login_01@test.invalid' });
  const nonAdmin = await t.call('POST', '/admin/login', { body: { email: 'plain_login_01@test.invalid', password: 'pw-ok-test' } });
  assert.equal(nonAdmin.status, 401);
  assert.equal(nonAdmin.data.token, undefined);
  // Les anciens identifiants codés en dur ne donnent plus de jeton
  const legacy = await t.call('POST', '/admin/login', { body: { email: 'admin@swisscv-pro.ch', password: 'nimporte-quoi' } });
  assert.equal(legacy.data.token, undefined);
  const src = t.source;
  assert.ok(!/Admin2024/.test(src), 'mot de passe admin codé en dur toujours présent dans le Worker');
});

test('[NÉGATIF] TOUTES les routes /admin/* présentes dans le code (toutes méthodes) refusent une requête sans jeton valide', async () => {
  const paths = new Set(['/admin/inexistante-aleatoire']);
  for (const m of t.source.matchAll(/"(\/admin\/[A-Za-z0-9_\-\/]*)"/g)) paths.add(m[1].replace(/\/$/, '') || m[1]);
  paths.add('/admin/users/some-id'); paths.add('/admin/users/some-id/role'); paths.add('/admin/users/some-id/cancel-subscription');
  paths.delete('/admin/login');
  assert.ok(paths.size >= 15, 'inventaire des routes admin trop petit : ' + paths.size);
  const forged = jwt({ userId: 'x', adm: 1, exp: future() }, 'mauvais-secret');
  for (const p of paths) {
    for (const method of ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']) {
      for (const token of [undefined, 'x', forged]) {
        const r = await t.call(method, p, { token, body: ['GET', 'DELETE'].includes(method) ? undefined : {} });
        assert.equal(r.status, 401, method + ' ' + p + ' avec ' + (token ? 'faux jeton' : 'aucun jeton') + ' → ' + r.status);
      }
    }
  }
});
