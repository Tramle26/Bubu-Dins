import assert from 'node:assert/strict';
import test from 'node:test';
import {
  netWorth,
  portfolioFromAccounts,
  futureValue,
  monthlyPayment,
  amortize,
  minimumPaymentPayoff,
  creditUtilization,
  utilizationBand,
  emergencyFundMonths,
  evaluateAllocation,
  projectPlan,
  ruleOf72,
  realReturn,
  FICO_WEIGHTS,
  REFERENCE_RATES,
  BANK_FEES,
  CREDIT_SCORE_BANDS,
  scoreBand,
  compareDebtStrategies,
} from '../src/lib/financeEngine.js';

const close = (a, b, tol = 0.02) =>
  assert.ok(Math.abs(a - b) <= tol, `expected ${a} to be within ${tol} of ${b}`);

test('netWorth sums assets and liabilities', () => {
  const r = netWorth([
    { label: 'Checking', value: 800, kind: 'asset' },
    { label: 'Savings', value: 2200, kind: 'asset' },
    { label: 'Card', value: 430, kind: 'liability' },
    { label: 'Student loan', value: 12000, kind: 'liability' },
  ]);
  assert.equal(r.assets, 3000);
  assert.equal(r.liabilities, 12430);
  assert.equal(r.net, -9430);
});

test('portfolioFromAccounts flips a Credit Card balance to a liability', () => {
  const r = portfolioFromAccounts({
    accounts: [
      { _id: 'a', type: 'Checking', nickname: 'Everyday', balance: 640 },
      { _id: 'b', type: 'Savings', nickname: 'Cushion', balance: 1500 },
      { _id: 'c', type: 'Credit Card', nickname: 'Student card', balance: 210 },
    ],
    loans: [{ _id: 'l', type: 'student', description: 'Direct Unsubsidized', amount: 5500 }],
  });
  assert.equal(r.assets, 2140);
  assert.equal(r.liabilities, 5710);
  assert.equal(r.net, -3570);
});

test('futureValue matches the closed-form annuity for a known case', () => {
  // $200/mo, 7% nominal, 10 years, ordinary annuity => ~$34,617
  const r = futureValue({ monthlyContribution: 200, annualRate: 0.07, years: 10 });
  close(r.futureValue, 34617.5, 2);
  assert.equal(r.contributed, 24000);
  close(r.growth, 10617.5, 2);
  assert.equal(r.series.length, 121);
  assert.equal(r.series[0].balance, 0);
});

test('futureValue handles a zero rate without dividing by zero', () => {
  const r = futureValue({ principal: 100, monthlyContribution: 50, annualRate: 0, years: 2 });
  assert.equal(r.futureValue, 1300);
  assert.equal(r.growth, 0);
});

test('monthlyPayment reproduces a standard 10-year federal loan', () => {
  // $27,000 at 6.52% over 10 years
  const m = monthlyPayment({ principal: 27000, annualRate: REFERENCE_RATES.federalUndergradLoanAPR, years: 10 });
  close(m, 306.86, 0.02);
});

test('monthlyPayment on a zero-interest loan is simple division', () => {
  assert.equal(monthlyPayment({ principal: 1200, annualRate: 0, years: 1 }), 100);
});

test('amortize pays the loan off in exactly the scheduled term', () => {
  const r = amortize({ principal: 27000, annualRate: 0.0652, years: 10 });
  assert.equal(r.months, 120);
  assert.ok(r.paidOff);
  close(r.totalPaid, r.scheduledPayment * 120, 1);
  close(r.totalInterest, r.totalPaid - 27000, 1);
  assert.equal(r.schedule.at(-1).balance, 0);
});

test('extra principal shortens the term and cuts total interest', () => {
  const base = amortize({ principal: 27000, annualRate: 0.0652, years: 10 });
  const extra = amortize({ principal: 27000, annualRate: 0.0652, years: 10, extraMonthly: 50 });
  assert.ok(extra.months < base.months, 'extra payments should shorten the term');
  assert.ok(extra.totalInterest < base.totalInterest, 'extra payments should cut interest');
});

test('minimum payments drag a small card balance out for years', () => {
  const r = minimumPaymentPayoff({ balance: 1200, annualAPR: REFERENCE_RATES.averageCarriedCardAPR });
  assert.ok(r.paidOff);
  assert.ok(r.months > 60, `expected a long payoff, got ${r.months} months`);
  assert.ok(r.totalInterest > 500, `expected heavy interest, got ${r.totalInterest}`);
});

test('a minimum below the monthly interest never pays off', () => {
  const r = minimumPaymentPayoff({ balance: 100000, annualAPR: 0.30, percentOfPrincipal: 0, floor: 25 });
  assert.equal(r.paidOff, false);
  assert.equal(r.months, Infinity);
});

test('credit utilization and bands', () => {
  close(creditUtilization({ balance: 90, limit: 500 }), 0.18, 0.001);
  assert.equal(utilizationBand(0.05).key, 'excellent');
  assert.equal(utilizationBand(0.18).key, 'good');
  assert.equal(utilizationBand(0.35).key, 'fair');
  assert.equal(utilizationBand(0.72).key, 'high');
  assert.equal(creditUtilization({ balance: 100, limit: 0 }), 0);
});

test('FICO weights sum to 1', () => {
  close(FICO_WEIGHTS.reduce((s, f) => s + f.weight, 0), 1, 1e-9);
});

test('emergency fund months', () => {
  assert.equal(emergencyFundMonths({ savings: 2400, monthlyEssentials: 800 }), 3);
  assert.equal(emergencyFundMonths({ savings: 2400, monthlyEssentials: 0 }), 0);
});

test('ruleOf72 and realReturn', () => {
  close(ruleOf72(0.07), 10.29, 0.01);
  close(realReturn(0.10, 0.03), 0.0680, 0.0005);
});

test('allocation flags overspending and an underfunded bottom layer', () => {
  const r = evaluateAllocation(
    { cashflow: 300, safety: 400, growth: 200 },
    { income: 700, essentials: 620 }
  );
  assert.equal(r.passed, false);
  const levels = r.findings.map((f) => f.level);
  assert.ok(levels.includes('blocking'));
  assert.ok(r.findings.some((f) => f.layer === 'cashflow'));
});

test('allocation accepts a sensible plan', () => {
  const r = evaluateAllocation(
    { cashflow: 620, safety: 180, credit: 0, debt: 0, growth: 0 },
    { income: 800, essentials: 620, cardBalance: 0, savings: 0 }
  );
  assert.equal(r.passed, true);
});

test('allocation nudges toward growth once the cushion is full', () => {
  const r = evaluateAllocation(
    { cashflow: 620, safety: 100 },
    { income: 900, essentials: 620, savings: 4000, cardBalance: 0 }
  );
  assert.ok(r.findings.some((f) => f.layer === 'growth'));
  assert.equal(r.passed, true);
});

test('projectPlan drives the card to zero and grows savings', () => {
  const s = projectPlan(
    { safety: 150, credit: 100, growth: 50 },
    { savings: 500, cardBalance: 400, loanBalance: 0, investments: 0 },
    12
  );
  assert.equal(s.length, 13);
  assert.equal(s.at(-1).card, 0);
  assert.ok(s.at(-1).savings > 500 + 150 * 11);
  assert.ok(s.at(-1).net > s[0].net);
});

/* --- figures the rewritten lesson quotes in prose or answer keys ---------- */

test('bank fees cover the six a student actually meets, each with a fix', () => {
  assert.equal(BANK_FEES.length, 6);
  for (const f of BANK_FEES) {
    assert.ok(f.low <= f.typical && f.typical <= f.high, `${f.key} typical outside its range`);
    assert.ok(f.avoid.length > 20, `${f.key} needs a real avoidance step`);
  }
});

test('the fee activity answer key is $121 for one semester', () => {
  const semester = 12 * 4 + 3 * 6 + 35 + 10 * 2;
  assert.equal(semester, 121);
});

test('the same student earns under a dollar in interest over that semester', () => {
  const earned =
    futureValue({ principal: 415, annualRate: REFERENCE_RATES.nationalAverageSavingsAPY, years: 4 / 12 })
      .futureValue - 415;
  close(earned, 0.89, 0.02);
});

test('closing one of two cards doubles utilization', () => {
  close(creditUtilization({ balance: 1000, limit: 5000 }), 0.2, 0.001);
  close(creditUtilization({ balance: 1000, limit: 2500 }), 0.4, 0.001);
});

test('credit score bands are contiguous from 300 to 850', () => {
  const sorted = [...CREDIT_SCORE_BANDS].sort((a, b) => a.min - b.min);
  assert.equal(sorted[0].min, 300);
  assert.equal(sorted.at(-1).max, 850);
  for (let i = 1; i < sorted.length; i++) {
    assert.equal(sorted[i].min, sorted[i - 1].max + 1, 'bands must not overlap or leave gaps');
  }
  assert.equal(scoreBand(710).label, 'Good');
  assert.equal(scoreBand(612).label, 'Subprime');
  assert.equal(scoreBand(820).label, 'Excellent');
});

test('avalanche beats snowball by the amount the answer key claims', () => {
  const debts = [
    { label: 'Card A', balance: 400, apr: 0.1799, minimum: 25 },
    { label: 'Card B', balance: 2000, apr: 0.2499, minimum: 40 },
    { label: 'Card C', balance: 5000, apr: 0.2199, minimum: 100 },
  ];
  const c = compareDebtStrategies(debts, 150);
  assert.equal(c.snowball.months, 39);
  assert.equal(c.avalanche.months, 37);
  close(c.snowball.totalInterest, 2868, 2);
  close(c.avalanche.totalInterest, 2651, 2);
  close(c.interestSaved, 217, 2);
  assert.equal(c.monthsSaved, 2);
});

test('unsubsidized interest over four years is about $1,565 on $6,000', () => {
  // Simple accrual, no capitalization until repayment — which is what the lesson says.
  const accrued = 6000 * REFERENCE_RATES.federalUndergradLoanAPR * 4;
  close(accrued, 1565, 5);
});
