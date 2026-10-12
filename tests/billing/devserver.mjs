// Serveur de DÉMONSTRATION local (jamais déployé) : exécute le vrai Worker sur une base D1 locale avec Resend simulé,
// pour essayer l'interface admin dans un navigateur sans toucher à la production.
//   node tests/billing/devserver.mjs   → http://127.0.0.1:8788  (jeton admin écrit dans /tmp/dev_admin_token.txt)
import http from 'node:http';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { createEnv, SECRETS } from './harness.mjs';

process.env.TEST_VERBOSE = process.env.TEST_VERBOSE || '';
const t = await createEnv();
await t.seedUser({ id: 'demo_admin_0001', email: 'dallyhermann@gmail.com' });
await t.DB.prepare("UPDATE users SET role = 'admin', is_internal = 1, full_name = 'Hermann Dally' WHERE id = 'demo_admin_0001'").run();
const names = ['Alice', 'Bruno', 'Chloé', 'David', 'Élise', 'Fabien', 'Gaëlle', 'Hugo', 'Inès', 'Julien', 'Karim', 'Laura', 'Marc', 'Nina'];
for (let i = 0; i < 24; i++) {
  const id = 'demo_user_' + String(i).padStart(4, '0');
  await t.seedUser({ id, email: 'utilisateur' + i + '@exemple.ch', tier: i % 9 === 0 ? 'premium' : 'free' });
  await t.DB.prepare('UPDATE users SET full_name = ? WHERE id = ?').bind(names[i % names.length] + ' Test', id).run();
  if (i % 4 !== 3) await t.DB.prepare('INSERT INTO cv_analyses (id, user_id, score, created_at) VALUES (?, ?, 70, unixepoch() - ?)').bind('demo_an_' + i, id, (i % 5) * 20 * 86400).run();
}
const b64 = x => Buffer.from(x).toString('base64');
const h = b64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
const p = b64(JSON.stringify({ userId: 'demo_admin_0001', email: 'dallyhermann@gmail.com', adm: 1, role: 'admin', exp: Math.floor(Date.now() / 1000) + 7200 }));
fs.writeFileSync('/tmp/dev_admin_token.txt', h + '.' + p + '.' + crypto.createHmac('sha256', SECRETS.JWT_SECRET).update(h + '.' + p).digest('base64'));

http.createServer(async (req, res) => {
  const chunks = []; for await (const c of req) chunks.push(c);
  const body = chunks.length ? Buffer.concat(chunks) : undefined;
  const headers = {}; for (const [k, v] of Object.entries(req.headers)) headers[k] = v;
  headers['cf-connecting-ip'] = '198.51.100.' + Math.floor(Math.random() * 200);
  const r = await t.raw(new Request('http://127.0.0.1:8788' + req.url, { method: req.method, headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : body }));
  res.writeHead(r.status, Object.fromEntries(r.headers.entries()));
  res.end(Buffer.from(await r.arrayBuffer()));
}).listen(8788, '127.0.0.1', () => console.log('serveur de démonstration prêt sur http://127.0.0.1:8788'));
