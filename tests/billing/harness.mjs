// Banc de test facturation : exécute le VRAI Worker (index.js) contre une VRAIE base D1 locale (Miniflare/SQLite).
// Stripe, Resend et Supabase sont simulés : aucun appel réseau réel, aucune clé réelle, aucun paiement.
//
//   WORKER_PATH=./index.js node --test tests/billing/        (défaut : ../../index.js)
import { Miniflare } from 'miniflare';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL, fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');

export const SECRETS = {
  JWT_SECRET: 'test-jwt-secret-not-real',
  STRIPE_WEBHOOK_SECRET: 'whsec_test_not_real',
  STRIPE_SECRET_KEY: 'sk_test_not_real',
  RESEND_API_KEY: 're_test_not_real'
};

export const PRICE_PREMIUM = 'price_1Suy0EADypIYoB8vWc0RD5na';
export const PRICE_PRO = 'price_1Suy1SADypIYoB8vxzCU7Cft';

// ---------- schéma : DDL de production + migrations 038/039 ----------
function splitSql(text) {
  return text.split('\n').filter(l => !l.trim().startsWith('--')).join('\n')
    .split(';').map(s => s.trim()).filter(Boolean);
}

const PROD_TABLES = ['users', 'credit_transactions', 'job_pack_events', 'email_logs', 'free_usage', 'cv_analyses', 'saved_searches', 'admin_logs', 'metrics_snapshots', 'feedback_responses', 'ai_usage', 'cv_builder_documents', 'job_applications'];

function loadProdDdl() {
  const f = process.env.SCHEMA_JSON;
  if (f && fs.existsSync(f)) {
    const d = JSON.parse(fs.readFileSync(f, 'utf8'))[0].results;
    return PROD_TABLES.map(t => (d.find(r => r.name === t) || {}).sql).filter(Boolean);
  }
  return null;
}

const FALLBACK_DDL = [
  "CREATE TABLE users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, supabase_id TEXT UNIQUE, subscription_tier TEXT DEFAULT 'free', stripe_customer_id TEXT, stripe_subscription_id TEXT, subscription_status TEXT, subscription_start_date INTEGER, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, profile_completed INTEGER DEFAULT 0, deleted_at INTEGER DEFAULT NULL, full_name TEXT, bio TEXT, location TEXT, phone TEXT, onboarding_data TEXT, credits_balance INTEGER DEFAULT 5, credits_monthly_limit INTEGER DEFAULT 5, credits_last_reset_at INTEGER, role TEXT DEFAULT 'viewer', j3_reminder_sent INTEGER DEFAULT 0, j7_upgrade_sent INTEGER DEFAULT 0, credits_depleted_email_sent INTEGER DEFAULT 0, reengagement_email_sent INTEGER DEFAULT 0, analysis_reminder_sent INTEGER DEFAULT 0, j14_upgrade_sent INTEGER DEFAULT 0, analysis_edu_email_sent INTEGER DEFAULT 0, has_job_pack INTEGER DEFAULT 0, job_pack_purchased_at INTEGER, job_pack_reminder_sent INTEGER DEFAULT 0)",
  "CREATE TABLE credit_transactions (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, action_type TEXT NOT NULL, credits_used INTEGER NOT NULL, credits_before INTEGER NOT NULL, credits_after INTEGER NOT NULL, metadata TEXT, created_at INTEGER DEFAULT (unixepoch()))",
  "CREATE TABLE job_pack_events (id TEXT PRIMARY KEY, user_id TEXT, event_type TEXT NOT NULL, metadata TEXT, created_at INTEGER DEFAULT (unixepoch()))",
  "CREATE TABLE email_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, user_email TEXT, template_type TEXT, subject TEXT, resend_id TEXT, sent_at INTEGER DEFAULT (unixepoch()), opened_at INTEGER, clicked_at INTEGER, status TEXT, html_content TEXT)",
  "CREATE TABLE free_usage (user_id TEXT PRIMARY KEY, analysis_count INTEGER DEFAULT 0)",
  "CREATE TABLE cv_analyses (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, score INTEGER, ats_score INTEGER, strong_points TEXT, improvements TEXT, swiss_advice TEXT, keywords TEXT, created_at INTEGER NOT NULL, filename TEXT)",
  "CREATE TABLE saved_searches (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, name TEXT, keywords TEXT, location TEXT, filters TEXT, created_at INTEGER, last_used_at INTEGER, email_alerts INTEGER DEFAULT 0, last_alert_sent INTEGER)",
  "CREATE TABLE admin_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, admin_id TEXT, action TEXT, target_type TEXT, target_id TEXT, details TEXT, ip_address TEXT, created_at INTEGER DEFAULT (unixepoch()))",
  "CREATE TABLE feedback_responses (id TEXT PRIMARY KEY, user_id TEXT, email TEXT NOT NULL, blocker_reason TEXT NOT NULL, quality_rating TEXT, missing_feature TEXT, comment TEXT, credited INTEGER DEFAULT 0, created_at INTEGER DEFAULT (unixepoch()), usage_features TEXT, nps_score INTEGER)",
  "CREATE TABLE cv_builder_documents (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, template_id TEXT, name TEXT, data TEXT, created_at INTEGER, updated_at INTEGER, deleted_at INTEGER, download_charged_at INTEGER)",
  "CREATE TABLE job_applications (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, job_title TEXT NOT NULL, company TEXT NOT NULL, job_url TEXT, status TEXT DEFAULT 'a_consulter', applied_date INTEGER DEFAULT (unixepoch()), deadline INTEGER, reminder_date INTEGER, status_history TEXT DEFAULT '[]', priority TEXT DEFAULT 'medium', salary_expectation INTEGER, last_status_change INTEGER, created_at INTEGER DEFAULT (unixepoch()), updated_at INTEGER DEFAULT (unixepoch()), deleted_at INTEGER, notes TEXT, notes_updated_at INTEGER, reminder_note TEXT, reminder_updated_at INTEGER)",
  "CREATE TABLE ai_usage (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT, feature TEXT, tokens_used INTEGER, cost_estimate REAL, created_at INTEGER DEFAULT (unixepoch()))",
  "CREATE TABLE metrics_snapshots (id INTEGER PRIMARY KEY AUTOINCREMENT, snapshot_date TEXT NOT NULL UNIQUE, total_users INTEGER NOT NULL, premium_users INTEGER NOT NULL, pro_users INTEGER NOT NULL, mrr INTEGER NOT NULL, created_at INTEGER DEFAULT (unixepoch()))"
];

async function buildDb() {
  const mf = new Miniflare({
    modules: true,
    script: 'export default { fetch() { return new Response("ok"); } }',
    compatibilityDate: '2024-09-01',
    d1Databases: { DB: 'billing-test-' + crypto.randomUUID() }
  });
  const DB = await mf.getD1Database('DB');
  const ddl = loadProdDdl() || FALLBACK_DDL;
  for (const stmt of ddl) await DB.prepare(stmt).run();
  // Migration 038 : colonnes + tables (on saute les ALTER déjà présents si le DDL de prod est récent)
  for (const stmt of splitSql(fs.readFileSync(path.join(root, 'migrations/038_marketing_tracking.sql'), 'utf8'))) {
    if (/^UPDATE users/i.test(stmt)) continue;
    try { await DB.prepare(stmt).run(); } catch (e) { if (!/duplicate column/i.test(String(e.message))) throw e; }
  }
  for (const f of ['039_billing_idempotency.sql', '040_feedback_single_credit.sql', '041_rate_limits.sql', '042_marketing_campaigns.sql', '043_teams.sql', '044_candidates.sql']) {
    for (const stmt of splitSql(fs.readFileSync(path.join(root, 'migrations', f), 'utf8'))) await DB.prepare(stmt).run();
  }
  return { mf, DB };
}

// ---------- simulation réseau ----------
export function installFakeNetwork(state) {
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input.url;
    const method = (init && init.method) || 'GET';
    const body = init && init.body ? String(init.body) : '';
    state.calls.push({ url, method, body });
    const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'Content-Type': 'application/json' } });
    if (url.startsWith('https://api.stripe.com/v1/checkout/sessions') && method === 'POST') {
      state.sessionCounter += 1;
      const id = 'cs_test_' + String(state.sessionCounter).padStart(8, '0');
      return json({ id, url: 'https://checkout.stripe.test/' + id });
    }
    if (url.startsWith('https://api.stripe.com/v1/customers/') && method === 'GET') {
      const id = decodeURIComponent(url.split('/customers/')[1]);
      return json(state.stripeCustomers[id] || { id, email: null });
    }
    if (url.startsWith('https://api.stripe.com/v1/customers') && method === 'POST') return json({ id: 'cus_created_' + (++state.sessionCounter) });
    if (url.startsWith('https://api.stripe.com/v1/subscriptions/') && method === 'DELETE') {
      state.stripeCancelled = (state.stripeCancelled || []).concat(decodeURIComponent(url.split('/subscriptions/')[1]));
      return state.stripeCancelStatus ? json({ error: { code: 'api_error' } }, state.stripeCancelStatus) : json({ id: 'sub', status: 'canceled' });
    }
    if (url.startsWith('https://api.stripe.com/v1/subscriptions/') && method === 'GET') {
      const id = decodeURIComponent(url.split('/subscriptions/')[1]);
      return state.stripeSubscriptions[id] ? json(state.stripeSubscriptions[id]) : json({ error: 'not found' }, 404);
    }
    if (url.startsWith('https://api.anthropic.com/v1/messages')) {
      if (state.anthropicDelayMs) await new Promise(r => setTimeout(r, state.anthropicDelayMs));
      state.anthropicCalls = (state.anthropicCalls || 0) + 1;
      const callNo = state.anthropicCalls;
      if (state.anthropicFail || (state.anthropicFailOn && state.anthropicFailOn(callNo))) return json({ error: 'surcharge simulée' }, 529);
      return json({ content: [{ text: '{"score":70,"atsScore":70,"strongPoints":["a"],"improvements":["b"],"swissAdvice":"c","keywords":["x","y"],"matchScore":80,"strengths":[],"gaps":[],"recommendations":[],"verdict":"v","cv":{"firstName":"A","lastName":"B"},"letter":"Madame, Monsieur"}' }], usage: { input_tokens: 10, output_tokens: 10 } });
    }
    if (url === 'https://api.resend.com/emails/batch') {
      if (state.resendStatus) return json({ message: 'simulated ' + state.resendStatus }, state.resendStatus);
      let items = []; try { items = JSON.parse(body); } catch (e) { items = []; }
      state.batchCounter = (state.batchCounter || 0);
      return json({ data: items.map(() => ({ id: 're_batch_' + (++state.batchCounter) })) });
    }
    if (url.startsWith('https://api.resend.com')) return json({ id: 're_' + (++state.sessionCounter) });
    if (/\/auth\/v1\/signup/.test(url)) return json({ id: 'sb-' + crypto.randomUUID() });
    if (/\/auth\/v1\/token/.test(url)) {
      let b = {}; try { b = JSON.parse(body); } catch (e) { /* ignore */ }
      return b.password === 'pw-ok-test' ? json({ access_token: 'sb.access.token', user: { id: 'sb-user' } }) : json({ error: 'invalid_grant' }, 400);
    }
    if (url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1')) return realFetch(input, init);
    return json({});
  };
  return () => { globalThis.fetch = realFetch; };
}

// ---------- environnement de test ----------
export async function createEnv() {
  // Le Worker journalise beaucoup : on coupe la sortie pour ne pas saturer le lanceur de tests (TEST_VERBOSE=1 pour la voir)
  if (!process.env.TEST_VERBOSE) { console.log = () => {}; console.info = () => {}; console.warn = () => {}; console.error = () => {}; }
  const { mf, DB } = await buildDb();
  const state = { calls: [], sessionCounter: 0, stripeCustomers: {}, stripeSubscriptions: {} };
  const restoreFetch = installFakeNetwork(state);

  const workerPath = path.resolve(process.env.WORKER_PATH || path.join(root, 'index.js'));
  const tmp = path.join(os.tmpdir(), 'swisscv-worker-' + crypto.randomUUID() + '.mjs');
  fs.copyFileSync(workerPath, tmp);
  const worker = (await import(pathToFileURL(tmp).href)).default;

  const env = { DB, ...SECRETS };
  const pending = [];
  const ctx = { waitUntil: p => { pending.push(Promise.resolve(p).catch(() => {})); }, passThroughOnException() {} };

  async function call(method, pathname, { headers = {}, body, token } = {}) {
    const h = { ...headers };
    // Chaque appel de test vient d'une IP différente (sauf si le test fixe CF-Connecting-IP) : les limites de débit ne gênent pas les autres tests
    if (!h['CF-Connecting-IP']) h['CF-Connecting-IP'] = '10.' + Math.floor(Math.random() * 250) + '.' + Math.floor(Math.random() * 250) + '.' + Math.floor(Math.random() * 250);
    if (token) h['Authorization'] = 'Bearer ' + token;
    if (body !== undefined && !h['Content-Type']) h['Content-Type'] = 'application/json';
    const req = new Request('https://worker.test' + pathname, {
      method, headers: h, body: body === undefined ? undefined : (typeof body === 'string' ? body : JSON.stringify(body))
    });
    const res = await worker.fetch(req, env, ctx);
    await Promise.all(pending.splice(0));
    let data = null;
    try { data = await res.clone().json(); } catch (e) { /* non JSON */ }
    return { status: res.status, data };
  }

  function signStripe(payload, { secret = SECRETS.STRIPE_WEBHOOK_SECRET, ts = Math.floor(Date.now() / 1000) } = {}) {
    const sig = crypto.createHmac('sha256', secret).update(ts + '.' + payload).digest('hex');
    return 't=' + ts + ',v1=' + sig;
  }

  let eventCounter = 0;
  async function webhook(type, object, { id, signature, rawBody } = {}) {
    const event = { id: id || ('evt_test_' + String(++eventCounter).padStart(6, '0')), type, created: Math.floor(Date.now() / 1000), data: { object } };
    const payload = rawBody || JSON.stringify(event);
    const headers = { 'Content-Type': 'application/json' };
    if (signature !== null) headers['stripe-signature'] = signature || signStripe(payload);
    const r = await call('POST', '/stripe/webhook', { headers, body: payload });
    r.event = event;
    return r;
  }

  async function makeToken(userId, email) {
    const b64 = s => Buffer.from(s).toString('base64');
    const header = b64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = b64(JSON.stringify({ userId, email, tier: 'free', exp: Math.floor(Date.now() / 1000) + 3600 }));
    const sig = crypto.createHmac('sha256', SECRETS.JWT_SECRET).update(header + '.' + payload).digest('base64');
    return header + '.' + payload + '.' + sig;
  }

  async function seedUser(u) {
    const user = {
      id: u.id, email: u.email || (u.id + '@test.invalid'), tier: u.tier || 'free', balance: u.balance ?? 5, limit: u.limit ?? 5,
      customer: u.customer || null, sub: u.sub || null, pack: u.pack ? 1 : 0, internal: u.internal ? 1 : 0, lastReset: u.lastReset ?? null, createdAt: u.createdAt ?? Math.floor(Date.now() / 1000)
    };
    await DB.prepare(
      'INSERT INTO users (id, email, subscription_tier, stripe_customer_id, stripe_subscription_id, credits_balance, credits_monthly_limit, has_job_pack, is_internal, credits_last_reset_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(user.id, user.email, user.tier, user.customer, user.sub, user.balance, user.limit, user.pack, user.internal, user.lastReset, user.createdAt, user.createdAt).run();
    return user;
  }

  const q = async (sql, ...b) => (await DB.prepare(sql).bind(...b).first());
  const qa = async (sql, ...b) => ((await DB.prepare(sql).bind(...b).all()).results || []);
  const userRow = id => q('SELECT * FROM users WHERE id = ?', id);

  const calls = {
    stripeCheckoutBodies: () => state.calls.filter(c => c.url.startsWith('https://api.stripe.com/v1/checkout/sessions') && c.method === 'POST').map(c => new URLSearchParams(c.body)),
    emails: () => state.calls.filter(c => c.url.startsWith('https://api.resend.com')),
    reset: () => { state.calls.length = 0; }
  };

  async function close() { restoreFetch(); await mf.dispose(); try { fs.unlinkSync(tmp); } catch (e) { /* ignore */ } }

  // Déclenche le cron quotidien (handler scheduled) et attend ses tâches
  async function runScheduled() { await worker.scheduled({ cron: '0 8 * * *', scheduledTime: Date.now() }, env, ctx); await Promise.all(pending.splice(0)); }

  // Accès brut au Worker (utilisé par le serveur de démonstration local, jamais par les tests)
  async function raw(req) { const res = await worker.fetch(req, env, ctx); await Promise.all(pending.splice(0)); return res; }

  return { env, DB, state, call, raw, runScheduled, webhook, signStripe, makeToken, seedUser, q, qa, userRow, calls, close, workerPath, source: fs.readFileSync(workerPath, 'utf8') };
}

// Objets Stripe de test
export const stripeObjects = {
  creditSession: (o = {}) => ({
    id: o.id || 'cs_test_credit_0001', mode: 'payment', payment_status: o.payment_status || 'paid',
    currency: o.currency || 'chf', amount_total: o.amount_total ?? 500, customer: o.customer ?? 'cus_user1',
    customer_email: o.customer_email || null,
    metadata: { type: 'credit_purchase', user_id: o.user_id || 'user1', credits: String(o.credits ?? 15), ...(o.metadata || {}) }
  }),
  packSession: (o = {}) => ({
    id: o.id || 'cs_test_pack_0001', mode: 'payment', payment_status: o.payment_status || 'paid',
    currency: o.currency || 'chf', amount_total: o.amount_total ?? 1990, customer: o.customer ?? 'cus_user1',
    metadata: { type: 'job_pack_purchase', user_id: o.user_id || 'user1', credits: String(o.credits ?? 55) }
  }),
  subscription: (o = {}) => ({
    id: o.id || 'sub_test_1', customer: o.customer || 'cus_user1', status: o.status || 'active',
    cancel_at_period_end: !!o.cancel_at_period_end,
    items: { data: [{ price: { id: o.price === undefined ? PRICE_PREMIUM : o.price } }] }
  }),
  invoice: (o = {}) => ({
    id: o.id || 'in_test_1', customer: o.customer || 'cus_user1', amount_paid: o.amount_paid ?? 900, currency: 'chf',
    billing_reason: o.billing_reason === undefined ? 'subscription_cycle' : o.billing_reason,
    ...(o.newShape ? { parent: { subscription_details: { subscription: 'sub_test_1' } } } : (o.subscription === null ? {} : { subscription: o.subscription || 'sub_test_1' })),
    lines: { data: [{ price: { id: PRICE_PREMIUM } }] }
  })
};
