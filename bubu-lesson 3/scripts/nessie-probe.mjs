#!/usr/bin/env node
/**
 * nessie-probe.mjs — verify what the live Nessie sandbox actually returns.
 *
 *   node scripts/nessie-probe.mjs <YOUR_API_KEY>
 *   node scripts/nessie-probe.mjs <YOUR_API_KEY> --seed
 *
 * Why this exists: Nessie's docs render client-side and the response schemas are
 * not published anywhere machine-readable, so the field names in nessie.js are
 * written from the SDK sources and community projects. Run this once with your
 * key and it prints the real shape of every object the lesson touches. If any
 * field name below differs, fix it in src/services/nessie.js — this script is
 * the source of truth, not the comments.
 *
 * --seed additionally creates a demo customer with Checking / Savings / Credit
 * Card accounts, a merchant, a month of purchases and a student loan, then
 * prints the ids to paste into .env as VITE_NESSIE_CUSTOMER_ID.
 *
 * Node 18+ (uses global fetch). Runs over plain http, which is fine from Node —
 * only browsers block mixed content.
 */

const BASE = process.env.NESSIE_BASE || 'http://api.nessieisreal.com';
const KEY = process.argv[2] || process.env.NESSIE_KEY;
const SEED = process.argv.includes('--seed');

if (!KEY) {
  console.error('Usage: node scripts/nessie-probe.mjs <API_KEY> [--seed]');
  process.exit(1);
}

const url = (p) => `${BASE}${p}${p.includes('?') ? '&' : '?'}key=${KEY}`;

async function call(method, path, body) {
  const res = await fetch(url(path), {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }
  return { status: res.status, ok: res.ok, json };
}

const unwrap = (j) => (j && typeof j === 'object' && 'objectCreated' in j ? j.objectCreated : j);
const sample = (v) => (Array.isArray(v) ? v[0] : v);

function shape(label, value) {
  const s = sample(value);
  if (s == null || typeof s !== 'object') {
    console.log(`\n  ${label}: ${JSON.stringify(s)}`);
    return;
  }
  console.log(`\n  ${label}`);
  for (const [k, v] of Object.entries(s)) {
    const t = Array.isArray(v) ? 'array' : v === null ? 'null' : typeof v;
    const preview = typeof v === 'object' && v !== null ? JSON.stringify(v).slice(0, 60) : String(v);
    console.log(`    ${k.padEnd(20)} ${t.padEnd(8)} ${preview}`);
  }
}

const ok = (r) => (r.ok ? '\x1b[32mOK \x1b[0m' : `\x1b[31m${r.status}\x1b[0m`);

(async () => {
  console.log(`\nProbing ${BASE}\n${'='.repeat(60)}`);

  // 1. Does the key work at all?
  const customers = await call('GET', '/customers');
  console.log(`${ok(customers)} GET /customers  ->  ${Array.isArray(customers.json) ? `${customers.json.length} customers` : JSON.stringify(customers.json).slice(0, 120)}`);
  if (!customers.ok) {
    // Distinguish the three things a failure here can mean. They need
    // completely different fixes, and calling all of them "bad key" sends you
    // hunting for a new key when the real problem is your network.
    const body = typeof customers.json === 'string' ? customers.json : JSON.stringify(customers.json || '');
    if (/allowlist|egress|not allowed|blocked/i.test(body)) {
      console.error(`\nThe request never reached Nessie — something between you and it refused the host.`);
      console.error(`  ${body.slice(0, 200)}`);
      console.error(`\nThis is a network policy on your side (a corporate proxy, a VPN, a container egress`);
      console.error(`allowlist), not a problem with the key. Run this from a machine with plain outbound`);
      console.error(`access, or add api.nessieisreal.com to the allowlist.`);
    } else if (customers.status === 401 || customers.status === 403) {
      console.error(`\nNessie rejected the key (${customers.status}). Get a fresh one at https://nessieisreal.com.`);
    } else {
      console.error(`\nNessie answered ${customers.status} but not with data. It may be down — try again shortly.`);
      console.error(`  ${body.slice(0, 200)}`);
    }
    process.exit(1);
  }
  shape('Customer', customers.json);

  const accountsRes = await call('GET', '/accounts');
  console.log(`\n${ok(accountsRes)} GET /accounts  ->  ${Array.isArray(accountsRes.json) ? `${accountsRes.json.length} accounts` : ''}`);
  shape('Account', accountsRes.json);
  if (Array.isArray(accountsRes.json)) {
    const types = [...new Set(accountsRes.json.map((a) => a.type || a.account_type))];
    console.log(`\n    account types seen: ${types.join(' | ')}`);
  }

  const merchantsRes = await call('GET', '/merchants');
  console.log(`\n${ok(merchantsRes)} GET /merchants  ->  ${Array.isArray(merchantsRes.json) ? `${merchantsRes.json.length} merchants` : ''}`);
  shape('Merchant', merchantsRes.json);

  // 2. Purchases and loans hang off an account, so find one that has them.
  const someAccount = sample(accountsRes.json);
  if (someAccount?._id) {
    const purchasesRes = await call('GET', `/accounts/${someAccount._id}/purchases`);
    console.log(`\n${ok(purchasesRes)} GET /accounts/{id}/purchases  ->  ${Array.isArray(purchasesRes.json) ? `${purchasesRes.json.length} purchases` : ''}`);
    shape('Purchase', purchasesRes.json);

    const loansRes = await call('GET', `/accounts/${someAccount._id}/loans`);
    console.log(`\n${ok(loansRes)} GET /accounts/{id}/loans  ->  ${Array.isArray(loansRes.json) ? `${loansRes.json.length} loans` : ''}`);
    shape('Loan', loansRes.json);
  }

  if (!SEED) {
    console.log(`\n${'='.repeat(60)}\nRe-run with --seed to create Bubu's demo customer and data.\n`);
    return;
  }

  // 3. Seed a full demo portfolio.
  console.log(`\n${'='.repeat(60)}\nSeeding Bubu's demo portfolio\n`);

  const cust = unwrap(
    (
      await call('POST', '/customers', {
        first_name: 'Bubu',
        last_name: 'Learner',
        address: { street_number: '1', street_name: 'Campus Dr', city: 'Greenville', state: 'SC', zip: '29613' },
      })
    ).json
  );
  console.log(`  customer   ${cust?._id}`);

  const mk = async (type, nickname, balance) => {
    const r = await call('POST', `/customers/${cust._id}/accounts`, { type, nickname, rewards: 0, balance });
    const a = unwrap(r.json);
    console.log(`  ${type.padEnd(12)} ${a?._id}  ${nickname}`);
    return a;
  };
  const checking = await mk('Checking', 'Everyday Checking', 862);
  const savings = await mk('Savings', 'Cushion Savings', 415);
  const card = await mk('Credit Card', 'Student Credit Card', 0);

  const merchant =
    sample(merchantsRes.json) ||
    unwrap(
      (
        await call('POST', '/merchants', {
          name: 'Brew & Bean',
          category: ['Food'],
          address: { street_number: '100', street_name: 'Main St', city: 'Greenville', state: 'SC', zip: '29601' },
          geocode: { lat: 34.8526, lng: -82.394 },
        })
      ).json
    );

  const spend = [
    [64.5, 27, 'Meal plan top-up'],
    [6.25, 26, 'Latte'],
    [48.12, 25, 'Weekly groceries'],
    [22.0, 24, 'Monthly bus pass'],
    [15.99, 22, 'Subscription'],
    [89.0, 18, 'Organic chem text'],
    [51.3, 14, 'Weekly groceries'],
    [72.0, 8, 'Rain jacket'],
  ];
  let madePurchases = 0;
  for (const [amount, day, description] of spend) {
    const d = new Date();
    d.setDate(d.getDate() - day);
    const r = await call('POST', `/accounts/${checking._id}/purchases`, {
      merchant_id: merchant._id,
      medium: 'balance',
      purchase_date: d.toISOString().slice(0, 10),
      amount,
      status: 'completed',
      description,
    });
    if (r.ok) madePurchases++;
    else console.log(`  purchase failed (${r.status}): ${JSON.stringify(r.json).slice(0, 160)}`);
  }
  console.log(`  purchases  ${madePurchases}/${spend.length} created on the checking account`);

  const loanRes = await call('POST', `/accounts/${checking._id}/loans`, {
    type: 'student',
    status: 'approved',
    credit_score: 710,
    monthly_payment: 306.86,
    amount: 27000,
    description: 'Direct Unsubsidized, 6.52% fixed, 10-year standard',
  });
  console.log(`  loan       ${loanRes.ok ? unwrap(loanRes.json)?._id : `FAILED ${loanRes.status} ${JSON.stringify(loanRes.json).slice(0, 200)}`}`);
  if (!loanRes.ok) {
    console.log('  ^ if this failed on `type`, print the error above and adjust LOAN_TYPES in src/services/nessie.js');
  }

  console.log(`\n${'='.repeat(60)}\nPaste into .env:\n`);
  console.log(`VITE_NESSIE_KEY=${KEY}`);
  console.log(`VITE_NESSIE_CUSTOMER_ID=${cust._id}`);
  console.log(`\n(checking ${checking._id} / savings ${savings._id} / card ${card._id})\n`);
})().catch((e) => {
  console.error('\nProbe failed:', e.message);
  process.exit(1);
});
