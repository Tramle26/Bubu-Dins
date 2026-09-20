import { useMemo, useState } from 'react';
import Activity from './Activity.jsx';
import Chart, { ChartLegend } from '../Chart.jsx';
import {
  futureValue,
  amortize,
  minimumPaymentPayoff,
  creditUtilization,
  utilizationBand,
  usd,
  pct,
  REFERENCE_RATES as R,
} from '../../lib/financeEngine.js';

/* Explorers are ungraded on purpose. A slider you can get "wrong" stops being
   a place to be curious, and curiosity is the point of this block type. */

function Dial({ id, label, value, min, max, step, onChange, format }) {
  return (
    <div className="dial">
      <label htmlFor={id}>
        <span>{label}</span>
        <output htmlFor={id}>{format(value)}</output>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

function Readout({ cells }) {
  return (
    <dl className="readout__grid">
      {cells.map((c) => (
        <div className="readout__cell" key={c.label} data-tone={c.tone}>
          <dt>{c.label}</dt>
          <dd>{c.value}</dd>
        </div>
      ))}
    </dl>
  );
}

const shortUsd = (n) =>
  Math.abs(n) >= 1000 ? `$${Math.round(n / 1000)}k` : `$${Math.round(n)}`;

/* ------------------------------------------------------------------ growth */

function GrowthExplorer({ id }) {
  const [monthly, setMonthly] = useState(100);
  const [years, setYears] = useState(40);
  const [rate, setRate] = useState(7);

  const result = useMemo(
    () => futureValue({ monthlyContribution: monthly, annualRate: rate / 100, years }),
    [monthly, years, rate]
  );

  const series = [
    {
      key: 'balance',
      label: 'What it grows to',
      color: 'var(--moss)',
      fill: true,
      points: result.series.filter((_, i) => i % 3 === 0).map((p) => ({ x: p.year, y: p.balance })),
    },
    {
      key: 'contributed',
      label: 'What you put in',
      color: 'var(--ember)',
      dashed: true,
      points: result.series.filter((_, i) => i % 3 === 0).map((p) => ({ x: p.year, y: p.contributed })),
    },
  ];

  return (
    <div className="explorer">
      <div className="dials">
        <Dial id={`${id}-monthly`} label="Per month" value={monthly} min={25} max={500} step={25} onChange={setMonthly} format={(v) => usd(v)} />
        <Dial id={`${id}-years`} label="Years" value={years} min={1} max={45} step={1} onChange={setYears} format={(v) => `${v}`} />
        <Dial id={`${id}-rate`} label="Annual return" value={rate} min={0} max={10} step={0.5} onChange={setRate} format={(v) => `${v}%`} />
        <p style={{ fontSize: '0.78rem', color: 'var(--ink-3)', margin: 0, lineHeight: 1.45 }}>
          {pct(R.longRunStockMarketReal, 0)} is roughly the long-run US stock market average <em>after</em> inflation.
          Real returns are what matter; a headline {pct(R.longRunStockMarketNominal, 0)} loses about three points to it.
        </p>
      </div>

      <div className="readout">
        <Readout
          cells={[
            { label: 'You contribute', value: usd(result.contributed) },
            { label: 'It becomes', value: usd(result.futureValue), tone: 'accent' },
            { label: 'Growth', value: usd(result.growth), tone: 'good' },
          ]}
        />
        <Chart
          series={series}
          yFormat={shortUsd}
          xFormat={(v) => `${Math.round(v)}y`}
          ariaLabel={`Balance growing to ${usd(result.futureValue)} over ${years} years against ${usd(result.contributed)} contributed`}
        />
        <ChartLegend series={series} />
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- utilization */

function UtilizationExplorer({ id }) {
  const [limit, setLimit] = useState(500);
  const [balance, setBalance] = useState(200);

  const u = creditUtilization({ balance: Math.min(balance, limit), limit });
  const band = utilizationBand(u);

  return (
    <div className="explorer">
      <div className="dials">
        <Dial id={`${id}-limit`} label="Credit limit" value={limit} min={300} max={5000} step={100} onChange={setLimit} format={(v) => usd(v)} />
        <Dial
          id={`${id}-balance`}
          label="Balance when the statement closes"
          value={Math.min(balance, limit)}
          min={0}
          max={limit}
          step={10}
          onChange={setBalance}
          format={(v) => usd(v)}
        />
        <p style={{ fontSize: '0.78rem', color: 'var(--ink-3)', margin: 0, lineHeight: 1.45 }}>
          Utilization is measured on the statement date, not on the due date. Paying the card down
          <em> before</em> the statement closes is what changes the number that gets reported.
        </p>
      </div>

      <div className="readout">
        <Readout
          cells={[
            { label: 'Utilization', value: pct(u, 1), tone: band.key === 'excellent' ? 'good' : band.key === 'high' ? 'bad' : 'accent' },
            { label: 'Band', value: band.label },
            { label: 'Under-10% ceiling', value: usd(limit * 0.1) },
          ]}
        />
        <div className="meter">
          <div className="meter__track">
            <div className="meter__fill" data-band={band.key} style={{ width: `${Math.min(100, u * 100)}%` }} />
            <div className="meter__mark" style={{ left: '10%' }}>
              <span>10%</span>
            </div>
            <div className="meter__mark" style={{ left: '30%' }}>
              <span>30%</span>
            </div>
          </div>
          <div className="meter__legend">
            <span className="meter__band">{band.label}</span>
            <span style={{ color: 'var(--ink-2)', textAlign: 'right' }}>{band.note}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- minimum */

function MinimumExplorer({ id }) {
  const [balance, setBalance] = useState(1200);
  const [apr, setApr] = useState(Math.round(R.averageCarriedCardAPR * 1000) / 10);

  const min = useMemo(() => minimumPaymentPayoff({ balance, annualAPR: apr / 100 }), [balance, apr]);
  const plan = useMemo(() => amortize({ principal: balance, annualRate: apr / 100, years: 1 }), [balance, apr]);

  const series = [
    {
      key: 'min',
      label: 'Paying the minimum',
      color: 'var(--clay)',
      fill: true,
      points: min.schedule.filter((_, i) => i % 2 === 0).map((p) => ({ x: p.month, y: p.balance })),
    },
    {
      key: 'plan',
      label: 'Paying it off in 12 months',
      color: 'var(--moss)',
      points: plan.schedule.map((p) => ({ x: p.month, y: p.balance })),
    },
  ];

  return (
    <div className="explorer">
      <div className="dials">
        <Dial id={`${id}-bal`} label="Balance" value={balance} min={200} max={5000} step={100} onChange={setBalance} format={(v) => usd(v)} />
        <Dial id={`${id}-apr`} label="APR" value={apr} min={12} max={30} step={0.5} onChange={setApr} format={(v) => `${v}%`} />
        <p style={{ fontSize: '0.78rem', color: 'var(--ink-3)', margin: 0, lineHeight: 1.45 }}>
          Minimum modelled as 1% of the balance plus that month’s interest, with a $25 floor — the
          most common issuer formula. It clears the interest and almost nothing else.
        </p>
      </div>

      <div className="readout">
        <Readout
          cells={[
            { label: 'Minimum only', value: min.paidOff ? `${min.months} mo` : 'never', tone: 'bad' },
            { label: 'Interest paid', value: usd(min.totalInterest), tone: 'bad' },
            { label: '12-month plan', value: `${usd(plan.scheduledPayment, { cents: true })}/mo` },
            { label: 'Interest paid', value: usd(plan.totalInterest), tone: 'good' },
          ]}
        />
        <Chart
          series={series}
          yFormat={shortUsd}
          xFormat={(v) => `${Math.round(v)}mo`}
          ariaLabel={`Minimum payments take ${min.months} months and ${usd(min.totalInterest)} of interest versus ${usd(plan.totalInterest)} on a twelve month plan`}
        />
        <ChartLegend series={series} />
        <p style={{ fontSize: '0.85rem', color: 'var(--ink-2)', margin: 0 }}>
          Same balance, same card. The difference between the two lines is{' '}
          <strong>{usd(min.totalInterest - plan.totalInterest)}</strong> and{' '}
          <strong>{min.paidOff ? min.months - 12 : '∞'} extra months</strong>.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ loan */

function LoanExplorer({ id }) {
  const [principal, setPrincipal] = useState(27000);
  const [rate, setRate] = useState(Math.round(R.federalUndergradLoanAPR * 10000) / 100);
  const [years, setYears] = useState(10);
  const [extra, setExtra] = useState(0);

  const base = useMemo(() => amortize({ principal, annualRate: rate / 100, years }), [principal, rate, years]);
  const withExtra = useMemo(
    () => amortize({ principal, annualRate: rate / 100, years, extraMonthly: extra }),
    [principal, rate, years, extra]
  );

  const series = [
    {
      key: 'base',
      label: 'Scheduled payments',
      color: 'var(--ink-3)',
      dashed: true,
      points: base.schedule.filter((_, i) => i % 2 === 0).map((p) => ({ x: p.month, y: p.balance })),
    },
    {
      key: 'extra',
      label: extra > 0 ? `With ${usd(extra)}/mo extra` : 'With extra principal',
      color: 'var(--moss)',
      fill: true,
      points: withExtra.schedule.filter((_, i) => i % 2 === 0).map((p) => ({ x: p.month, y: p.balance })),
    },
  ];

  return (
    <div className="explorer">
      <div className="dials">
        <Dial id={`${id}-p`} label="Amount borrowed" value={principal} min={2000} max={60000} step={500} onChange={setPrincipal} format={(v) => usd(v)} />
        <Dial id={`${id}-r`} label="Interest rate" value={rate} min={3} max={12} step={0.01} onChange={setRate} format={(v) => `${v.toFixed(2)}%`} />
        <Dial id={`${id}-y`} label="Term" value={years} min={5} max={25} step={1} onChange={setYears} format={(v) => `${v} yr`} />
        <Dial id={`${id}-x`} label="Extra per month" value={extra} min={0} max={400} step={25} onChange={setExtra} format={(v) => usd(v)} />
        <p style={{ fontSize: '0.78rem', color: 'var(--ink-3)', margin: 0, lineHeight: 1.45 }}>
          {pct(R.federalUndergradLoanAPR, 2)} is the fixed rate on undergraduate Direct loans
          disbursed in 2026–27.
        </p>
      </div>

      <div className="readout">
        <Readout
          cells={[
            { label: 'Monthly payment', value: usd(base.scheduledPayment, { cents: true }), tone: 'accent' },
            { label: 'Total interest', value: usd(base.totalInterest), tone: 'bad' },
            { label: extra > 0 ? 'New payoff' : 'Payoff', value: `${withExtra.months} mo` },
            {
              label: 'Interest saved',
              value: usd(base.totalInterest - withExtra.totalInterest),
              tone: extra > 0 ? 'good' : undefined,
            },
          ]}
        />
        <Chart
          series={series}
          yFormat={shortUsd}
          xFormat={(v) => `${Math.round(v / 12)}y`}
          ariaLabel={`Loan balance falling to zero in ${withExtra.months} months`}
        />
        <ChartLegend series={series} />
        {extra > 0 && (
          <p style={{ fontSize: '0.85rem', color: 'var(--ink-2)', margin: 0 }}>
            {usd(extra)} a month — about {usd(extra / 4.3, { cents: true })} a week — retires it{' '}
            <strong>{base.months - withExtra.months} months early</strong> and saves{' '}
            <strong>{usd(base.totalInterest - withExtra.totalInterest)}</strong>.
          </p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- dispatch */

const EXPLORERS = {
  growth: GrowthExplorer,
  utilization: UtilizationExplorer,
  minimum: MinimumExplorer,
  loan: LoanExplorer,
};

export default function Explorer({ block }) {
  const Component = EXPLORERS[block.explorer];
  if (!Component) return null;
  return (
    <Activity block={block} statusOverride="explore">
      <Component id={block.id} />
    </Activity>
  );
}
