/**
 * financeEngine.js — pure money math shared by the lesson and the story-world simulations.
 *
 * Every function here is deterministic and side-effect free so it can be unit tested,
 * reused inside Bubu's world gameplay, and called from the Dr. Bos chatbot when it needs
 * to check a student's arithmetic.
 *
 * Rate convention: pass annual rates as DECIMALS (0.0652 for 6.52%), never percents.
 */

// ---------------------------------------------------------------------------
// Reference figures. Update these once a year; every lesson string reads from here
// so the content never silently goes stale.
// ---------------------------------------------------------------------------
export const REFERENCE_RATES = {
  asOf: '2026-09',
  federalUndergradLoanAPR: 0.0652,   // Direct Sub/Unsub, disbursed 7/1/26–6/30/27
  federalGradLoanAPR: 0.0807,
  federalPlusLoanAPR: 0.0907,
  federalLoanOriginationFee: 0.01057,
  nationalAverageSavingsAPY: 0.0064, // FDIC/Bankrate national average
  highYieldSavingsAPY: 0.042,        // typical top-of-market online savings
  averageNewCardAPR: 0.2379,         // average APR on new card offers
  averageCarriedCardAPR: 0.2152,     // average on accounts actually assessed interest
  longRunStockMarketNominal: 0.10,   // ~historical US large-cap average, nominal
  longRunStockMarketReal: 0.07,      // same, after inflation — use this for projections
};

export const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

export const usd = (n, { cents = false } = {}) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  }).format(Number.isFinite(n) ? n : 0);

export const pct = (n, digits = 1) => `${(n * 100).toFixed(digits)}%`;

// ---------------------------------------------------------------------------
// 1. Net worth — the definition of a "portfolio"
// ---------------------------------------------------------------------------

/**
 * @param {Array<{label:string, value:number, kind:'asset'|'liability'}>} items
 */
export function netWorth(items = []) {
  const assets = items
    .filter((i) => i.kind === 'asset')
    .reduce((s, i) => s + (Number(i.value) || 0), 0);
  const liabilities = items
    .filter((i) => i.kind === 'liability')
    .reduce((s, i) => s + Math.abs(Number(i.value) || 0), 0);
  return { assets: round2(assets), liabilities: round2(liabilities), net: round2(assets - liabilities) };
}

/**
 * Turns a set of Nessie accounts + loans into the asset/liability rows above.
 * Nessie models a Credit Card account's balance as a positive number that is
 * money OWED, which is why it flips sides here.
 */
export function portfolioFromAccounts({ accounts = [], loans = [], investments = 0 } = {}) {
  const items = [];
  for (const a of accounts) {
    const type = a.type || a.account_type;
    const balance = Number(a.balance) || 0;
    if (type === 'Credit Card') {
      items.push({ label: a.nickname || 'Credit card', value: balance, kind: 'liability', source: 'account', id: a._id });
    } else {
      items.push({ label: a.nickname || type, value: balance, kind: 'asset', source: 'account', id: a._id });
    }
  }
  for (const l of loans) {
    items.push({
      label: l.description || `${l.type || 'Loan'}`,
      value: Number(l.amount) || 0,
      kind: 'liability',
      source: 'loan',
      id: l._id,
    });
  }
  if (investments) items.push({ label: 'Investments', value: investments, kind: 'asset', source: 'manual' });
  return { items, ...netWorth(items) };
}

// ---------------------------------------------------------------------------
// 2. Growth — compounding with regular contributions
// ---------------------------------------------------------------------------

/**
 * Future value of a lump sum plus an ordinary annuity (contribution at period end).
 * FV = P(1+r)^n + PMT * [((1+r)^n - 1) / r]
 */
export function futureValue({
  principal = 0,
  monthlyContribution = 0,
  annualRate = 0,
  years = 1,
  periodsPerYear = 12,
} = {}) {
  const r = annualRate / periodsPerYear;
  const n = Math.max(0, Math.round(years * periodsPerYear));
  const pmt = monthlyContribution * (periodsPerYear / 12);

  const growthFactor = Math.pow(1 + r, n);
  const fromPrincipal = principal * growthFactor;
  const fromContributions = r === 0 ? pmt * n : pmt * ((growthFactor - 1) / r);
  const total = fromPrincipal + fromContributions;
  const contributed = principal + pmt * n;

  const series = [];
  let balance = principal;
  for (let i = 0; i <= n; i++) {
    if (i > 0) balance = balance * (1 + r) + pmt;
    series.push({
      period: i,
      year: round2(i / periodsPerYear),
      balance: round2(balance),
      contributed: round2(principal + pmt * i),
    });
  }

  return {
    futureValue: round2(total),
    contributed: round2(contributed),
    growth: round2(total - contributed),
    series,
  };
}

/** Rule-of-72 estimate of years to double. Teaching tool, not a precise answer. */
export const ruleOf72 = (annualRate) => (annualRate > 0 ? round2(0.72 / annualRate) : Infinity);

/** What a nominal return is worth after inflation. */
export const realReturn = (nominal, inflation) => (1 + nominal) / (1 + inflation) - 1;

// ---------------------------------------------------------------------------
// 3. Debt — amortization and the minimum-payment trap
// ---------------------------------------------------------------------------

/**
 * Standard amortizing payment: M = P·r / (1 − (1+r)^−n)
 *
 * Rounded UP to the cent, the way servicers actually set it: rounding to the
 * nearest cent can leave a few cents outstanding and push the loan one payment
 * past its stated term, which confuses students far more than a penny does.
 */
export function monthlyPayment({ principal, annualRate, years }) {
  const r = annualRate / 12;
  const n = Math.round(years * 12);
  if (n <= 0) return 0;
  const exact = r === 0 ? principal / n : (principal * r) / (1 - Math.pow(1 + r, -n));
  return Math.ceil(exact * 100) / 100;
}

/**
 * Runs a loan to payoff. `extraMonthly` is applied to principal on top of the
 * scheduled payment — this is the lever students explore in Section 6.
 */
export function amortize({ principal, annualRate, years, extraMonthly = 0, maxMonths = 720 } = {}) {
  const scheduled = monthlyPayment({ principal, annualRate, years });
  const r = annualRate / 12;
  let balance = principal;
  let totalInterest = 0;
  let totalPaid = 0;
  const schedule = [];

  for (let month = 1; month <= maxMonths && balance > 0.005; month++) {
    const interest = balance * r;
    let payment = scheduled + extraMonthly;
    if (payment > balance + interest) payment = balance + interest;
    const principalPaid = payment - interest;
    balance = balance - principalPaid;
    totalInterest += interest;
    totalPaid += payment;
    schedule.push({
      month,
      payment: round2(payment),
      interest: round2(interest),
      principal: round2(principalPaid),
      balance: round2(Math.max(0, balance)),
    });
  }

  return {
    scheduledPayment: scheduled,
    months: schedule.length,
    years: round2(schedule.length / 12),
    totalInterest: round2(totalInterest),
    totalPaid: round2(totalPaid),
    paidOff: balance <= 0.005,
    schedule,
  };
}

/**
 * Credit-card payoff when the student pays only the minimum.
 * Common issuer formula: greater of ($floor, percentOfBalance · balance + interest).
 */
export function minimumPaymentPayoff({
  balance,
  annualAPR,
  percentOfPrincipal = 0.01,
  floor = 25,
  maxMonths = 600,
} = {}) {
  const r = annualAPR / 12;
  let bal = balance;
  let totalInterest = 0;
  let totalPaid = 0;
  const schedule = [];

  for (let month = 1; month <= maxMonths && bal > 0.005; month++) {
    const interest = bal * r;
    let payment = Math.max(floor, bal * percentOfPrincipal + interest);
    if (payment <= interest) return { paidOff: false, months: Infinity, totalInterest: Infinity, totalPaid: Infinity, schedule };
    if (payment > bal + interest) payment = bal + interest;
    bal = bal + interest - payment;
    totalInterest += interest;
    totalPaid += payment;
    schedule.push({ month, payment: round2(payment), interest: round2(interest), balance: round2(Math.max(0, bal)) });
  }

  return {
    paidOff: bal <= 0.005,
    months: schedule.length,
    years: round2(schedule.length / 12),
    totalInterest: round2(totalInterest),
    totalPaid: round2(totalPaid),
    schedule,
  };
}

/** Months of essential spending your cash cushion covers. */
export function emergencyFundMonths({ savings, monthlyEssentials }) {
  if (!monthlyEssentials) return 0;
  return round2(savings / monthlyEssentials);
}

/**
 * Bank fees, with the ranges Kara Ross lists in Personal Finance for Teens and
 * College Students (2021, ch. 2) and the avoidance move she pairs with each.
 * These are the numbers that actually move a student's balance — the interest
 * rate on a college checking account almost never does.
 */
export const BANK_FEES = [
  {
    key: 'maintenance',
    label: 'Monthly maintenance fee',
    low: 4,
    high: 25,
    typical: 12,
    avoid: 'Keep the minimum balance, hold checking and savings at the same bank, or pick a student account that charges nothing.',
  },
  {
    key: 'atm',
    label: 'Out-of-network ATM fee',
    low: 2.5,
    high: 5,
    typical: 3,
    avoid: 'Find an in-network ATM in your bank’s app. If you truly cannot, take out more at once — the fee is per visit, not per dollar.',
  },
  {
    key: 'overdraft',
    label: 'Overdraft fee',
    low: 30,
    high: 35,
    typical: 35,
    avoid: 'Link savings to checking as backup, and turn on a low-balance alert.',
  },
  {
    key: 'nsf',
    label: 'Returned item / insufficient funds',
    low: 30,
    high: 35,
    typical: 35,
    avoid: 'Same fix: an alert, and a buffer you do not treat as spendable.',
  },
  {
    key: 'savings-transfer',
    label: 'Excess savings withdrawal',
    low: 3,
    high: 25,
    typical: 10,
    avoid: 'Savings accounts often cap free transfers at six a month. Run day-to-day spending through checking.',
  },
  {
    key: 'late',
    label: 'Credit card late fee',
    low: 30,
    high: 35,
    typical: 32,
    avoid: 'Autopay the minimum, then pay the statement balance by hand. The autopay is insurance, not the plan.',
  },
];

/** Score bands, as lenders read them. */
export const CREDIT_SCORE_BANDS = [
  { min: 800, max: 850, label: 'Excellent', note: 'Lenders compete for you.' },
  { min: 740, max: 799, label: 'Very good', note: 'Better than average rates, easily approved.' },
  { min: 670, max: 739, label: 'Good', note: 'Most people land here. Approved, ordinary rates.' },
  { min: 640, max: 669, label: 'Fair', note: 'Approved, but you pay more for the same loan.' },
  { min: 300, max: 639, label: 'Subprime', note: 'Higher rates, shorter terms, more deposits asked of you.' },
];

export const scoreBand = (score) =>
  CREDIT_SCORE_BANDS.find((b) => score >= b.min && score <= b.max) || CREDIT_SCORE_BANDS.at(-1);

/**
 * Snowball vs avalanche, run month by month on the same money.
 *
 * Snowball orders by balance (smallest first) because finishing something is
 * motivating. Avalanche orders by rate (highest first) because interest does
 * not care how you feel. Both are defensible; this returns what each costs so a
 * student can see the size of the trade instead of being told which to pick.
 *
 * @param {Array<{label:string, balance:number, apr:number, minimum:number}>} debts
 * @param {number} extraMonthly  spare money on top of every minimum
 */
export function compareDebtStrategies(debts = [], extraMonthly = 0, maxMonths = 600) {
  const run = (order) => {
    const list = order.map((d) => ({ ...d, balance: d.balance }));
    let totalInterest = 0;
    let month = 0;

    while (list.some((d) => d.balance > 0.005) && month < maxMonths) {
      month++;
      // Interest first, then every minimum, then the extra onto the target.
      let pool = extraMonthly;
      for (const d of list) {
        if (d.balance <= 0.005) continue;
        const interest = d.balance * (d.apr / 12);
        totalInterest += interest;
        d.balance += interest;
        const pay = Math.min(d.minimum, d.balance);
        d.balance -= pay;
      }
      for (const d of list) {
        if (pool <= 0) break;
        if (d.balance <= 0.005) continue;
        const pay = Math.min(pool, d.balance);
        d.balance -= pay;
        pool -= pay;
      }
    }
    return { months: month, totalInterest: round2(totalInterest) };
  };

  const snowball = run([...debts].sort((a, b) => a.balance - b.balance));
  const avalanche = run([...debts].sort((a, b) => b.apr - a.apr));

  return {
    snowball,
    avalanche,
    interestSaved: round2(snowball.totalInterest - avalanche.totalInterest),
    monthsSaved: snowball.months - avalanche.months,
  };
}

// ---------------------------------------------------------------------------
// 4. Credit — utilization
// ---------------------------------------------------------------------------

export function creditUtilization({ balance, limit }) {
  if (!limit) return 0;
  return Math.max(0, balance) / limit;
}

/**
 * Bands follow the conventional scoring guidance: under 10% is where the
 * "amounts owed" factor stops costing you anything meaningful.
 */
export function utilizationBand(u) {
  if (u <= 0.09) return { key: 'excellent', label: 'Excellent', note: 'Under 10% — this factor is working for you.' };
  if (u <= 0.29) return { key: 'good', label: 'Good', note: 'Under 30% — fine, but there is room to improve.' };
  if (u <= 0.49) return { key: 'fair', label: 'Fair', note: 'Over 30% — scoring models start reading this as strain.' };
  return { key: 'high', label: 'High', note: 'Over 50% — this is the second-heaviest factor in your score.' };
}

/** Published FICO category weights — used by the score-factor activity. */
export const FICO_WEIGHTS = [
  { key: 'payment-history', label: 'Payment history', weight: 0.35, plain: 'Did you pay on time?' },
  { key: 'amounts-owed', label: 'Amounts owed', weight: 0.30, plain: 'How much of your limit are you using?' },
  { key: 'length', label: 'Length of credit history', weight: 0.15, plain: 'How long have your accounts been open?' },
  { key: 'new-credit', label: 'New credit', weight: 0.10, plain: 'How many accounts did you just open?' },
  { key: 'credit-mix', label: 'Credit mix', weight: 0.10, plain: 'Do you handle more than one kind of credit?' },
];

// ---------------------------------------------------------------------------
// 5. Allocation — the capstone's feedback engine
// ---------------------------------------------------------------------------

export const LAYERS = [
  { key: 'cashflow',  label: 'Cash flow',     home: 'Checking',    blurb: 'Covers this month. Rent, food, transit, tuition bills.' },
  { key: 'safety',    label: 'Safety',        home: 'Savings',     blurb: 'The cushion that keeps one bad week from becoming debt.' },
  { key: 'credit',    label: 'Credit',        home: 'Credit Card', blurb: 'Paid in full every month. Builds history at zero cost.' },
  { key: 'debt',      label: 'Debt payoff',   home: 'Loans',       blurb: 'A guaranteed return equal to the interest rate you stop paying.' },
  { key: 'growth',    label: 'Growth',        home: 'Investments', blurb: 'Money you will not touch for years. Risk is survivable here.' },
];

/**
 * Evaluates a student's monthly allocation against rules rather than one "right"
 * answer. Returns findings the UI renders as coaching, so two different sensible
 * plans can both pass. Order of checks is the order Dr. Bos should raise them.
 *
 * @param {object} plan  dollars per month, keyed by LAYERS[].key
 * @param {object} ctx   { income, essentials, cardBalance, cardAPR, loanAPR, savings, emergencyTargetMonths }
 */
export function evaluateAllocation(plan = {}, ctx = {}) {
  const {
    income = 0,
    essentials = 0,
    cardBalance = 0,
    cardAPR = REFERENCE_RATES.averageCarriedCardAPR,
    loanAPR = REFERENCE_RATES.federalUndergradLoanAPR,
    savings = 0,
    emergencyTargetMonths = 3,
  } = ctx;

  const allocated = LAYERS.reduce((s, l) => s + (Number(plan[l.key]) || 0), 0);
  const findings = [];
  const target = essentials * emergencyTargetMonths;

  if (round2(allocated) > round2(income)) {
    findings.push({
      level: 'blocking',
      layer: null,
      message: `You allocated ${usd(allocated)} out of ${usd(income)}. A plan that spends money you do not have is the most common way a budget fails in month one.`,
    });
  }

  if ((Number(plan.cashflow) || 0) < essentials) {
    findings.push({
      level: 'blocking',
      layer: 'cashflow',
      message: `Essentials cost ${usd(essentials)} a month and you left ${usd(plan.cashflow || 0)} in checking. Fund the bottom layer before anything above it.`,
    });
  }

  if (cardBalance > 0 && (Number(plan.credit) || 0) < cardBalance && cardAPR > loanAPR) {
    findings.push({
      level: 'warning',
      layer: 'credit',
      message: `Carrying ${usd(cardBalance)} at ${pct(cardAPR)} costs about ${usd((cardBalance * cardAPR) / 12, { cents: true })} in interest this month. No investment reliably beats a guaranteed ${pct(cardAPR)}, so clearing the card usually outranks the layers above it.`,
    });
  }

  if (savings < target && (Number(plan.safety) || 0) === 0 && (Number(plan.growth) || 0) > 0) {
    findings.push({
      level: 'warning',
      layer: 'safety',
      message: `Your cushion covers ${emergencyFundMonths({ savings, monthlyEssentials: essentials })} months and you are routing money to growth instead. Invested money is the money you are most likely to have to sell at a bad moment.`,
    });
  }

  if (savings >= target && (Number(plan.growth) || 0) === 0 && allocated < income) {
    findings.push({
      level: 'note',
      layer: 'growth',
      message: `Your cushion already covers ${emergencyTargetMonths}+ months and you have ${usd(income - allocated)} unassigned. Idle cash in checking loses to inflation every year it sits there.`,
    });
  }

  if (round2(allocated) < round2(income) && findings.length === 0) {
    findings.push({
      level: 'note',
      layer: null,
      message: `${usd(income - allocated)} is unassigned. Unassigned money is not saved money — it is money that gets spent without a decision.`,
    });
  }

  const blocking = findings.filter((f) => f.level === 'blocking').length;
  return {
    allocated: round2(allocated),
    unassigned: round2(income - allocated),
    findings,
    passed: blocking === 0 && (Number(plan.cashflow) || 0) >= essentials,
  };
}

/**
 * Projects a plan forward so the capstone can show a 12-month net-worth line.
 * Simple by design: it is a teaching model, not a financial planning tool.
 */
export function projectPlan(plan = {}, ctx = {}, months = 12) {
  const {
    savings = 0,
    savingsAPY = REFERENCE_RATES.highYieldSavingsAPY,
    cardBalance = 0,
    cardAPR = REFERENCE_RATES.averageCarriedCardAPR,
    loanBalance = 0,
    loanAPR = REFERENCE_RATES.federalUndergradLoanAPR,
    investments = 0,
    investmentReturn = REFERENCE_RATES.longRunStockMarketReal,
  } = ctx;

  let sav = savings;
  let card = cardBalance;
  let loan = loanBalance;
  let inv = investments;
  const series = [];

  for (let m = 0; m <= months; m++) {
    if (m > 0) {
      sav = sav * (1 + savingsAPY / 12) + (Number(plan.safety) || 0);
      card = Math.max(0, card * (1 + cardAPR / 12) - (Number(plan.credit) || 0));
      loan = Math.max(0, loan * (1 + loanAPR / 12) - (Number(plan.debt) || 0));
      inv = inv * (1 + investmentReturn / 12) + (Number(plan.growth) || 0);
    }
    series.push({
      month: m,
      savings: round2(sav),
      card: round2(card),
      loan: round2(loan),
      investments: round2(inv),
      net: round2(sav + inv - card - loan),
    });
  }
  return series;
}
