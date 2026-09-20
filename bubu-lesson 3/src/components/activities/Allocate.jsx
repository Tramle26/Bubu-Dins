import { useMemo, useState } from 'react';
import Activity, { Feedback } from './Activity.jsx';
import Chart, { ChartLegend } from '../Chart.jsx';
import { useActivity } from '../../hooks/useLessonProgress.jsx';
import {
  LAYERS,
  evaluateAllocation,
  projectPlan,
  emergencyFundMonths,
  usd,
  pct,
} from '../../lib/financeEngine.js';

const MARK = { blocking: '!', warning: '~', note: 'i' };

export default function Allocate({ block }) {
  const s = block.scenario;
  const { record, correct } = useActivity(block.id);

  const [plan, setPlan] = useState({ cashflow: s.essentials, safety: 0, credit: 0, debt: 0, growth: 0 });
  const [checked, setChecked] = useState(false);
  const [projected, setProjected] = useState(false);

  const ctx = useMemo(
    () => ({
      income: s.income,
      essentials: s.essentials,
      cardBalance: s.cardBalance,
      cardAPR: s.cardAPR,
      loanAPR: s.loanAPR,
      savings: s.savings,
      emergencyTargetMonths: s.emergencyTargetMonths,
    }),
    [s]
  );

  const result = useMemo(() => evaluateAllocation(plan, ctx), [plan, ctx]);

  const projection = useMemo(
    () =>
      projectPlan(plan, {
        savings: s.savings,
        cardBalance: s.cardBalance,
        cardAPR: s.cardAPR,
        loanBalance: s.loanBalance,
        loanAPR: s.loanAPR,
        investments: s.investments,
      }),
    [plan, s]
  );

  const set = (key, value) => {
    setPlan((p) => ({ ...p, [key]: Math.max(0, Number(value) || 0) }));
    setChecked(false);
  };

  const check = () => {
    setChecked(true);
    setProjected(true);
    record(result.passed);
  };

  const series = [
    {
      key: 'net',
      label: 'Net worth',
      color: 'var(--moss)',
      fill: true,
      points: projection.map((p) => ({ x: p.month, y: p.net })),
    },
    {
      key: 'savings',
      label: 'Cushion',
      color: 'var(--honey)',
      dashed: true,
      points: projection.map((p) => ({ x: p.month, y: p.savings })),
    },
  ];

  const start = projection[0];
  const end = projection.at(-1);

  return (
    <Activity block={block}>
      <div className="allocate">
        <dl className="scenario">
          <div>
            <dt>Money in</dt>
            <dd>
              {usd(s.income)}
              <small>{s.incomeNote}</small>
            </dd>
          </div>
          <div>
            <dt>Essentials</dt>
            <dd>
              {usd(s.essentials)}
              <small>{s.essentialsBreakdown.map((e) => `${e.label} ${usd(e.amount)}`).join(' · ')}</small>
            </dd>
          </div>
          <div>
            <dt>Cushion</dt>
            <dd>
              {usd(s.savings)}
              <small>{emergencyFundMonths({ savings: s.savings, monthlyEssentials: s.essentials })} months of essentials</small>
            </dd>
          </div>
          <div>
            <dt>Card balance</dt>
            <dd>
              {usd(s.cardBalance)}
              <small>at {pct(s.cardAPR)} · limit {usd(s.cardLimit)}</small>
            </dd>
          </div>
          <div>
            <dt>Student loans</dt>
            <dd>
              {usd(s.loanBalance)}
              <small>{s.loanNote}</small>
            </dd>
          </div>
        </dl>

        <div className="alloc-rows">
          {LAYERS.map((layer) => (
            <div className="alloc-row" key={layer.key}>
              <label className="alloc-row__label" htmlFor={`${block.id}-${layer.key}`}>
                {layer.label}
                <small>{layer.blurb}</small>
              </label>
              <input
                id={`${block.id}-${layer.key}`}
                type="number"
                min={0}
                max={s.income}
                step={5}
                value={plan[layer.key] ?? 0}
                onChange={(e) => set(layer.key, e.target.value)}
              />
              <input
                type="range"
                min={0}
                max={s.income}
                step={5}
                value={plan[layer.key] ?? 0}
                aria-label={`${layer.label} slider`}
                onChange={(e) => set(layer.key, e.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="alloc-total" data-over={result.allocated > s.income}>
          <span>
            Allocated {usd(result.allocated)} of {usd(s.income)}
          </span>
          <span>
            {result.unassigned >= 0 ? `${usd(result.unassigned)} unassigned` : `${usd(-result.unassigned)} over`}
          </span>
        </div>

        <div className="activity__actions">
          <button type="button" className="btn" onClick={check}>
            Check this plan
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => {
              setPlan({ cashflow: s.essentials, safety: 0, credit: 0, debt: 0, growth: 0 });
              setChecked(false);
              setProjected(false);
            }}
          >
            Reset
          </button>
        </div>

        {checked && (
          <>
            <Feedback
              tone={result.passed ? 'correct' : 'incorrect'}
              head={result.passed ? 'This plan holds up' : 'This plan breaks a rule from the lesson'}
              html={
                result.passed
                  ? 'Not the only plan that would pass — that is the point. It funds what has to be funded, and it does not leave money without a job.'
                  : 'Fix what is flagged below, then check again.'
              }
            />

            {result.findings.length > 0 && (
              <div className="findings">
                {result.findings.map((f, i) => (
                  <div className="finding" key={i} data-level={f.level}>
                    <span className="finding__mark" aria-hidden="true">
                      {MARK[f.level]}
                    </span>
                    <span>{f.message}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {projected && (
          <>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', margin: '4px 0 0' }}>
              Twelve months on this plan
            </h4>
            <dl className="readout__grid">
              <div className="readout__cell">
                <dt>Net worth today</dt>
                <dd>{usd(start.net)}</dd>
              </div>
              <div className="readout__cell" data-tone={end.net > start.net ? 'good' : 'bad'}>
                <dt>In 12 months</dt>
                <dd>{usd(end.net)}</dd>
              </div>
              <div className="readout__cell" data-tone="accent">
                <dt>Change</dt>
                <dd>
                  {end.net - start.net >= 0 ? '+' : '−'}
                  {usd(Math.abs(end.net - start.net))}
                </dd>
              </div>
              <div className="readout__cell" data-tone={end.card === 0 ? 'good' : 'bad'}>
                <dt>Card balance</dt>
                <dd>{usd(end.card, { cents: true })}</dd>
              </div>
            </dl>
            <Chart
              series={series}
              yFormat={(v) => (Math.abs(v) >= 1000 ? `$${Math.round(v / 1000)}k` : `$${Math.round(v)}`)}
              xFormat={(v) => `${Math.round(v)}mo`}
              ariaLabel={`Net worth moving from ${usd(start.net)} to ${usd(end.net)} over twelve months`}
            />
            <ChartLegend series={series} />
            <p style={{ fontSize: '0.82rem', color: 'var(--ink-3)', margin: 0 }}>
              A teaching projection, not a forecast: it assumes the same income, the same spending and a
              steady return every month, none of which a real year does.
            </p>
          </>
        )}
      </div>
    </Activity>
  );
}
