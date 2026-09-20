import { LAYERS, FICO_WEIGHTS, CREDIT_SCORE_BANDS, REFERENCE_RATES as R, pct, usd } from '../lib/financeEngine.js';
import { SortActivity, OrderActivity, MatchActivity, MultipleChoice, NumericEntry } from './activities/Graded.jsx';
import Explorer from './activities/Explorer.jsx';
import Sandbox from './activities/Sandbox.jsx';
import Allocate from './activities/Allocate.jsx';

/* ------------------------------------------------------------- prose */

export function Prose({ block }) {
  return <div className="prose" dangerouslySetInnerHTML={{ __html: block.html }} />;
}

const CALLOUT_MARK = { note: 'i', warn: '!', bubu: 'B', bos: 'Bos' };

export function Callout({ block }) {
  return (
    <aside className={`callout callout--${block.tone}`}>
      <h4>
        <span className="callout__mark" aria-hidden="true">
          {CALLOUT_MARK[block.tone] || 'i'}
        </span>
        {block.title}
      </h4>
      <div dangerouslySetInnerHTML={{ __html: block.html }} />
    </aside>
  );
}

export function Figures({ block }) {
  return (
    <div className="figures">
      {block.items.map((f) => (
        <div className="figure" key={f.label}>
          <div className="figure__value">{f.value}</div>
          <div className="figure__label">{f.label}</div>
          {f.note && <div className="figure__note">{f.note}</div>}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------ layer ladder */

const RUNG_COLOR = ['var(--forest)', 'var(--moss)', 'var(--pale)', 'var(--honey)', 'var(--ember)'];

export function Ladder() {
  // Rendered bottom-up (CSS column-reverse) so "fund the bottom layer first"
  // is a spatial fact on the page, not just a sentence in the prose.
  return (
    <div className="ladder">
      {LAYERS.map((layer, i) => (
        <div className="rung" key={layer.key} style={{ '--rung-color': RUNG_COLOR[i] }}>
          <span className="rung__n">{i + 1}</span>
          <span>
            <span className="rung__title">
              {layer.label}
              <span className="rung__home">{layer.home}</span>
            </span>
            <span className="rung__blurb">{layer.blurb}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

/* ----------------------------------------------------- account cards */

const ACCOUNT_CARDS = [
  {
    type: 'Checking',
    job: 'Throughput',
    color: 'var(--moss)',
    body: 'Money lands here and leaves here. It is a hallway, not a room — nothing should live in it for long.',
    stats: [
      ['Typical yield', 'near 0%'],
      ['Access', 'instant'],
      ['Nessie type', '"Checking"'],
    ],
  },
  {
    type: 'Savings',
    job: 'Storage',
    color: 'var(--sprout)',
    body: 'Money that must be worth the same amount when you need it. Same insurance as checking, meaningfully better yield.',
    stats: [
      ['National average', pct(R.nationalAverageSavingsAPY, 2)],
      ['Online banks', `~${pct(R.highYieldSavingsAPY, 2)}`],
      ['Nessie type', '"Savings"'],
    ],
  },
  {
    type: 'Credit Card',
    job: 'Record',
    color: 'var(--ember)',
    body: 'A short-term loan that builds a payment history. Free if you pay the statement in full; among the most expensive money there is if you do not.',
    stats: [
      ['Average APR', pct(R.averageCarriedCardAPR)],
      ['Cost if paid in full', usd(0, { cents: true })],
      ['Nessie type', '"Credit Card"'],
    ],
  },
];

export function AccountCards() {
  return (
    <div className="acct-cards">
      {ACCOUNT_CARDS.map((c) => (
        <div className="acct-card" key={c.type} style={{ '--acct-color': c.color }}>
          <span className="job">{c.job}</span>
          <h4>{c.type}</h4>
          <p>{c.body}</p>
          <dl>
            {c.stats.map(([k, v]) => (
              <div key={k} style={{ display: 'contents' }}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------- horizons */

const HORIZONS = [
  { when: 'Under 1 year', what: '<strong>Savings.</strong> The money has to be worth exactly what it is worth today on the day you need it.' },
  { when: '1–5 years', what: '<strong>Savings or a CD.</strong> Long enough to earn something, short enough that a bad year would land on you.' },
  { when: '5+ years', what: '<strong>Growth assets.</strong> Long enough that volatility stops being a risk and starts being the price of the return.' },
];

export function Horizons() {
  return (
    <div className="horizons">
      {HORIZONS.map((h) => (
        <div className="horizon" key={h.when}>
          <span className="horizon__when">{h.when}</span>
          <span className="horizon__what" dangerouslySetInnerHTML={{ __html: h.what }} />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------- fico weights */

const FICO_COLOR = ['var(--forest)', 'var(--moss)', 'var(--pale)', 'var(--honey)', 'var(--ember)'];

export function FicoWeights() {
  return (
    <div className="fico">
      {FICO_WEIGHTS.map((f, i) => (
        <div className="fico__row" key={f.key}>
          <span className="fico__label">
            {f.label}
            <span className="fico__plain" style={{ display: 'block', marginTop: 1 }}>
              {f.plain}
            </span>
          </span>
          <span className="fico__pct">{pct(f.weight, 0)}</span>
          <span
            className="fico__track"
            role="img"
            aria-label={`${f.label}: ${pct(f.weight, 0)} of the score`}
          >
            <span className="fico__fill" style={{ width: `${f.weight * 100}%`, '--fico-color': FICO_COLOR[i] }} />
          </span>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------- score bands */

export function ScoreBands() {
  // Drawn as one continuous 300–850 strip rather than five cards, because the
  // thing students misread is how wide "good" actually is and how far down
  // "subprime" starts.
  const min = 300;
  const max = 850;
  const span = max - min;
  const colors = ['var(--forest)', 'var(--moss)', 'var(--pale)', 'var(--honey)', 'var(--clay)'];

  return (
    <div className="bands">
      <div className="bands__strip" role="img" aria-label="Credit score ranges from 300 to 850">
        {[...CREDIT_SCORE_BANDS].reverse().map((b, i) => (
          <span
            key={b.label}
            className="bands__seg"
            style={{
              flexGrow: (b.max - b.min) / span,
              background: colors[CREDIT_SCORE_BANDS.length - 1 - i],
            }}
          />
        ))}
      </div>
      <div className="bands__scale">
        <span>300</span>
        <span>850</span>
      </div>
      <dl className="bands__list">
        {CREDIT_SCORE_BANDS.map((b, i) => (
          <div className="bands__row" key={b.label}>
            <span className="bands__swatch" style={{ background: colors[i] }} aria-hidden="true" />
            <dt>
              {b.label} <span className="bands__range">{b.min}–{b.max}</span>
            </dt>
            <dd>{b.note}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* --------------------------------------------------------- dispatch */

const RENDERERS = {
  prose: Prose,
  callout: Callout,
  figures: Figures,
  layers: Ladder,
  accountCards: AccountCards,
  horizons: Horizons,
  ficoWeights: FicoWeights,
  scoreBands: ScoreBands,
  sort: SortActivity,
  order: OrderActivity,
  match: MatchActivity,
  mcq: MultipleChoice,
  numeric: NumericEntry,
  explorer: Explorer,
  sandbox: Sandbox,
  allocate: Allocate,
};

export default function Block({ block }) {
  const Component = RENDERERS[block.kind];
  if (!Component) {
    if (import.meta.env?.DEV) console.warn(`No renderer for block kind "${block.kind}"`);
    return null;
  }
  return <Component block={block} />;
}
