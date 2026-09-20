import { mountPathMXBehavior } from "@pathmx/core/controls/browser";
// Adapted from the user-provided Bubu at the Bank artifact. No Claude runtime or browser credentials.
mountPathMXBehavior('[data-bank-controller]', (marker, { signal }) => {
const root = marker.closest('.bank-simulation');
if (!root) return;
const setTimeout = (fn, ms) => { const id = window.setTimeout(() => { if (!signal.aborted) fn(); }, ms); signal.addEventListener('abort', () => window.clearTimeout(id), {once:true}); return id; };

/* =====================================================================
   Bubu — Storyworld scene: Opening day at the bank
   Authored scenario engine; live sandbox data uses the separate server route.

   The scenario is data (SCENARIOS below). The engine walks beats and
   renders them. To change the script, edit the data — not the engine.
   ===================================================================== */

// Temporary fictional case records. Never used as an API failure fallback.
const bankState = { mode: 'mock', calls: [] };

const oid = () => {
  let s = 'bb';
  for (let i = 0; i < 22; i++) s += '0123456789abcdef'[(Math.random() * 16) | 0];
  return s;
};

const mockDb = { customers: new Map(), accounts: new Map(), purchases: new Map(), merchants: new Map() };

for (const [name, cat] of [
  ['Brew & Bean', 'Food'],
  ['Riverside Grocery', 'Groceries'],
  ['City Transit', 'Transport'],
  ['Textbook Exchange', 'Education'],
  ['Northside Auto', 'Transport'],
]) {
  const m = { _id: oid(), name, category: [cat] };
  mockDb.merchants.set(m._id, m);
}

const mockBank = {
  async createCustomer(c) {
    const rec = { _id: oid(), ...c };
    mockDb.customers.set(rec._id, rec);
    return rec;
  },
  async createAccount(customerId, a) {
    const rec = {
      _id: oid(),
      rewards: 0,
      balance: 0,
      account_number: String(Math.floor(1e15 + Math.random() * 9e15)),
      ...a,
      customer_id: customerId,
    };
    mockDb.accounts.set(rec._id, rec);
    return rec;
  },
  async accountsFor(customerId) {
    return [...mockDb.accounts.values()].filter((a) => a.customer_id === customerId);
  },
  async createPurchase(accountId, p) {
    const rec = { _id: oid(), type: 'merchant', payer_id: accountId, ...p };
    mockDb.purchases.set(rec._id, rec);
    const acct = mockDb.accounts.get(accountId);
    if (acct) {
      const amt = Number(p.amount) || 0;
      // On a Credit Card, Nessie's single `balance` field is money OWED,
      // so a purchase raises it. On cash accounts it lowers it.
      acct.balance = acct.type === 'Credit Card' ? acct.balance + amt : acct.balance - amt;
    }
    return rec;
  },
  async createWithdrawal(accountId, w) {
    const acct = mockDb.accounts.get(accountId);
    if (acct) acct.balance -= Number(w.amount) || 0;
    return { _id: oid(), type: 'withdrawal', payer_id: accountId, ...w };
  },
  async createDeposit(accountId, d) {
    const acct = mockDb.accounts.get(accountId);
    if (acct) acct.balance += Number(d.amount) || 0;
    return { _id: oid(), type: 'deposit', payee_id: accountId, ...d };
  },
  async createTransfer(fromId, t) {
    const from = mockDb.accounts.get(fromId);
    const to = mockDb.accounts.get(t.payee_id);
    const amt = Number(t.amount) || 0;
    if (from) from.balance -= amt;
    if (to) to.balance += amt;
    return { _id: oid(), type: 'p2p', payer_id: fromId, ...t };
  },
  merchants: () => [...mockDb.merchants.values()],
};

function logCall(method, path, detail) {
  bankState.calls.unshift({ method, path, detail });
  bankState.calls = bankState.calls.slice(0, 20);
  renderWire();
}

const bank = {...mockBank, async probe() {}};
/* ---------------------------------------------------------- helpers */

const usd = (n, cents = false) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0,
  }).format(Number.isFinite(+n) ? +n : 0);

const short = (id) => (id ? String(id).slice(0, 6) + '…' : '—');
const today = () => new Date().toISOString().slice(0, 10);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const ICONS = {
  card: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="5" width="20" height="14" rx="2.5"/><path d="M2 10h20"/></svg>',
  doc: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/></svg>',
  piggy: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a7 7 0 0 1 7-7h3a7 7 0 0 1 7 7v3a2 2 0 0 1-2 2h-1v2h-3v-2H9v2H6v-2.3A7 7 0 0 1 4 15z"/><circle cx="16" cy="11" r="1"/><path d="M2 11v3"/></svg>',
  shield: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5z"/><path d="m9 12 2 2 4-4"/></svg>',
  clock: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  chart: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20h18M6 16v-5M11 16V7M16 16v-8M21 16v-3"/></svg>',
  alert: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 2 20h20z"/><path d="M12 9v5M12 17.2v.1"/></svg>',
  coin: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.5 9.5h4a1.75 1.75 0 0 1 0 3.5h-3a1.75 1.75 0 0 0 0 3.5h4"/></svg>',
  bank: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9 12 4l9 5M4 9v9M20 9v9M8 12v4M12 12v4M16 12v4M2 21h20"/></svg>',
  spark: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v5M12 17v5M2 12h5M17 12h5M5.6 5.6l3.2 3.2M15.2 15.2l3.2 3.2M18.4 5.6l-3.2 3.2M8.8 15.2l-3.2 3.2"/></svg>',
};

/* -------------------------------------------------------------------
   2. What Tram knows. Each entry is a question a real 18-year-old asks
   at a bank counter, plus the answer a good associate gives — short,
   concrete, no upsell. `keys` drive free-text matching.
   ------------------------------------------------------------------- */

const KB = [
  {
    id: 'checking-vs-savings', icon: 'card', teaches: 'Checking vs savings',
    q: 'What is the difference between savings and checking?',
    keys: ['difference', 'checking', 'savings', 'saving vs', 'two accounts'],
    a: `Checking is the account money moves <strong>through</strong>. Your paycheck lands there, rent leaves from there, your debit card spends from there. It pays you almost nothing in interest, and that is fine, because nothing should sit in it for long.
    <p>Savings is where money <strong>sits</strong>. It earns a bit more, and some savings accounts impose their own transfer limits — which sounds like a restriction but is really the point. It makes the money slightly annoying to reach, and slightly annoying is what keeps it there.</p>`,
  },
  {
    id: 'what-you-need', icon: 'doc', teaches: 'What opening takes',
    q: 'What do I need to open an account?',
    keys: ['what do i need', 'documents', 'id', 'requirements', 'bring', 'open an account'],
    a: `A government photo ID, your Social Security number, and something with your current address on it — a lease or a utility bill works, and for students a dorm assignment letter usually does too.
    <p>There is often an opening deposit, though it is small, sometimes $25. If you are under 18 you need a parent or guardian on the account with you.</p>`,
  },
  {
    id: 'how-much-savings', icon: 'piggy', teaches: 'How much to keep',
    q: 'How much money should I keep in savings?',
    keys: ['how much', 'emergency fund', 'keep in savings', 'cushion', 'how much should'],
    a: `An illustrative starting target is three to six months of expenses, and for a college student that can sound absurd. So start smaller: one month of the things that would actually hurt to miss. Rent, food, transit.
    <p>Build it $10 or $20 at a time. A cushion you fill slowly is one you finish. A cushion you plan to fill in one heroic transfer is one that never happens.</p>`,
  },
  {
    id: 'fees', icon: 'alert', teaches: 'The fees',
    q: 'What fees am I going to get charged?',
    keys: ['fee', 'fees', 'charge', 'cost', 'monthly', 'maintenance'],
    a: `I will be straight with you, because this is where students lose the most money. A monthly maintenance fee runs $4 to $25 — ours is $12 and I will show you three ways to get it waived. Using another bank's ATM costs $2.50 to $5 <em>per visit</em>. An overdraft is up to $35. Going over the transfer limit on savings is $3 to $25.
    <p>None of those are unavoidable. All of them are bigger than any interest you will earn this year. Fix the fees first, then worry about the rate.</p>`,
  },
  {
    id: 'apy', icon: 'chart', teaches: 'APY vs APR',
    q: 'What is APY, and why is yours different from the bank across the street?',
    keys: ['apy', 'apr', 'interest rate', 'yield', 'earn'],
    a: `APY is what you earn over a year <em>including</em> interest compounding on itself. APR is the plain rate with no compounding in it. We quote APY when we are paying you and APR when you are paying us, which tells you which one tends to look better.
    <p>And yes, online-only banks pay more — an illustrative 4% versus 0.6% in this case. Same federal insurance, same access. On $2,000 that gap is about $73 a year. I am not supposed to love telling you that, but you asked.</p>`,
  },
  {
    id: 'debit-card', icon: 'card', teaches: 'Debit vs credit',
    q: 'Is a debit card the same as a credit card?',
    keys: ['debit', 'debit card', 'same as credit', 'difference between debit'],
    a: `No, and it is the single most useful distinction in this building. A <strong>debit</strong> card spends money you already have — it pulls straight from checking, and if the money is not there the payment fails or overdrafts.
    <p>A <strong>credit</strong> card spends the bank's money and bills you later. Nothing leaves your account at the till. That is why a credit card builds a record and a debit card does not: there is nothing to record. You never borrowed anything.</p>`,
  },
  {
    id: 'fdic', icon: 'shield', teaches: 'Deposit insurance',
    q: 'What happens to my money if the bank fails?',
    keys: ['bank fails', 'fdic', 'insured', 'safe', 'lose my money', 'collapse'],
    a: `Deposits here are federally insured up to $250,000 per depositor, per insured bank, per ownership category. If we went under tomorrow, you would be made whole — this is the one part of banking where you genuinely do not need to worry.
    <p>Worth knowing the limit is per <em>bank</em>, not per account. Not a problem you will have this year.</p>`,
  },
  {
    id: 'overdraft', icon: 'alert', teaches: 'Overdraft',
    q: 'What actually happens if I overdraw?',
    keys: ['overdraw', 'overdraft', 'negative', 'not enough money', 'decline'],
    a: `Two versions, and you get to pick which one you have. With overdraft coverage on, we let the payment go through and charge you up to $35 for covering it. Buy a $4 coffee with $2 in the account and the coffee cost $39.
    <p>With it off, the payment is simply declined. It is embarrassing for ten seconds and it is free. Most people your age are better off declining coverage and linking savings as the backup instead.</p>`,
  },
  {
    id: 'minimum-balance', icon: 'coin', teaches: 'Minimum balance',
    q: 'What is a minimum balance requirement?',
    keys: ['minimum balance', 'minimum', 'balance requirement', 'how low'],
    a: `It is a floor you have to stay above, or the monthly fee comes back. If ours is $100 and you have $850, only $750 of that is really yours to spend without consequence.
    <p>The trap is treating the whole balance as spendable and then wondering where the fee came from. If you take one of our other waivers instead, you do not have to think about it at all.</p>`,
  },

  /* --- credit --- */
  {
    id: 'credit-score', icon: 'chart', teaches: 'Credit score',
    q: 'What is a credit score and how do I get one?',
    keys: ['credit score', 'score', 'fico', 'credit history', 'build credit'],
    a: `It runs 300 to 850 and it predicts one thing: whether you pay on time. It is not a measure of how much money you have, and plenty of people with money have bad ones.
    <p>You get one by borrowing something small and paying it back on schedule. Five things make it up — paying on time is 35%, how much of your limit you are using is 30%, how long your accounts have been open is 15%, and new accounts and credit mix are 10% each. Review your credit reports at AnnualCreditReport.com; reports do not necessarily include a score.</p>`,
  },
  {
    id: 'utilization', icon: 'chart', teaches: 'Utilization',
    q: 'How much of the card am I allowed to use?',
    keys: ['how much can i use', 'utilization', 'usage', 'percent of limit', 'max out'],
    a: `Allowed, all of it. Advisable, under 10% on the day your statement closes. That is the number we report, not the number after you pay.
    <p>On a $500 limit that means about $50. Which is why a small limit is <em>harder</em> to manage than a big one, not safer — one textbook can blow past it.</p>`,
  },
  {
    id: 'apr-grace', icon: 'clock', teaches: 'Grace period',
    q: 'When do I actually get charged interest?',
    keys: ['interest', 'charged interest', 'grace', 'apr on the card', 'when do i pay'],
    a: `Only if you carry a balance. Pay the <strong>statement balance</strong> in full by the due date and you are inside the grace period — 20 to 30 days — and the interest is zero. Not low. Zero.
    <p>Carry even part of it and the grace period ends. Interest starts on the leftover and on everything you buy next, from the day you buy it. At around 21% that gets expensive fast.</p>`,
  },
  {
    id: 'hard-inquiry', icon: 'doc', teaches: 'Hard inquiries',
    q: 'Does applying hurt my score?',
    keys: ['applying hurt', 'inquiry', 'hard pull', 'does applying', 'affect my score'],
    a: `A little, briefly. A hard inquiry takes a few points off and fades within a year. New credit is 10% of the score.
    <p>What actually hurts is applying to six cards in a month. One application for a card you intend to keep for a decade is a rounding error against the fifteen percent you earn by having an old account.</p>`,
  },
  {
    id: 'limit-size', icon: 'coin', teaches: 'Choosing a limit',
    q: 'Should I ask for a high limit or a low one?',
    keys: ['high limit', 'low limit', 'credit limit', 'how much limit', 'ask for'],
    a: `People assume low is safer. It is usually the opposite. Your limit is the denominator in the utilization number, so a low one makes ordinary spending look like strain.
    <p>Take the limit and do not spend it. That is the whole trick. If you do not trust yourself with the card in your practice cash, leave the card at home — the limit is not what makes you spend.</p>`,
  },
  {
    id: 'credit-vs-debit', icon: 'card', teaches: 'When to use which',
    q: 'Why would I use the credit card instead of the debit card?',
    keys: ['why use credit', 'instead of debit', 'which card', 'when to use'],
    a: `Three reasons. It builds the record, which the debit card cannot. It has stronger fraud protection — a stolen credit card is our money going missing, a stolen debit card is your rent going missing while we investigate. And some cards pay a little back.
    <p>All three only hold if you pay it in full. The moment you carry a balance, the card stops being a tool and starts being a loan at 21%.</p>`,
  },
  {
    id: 'annual-fee', icon: 'alert', teaches: 'Card fees',
    q: 'Is there a fee just for having the card?',
    keys: ['annual fee', 'fee for the card', 'cost to have', 'yearly fee'],
    a: `Some cards charge $15 to $300 a year. Our student card charges nothing, and you should be sceptical of any first card that does charge.
    <p>The fees to actually watch are the late fee — $30 to $35, charged every month you are late — and the over-limit fee, up to $35. Both are avoidable with autopay and a limit you do not crowd.</p>`,
  },
  {
    id: 'statement-vs-current', icon: 'doc', teaches: 'Which number to pay',
    q: 'Which number on the app am I supposed to pay?',
    keys: ['which number', 'statement balance', 'current balance', 'what do i pay'],
    a: `The <strong>statement balance</strong>. That is what you spent during the billing cycle that just closed, and paying it in full is the line between zero interest and interest.
    <p>The <strong>current balance</strong> is that plus everything you have bought since the statement closed. You can pay it, and it does no harm, but it is never what is due.</p>`,
  },
  {
    id: 'minimum-payment', icon: 'alert', teaches: 'The minimum trap',
    q: 'What if I just pay the minimum every month?',
    keys: ['minimum payment', 'pay the minimum', 'just the minimum', 'smallest payment'],
    a: `The minimum is designed to be payable, not to get you out of debt. It is roughly 2% of the balance, which covers the interest and very little else.
    <p>On a $1,200 balance at 21.5%, paying only the minimum takes about 87 months and costs roughly $1,097 in interest. The same $1,200 cleared over 12 months costs about $144. Same purchase, $950 difference.</p>`,
  },
];

const kbById = Object.fromEntries(KB.map((k) => [k.id, k]));

/* -------------------------------------------------------------------
   3. The script. Beat types:
     say      Tram (or Bubu) speaks, then the scene advances.
     choose   the player picks a line; each option may teach, pay
              credits, and set a flag the later beats read.
     ask      the free-question loop, gated on a minimum.
     api      a real call to the bank, with a receipt in the log.
     debrief  what Bubu learned, and the credits for it.
   ------------------------------------------------------------------- */

const SCENARIOS = [
  /* =============================================== 1. the accounts === */
  {
    id: 'accounts',
    title: 'Opening the account',
    where: 'Greenville Community Bank · Tuesday, 10:15am',
    beat: 'Bubu has never opened an account before.',
    sub: 'Ask Tram anything. She will not move on until you have asked at least two questions — that is the point of sitting down with a person.',
    beats: [
      { t: 'say', who: 'tram', text: 'Hi Bubu! What can I help you with today?' },
      {
        t: 'choose',
        prompt: 'What would you like to say?',
        options: [
          {
            icon: 'bank', label: 'I want to open a bank account.',
            reply: `Good place to start. Most students end up with two accounts, not one — a checking account for money moving through, and a savings account for money sitting still. I will set up both, but ask me whatever you want first. People sign things at this desk they do not understand, and I would rather you were not one of them.`,
          },
          {
            icon: 'coin', label: 'My financial aid refund is coming and I have nowhere to put it.',
            reply: `Then you came at exactly the right time — a refund landing in an account you have not thought about is how it disappears. We will set up two accounts, checking for what moves and savings for what stays, so the refund has somewhere to go that is not your practice cash. Ask me anything first, though.`,
          },
          {
            icon: 'spark', label: 'Honestly, I am not sure. My roommate said I need one.',
            reply: `Your roommate is right, and not being sure is a completely normal place to start. Nearly everyone sits down here knowing they should and not knowing why. Let us fix the why first — ask me whatever you want, and then I will open what you actually need rather than what I am supposed to sell you.`,
          },
        ],
      },
      {
        t: 'ask',
        pool: ['checking-vs-savings', 'what-you-need', 'how-much-savings', 'fees', 'apy', 'debit-card', 'fdic', 'overdraft', 'minimum-balance'],
        min: 2,
        ready: 'I think I am ready.',
        readyReply: 'Good questions. Now the parts where you have to decide something.',
      },
      {
        t: 'allocate',
        prompt: 'How much do you want to put in each one?',
        subtitle: 'This is fictional scenario money. Whatever you deposit leaves your practice cash and lands in the bank.',
        confirm: 'Open the accounts',
        say: 'Deposit what I have set here.',
        destinations: [
          {
            key: 'checking', label: 'Everyday Checking', icon: 'card',
            color: 'var(--green)', soft: 'var(--green-soft)',
            sub: 'Rent, food, the debit card. Money moving through.', default: 350,
          },
          {
            key: 'savings', label: 'Cushion Savings', icon: 'piggy',
            color: 'var(--teal)', soft: 'var(--teal-soft)',
            sub: 'The money you are not planning to touch.', default: 150,
          },
        ],
        // There is no single right split, so Tram responds to what you actually
        // did rather than checking it against one answer.
        review(plan, c) {
          const checking = plan.checking || 0;
          const savings = plan.savings || 0;
          const total = checking + savings;
          const kept = c.caseCash - total;

          if (total === 0) {
            return { reply: `You have to put something in — an account with nothing in it cannot pay for anything, and some banks close an empty one after a few months. Slide something across.`, retry: true };
          }
          if (checking === 0) {
            return {
              reply: `I will open them, and I want to flag the checking account at zero. Every purchase now becomes a transfer out of savings, and this fictional savings account has a six-transfer monthly limit. Move some across when you get a chance.`,
              teaches: 'Checking vs savings',
            };
          }
          if (savings === 0) {
            return {
              reply: `Done. Nothing is set aside though, so the first unexpected ${usd(200)} comes straight out of the money you were going to live on. You can move some across any time, and I would.`,
              teaches: 'Checking vs savings',
            };
          }
          if (checking < 100) {
            return {
              reply: `Your instinct is right and the split is a little aggressive. ${usd(checking)} in checking is thin once rent and a phone bill land, and this fictional account allows six free savings transfers a month. It works — just keep an eye on it.`,
              credits: 20, teaches: 'Checking vs savings',
            };
          }
          const note = kept > total
            ? ` You kept ${usd(kept)} back in your practice cash, which is more than you deposited — that is fine, just remember cash in a cash balance earns nothing and is the easiest money in the world to spend.`
            : kept > 0
              ? ` And ${usd(kept)} stays in your practice cash for the week.`
              : ` That is everything you had, so watch the balance until your next paycheck.`;
          return {
            reply: `Good split. Enough in checking that rent and groceries clear without you watching the balance, and a cushion that exists from day one instead of "starting next month."${note}`,
            credits: 45, teaches: 'Checking vs savings', good: true,
          };
        },
      },
      {
        t: 'choose',
        prompt: 'Now the box I have to ask about: overdraft coverage on the debit card. Do you want it?',
        subtitle: 'This is a fictional opt-in choice. Banks are required to ask.',
        options: [
          {
            icon: 'alert', label: 'Yes — I would rather the payment go through.', say: 'Turn it on, I guess. I do not want a card getting declined.',
            reply: `I will note it, and I want you to know the price. We cover the payment and charge up to $35 for doing it. A $4 coffee bought with $2 in the account is a $39 coffee. Some people decide that is worth it for rent. Almost nobody decides it is worth it for coffee.`,
          },
          {
            icon: 'shield', label: 'No — decline it, and link my savings as backup.', say: 'No thanks. Can you link my savings as the backup instead?',
            credits: 40, good: true, teaches: 'Overdraft',
            reply: `That is the right call and the one I would make. The card declines instead of charging you, and if the savings link covers it there is usually a small transfer fee at worst instead of $35. Done.`,
          },
          {
            icon: 'clock', label: 'No — and set a low-balance alert instead.', say: 'Leave it off. Can I get an alert when the balance drops?',
            credits: 40, good: true, teaches: 'Overdraft',
            reply: `Also a good answer, and honestly the alert is the part that does the work. We will text you under $50. Most overdrafts are not people spending money they do not have on purpose — they are people who lost track of the number.`,
          },
        ],
      },
      {
        t: 'choose',
        prompt: 'Last one. The checking account has a $12 monthly maintenance fee, but there are three ways to have it waived. Which suits you?',
        subtitle: '$12 a month is $144 a year. This is the most valuable question at this desk.',
        options: [
          {
            icon: 'doc', label: 'Direct deposit — my campus job pays me electronically.', say: 'My campus job pays by direct deposit. Does that count?',
            credits: 30, good: true, teaches: 'Fee waivers',
            reply: `It does, and it is the easiest of the three because you only set it up once. Fee waived as long as anything lands in the account each month.`,
          },
          {
            icon: 'coin', label: 'Minimum balance — I will keep $100 in there.', say: 'I will just keep a hundred dollars in it.',
            credits: 20, teaches: 'Fee waivers',
            reply: `That works too. Just remember the $100 is not spendable — it is rent for the account. If the balance dips under it for one day, the fee comes back that month.`,
          },
          {
            icon: 'spark', label: 'Student status — I am enrolled full time.', say: 'I am a full-time student. Is there a student waiver?',
            credits: 30, good: true, teaches: 'Fee waivers',
            reply: `There is, and you should take it. One thing to diary: it expires when you graduate, and that is exactly when people stop reading their statements. Set a reminder for yourself now.`,
          },
        ],
      },
      {
        t: 'api',
        steps: 2,
        label: 'Tram turns the laptop toward you.',
        say: 'Alright. Opening them now — watch the screen, this is a temporary practice record.',
        async run(ctx) {
          const customer = await bank.createCustomer({
            first_name: 'Bubu',
            last_name: 'Learner',
            address: { street_number: '1', street_name: 'Campus Dr', city: 'Greenville', state: 'SC', zip: '29613' },
          });
          ctx.customerId = customer._id;

          const checking = await bank.createAccount(customer._id, {
            type: 'Checking', nickname: 'Everyday Checking', rewards: 0, balance: ctx.flags.checking ?? 350,
          });
          const savings = await bank.createAccount(customer._id, {
            type: 'Savings', nickname: 'Cushion Savings', rewards: 0, balance: ctx.flags.savings ?? 150,
          });
          ctx.accounts.checking = checking;
          ctx.accounts.savings = savings;

          return {
            head: 'Two accounts opened',
            lines: [
              ['POST', '/customers', `Bubu Learner → ${customer._id}`],
              ['POST', `/customers/${short(customer._id)}/accounts`, `Checking · ${usd(checking.balance)} → ${checking._id}`],
              ['POST', `/customers/${short(customer._id)}/accounts`, `Savings · ${usd(savings.balance)} → ${savings._id}`],
            ],
          };
        },
        after: `There you go. Debit card arrives in about a week, and the account numbers are on the paperwork. Anything that happens to this money from now on is a record you can look up.`,
        then: 'paycheck',
      },
      {
        t: 'debrief',
        title: 'Scenario 1 complete',
        points: [
          'Checking is for money moving through. Savings is for money sitting still.',
          'Overdraft coverage is opt-in and costs up to $35 a time. Declining it and linking savings is usually the better trade.',
          'The $12 monthly fee is waivable three ways. $144 a year is more than a student account will ever earn in interest.',
        ],
        credits: 100,
      },
    ],
  },

  /* ================================================ 2. the card ====== */
  {
    id: 'card',
    title: 'The student credit card',
    where: 'Greenville Community Bank',
    beat: 'The student credit card.',
    sub: 'Understand it well, and ask carefully before you sign.',
    beats: [
      {
        t: 'say', who: 'tram',
        text: `You qualify for our student card — no annual fee, small limit to start. I am required to tell you I can offer it. I am not required to tell you to take it, and I am not going to.
        <p>Ask me about it properly first, and make sure you understand it before you sign anything.</p>`,
      },
      {
        t: 'ask',
        pool: ['credit-score', 'utilization', 'apr-grace', 'hard-inquiry', 'limit-size', 'credit-vs-debit', 'annual-fee', 'debit-card'],
        min: 2,
        ready: 'Okay. I understand it well enough.',
        readyReply: 'Then you are in a better position than most people who sign this form. Your call.',
      },
      {
        t: 'choose',
        prompt: 'So — do you want the card?',
        subtitle: 'Both answers are defensible. Tram means it.',
        options: [
          {
            icon: 'card', label: 'Yes. I want to start the clock on my credit history.', say: 'Yes. If length of history is the part I cannot speed up later, I should start now.',
            set: { wantsCard: true }, credits: 50, good: true, teaches: 'Starting the clock',
            reply: `That is the right reason, and it is the one almost nobody says out loud. The rewards are noise. The fifteen percent of your score that is length of history only accrues by waiting, and you cannot buy it back at 30.`,
          },
          {
            icon: 'shield', label: 'Not yet. I want to see how I handle the debit card first.', say: 'Not yet. Let me see how I do with the debit card for a few months.',
            set: { wantsCard: false }, credits: 30, good: true, teaches: 'Knowing your own habits',
            reply: `Genuinely fine, and I will not push you. You lose a few months of history, which matters a little. You avoid a balance you cannot clear, which matters more if that is a real risk for you. Come back in the spring — the offer does not expire.`,
          },
        ],
      },
      {
        t: 'choose',
        prompt: 'What limit would you like me to put you in for?',
        subtitle: 'Remember what the limit does to the utilization number.',
        when: (ctx) => ctx.flags.wantsCard !== false,
        options: [
          {
            icon: 'coin', label: '$500 — keep it small so I cannot get into trouble.', say: 'Keep it low. $500.',
            set: { limit: 500 },
            reply: `The instinct is good and the arithmetic works against you. Under 10% of $500 is $50 — one textbook takes you past it, and the statement reports that. A small limit does not stop you spending, it just makes ordinary spending look bad.`,
          },
          {
            icon: 'chart', label: '$1,500 — and I will treat it like it is $150.', say: 'Make it $1,500, and I will act like the limit is $150.',
            set: { limit: 1500 }, credits: 50, good: true, teaches: 'Limit vs utilization',
            reply: `That is exactly the move. The limit is the denominator, so a bigger one gives you room to look sensible. What stops you spending is not the limit, it is you — and you just said the right sentence out loud.`,
          },
          {
            icon: 'spark', label: '$3,000 — the highest I can get.', say: 'What is the highest you can give me?',
            set: { limit: 3000 },
            reply: `I can put you in for it, and on paper it is good for your utilization. I will say the quiet part: a $3,000 limit in a first-year student's caseCash is a lot of rope. If you take it, the card lives in a drawer and comes out for the bills you already planned.`,
          },
        ],
      },
      {
        t: 'choose',
        prompt: 'Autopay. What should I set it to?',
        when: (ctx) => ctx.flags.wantsCard !== false,
        options: [
          {
            icon: 'clock', label: 'Autopay the minimum, and I will pay the rest by hand.', say: 'Set autopay for the minimum. I will pay the full statement myself.',
            credits: 50, good: true, teaches: 'Autopay as insurance',
            reply: `The best answer, and it is subtle, so let me say why. Autopay on the minimum means a bad week never turns into a $35 late fee and a mark on your record. Paying the statement by hand means you actually look at what you spent. Insurance underneath, attention on top.`,
          },
          {
            icon: 'shield', label: 'Autopay the full statement balance.', say: 'Just autopay the whole statement.',
            credits: 35, teaches: 'Autopay as insurance',
            reply: `Safe, and I will set it. One caveat: it only works if checking always has enough, or you have swapped a $35 late fee for a $35 overdraft. And you stop looking at the statement, which is how people discover a subscription they cancelled two years ago is still running.`,
          },
          {
            icon: 'alert', label: 'No autopay. I will remember.', say: 'I do not need autopay. I will just remember.',
            reply: `You will, for about five months. Then you will have a week with three deadlines and a broken laptop. The late fee is $30 to $35 and a payment over 30 days late lands on the thing that is 35% of your score. Set the minimum at least — it costs you nothing if you never need it.`,
          },
        ],
      },
      {
        t: 'api',
        steps: 1,
        label: 'Tram types for a moment.',
        say: 'Approved. Here it is.',
        when: (ctx) => ctx.flags.wantsCard !== false,
        async run(ctx) {
          const card = await bank.createAccount(ctx.customerId, {
            type: 'Credit Card', nickname: 'Student Credit Card', rewards: 0, balance: 0,
          });
          ctx.accounts.card = card;
          ctx.flags.limit = ctx.flags.limit || 1500;
          return {
            head: 'Credit card opened',
            lines: [
              ['POST', `/customers/${short(ctx.customerId)}/accounts`, `Credit Card · limit ${usd(ctx.flags.limit)} → ${card._id}`],
            ],
            note: `Opening balance ${usd(0, true)} — a card is not money until you spend on it.`,
          };
        },
        after: `Card comes in seven to ten days. Balance is zero, which is the only number on that account I ever want to see you happy about.`,
      },
      {
        t: 'debrief',
        title: 'Scenario 2 complete',
        points: [
          'Pay the statement balance in full inside the grace period and the interest is zero, not low.',
          'Utilization is measured on the statement date. A bigger limit makes the same spending look better.',
          'Length of credit history is 15% of the score and the only part you cannot speed up later.',
        ],
        credits: 120,
      },
    ],
  },

  /* ============================================= 3. the first month == */
  {
    id: 'month',
    title: 'Your first month',
    where: 'Campus · four weeks later',
    beat: 'The cards arrived. Now the month happens.',
    sub: 'Every choice here posts a real transaction. The statement at the end is computed from what you actually did.',
    beats: [
      {
        t: 'say', who: 'tram',
        text: `Tram here — I am the one who set up your accounts. I get a note when a new student account has its first month, and I call. Most of what goes wrong goes wrong in the first thirty days.
        <p>Walk me through it as it happens. I will tell you at the end what your statement looks like.</p>`,
      },
      {
        t: 'choose',
        prompt: 'Week one. Groceries, $52.40. Which card?',
        options: [
          {
            icon: 'card', label: 'Debit. It is money I have.', say: 'Debit — I have the money, so I will just use it.',
            spend: { on: 'checking', amount: 52.4, desc: 'Riverside Grocery' },
            reply: `Nothing wrong with it. The money leaves, the groceries are yours, and nothing is recorded anywhere that helps you later. That is the trade with debit: simple, and invisible.`,
          },
          {
            icon: 'chart', label: 'Credit. I will pay it off at the end of the month.', say: 'Credit. I will clear it when the statement comes.',
            when: (c) => Boolean(c.accounts.card),
            spend: { on: 'card', amount: 52.4, desc: 'Riverside Grocery' },
            credits: 20, good: true,
            reply: `This is the version that builds something, as long as the second half of your sentence actually happens. Groceries are the ideal thing to put on a card — you were going to buy them anyway and the amount is predictable.`,
          },
        ],
      },
      {
        t: 'choose',
        prompt: 'Week two. A jacket you like, $88. Not a need.',
        options: [
          {
            icon: 'card', label: 'Buy it on the credit card.', say: 'I will put the jacket on the credit card.',
            when: (c) => Boolean(c.accounts.card),
            spend: { on: 'card', amount: 88, desc: 'Trailhead Outfitters' },
            reply: `Noted. It is not a disaster and I am not going to lecture you about a jacket. Just watch what it does to the statement number — this is the purchase people forget about when the bill lands.`,
          },
          {
            icon: 'coin', label: 'Buy it on debit so it comes out of real money.', say: 'Debit. If I cannot feel it leaving, I will buy too much.',
            spend: { on: 'checking', amount: 88, desc: 'Trailhead Outfitters' },
            credits: 20, teaches: 'Knowing your own habits',
            reply: `That is a real strategy and it works for a lot of people. Putting wants on debit and needs on credit means the wants are capped by what you have. Slightly worse for your credit file, meaningfully better for your habits.`,
          },
          {
            icon: 'clock', label: 'Wait. If I still want it in two weeks, buy it then.', say: 'I will wait two weeks and see if I still want it.',
            credits: 30, good: true, teaches: 'Wants vs needs',
            reply: `The cheapest financial decision available to anyone, and the hardest. Half the things people wait two weeks on, they never buy. The other half they enjoy more, because it was a decision instead of a reflex.`,
          },
        ],
      },
      {
        t: 'choose',
        prompt: 'Week three. Your car needs $180 of work to pass inspection. This one is not optional.',
        subtitle: 'This is the moment the cushion exists for.',
        options: [
          {
            icon: 'piggy', label: 'Take it from savings.', say: 'I will pull it out of savings. That is what it is for.',
            transfer: { from: 'savings', to: 'checking', amount: 180 },
            spend: { on: 'checking', amount: 180, desc: 'Northside Auto' },
            credits: 45, good: true, teaches: 'Using the cushion',
            reply: `Yes. This is the whole reason we opened the second account — so that a $180 surprise is annoying rather than expensive. Build it back at $20 a week and you are whole in nine weeks with nothing borrowed.`,
          },
          {
            icon: 'card', label: 'Put it on the credit card and pay it off later.', say: 'On the card. I will deal with it next month.',
            when: (c) => Boolean(c.accounts.card),
            spend: { on: 'card', amount: 180, desc: 'Northside Auto' },
            reply: `It works, and it costs you nothing <em>if</em> you clear the statement. If you cannot, that $180 starts earning 21% against you. Watch what it does to your utilization in a moment — that is the part people do not see coming.`,
          },
          {
            icon: 'alert', label: 'Let checking go negative. It will sort itself out on payday.', say: 'Just let checking take the hit. Payday is Friday.',
            spend: { on: 'checking', amount: 180, desc: 'Northside Auto' },
            flag: { overdrew: true },
            reply: `This is the one I would have talked you out of. You declined overdraft coverage, so the payment gets refused at the counter — and if you had accepted it, that repair would have cost $215. The cushion was three feet to the left the whole time.`,
          },
        ],
      },
      {
        t: 'api',
        steps: 1,
        label: 'Statement day.',
        say: 'Your statement closed this morning. Let me read it to you.',
        async run(ctx) {
          const accounts = await bank.accountsFor(ctx.customerId);
          for (const a of accounts) {
            const t = a.type || a.account_type;
            if (t === 'Checking') ctx.accounts.checking = a;
            if (t === 'Savings') ctx.accounts.savings = a;
            if (t === 'Credit Card') ctx.accounts.card = a;
          }
          const card = ctx.accounts.card;
          const limit = ctx.flags.limit || 1500;
          const owed = card ? Number(card.balance) || 0 : 0;
          const util = limit ? owed / limit : 0;
          ctx.flags.statement = owed;
          ctx.flags.util = util;
          return {
            head: 'Statement',
            lines: [
              ['GET', `/customers/${short(ctx.customerId)}/accounts`, `${accounts.length} accounts read back`],
            ],
            note: card
              ? `Statement balance ${usd(owed, true)} on a ${usd(limit)} limit — utilization ${(util * 100).toFixed(1)}%. ${
                  util <= 0.09
                    ? 'Under 10%, which is where it stops costing you anything.'
                    : util <= 0.29
                      ? 'Under 30%, so it is fine, but there is room to do better.'
                      : 'Over 30%, and scoring models read that as strain.'
                }`
              : 'No card on the account, so nothing to report to the bureaus this month.',
          };
        },
      },
      {
        t: 'choose',
        prompt: 'How much of the statement do you want to pay?',
        when: (ctx) => (ctx.flags.statement || 0) > 0,
        options: [
          {
            icon: 'shield', label: 'The whole statement balance.', say: 'All of it. Pay the statement in full.',
            payoff: 'full', credits: 60, good: true, teaches: 'Paying in full',
            reply: `Then the interest on this month is zero. Not a low rate — nothing at all. You used the bank's money for up to thirty days for free, and the bureaus get a clean on-time payment with low utilization. That is the card working exactly as intended.`,
          },
          {
            icon: 'alert', label: 'Just the minimum for now.', say: 'Only the minimum this month. Money is tight.',
            payoff: 'minimum',
            reply: `I understand, and sometimes that is genuinely the choice. Know what it costs: the grace period ends, so interest starts on what is left <em>and</em> on everything you buy next, from the purchase date. On a balance like this, minimum-only payments take years and roughly double what you spent.`,
          },
        ],
      },
      {
        t: 'api',
        steps: 1,
        label: 'Payment posted.',
        when: (ctx) => (ctx.flags.statement || 0) > 0,
        async run(ctx) {
          const card = ctx.accounts.card;
          const owed = Number(card?.balance) || 0;
          const pay = ctx.flags.payoff === 'minimum' ? Math.max(25, owed * 0.02) : owed;
          // Nessie keeps one unsigned `balance` per account and models no credit
          // line, so on a Credit Card that balance IS the amount owed. Paying it
          // down is therefore the call that decreases it — a withdrawal — and a
          // second withdrawal takes the same money out of checking, where it
          // really comes from.
          await bank.createWithdrawal(card._id, { medium: 'balance', amount: pay, description: 'Card payment' });
          await bank.createWithdrawal(ctx.accounts.checking._id, { medium: 'balance', amount: pay, description: 'Credit card payment' });
          const accounts = await bank.accountsFor(ctx.customerId);
          for (const a of accounts) {
            const t = a.type || a.account_type;
            if (t === 'Checking') ctx.accounts.checking = a;
            if (t === 'Savings') ctx.accounts.savings = a;
            if (t === 'Credit Card') ctx.accounts.card = a;
          }
          return {
            head: ctx.flags.payoff === 'minimum' ? 'Minimum paid' : 'Statement cleared',
            lines: [
              ['POST', `/accounts/${short(card._id)}/withdrawals`, `${usd(pay, true)} against the card`],
              ['POST', `/accounts/${short(ctx.accounts.checking._id)}/withdrawals`, `${usd(pay, true)} out of checking`],
            ],
            note:
              ctx.flags.payoff === 'minimum'
                ? `${usd(Number(ctx.accounts.card.balance) || 0, true)} still owed, now accruing interest at about 21.5%.`
                : `Card balance ${usd(0, true)}. Interest charged this month: ${usd(0, true)}.`,
          };
        },
      },
      {
        t: 'debrief',
        title: 'Scenario 3 complete',
        points: [
          'The cushion is what turns a $180 surprise into an inconvenience instead of a debt.',
          'What you put on credit is reported. What you put on debit is not. Neither is wrong — they do different jobs.',
          'Paying the statement in full is the line between using the bank\'s money for free and borrowing at 21.5%.',
        ],
        credits: 150,
        final: true,
      },
    ],
  },
];

/* -------------------------------------------------------------------
   4. Engine
   ------------------------------------------------------------------- */

const ctx = {
  scenario: 0,
  beat: -1,
  customerId: null,
  accounts: {},
  flags: {},
  asked: new Set(),
  learned: new Set(),
  caseCash: 850,
  portfolio: 0,
  portfolioTotal: 5,
  busy: false,
};


const el = (id) => root.querySelector('[id="' + id + '"]');
const logEl = el('log');
const dockEl = el('dock');

function say(who, html, opts = {}) {
  const wrap = document.createElement('div');
  wrap.className = `msg fade-in ${who === 'bubu' ? 'msg--me' : who === 'sys' ? 'msg--sys' : ''}`;
  if (who === 'sys') {
    wrap.innerHTML = `<div class="sysnote">${html}</div>`;
  } else {
    const img = who === 'bubu' ? '/assets/bank-reference-fd3cf84d69.jpg' : '/assets/bank-reference-e4a3bb9f22.jpg';
    wrap.innerHTML = `<img src="${img}" alt="${who === 'bubu' ? 'Bubu' : 'Tram'}"><div class="msg__bubble">${
      html.trim().startsWith('<p') || html.includes('</p>') ? html : `<p>${html}</p>`
    }</div>`;
  }
  logEl.append(wrap);
  scrollLog();
  return wrap;
}

function scrollLog() {
  requestAnimationFrame(() => { logEl.scrollTop = logEl.scrollHeight; });
}

function typing() {
  const wrap = document.createElement('div');
  wrap.className = 'msg';
  wrap.innerHTML = `<img src="/assets/bank-reference-e4a3bb9f22.jpg" alt=""><div class="msg__bubble"><span class="typing"><span></span><span></span><span></span></span></div>`;
  logEl.append(wrap);
  scrollLog();
  return wrap;
}

async function tramSays(html, delay = 620) {
  const t = typing();
  await wait(delay);
  t.remove();
  return say('tram', html);
}

function learn(name) {
  if (!name || ctx.learned.has(name)) return;
  ctx.learned.add(name);
  const chip = document.createElement('div');
  chip.className = 'msg msg--sys fade-in';
  chip.innerHTML = `<div style="text-align:center"><span class="learned"><span class="tick" aria-hidden="true">✓</span>Discussed: ${esc(name)}</span></div>`;
  logEl.append(chip);
  scrollLog();
}

// Temporary case budget only. Never awards or spends Completion credit.
function caseCashDelta(n) {
  if (!n) return;
  ctx.caseCash = Math.max(0, Math.round((ctx.caseCash + n) * 100) / 100);

}

const award = () => {}; // Conversation never grants Completion or learning credit.
const caseCashSpend = (n) => caseCashDelta(-Math.abs(n));

function bumpPortfolio(n = 1) {
  ctx.portfolio = Math.min(ctx.portfolioTotal, ctx.portfolio + n);
  el('pf-fill').style.width = `${(ctx.portfolio / ctx.portfolioTotal) * 100}%`;
  el('pf-count').textContent = `${ctx.portfolio} / ${ctx.portfolioTotal}`;
}

function renderSteps() {
  const dots = el('steps-dots');
  dots.innerHTML = '';
  SCENARIOS.forEach((s, i) => {
    if (i) {
      const bar = document.createElement('span');
      bar.className = 'steps__bar';
      bar.dataset.on = i <= ctx.scenario;
      dots.append(bar);
    }
    const dot = document.createElement('span');
    dot.className = 'steps__dot';
    dot.dataset.on = i <= ctx.scenario;
    dots.append(dot);
  });
  el('steps-label').textContent = `Scenario ${ctx.scenario + 1} of ${SCENARIOS.length} · ${SCENARIOS[ctx.scenario].title}`;
}

function renderScene() {
  const s = SCENARIOS[ctx.scenario];
  el('scene-where').textContent = s.where;
  el('scene-beat').textContent = s.beat;
  el('scene-sub').textContent = s.sub;
}

function renderStatus() {
  const pill = el('bank-pill');
  pill.textContent = bankState.mode === 'live' ? 'Nessie live' : 'Practice bank';
  pill.className = `pill pill--${bankState.mode === 'live' ? 'live' : 'mock'}`;
}

function renderWire() {
  const wire = el('dash-wire');
  if (!wire) return;
  wire.innerHTML = bankState.calls.length
    ? bankState.calls.map((c) => `<div><b>${c.method}</b> ${esc(c.path)}${c.detail ? `  →  ${esc(c.detail)}` : ''}</div>`).join('')
    : '<div>Nothing yet.</div>';
}

const ACCT_STYLE = {
  Checking: ['var(--green)', 'var(--green-soft)', 'card'],
  Savings: ['var(--teal)', 'var(--teal-soft)', 'piggy'],
  'Credit Card': ['var(--amber)', '#fdf1de', 'chart'],
};

async function renderDash() {
  const accounts = ctx.customerId ? await bank.accountsFor(ctx.customerId) : [];
  const note = el('dash-note');
  const stats = el('dash-stats');
  const list = el('dash-accounts');

  if (!accounts.length) {
    note.textContent = 'Nothing opened yet. Your fictional case cash is unallocated.';
    stats.innerHTML = `<div class="stat"><dt>Case cash</dt><dd>${usd(ctx.caseCash)}</dd></div>`;
    list.innerHTML = '';
    renderWire();
    return;
  }

  let assets = 0;
  let owed = 0;
  list.innerHTML = '';
  for (const a of accounts) {
    const type = a.type || a.account_type;
    const bal = Number(a.balance) || 0;
    if (type === 'Credit Card') owed += bal; else assets += bal;
    const [color, soft, icon] = ACCT_STYLE[type] || ['var(--green)', 'var(--green-soft)', 'bank'];
    const row = document.createElement('div');
    row.className = 'acct';
    row.style.setProperty('--acct', color);
    row.style.setProperty('--acct-soft', soft);
    row.innerHTML = `<span class="acct__ico">${ICONS[icon]}</span>
      <span><span class="acct__name">${esc(a.nickname || type)}</span><span class="acct__type">${esc(type)}${
        type === 'Credit Card' ? ` · limit ${usd(ctx.flags.limit || 1500)}` : ''
      }</span></span>
      <span class="acct__bal">${usd(bal, true)}</span>`;
    list.append(row);
  }

  note.textContent = 'Fictional practice balances for this visit. Open Capital One sandbox data for live sandbox records.';
  const limit = ctx.flags.limit || 1500;
  const util = limit ? owed / limit : 0;
  stats.innerHTML = `
    <div class="stat"><dt>Case cash</dt><dd>${usd(ctx.caseCash)}</dd></div>
    <div class="stat" data-tone="good"><dt>In the bank</dt><dd>${usd(assets, true)}</dd></div>
    <div class="stat" data-tone="${owed > 0 ? 'bad' : ''}"><dt>Owe</dt><dd>${usd(owed, true)}</dd></div>
    <div class="stat"><dt>Net</dt><dd>${usd(ctx.caseCash + assets - owed, true)}</dd></div>
    ${ctx.accounts.card ? `<div class="stat" data-tone="${util <= 0.09 ? 'good' : util > 0.29 ? 'bad' : ''}"><dt>Utilization</dt><dd>${(util * 100).toFixed(1)}%</dd></div>` : ''}`;
  renderWire();
}

/* --------------------------------------------------------- the dock */

let dockBody = null;

const CHEV_UP =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m6 15 6-6 6 6"/></svg>';

/**
 * The reply options live behind a handle rather than sitting open.
 *
 * When they were always visible they covered the bottom of the log, so Tram's
 * answer was half-hidden behind the next question before you had read it. Now
 * the answer lands in full, and you pull the options up when you are ready.
 * Anything Tram asks goes into the chat as her line, not onto the handle —
 * otherwise a collapsed drawer would hide the question itself.
 */
function clearDock(label = 'What would you like to say?', sub = '', { open = false } = {}) {
  dockEl.innerHTML = '';
  dockBody = null;
  if (label === null) return null;

  const handle = document.createElement('button');
  handle.type = 'button';
  handle.className = 'dock__handle';
  handle.id = 'dock-handle';
  handle.setAttribute('aria-expanded', 'false');
  handle.setAttribute('aria-controls', 'dock-body');
  handle.dataset.fresh = 'true';
  handle.innerHTML = `<span>${esc(label)}${sub ? `<small>${esc(sub)}</small>` : ''}</span>
    <span class="dock__chev" aria-hidden="true">${CHEV_UP}</span>`;

  const body = document.createElement('div');
  body.className = 'dock__body';
  body.id = 'dock-body';
  body.hidden = !open;
  if (open) {
    handle.setAttribute('aria-expanded', 'true');
    handle.dataset.fresh = 'false';
  }

  handle.addEventListener('click', () => {
    const open = handle.getAttribute('aria-expanded') === 'true';
    handle.setAttribute('aria-expanded', String(!open));
    body.hidden = open;
    handle.dataset.fresh = 'false';
    if (!open) {
      requestAnimationFrame(() => {
        const first = body.querySelector('input, button, select');
        if (first) first.focus({ preventScroll: true });
      });
    }
  });

  dockEl.append(handle, body);
  dockBody = body;
  return body;
}

function choiceButton({ icon, label, sub, asked }, onClick) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'choice';
  if (asked) b.dataset.asked = 'true';
  b.innerHTML = `<span class="choice__ico">${ICONS[icon] || ICONS.spark}</span>
    <span class="choice__text">${esc(label)}${sub ? `<small>${esc(sub)}</small>` : ''}</span>
    <span class="choice__go" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg></span>`;
  b.addEventListener('click', onClick);
  return b;
}

/* --------------------------------------------------------- beat run */

async function runBeat() {
  const scenario = SCENARIOS[ctx.scenario];
  ctx.beat += 1;

  if (ctx.beat >= scenario.beats.length) return nextScenario();

  const beat = scenario.beats[ctx.beat];
  if (beat.when && !beat.when(ctx)) return runBeat();

  clearDock();

  if (beat.t === 'say') {
    await tramSays(beat.text);
    return runBeat();
  }

  if (beat.t === 'choose') return renderChoose(beat);
  if (beat.t === 'ask') return renderAsk(beat);
  if (beat.t === 'allocate') return renderAllocate(beat);
  if (beat.t === 'api') return runApi(beat);
  if (beat.t === 'debrief') return renderDebrief(beat);
}

/* ----- choose ----- */

async function renderChoose(beat) {
  clearDock(null);
  // Tram's question belongs in the chat. If it lived on the collapsed handle
  // you would have to open the drawer to find out what you were answering.
  await tramSays(beat.prompt);
  if (beat.subtitle) say('sys', esc(beat.subtitle));

  const live = beat.options.filter((o) => !o.when || o.when(ctx));
  clearDock('What would you like to say?', `${live.length} option${live.length === 1 ? '' : 's'}`);
  const box = document.createElement('div');
  box.className = 'choices';
  // Options can be conditional too — a player who declined the credit card in
  // scenario 2 should never be offered "put it on the card" in scenario 3.
  for (const opt of live) {
    box.append(
      choiceButton({ icon: opt.icon, label: opt.label }, async () => {
        if (ctx.busy) return;
        ctx.busy = true;
        clearDock();
        say('bubu', esc(opt.say || opt.label));

        if (opt.set) Object.assign(ctx.flags, opt.set);
        if (opt.flag) Object.assign(ctx.flags, opt.flag);
        if (opt.payoff) ctx.flags.payoff = opt.payoff;

        if (opt.transfer) {
          const from = ctx.accounts[opt.transfer.from];
          const to = ctx.accounts[opt.transfer.to];
          if (from && to) await bank.createTransfer(from._id, { medium: 'balance', payee_id: to._id, amount: opt.transfer.amount, description: 'Cushion to checking' });
        }
        if (opt.spend) {
          const acct = ctx.accounts[opt.spend.on];
          if (acct) {
            const merchants = await bank.merchants();
            const m = merchants.find((x) => x.name === opt.spend.desc) || merchants[0];
            await bank.createPurchase(acct._id, {
              merchant_id: m && m._id,
              medium: 'balance',
              purchase_date: today(),
              amount: opt.spend.amount,
              status: 'completed',
              description: opt.spend.desc,
            });
          }
        }

        await tramSays(opt.reply);
        if (opt.teaches) learn(opt.teaches);
        if (opt.credits) award(opt.credits);
        ctx.busy = false;
        runBeat();
      })
    );
  }
  dockBody.append(box);
}

/* ----- ask ----- */

function renderAsk(beat) {
  const remaining = beat.pool.filter((id) => !ctx.asked.has(id));
  const shown = remaining.slice(0, 3);
  const count = beat.pool.length - remaining.length;

  clearDock(
    'Ask Tram a question',
    count < beat.min
      ? `${beat.min - count} more before she will move on · or type your own`
      : `${shown.length} suggested · or type your own · ${count} asked`
  );

  const box = document.createElement('div');
  box.className = 'choices';
  for (const id of shown) {
    const topic = kbById[id];
    box.append(
      choiceButton({ icon: topic.icon, label: topic.q }, () => answerTopic(topic, beat))
    );
  }
  if (!shown.length) {
    const p = document.createElement('p');
    p.className = 'hint';
    p.textContent = 'You have asked everything on the list. Type your own, or tell her you are ready.';
    box.append(p);
  }
  dockBody.append(box);

  const or = document.createElement('div');
  or.className = 'or';
  or.innerHTML = '<span>OR</span>';
  dockBody.append(or);

  const form = document.createElement('form');
  form.className = 'askbox';
  form.innerHTML = `
    <label class="askbox__field">
      <span aria-hidden="true" style="color:var(--ink-3)"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg></span>
      <input id="ask-input" type="text" placeholder="Ask your own question…" autocomplete="off" aria-label="Ask Tram your own question">
    </label>
    <button class="send" type="submit" aria-label="Send question"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 14 0M13 6l6 6-6 6"/></svg></button>`;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input');
    const text = input.value.trim();
    if (!text || ctx.busy) return;
    input.value = '';
    askFreeform(text, beat);
  });
  dockBody.append(form);

  const foot = document.createElement('div');
  foot.className = 'dock__foot';
  const ready = document.createElement('button');
  ready.type = 'button';
  ready.className = 'btn';
  ready.textContent = beat.ready;
  ready.disabled = count < beat.min;
  ready.addEventListener('click', async () => {
    if (ctx.busy) return;
    ctx.busy = true;
    clearDock();
    say('bubu', esc(beat.ready));
    await tramSays(beat.readyReply);
    ctx.busy = false;
    runBeat();
  });
  foot.append(ready);
  const hint = document.createElement('span');
  hint.className = 'hint';
  hint.textContent = `${count} question${count === 1 ? '' : 's'} asked`;
  foot.append(hint);
  dockBody.append(foot);
}

async function answerTopic(topic, beat) {
  if (ctx.busy) return;
  ctx.busy = true;
  clearDock();
  say('bubu', esc(topic.q));
  ctx.asked.add(topic.id);
  await tramSays(topic.a, 700);
  learn(topic.teaches);
  award(15);
  ctx.busy = false;
  renderAsk(beat);
}

/** Cheap keyword match first — free, instant, and right most of the time. */
function matchTopic(text) {
  const t = text.toLowerCase();
  let best = null;
  let bestScore = 0;
  for (const topic of KB) {
    let score = 0;
    for (const k of topic.keys) if (t.includes(k)) score += k.length;
    if (score > bestScore) { bestScore = score; best = topic; }
  }
  return bestScore >= 6 ? best : null;
}

const conversation = [];
async function askFreeform(text, beat) {
  if (ctx.busy) return;
  ctx.busy = true;
  clearDock();
  say('bubu', esc(text));
  const bubble = typing();
  let failed = false;
  try {
    const response = await fetch('/api/bubu/tram-chat', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({message:text, history:conversation.slice(-12), scenario:ctx.scenario}),
      signal: AbortSignal.any([signal, AbortSignal.timeout(30000)])
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Tram could not answer. Please retry.');
    bubble.remove();
    say('tram', esc(data.reply));
    conversation.push({role:'user',content:text},{role:'assistant',content:data.reply});
    const id = 'free:' + crypto.randomUUID();
    ctx.asked.add(id); beat.pool.push(id);
  } catch (error) {
    failed = true;
    bubble.remove();
    if (signal.aborted) return;
    say('sys', esc(error.message || 'Tram is unavailable. Please retry.'));
  } finally {
    ctx.busy = false;
    if (!signal.aborted) { renderAsk(beat); const field = el('ask-input'); if(field && failed) field.value = text; }
  }
}

/* ----- api ----- */

async function runApi(beat) {
  ctx.busy = true;
  clearDock();
  if (beat.say) await tramSays(beat.say, 500);

  const holder = document.createElement('div');
  holder.className = 'msg msg--sys fade-in';
  holder.innerHTML = `<div class="sysnote">${esc(beat.label || 'Talking to the bank…')}</div>`;
  logEl.append(holder);
  scrollLog();

  let receipt;
  try {
    receipt = await beat.run(ctx);
  } catch (e) {
    holder.innerHTML = `<div class="sysnote">The bank did not answer that one: ${esc(e.message || e)}</div>`;
    ctx.busy = false;
    clearDock('This step could not finish.', 'Start over to retry.');
    return;
  }

  holder.innerHTML = `<div class="receipt">
      <span class="receipt__head">${ICONS.shield}${esc(receipt.head)}</span>
      <pre>${receipt.lines.map(([, , d]) => esc(d || '')).join('\n')}</pre>
      ${receipt.note ? `<span>${receipt.note}</span>` : ''}
    </div>`;
  scrollLog();

  bumpPortfolio(beat.steps ?? 1);
  if (el('dash').hidden === false) renderDash();
  if (beat.after) await tramSays(beat.after, 700);
  // Events that happen to Bubu between scenes arrive at the bell, not in the
  // conversation — the player has to notice them.
  if (beat.then === 'paycheck') setTimeout(armPaycheck, 5200);
  ctx.busy = false;
  runBeat();
}

/* ----- debrief ----- */

function renderDebrief(beat) {
  award(beat.credits);
  const card = document.createElement('div');
  card.className = 'msg msg--sys fade-in';
  card.innerHTML = `<div class="receipt">
    <span class="receipt__head">${ICONS.spark}${esc(beat.title)}</span>
    <div style="display:grid;gap:6px">
      ${beat.points.map((p) => `<span>• ${p}</span>`).join('')}
    </div>
    <span>Practice visit only. Learning progress is unchanged.</span>
  </div>`;
  logEl.append(card);
  scrollLog();

  clearDock();
  const foot = document.createElement('div');
  foot.className = 'dock__foot';

  if (beat.final) {
    clearDock('That is the whole visit.', 'Your accounts, spending and statement are all sitting in the bank.', { open: true });
    const again = document.createElement('button');
    again.className = 'btn btn--ghost';
    again.type = 'button';
    again.textContent = 'Play again';
    again.addEventListener('click', () => window.location.assign('/world/bank.page'));
    const dash = document.createElement('button');
    dash.className = 'btn';
    dash.type = 'button';
    dash.textContent = 'See my portfolio';
    dash.addEventListener('click', () => showTab('dashboard'));
    foot.append(dash, again);
  } else {
    clearDock('Ready for what happens next?', '', { open: true });
    const go = document.createElement('button');
    go.className = 'btn';
    go.type = 'button';
    go.textContent = `Continue to ${SCENARIOS[ctx.scenario + 1].title}`;
    go.addEventListener('click', () => { ctx.beat = SCENARIOS[ctx.scenario].beats.length; runBeat(); });
    foot.append(go);
  }
  dockBody.append(foot);
}

function nextScenario() {
  if (ctx.scenario >= SCENARIOS.length - 1) return;
  ctx.scenario += 1;
  ctx.beat = -1;
  renderSteps();
  renderScene();
  say('sys', `<strong>${esc(SCENARIOS[ctx.scenario].title)}</strong> — ${esc(SCENARIOS[ctx.scenario].where)}`);
  runBeat();
}

/* ----- allocator ---------------------------------------------------------
   Shared by the bank scene and the notification panel: a set of destinations,
   a budget that is genuinely your practice cash, and sliders that cannot between them
   spend more than you have. The constraint is the teaching — you feel the
   trade-off because there is no way to give every row what it wants.
   ------------------------------------------------------------------------ */

function buildAllocator(host, cfg, onConfirm) {
  const dests = cfg.destinations;
  const available = Math.floor(cfg.available);
  const plan = {};
  let spare = available;
  for (const d of dests) {
    const want = Math.min(Math.floor(d.default || 0), spare);
    plan[d.key] = want;
    spare -= want;
  }

  const wrap = document.createElement('div');
  wrap.className = 'alloc';

  const avail = document.createElement('div');
  avail.className = 'alloc__avail';
  wrap.append(avail);

  const rows = [];
  for (const d of dests) {
    const row = document.createElement('div');
    row.className = 'alloc__row';
    row.style.setProperty('--dest', d.color || 'var(--green)');
    row.style.setProperty('--dest-soft', d.soft || 'var(--green-soft)');
    row.innerHTML = `
      <span class="alloc__ico" aria-hidden="true">${ICONS[d.icon] || ICONS.coin}</span>
      <span class="alloc__label">${esc(d.label)}${d.sub ? `<small>${esc(d.sub)}</small>` : ''}</span>
      <input class="alloc__amt" type="number" min="0" step="5" inputmode="numeric" aria-label="${esc(d.label)}: amount">
      <input type="range" min="0" step="5" max="${available}" aria-label="${esc(d.label)}: slider">`;
    const num = row.querySelector('.alloc__amt');
    const rng = row.querySelector('input[type=range]');
    const set = (v) => {
      const others = dests.reduce((t, x) => (x.key === d.key ? t : t + plan[x.key]), 0);
      plan[d.key] = Math.max(0, Math.min(Math.round(Number(v) || 0), available - others));
      sync();
    };
    num.addEventListener('input', () => set(num.value));
    rng.addEventListener('input', () => set(rng.value));
    rows.push({ d, num, rng });
    wrap.append(row);
  }

  const foot = document.createElement('div');
  foot.className = 'dock__foot';
  const go = document.createElement('button');
  go.className = 'btn';
  go.type = 'button';
  go.textContent = cfg.confirm || 'Confirm';
  foot.append(go);
  if (cfg.note) {
    const n = document.createElement('span');
    n.className = 'hint';
    n.textContent = cfg.note;
    foot.append(n);
  }
  wrap.append(foot);

  function sync() {
    const total = dests.reduce((t, d) => t + plan[d.key], 0);
    const kept = available - total;
    avail.dataset.over = String(total > available);
    avail.innerHTML =
      `<span>Depositing <b>${usd(total)}</b> of <b>${usd(available)}</b></span>` +
      `<span>${kept > 0 ? `${usd(kept)} stays in your practice cash` : 'Nothing held back'}</span>`;
    for (const { d, num, rng } of rows) {
      num.value = String(plan[d.key]);
      rng.value = String(plan[d.key]);
    }
  }
  sync();

  go.addEventListener('click', () =>
    onConfirm({ ...plan }, dests.reduce((t, d) => t + plan[d.key], 0))
  );

  host.append(wrap);
  return wrap;
}

/* ----- the allocate beat ----- */

function mountAllocator(beat) {
  const body = clearDock('Set the amounts', `${usd(ctx.caseCash)} in your practice cash`);
  buildAllocator(
    body,
    { destinations: beat.destinations, available: ctx.caseCash, confirm: beat.confirm },
    async (plan, total) => {
      if (ctx.busy) return;
      ctx.busy = true;
      const verdict = beat.review ? beat.review(plan, ctx) : {};

      if (verdict.retry) {
        await tramSays(verdict.reply);
        ctx.busy = false;
        return mountAllocator(beat);
      }

      clearDock(null);
      say(
        'bubu',
        esc(
          beat.destinations
            .filter((d) => plan[d.key] > 0)
            .map((d) => `${usd(plan[d.key])} in ${d.label.toLowerCase()}`)
            .join(', ') || 'Nothing for now.'
        )
      );
      Object.assign(ctx.flags, plan);
      caseCashSpend(total);
      await tramSays(verdict.reply);
      if (verdict.teaches) learn(verdict.teaches);
      if (verdict.credits) award(verdict.credits);
      ctx.busy = false;
      runBeat();
    }
  );
}

async function renderAllocate(beat) {
  clearDock(null);
  await tramSays(beat.prompt);
  if (beat.subtitle) say('sys', esc(beat.subtitle));
  mountAllocator(beat);
}

/* ----- notifications -----------------------------------------------------
   The bell is not decoration: it is where events that happen to Bubu between
   scenes arrive, and where money decisions outside the bank get made.
   ------------------------------------------------------------------------ */

const notifs = [];

function unreadCount() { return notifs.filter((n) => !n.read).length; }

function pushNotif(n, { ring = true } = {}) {
  notifs.unshift({ id: `n${Date.now()}${notifs.length}`, read: false, when: 'just now', ...n });
  renderNotifs();
  if (ring) {
    const bell = el('bell');
    bell.dataset.new = 'true';
    setTimeout(() => (bell.dataset.new = 'false'), 3400);
  }
}

function renderNotifs() {
  const badge = el('bell-badge');
  const n = unreadCount();
  badge.hidden = n === 0;
  badge.textContent = String(n);
  el('bell').setAttribute('aria-label', n ? `Notifications, ${n} unread` : 'Notifications');

  const list = el('notifs-list');
  list.innerHTML = '';
  if (!notifs.length) {
    list.innerHTML = '<div class="notifs__empty">Nothing yet. Things that happen to Bubu turn up here.</div>';
    return;
  }

  for (const item of notifs) {
    const card = document.createElement('div');
    card.className = 'notif';
    card.dataset.read = String(item.read);
    card.innerHTML = `
      <div class="notif__top">
        <span class="notif__ico" data-kind="${item.kind}" aria-hidden="true">${ICONS[item.icon] || ICONS.spark}</span>
        <span>
          <span class="notif__title">${esc(item.title)}</span>
          <span class="notif__body">${item.body}</span>
          <span class="notif__when">${esc(item.when)}</span>
        </span>
      </div>`;

    if (item.action && !item.read) {
      const holder = document.createElement('div');
      const open = document.createElement('button');
      open.type = 'button';
      open.className = 'btn btn--row';
      open.textContent = item.action.label;
      open.addEventListener('click', () => {
        holder.innerHTML = '';
        buildAllocator(
          holder,
          {
            destinations: item.action.destinations,
            available: ctx.caseCash,
            confirm: item.action.confirm || 'Deposit it',
            note: item.action.note,
          },
          (plan, total) => item.action.onConfirm(plan, total, item)
        );
      });
      holder.append(open);
      card.append(holder);
    }

    list.append(card);
  }
}

function openNotifs(open) {
  const panel = el('notifs');
  const bell = el('bell');
  panel.hidden = !open;
  bell.setAttribute('aria-expanded', String(open));
  if (open) { renderNotifs(); el('notifs-close').focus(); } else { bell.focus(); }
}

el('bell').addEventListener('click', () => openNotifs(el('notifs').hidden));
el('notifs-close').addEventListener('click', () => openNotifs(false));
root.addEventListener('click', (e) => {
  if (el('notifs').hidden) return;
  // A button inside the panel can remove itself during its own handler — the
  // "Decide where it goes" button swaps itself for the allocator. By the time
  // this listener runs the node is detached, and a detached node has no
  // ancestors, so `closest('.bellwrap')` returns null and reads as a click
  // outside. That closed the panel the click had just acted on.
  if (!e.target.isConnected) return;
  if (!e.target.closest('.bellwrap')) openNotifs(false);
});
root.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (!el('notifs').hidden) { e.stopPropagation(); openNotifs(false); return; }
  const handle = el('dock-handle');
  if (handle?.getAttribute('aria-expanded') === 'true') {
    e.stopPropagation(); handle.click(); handle.focus();
  }
});

/**
 * Payday. The money arrives in the caseCash first — that is the honest order, and
 * it is why the notification has something to ask about. Investing is modelled
 * on a second Savings account because Nessie has only Checking, Savings and
 * Credit Card; the label says so rather than pretending otherwise.
 */
const PAYCHECK = 320;

async function armPaycheck() {
  caseCashDelta(PAYCHECK);
  pushNotif({
    kind: 'paycheck',
    icon: 'coin',
    title: `Payday — ${usd(PAYCHECK)} just landed`,
    body: `Your campus job paid ${usd(PAYCHECK)} and it is sitting in your practice cash doing nothing. Coins in a cash balance earn no interest and are the easiest money in the world to spend. Where should it go?`,
    action: {
      label: 'Decide where it goes',
      confirm: 'Deposit it',
      note: 'Anything you leave undeposited stays spendable.',
      destinations: [
        {
          key: 'checking', label: 'Checking', icon: 'card',
          color: 'var(--green)', soft: 'var(--green-soft)',
          sub: 'This month’s rent, food and transit.', default: 180,
        },
        {
          key: 'savings', label: 'Savings', icon: 'piggy',
          color: 'var(--teal)', soft: 'var(--teal-soft)',
          sub: 'The cushion. Illustrative 4% annual rate in this case.', default: 100,
        },
        {
          key: 'investing', label: 'Investing', icon: 'chart',
          color: 'var(--amber)', soft: '#fdf1de',
          sub: 'Money you will not touch for years. Modelled on a savings account — the sandbox has no investment type.', default: 40,
        },
      ],
      async onConfirm(plan, total, item) {
        item.read = true;
        item.when = 'done';
        item.body = `You put ${usd(plan.checking || 0)} in checking, ${usd(plan.savings || 0)} in savings and ${usd(plan.investing || 0)} into investing. ${usd(PAYCHECK - total)} stayed in your practice cash.`;
        renderNotifs();
        openNotifs(false);

        if (!ctx.customerId) return;
        const targets = [
          [plan.checking, ctx.accounts.checking, 'Paycheck to checking'],
          [plan.savings, ctx.accounts.savings, 'Paycheck to savings'],
        ];
        for (const [amount, acct, desc] of targets) {
          if (amount > 0 && acct) await bank.createDeposit(acct._id, { medium: 'balance', amount, description: desc });
        }
        if (plan.investing > 0) {
          if (!ctx.accounts.growth) {
            ctx.accounts.growth = await bank.createAccount(ctx.customerId, {
              type: 'Savings', nickname: 'Growth Fund (simulated investing)', rewards: 0, balance: 0,
            });
          }
          await bank.createDeposit(ctx.accounts.growth._id, { medium: 'balance', amount: plan.investing, description: 'Paycheck to investing' });
        }
        caseCashSpend(total);

        say('sys', `Payday: ${esc(usd(total))} deposited from your practice cash — ${esc(usd(plan.checking || 0))} checking, ${esc(usd(plan.savings || 0))} savings, ${esc(usd(plan.investing || 0))} investing.`);
        if (plan.savings > 0 || plan.investing > 0) { learn('Paying yourself first'); award(35); }
        if (el('dash').hidden === false) renderDash();
      },
    },
  });
}

/* --------------------------------------------------------------- tabs */

function showTab(which) {
  const scene = el('scene');
  const dash = el('dash');
  if (which === 'restart') return window.location.assign('/world/bank.page');
  const isDash = which === 'dashboard';
  scene.hidden = isDash;
  dash.hidden = !isDash;
  for (const b of root.querySelectorAll('.tabs button')) {
    b.setAttribute('aria-current', b.dataset.tab === which ? 'true' : 'false');
  }
  if (isDash) renderDash();
}

for (const b of root.querySelectorAll('.tabs button')) {
  b.addEventListener('click', () => showTab(b.dataset.tab));
}
/* --------------------------------------------------------------- boot */

(async function boot() {

  pushNotif(
    {
      kind: 'note',
      icon: 'spark',
      title: 'Your fictional practice budget',
      body: `You have <strong>${usd(ctx.caseCash)}</strong> in fictional scenario cash. Allocations come from this case budget. Asking questions never changes your saved learning credit. Events that happen to Bubu will turn up here.`,
      when: 'now',
    },
    { ring: false }
  );

  renderSteps();
  renderScene();
  renderStatus();
  await bank.probe();
  renderStatus();
  runBeat();

})();


});
