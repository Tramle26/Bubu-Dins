/**
 * nessieMock.js — an in-memory bank that mirrors Nessie's shapes exactly.
 *
 * It exists so the lesson and the story-world scenarios still run when the
 * sandbox is down, the key is missing, or the app is served over https and the
 * browser blocks the plain-http API. Same field names, same id style, same
 * return values — swapping between live and mock changes nothing upstream.
 *
 * It also seeds a realistic month of a college student's spending, so the
 * expense-tracking activities have something to show on first load.
 */

const oid = () => {
  // Nessie ids are 24-char hex, so mock ids look the same to any code that
  // happens to validate them. The 'bb' prefix makes them easy to spot in logs.
  const hex = '0123456789abcdef';
  let s = 'bb';
  for (let i = 0; i < 22; i++) s += hex[Math.floor(Math.random() * 16)];
  return s;
};

const clone = (v) => JSON.parse(JSON.stringify(v));
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

const SEED_MERCHANTS = [
  { name: 'Campus Dining Hall', category: ['Food'] },
  { name: 'Riverside Grocery', category: ['Groceries'] },
  { name: 'Brew & Bean', category: ['Food'] },
  { name: 'City Transit', category: ['Transport'] },
  { name: 'StreamFlix', category: ['Subscriptions'] },
  { name: 'Textbook Exchange', category: ['Education'] },
  { name: 'Northside Laundry', category: ['Household'] },
  { name: 'Trailhead Outfitters', category: ['Shopping'] },
];

// A month that tells a story: dining and coffee quietly outrun everything else.
const SEED_PURCHASES = [
  { merchant: 'Campus Dining Hall', amount: 64.5, day: 27, description: 'Meal plan top-up' },
  { merchant: 'Brew & Bean', amount: 6.25, day: 26, description: 'Latte' },
  { merchant: 'Riverside Grocery', amount: 48.12, day: 25, description: 'Weekly groceries' },
  { merchant: 'City Transit', amount: 22.0, day: 24, description: 'Monthly bus pass' },
  { merchant: 'Brew & Bean', amount: 5.75, day: 23, description: 'Cold brew' },
  { merchant: 'StreamFlix', amount: 15.99, day: 22, description: 'Subscription' },
  { merchant: 'Brew & Bean', amount: 6.5, day: 20, description: 'Latte + pastry' },
  { merchant: 'Textbook Exchange', amount: 89.0, day: 18, description: 'Organic chem text' },
  { merchant: 'Campus Dining Hall', amount: 12.4, day: 17, description: 'Late lunch' },
  { merchant: 'Brew & Bean', amount: 6.25, day: 15, description: 'Latte' },
  { merchant: 'Riverside Grocery', amount: 51.3, day: 14, description: 'Weekly groceries' },
  { merchant: 'Northside Laundry', amount: 14.0, day: 13, description: 'Laundry card' },
  { merchant: 'Brew & Bean', amount: 7.1, day: 11, description: 'Latte + scone' },
  { merchant: 'Campus Dining Hall', amount: 18.75, day: 10, description: 'Dinner with friends' },
  { merchant: 'Trailhead Outfitters', amount: 72.0, day: 8, description: 'Rain jacket' },
  { merchant: 'Brew & Bean', amount: 6.25, day: 6, description: 'Latte' },
  { merchant: 'Riverside Grocery', amount: 44.88, day: 5, description: 'Weekly groceries' },
  { merchant: 'Brew & Bean', amount: 5.75, day: 3, description: 'Cold brew' },
  { merchant: 'Campus Dining Hall', amount: 21.3, day: 2, description: 'Weekend meals' },
];

export function createMockBank() {
  const db = {
    customers: new Map(),
    accounts: new Map(),
    purchases: new Map(),
    loans: new Map(),
    merchants: new Map(),
    deposits: new Map(),
    withdrawals: new Map(),
    transfers: new Map(),
    bills: new Map(),
  };

  // --- seed -----------------------------------------------------------------
  const merchantsByName = new Map();
  for (const m of SEED_MERCHANTS) {
    const rec = {
      _id: oid(),
      name: m.name,
      category: m.category,
      address: { street_number: '100', street_name: 'Main St', city: 'Greenville', state: 'SC', zip: '29601' },
      geocode: { lat: 34.8526, lng: -82.394 },
    };
    db.merchants.set(rec._id, rec);
    merchantsByName.set(m.name, rec);
  }

  const demoCustomer = {
    _id: oid(),
    first_name: 'Bubu',
    last_name: 'Learner',
    address: { street_number: '1', street_name: 'Campus Dr', city: 'Greenville', state: 'SC', zip: '29613' },
  };
  db.customers.set(demoCustomer._id, demoCustomer);

  const seedAccount = (type, nickname, balance) => {
    const rec = {
      _id: oid(),
      type,
      nickname,
      rewards: 0,
      balance,
      account_number: String(Math.floor(1e15 + Math.random() * 9e15)),
      customer_id: demoCustomer._id,
    };
    db.accounts.set(rec._id, rec);
    return rec;
  };

  const checking = seedAccount('Checking', 'Everyday Checking', 862.4);
  const savings = seedAccount('Savings', 'Cushion Savings', 415.0);
  const card = seedAccount('Credit Card', 'Student Credit Card', 0);

  for (const p of SEED_PURCHASES) {
    const merchant = merchantsByName.get(p.merchant);
    const rec = {
      _id: oid(),
      type: 'merchant',
      merchant_id: merchant._id,
      payer_id: checking._id,
      purchase_date: daysAgo(p.day),
      amount: p.amount,
      status: 'completed',
      medium: 'balance',
      description: p.description,
    };
    db.purchases.set(rec._id, rec);
  }

  // --- shared helpers -------------------------------------------------------
  const created = (message, obj) => clone(obj);
  const list = (map, pred) => clone([...map.values()].filter(pred || (() => true)));

  return {
    /** Handy for tests and for the "reset my sandbox" button. */
    _db: db,
    demoCustomerId: demoCustomer._id,
    starterAccountIds: { checking: checking._id, savings: savings._id, card: card._id },

    customers: {
      list: async () => list(db.customers),
      get: async (id) => clone(db.customers.get(id) || null),
      create: async (c) => {
        const rec = { _id: oid(), ...c };
        db.customers.set(rec._id, rec);
        return created('Customer created', rec);
      },
      update: async (id, patch) => {
        const rec = db.customers.get(id);
        if (rec) Object.assign(rec, patch);
        return clone(rec || null);
      },
      forAccount: async (accountId) => {
        const a = db.accounts.get(accountId);
        return clone((a && db.customers.get(a.customer_id)) || null);
      },
    },

    accounts: {
      list: async (type) => list(db.accounts, (a) => !type || a.type === type),
      get: async (id) => clone(db.accounts.get(id) || null),
      forCustomer: async (customerId) => list(db.accounts, (a) => a.customer_id === customerId),
      create: async (customerId, account) => {
        const rec = {
          _id: oid(),
          rewards: 0,
          balance: 0,
          account_number: String(Math.floor(1e15 + Math.random() * 9e15)),
          ...account,
          customer_id: customerId,
        };
        db.accounts.set(rec._id, rec);
        return created('Account created', rec);
      },
      update: async (id, patch) => {
        const rec = db.accounts.get(id);
        if (rec) Object.assign(rec, patch);
        return clone(rec || null);
      },
      remove: async (id) => {
        db.accounts.delete(id);
        return { code: 204, message: 'Account deleted' };
      },
    },

    purchases: {
      forAccount: async (accountId) => list(db.purchases, (p) => p.payer_id === accountId),
      get: async (id) => clone(db.purchases.get(id) || null),
      create: async (accountId, purchase) => {
        const rec = {
          _id: oid(),
          type: 'merchant',
          payer_id: accountId,
          ...purchase,
        };
        db.purchases.set(rec._id, rec);
        // The live sandbox moves the money; the mock does too, so utilization
        // and balances behave identically in both modes.
        const acct = db.accounts.get(accountId);
        if (acct) {
          const amt = Number(purchase.amount) || 0;
          acct.balance = acct.type === 'Credit Card' ? acct.balance + amt : acct.balance - amt;
        }
        return created('Purchase created', rec);
      },
      update: async (id, patch) => {
        const rec = db.purchases.get(id);
        if (rec) Object.assign(rec, patch);
        return clone(rec || null);
      },
      remove: async (id) => {
        const rec = db.purchases.get(id);
        if (rec) {
          const acct = db.accounts.get(rec.payer_id);
          if (acct) {
            const amt = Number(rec.amount) || 0;
            acct.balance = acct.type === 'Credit Card' ? acct.balance - amt : acct.balance + amt;
          }
        }
        db.purchases.delete(id);
        return { code: 204, message: 'Purchase deleted' };
      },
    },

    loans: {
      forAccount: async (accountId, { type, status } = {}) =>
        list(
          db.loans,
          (l) => l.account_id === accountId && (!type || l.type === type) && (!status || l.status === status)
        ),
      get: async (id) => clone(db.loans.get(id) || null),
      create: async (accountId, loan) => {
        const rec = {
          _id: oid(),
          account_id: accountId,
          creation_date: new Date().toISOString().slice(0, 10),
          status: 'pending',
          credit_score: 700,
          ...loan,
        };
        db.loans.set(rec._id, rec);
        return created('Loan created', rec);
      },
      update: async (id, patch) => {
        const rec = db.loans.get(id);
        if (rec) Object.assign(rec, patch);
        return clone(rec || null);
      },
      remove: async (id) => {
        db.loans.delete(id);
        return { code: 204, message: 'Loan deleted' };
      },
    },

    merchants: {
      list: async () => list(db.merchants),
      get: async (id) => clone(db.merchants.get(id) || null),
      create: async (m) => {
        const rec = { _id: oid(), ...m };
        db.merchants.set(rec._id, rec);
        return created('Merchant created', rec);
      },
    },

    deposits: {
      forAccount: async (accountId) => list(db.deposits, (d) => d.payee_id === accountId),
      create: async (accountId, deposit) => {
        const rec = { _id: oid(), type: 'deposit', payee_id: accountId, ...deposit };
        db.deposits.set(rec._id, rec);
        const acct = db.accounts.get(accountId);
        if (acct) acct.balance += Number(deposit.amount) || 0;
        return created('Deposit created', rec);
      },
    },

    withdrawals: {
      forAccount: async (accountId) => list(db.withdrawals, (w) => w.payer_id === accountId),
      create: async (accountId, withdrawal) => {
        const rec = { _id: oid(), type: 'withdrawal', payer_id: accountId, ...withdrawal };
        db.withdrawals.set(rec._id, rec);
        const acct = db.accounts.get(accountId);
        if (acct) acct.balance -= Number(withdrawal.amount) || 0;
        return created('Withdrawal created', rec);
      },
    },

    transfers: {
      forAccount: async (accountId) =>
        list(db.transfers, (t) => t.payer_id === accountId || t.payee_id === accountId),
      create: async (accountId, t) => {
        const rec = { _id: oid(), type: 'p2p', payer_id: accountId, ...t };
        db.transfers.set(rec._id, rec);
        const from = db.accounts.get(accountId);
        const to = db.accounts.get(t.payee_id);
        const amt = Number(t.amount) || 0;
        if (from) from.balance -= amt;
        if (to) to.balance += amt;
        return created('Transfer created', rec);
      },
    },

    bills: {
      forAccount: async (accountId) => list(db.bills, (b) => b.account_id === accountId),
      create: async (accountId, bill) => {
        const rec = { _id: oid(), account_id: accountId, status: 'pending', ...bill };
        db.bills.set(rec._id, rec);
        return created('Bill created', rec);
      },
    },
  };
}
