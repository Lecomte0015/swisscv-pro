// Serveur de DÉMONSTRATION local des équipes (jamais déployé) : le vrai Worker + une base D1 locale + le site (dist/),
// sur la même adresse. Resend et l'IA sont simulés. Les jetons des comptes de démo sont écrits dans /tmp/team_demo_tokens.json.
//   ./scripts/build-public.sh && node tests/billing/team-devserver.mjs   → http://127.0.0.1:8789/team.html
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createEnv } from './harness.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const dist = path.join(root, 'dist');
const PORT = 8789;
const t = await createEnv();

const users = [
  { id: 'demo_owner', email: 'direction@cabinet-demo.ch', name: 'Claire Martin', tier: 'pro', balance: 200, limit: 200 },
  { id: 'demo_coach1', email: 'paul@cabinet-demo.ch', name: 'Paul Favre', tier: 'free', balance: 0, limit: 5 },
  { id: 'demo_coach2', email: 'sara@cabinet-demo.ch', name: 'Sara Rossi', tier: 'free', balance: 2, limit: 5 }
];
const tokens = {};
for (const u of users) {
  await t.seedUser({ id: u.id, email: u.email, tier: u.tier, balance: u.balance, limit: u.limit });
  await t.DB.prepare('UPDATE users SET full_name = ? WHERE id = ?').bind(u.name, u.id).run();
  tokens[u.id] = { token: await t.makeToken(u.id, u.email), user: { id: u.id, email: u.email, full_name: u.name, tier: u.tier, subscription_tier: u.tier, credits_balance: u.balance } };
}
// Équipe déjà constituée (Claire propriétaire, Paul conseiller) ; Sara reste à inviter depuis l'interface
const created = await t.call('POST', '/teams/create', { token: tokens.demo_owner.token, body: { name: 'Cabinet Martin Carrières' } });
const inv = await t.call('POST', '/teams/invite', { token: tokens.demo_owner.token, body: { email: 'paul@cabinet-demo.ch' } });
await t.call('POST', '/teams/invitations/' + inv.data.invite_link.split('invite=')[1] + '/accept', { token: tokens.demo_coach1.token });
tokens.team_id = created.data.team_id;
fs.writeFileSync('/tmp/team_demo_tokens.json', JSON.stringify(tokens, null, 2));

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.json': 'application/json' };

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1:' + PORT);
  const file = path.join(dist, decodeURIComponent(url.pathname));
  if (file.startsWith(dist) && fs.existsSync(file) && fs.statSync(file).isFile()) {
    let content = fs.readFileSync(file);
    // Les pages appellent l'API de production : en démo, on la redirige vers ce serveur
    if (file.endsWith('.html') || file.endsWith('.js')) content = Buffer.from(String(content).split('https://swisscv-pro.dallyhermann-71e.workers.dev').join(''));
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    return res.end(content);
  }
  const chunks = []; for await (const c of req) chunks.push(c);
  const body = chunks.length ? Buffer.concat(chunks) : undefined;
  const headers = {}; for (const [k, v] of Object.entries(req.headers)) headers[k] = v;
  headers['cf-connecting-ip'] = '198.51.100.' + Math.floor(Math.random() * 200);
  const r = await t.raw(new Request('http://127.0.0.1:' + PORT + req.url, { method: req.method, headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : body }));
  res.writeHead(r.status, Object.fromEntries(r.headers.entries()));
  res.end(Buffer.from(await r.arrayBuffer()));
}).listen(PORT, '127.0.0.1', () => console.log('démo équipes : http://127.0.0.1:' + PORT + '/team.html'));
