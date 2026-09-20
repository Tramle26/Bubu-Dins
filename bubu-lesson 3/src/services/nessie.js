/**
 * nessie.js — Capital One Nessie sandbox client for Bubu.
 *
 * Three things this file handles that a plain fetch wrapper would not:
 *
 * 1. MIXED CONTENT. Nessie is served over plain http. `https://api.nessieisreal.com`
 *    answers, but 302-redirects to http, so a browser on an https page (Netlify,
 *    Vercel, GitHub Pages) blocks the call silently. In dev, vite.config.js proxies
 *    /nessie -> http://api.nessieisreal.com. In production you need the same proxy as
 *    a serverless function — see netlify/functions/nessie.js in this bundle.
 *
 * 2. GRACEFUL DEGRADATION. If there is no key, or the sandbox is down or rate-limiting,
 *    the client transparently switches to an in-memory mock bank with identical shapes.
 *    The lesson and the story-world scenarios keep working. Demos do not die on stage.
 *
 * 3. SHAPE NORMALIZATION. Nessie returns bare objects on GET but wraps POST results in
 *    { code, message, objectCreated }. Everything here returns the bare object.
 *
 * Docs: https://nessieisreal.com/docs   Base: http://api.nessieisreal.com
 */

import { createMockBank } from './nessieMock.js';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const env = (typeof import.meta !== 'undefined' && import.meta.env) || {};

export const config = {
  apiKey: env.VITE_NESSIE_KEY || '',
  // '/nessie' is the dev proxy path. Set VITE_NESSIE_BASE to your serverless
  // proxy URL in production, or to http://api.nessieisreal.com to go direct.
  baseUrl: env.VITE_NESSIE_BASE || '/nessie',
  timeoutMs: Number(env.VITE_NESSIE_TIMEOUT || 8000),
  // Set VITE_NESSIE_MODE=mock to force the local bank even when a key is present.
  forceMock: env.VITE_NESSIE_MODE === 'mock',
};

export const ACCOUNT_TYPES = ['Checking', 'Savings', 'Credit Card'];
export const TRANSACTION_MEDIUMS = ['balance', 'rewards'];
export const TRANSACTION_STATUSES = ['pending', 'completed', 'cancelled'];
export const LOAN_TYPES = ['home', 'auto', 'small business', 'student'];
export const LOAN_STATUSES = ['pending', 'approved', 'declined'];

// ---------------------------------------------------------------------------
// Live / mock mode
// ---------------------------------------------------------------------------

const mock = createMockBank();
const listeners = new Set();

export const state = {
  mode: config.forceMock || !config.apiKey ? 'mock' : 'live',
  reason: config.forceMock
    ? 'Mock mode is forced by VITE_NESSIE_MODE.'
    : !config.apiKey
      ? 'No VITE_NESSIE_KEY is set, so Bubu is using its local practice bank.'
      : '',
  lastError: null,
};

/** Subscribe to mode changes so the UI can show an honest status chip. */
export function onModeChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function fallToMock(reason, error) {
  if (state.mode !== 'mock') {
    state.mode = 'mock';
    state.reason = reason;
    state.lastError = error ? String(error.message || error) : null;
    listeners.forEach((fn) => fn({ ...state }));
  }
}

/** Manually retry the live sandbox — wire this to a "Reconnect" button. */
export async function retryLive() {
  if (!config.apiKey) return { ...state };
  state.mode = 'live';
  state.reason = '';
  state.lastError = null;
  try {
    await request('GET', '/customers');
    listeners.forEach((fn) => fn({ ...state }));
  } catch {
    /* request() already fell back and notified */
  }
  return { ...state };
}

// ---------------------------------------------------------------------------
// Transport
// ---------------------------------------------------------------------------

class NessieError extends Error {
  constructor(message, { status, path, body } = {}) {
    super(message);
    this.name = 'NessieError';
    this.status = status;
    this.path = path;
    this.body = body;
  }
}

function withKey(path) {
  const join = path.includes('?') ? '&' : '?';
  return `${config.baseUrl}${path}${join}key=${encodeURIComponent(config.apiKey)}`;
}

/** POST/PUT return { code, message, objectCreated }; GET returns the object itself. */
const unwrap = (payload) =>
  payload && typeof payload === 'object' && 'objectCreated' in payload ? payload.objectCreated : payload;

async function request(method, path, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);
  try {
    const res = await fetch(withKey(path), {
      method,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });

    const text = await res.text();
    let payload = null;
    try {
      payload = text ? JSON.parse(text) : null;
    } catch {
      payload = text;
    }

    if (!res.ok) {
      // 400/404 are the caller's problem, not the sandbox's — surface them.
      // 401/403 mean a bad key, and 5xx/429 mean the sandbox is unwell: fall back.
      if (res.status === 401 || res.status === 403) {
        fallToMock('That Nessie key was rejected, so Bubu switched to its local practice bank.');
      } else if (res.status >= 500 || res.status === 429) {
        fallToMock('The Nessie sandbox is not responding, so Bubu switched to its local practice bank.');
      }
      throw new NessieError(
        (payload && (payload.message || payload.error)) || `Nessie returned ${res.status}`,
        { status: res.status, path, body: payload }
      );
    }
    return unwrap(payload);
  } catch (err) {
    if (err instanceof NessieError) throw err;
    // AbortError, TypeError (CORS / mixed content / offline) all land here.
    fallToMock(
      'Bubu could not reach the Nessie sandbox, so it switched to its local practice bank.',
      err
    );
    throw new NessieError(err.name === 'AbortError' ? 'Nessie timed out' : 'Nessie is unreachable', {
      path,
    });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Runs `live` against the API, and quietly runs `fallback` against the mock bank
 * if we are in (or drop into) mock mode. Every exported method goes through this.
 */
async function call(live, fallback) {
  if (state.mode === 'mock') return fallback();
  try {
    return await live();
  } catch (err) {
    if (state.mode === 'mock') return fallback();
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------

export const customers = {
  list: () => call(() => request('GET', '/customers'), () => mock.customers.list()),

  get: (id) => call(() => request('GET', `/customers/${id}`), () => mock.customers.get(id)),

  /**
   * @param {{first_name:string, last_name:string, address:{street_number:string,
   *   street_name:string, city:string, state:string, zip:string}}} customer
   */
  create: (customer) =>
    call(() => request('POST', '/customers', customer), () => mock.customers.create(customer)),

  update: (id, patch) =>
    call(() => request('PUT', `/customers/${id}`, patch), () => mock.customers.update(id, patch)),

  forAccount: (accountId) =>
    call(
      () => request('GET', `/accounts/${accountId}/customer`),
      () => mock.customers.forAccount(accountId)
    ),
};

// ---------------------------------------------------------------------------
// Accounts — Checking, Savings, Credit Card
// ---------------------------------------------------------------------------

export const accounts = {
  list: (type) =>
    call(
      () => request('GET', type ? `/accounts?type=${encodeURIComponent(type)}` : '/accounts'),
      () => mock.accounts.list(type)
    ),

  get: (id) => call(() => request('GET', `/accounts/${id}`), () => mock.accounts.get(id)),

  forCustomer: (customerId) =>
    call(
      () => request('GET', `/customers/${customerId}/accounts`),
      () => mock.accounts.forCustomer(customerId)
    ),

  /**
   * @param {string} customerId
   * @param {{type:'Checking'|'Savings'|'Credit Card', nickname:string,
   *   rewards:number, balance:number, account_number?:string}} account
   */
  create: (customerId, account) => {
    if (!ACCOUNT_TYPES.includes(account.type)) {
      throw new NessieError(`Account type must be one of ${ACCOUNT_TYPES.join(', ')}`);
    }
    const payload = { rewards: 0, balance: 0, ...account };
    return call(
      () => request('POST', `/customers/${customerId}/accounts`, payload),
      () => mock.accounts.create(customerId, payload)
    );
  },

  /** Nessie only accepts nickname and account_number on update. */
  update: (id, patch) =>
    call(() => request('PUT', `/accounts/${id}`, patch), () => mock.accounts.update(id, patch)),

  remove: (id) => call(() => request('DELETE', `/accounts/${id}`), () => mock.accounts.remove(id)),
};

// ---------------------------------------------------------------------------
// Purchases — the expense-tracking surface
// ---------------------------------------------------------------------------

export const purchases = {
  forAccount: (accountId) =>
    call(
      () => request('GET', `/accounts/${accountId}/purchases`),
      () => mock.purchases.forAccount(accountId)
    ),

  get: (id) => call(() => request('GET', `/purchases/${id}`), () => mock.purchases.get(id)),

  /**
   * @param {string} accountId  the account the money leaves
   * @param {{merchant_id:string, medium:'balance'|'rewards', purchase_date:string,
   *   amount:number, status?:string, description?:string}} purchase
   *   purchase_date is 'YYYY-MM-DD'.
   */
  create: (accountId, purchase) => {
    const payload = {
      medium: 'balance',
      status: 'pending',
      purchase_date: new Date().toISOString().slice(0, 10),
      ...purchase,
    };
    return call(
      () => request('POST', `/accounts/${accountId}/purchases`, payload),
      () => mock.purchases.create(accountId, payload)
    );
  },

  update: (id, patch) =>
    call(() => request('PUT', `/purchases/${id}`, patch), () => mock.purchases.update(id, patch)),

  remove: (id) => call(() => request('DELETE', `/purchases/${id}`), () => mock.purchases.remove(id)),

  /** Convenience: totals by merchant category for the expense-tracking activity. */
  async byCategory(accountId) {
    const [rows, merchantList] = await Promise.all([
      purchases.forAccount(accountId),
      merchants.list(),
    ]);
    const nameOf = new Map(merchantList.map((m) => [m._id, m]));
    const totals = new Map();
    for (const p of rows || []) {
      const m = nameOf.get(p.merchant_id);
      const category = (m && (Array.isArray(m.category) ? m.category[0] : m.category)) || 'Other';
      const prev = totals.get(category) || { category, total: 0, count: 0 };
      prev.total += Number(p.amount) || 0;
      prev.count += 1;
      totals.set(category, prev);
    }
    return [...totals.values()].sort((a, b) => b.total - a.total);
  },
};

// ---------------------------------------------------------------------------
// Loans — student loans live here
// ---------------------------------------------------------------------------

export const loans = {
  forAccount: (accountId, { type, status } = {}) => {
    const q = new URLSearchParams();
    if (type) q.set('type', type);
    if (status) q.set('status', status);
    const qs = q.toString();
    return call(
      () => request('GET', `/accounts/${accountId}/loans${qs ? `?${qs}` : ''}`),
      () => mock.loans.forAccount(accountId, { type, status })
    );
  },

  get: (id) => call(() => request('GET', `/loans/${id}`), () => mock.loans.get(id)),

  /**
   * @param {string} accountId
   * @param {{type:string, status:string, credit_score:number,
   *   monthly_payment:number, amount:number, description?:string}} loan
   */
  create: (accountId, loan) => {
    const payload = { status: 'pending', credit_score: 700, ...loan };
    return call(
      () => request('POST', `/accounts/${accountId}/loans`, payload),
      () => mock.loans.create(accountId, payload)
    );
  },

  update: (id, patch) =>
    call(() => request('PUT', `/loans/${id}`, patch), () => mock.loans.update(id, patch)),

  remove: (id) => call(() => request('DELETE', `/loans/${id}`), () => mock.loans.remove(id)),
};

// ---------------------------------------------------------------------------
// Merchants, deposits, withdrawals, transfers, bills
// ---------------------------------------------------------------------------

export const merchants = {
  list: () => call(() => request('GET', '/merchants'), () => mock.merchants.list()),
  get: (id) => call(() => request('GET', `/merchants/${id}`), () => mock.merchants.get(id)),
  create: (merchant) =>
    call(() => request('POST', '/merchants', merchant), () => mock.merchants.create(merchant)),
};

export const deposits = {
  forAccount: (accountId) =>
    call(
      () => request('GET', `/accounts/${accountId}/deposits`),
      () => mock.deposits.forAccount(accountId)
    ),
  create: (accountId, deposit) => {
    const payload = {
      medium: 'balance',
      status: 'completed',
      transaction_date: new Date().toISOString().slice(0, 10),
      ...deposit,
    };
    return call(
      () => request('POST', `/accounts/${accountId}/deposits`, payload),
      () => mock.deposits.create(accountId, payload)
    );
  },
};

export const withdrawals = {
  forAccount: (accountId) =>
    call(
      () => request('GET', `/accounts/${accountId}/withdrawals`),
      () => mock.withdrawals.forAccount(accountId)
    ),
  create: (accountId, withdrawal) => {
    const payload = {
      medium: 'balance',
      status: 'completed',
      transaction_date: new Date().toISOString().slice(0, 10),
      ...withdrawal,
    };
    return call(
      () => request('POST', `/accounts/${accountId}/withdrawals`, payload),
      () => mock.withdrawals.create(accountId, payload)
    );
  },
};

export const transfers = {
  forAccount: (accountId) =>
    call(
      () => request('GET', `/accounts/${accountId}/transfers`),
      () => mock.transfers.forAccount(accountId)
    ),
  /** @param {{medium:string, payee_id:string, amount:number, transaction_date?:string, description?:string}} t */
  create: (accountId, t) => {
    const payload = {
      medium: 'balance',
      status: 'completed',
      transaction_date: new Date().toISOString().slice(0, 10),
      ...t,
    };
    return call(
      () => request('POST', `/accounts/${accountId}/transfers`, payload),
      () => mock.transfers.create(accountId, payload)
    );
  },
};

export const bills = {
  forAccount: (accountId) =>
    call(() => request('GET', `/accounts/${accountId}/bills`), () => mock.bills.forAccount(accountId)),
  create: (accountId, bill) =>
    call(() => request('POST', `/accounts/${accountId}/bills`, bill), () => mock.bills.create(accountId, bill)),
};

// ---------------------------------------------------------------------------
// Bubu-level helpers
// ---------------------------------------------------------------------------

/**
 * Creates (or reuses) the three accounts the lesson teaches: Checking, Savings,
 * Credit Card. Idempotent by nickname so a student who refreshes mid-lesson does
 * not end up with six accounts.
 */
export async function ensureStarterAccounts(customerId, opts = {}) {
  const {
    checkingNickname = 'Everyday Checking',
    savingsNickname = 'Cushion Savings',
    cardNickname = 'Student Credit Card',
    openingChecking = 850,
    openingSavings = 400,
  } = opts;

  const existing = (await accounts.forCustomer(customerId)) || [];
  const byNickname = new Map(existing.map((a) => [a.nickname, a]));

  const wanted = [
    { type: 'Checking', nickname: checkingNickname, balance: openingChecking, rewards: 0 },
    { type: 'Savings', nickname: savingsNickname, balance: openingSavings, rewards: 0 },
    { type: 'Credit Card', nickname: cardNickname, balance: 0, rewards: 0 },
  ];

  const out = [];
  for (const spec of wanted) {
    const hit = byNickname.get(spec.nickname);
    out.push(hit || (await accounts.create(customerId, spec)));
  }
  return out;
}

/** One call for the portfolio dashboard: accounts + purchases + loans together. */
export async function loadPortfolio(customerId) {
  const accts = (await accounts.forCustomer(customerId)) || [];
  const perAccount = await Promise.all(
    accts.map(async (a) => ({
      account: a,
      purchases: (await purchases.forAccount(a._id).catch(() => [])) || [],
      loans: (await loans.forAccount(a._id).catch(() => [])) || [],
    }))
  );
  return {
    accounts: accts,
    purchases: perAccount.flatMap((p) => p.purchases),
    loans: perAccount.flatMap((p) => p.loans),
    mode: state.mode,
  };
}

export { NessieError };
export default { customers, accounts, purchases, loans, merchants, deposits, withdrawals, transfers, bills, state, onModeChange, retryLive, ensureStarterAccounts, loadPortfolio, config };
