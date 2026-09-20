import { useCallback, useEffect, useMemo, useState } from 'react';
import Activity from './Activity.jsx';
import { useBank, short } from '../../hooks/useBank.jsx';
import {
  purchases as purchasesApi,
  loans as loansApi,
  merchants as merchantsApi,
  withdrawals as withdrawalsApi,
} from '../../services/nessie.js';
import {
  amortize,
  creditUtilization,
  utilizationBand,
  portfolioFromAccounts,
  usd,
  pct,
  REFERENCE_RATES as R,
} from '../../lib/financeEngine.js';

const ACCOUNT_COLOR = {
  Checking: 'var(--moss)',
  Savings: 'var(--sprout)',
  'Credit Card': 'var(--ember)',
};

/** Honest status line. If the sandbox is unreachable, the student is told so. */
function Status() {
  const { mode, reason, retryLive } = useBank();
  return (
    <div className="sandbox__status">
      <span className={`pill pill--${mode}`}>{mode === 'live' ? 'Nessie live' : 'Practice bank'}</span>
      <span>
        {mode === 'live'
          ? 'Calls below are hitting api.nessieisreal.com.'
          : reason || 'Running on Bubu’s built-in bank — the numbers behave identically.'}
      </span>
      {mode === 'mock' && (
        <button type="button" className="btn btn--ghost btn--small" onClick={retryLive} style={{ marginLeft: 'auto' }}>
          Try the live sandbox
        </button>
      )}
    </div>
  );
}

function Wire({ log }) {
  if (!log.length) return null;
  return (
    <pre className="wire" aria-label="Recent API calls">
      {log.map((l) => (
        <div key={l.at + l.path}>
          <span className="verb">{l.method}</span> {l.path}
          {l.detail ? `  →  ${l.detail}` : ''}
        </div>
      ))}
    </pre>
  );
}

function AccountCard({ account }) {
  const type = account.type || account.account_type;
  return (
    <div className="account" style={{ '--acct-color': ACCOUNT_COLOR[type] || 'var(--moss)' }}>
      <span className="account__type">{type}</span>
      <span className="account__nickname">{account.nickname}</span>
      <span className="account__balance">{usd(account.balance, { cents: true })}</span>
      <span className="account__id">{account._id}</span>
    </div>
  );
}

/* ====================================================== open accounts */

function OpenAccounts() {
  const { accounts, openStarterAccounts, busy, error, log, customerId } = useBank();
  const opened = accounts.length >= 3;

  return (
    <div className="sandbox">
      <Status />

      {accounts.length > 0 && (
        <div className="accounts">
          {accounts.map((a) => (
            <AccountCard key={a._id} account={a} />
          ))}
        </div>
      )}

      <div className="activity__actions">
        <button type="button" className="btn" onClick={openStarterAccounts} disabled={busy}>
          {busy ? 'Opening…' : opened ? 'Reload accounts' : 'Open Checking, Savings and a Credit Card'}
        </button>
        {customerId && (
          <span style={{ fontSize: '0.78rem', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
            customer {short(customerId)}
          </span>
        )}
      </div>

      {error && <p style={{ color: 'var(--incorrect)', fontSize: '0.85rem', margin: 0 }}>{error}</p>}
      <Wire log={log} />

      {opened && (
        <p style={{ fontSize: '0.85rem', color: 'var(--ink-2)', margin: 0 }}>
          Three accounts, three jobs — and the credit card opens at {usd(0, { cents: true })}, because a
          card is not money until you spend on it.
        </p>
      )}
    </div>
  );
}

/* ============================================================== card */

const CARD_PURCHASES = [
  { label: 'Coffee', amount: 6.25, description: 'Brew & Bean' },
  { label: 'Groceries', amount: 48.12, description: 'Riverside Grocery' },
  { label: 'Textbook', amount: 89.0, description: 'Textbook Exchange' },
  { label: 'Flight home', amount: 214.0, description: 'Winter break' },
];

function CardSandbox() {
  const { card, checking, openStarterAccounts, refresh, note, log, busy, mode } = useBank();
  const [limit, setLimit] = useState(700);
  const [merchantId, setMerchantId] = useState(null);
  const [working, setWorking] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    let cancelled = false;
    merchantsApi
      .list()
      .then((list) => {
        if (!cancelled && Array.isArray(list) && list.length) setMerchantId(list[0]._id);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [mode]);

  const balance = Number(card?.balance) || 0;
  const u = creditUtilization({ balance, limit });
  const band = utilizationBand(u);

  const spend = useCallback(
    async (item) => {
      if (!card) return;
      setWorking(true);
      try {
        let mid = merchantId;
        if (!mid) {
          const made = await merchantsApi.create({
            name: 'Campus Merchant',
            category: ['Shopping'],
            address: { street_number: '100', street_name: 'Main St', city: 'Greenville', state: 'SC', zip: '29601' },
            geocode: { lat: 34.8526, lng: -82.394 },
          });
          mid = made?._id;
          setMerchantId(mid);
        }
        await purchasesApi.create(card._id, {
          merchant_id: mid,
          medium: 'balance',
          amount: item.amount,
          status: 'completed',
          description: item.description,
        });
        note('POST', `/accounts/${short(card._id)}/purchases`, `${usd(item.amount, { cents: true })} ${item.description}`);
        setHistory((h) => [item, ...h].slice(0, 6));
        await refresh();
      } finally {
        setWorking(false);
      }
    },
    [card, merchantId, note, refresh]
  );

  const payOff = useCallback(async () => {
    if (!card || balance <= 0) return;
    setWorking(true);
    try {
      // Nessie stores one unsigned `balance` per account and does not model a
      // credit line, so on a Credit Card we read that balance as "owed". Paying
      // it down is therefore the operation that DECREASES it — a withdrawal —
      // even though in the real world you are sending money in. The second call
      // takes the same money out of checking, which is where it actually comes
      // from; skipping it would make the card free.
      await withdrawalsApi.create(card._id, {
        medium: 'balance',
        amount: balance,
        description: 'Statement paid in full',
      });
      if (checking) {
        await withdrawalsApi.create(checking._id, {
          medium: 'balance',
          amount: balance,
          description: 'Credit card payment',
        });
      }
      note('POST', `/accounts/${short(card._id)}/withdrawals`, `cleared ${usd(balance, { cents: true })}`);
      await refresh();
      setHistory([]);
    } finally {
      setWorking(false);
    }
  }, [card, balance, note, refresh]);

  if (!card) {
    return (
      <div className="sandbox">
        <Status />
        <p style={{ fontSize: '0.88rem', color: 'var(--ink-2)', margin: 0 }}>
          You have not opened a credit card yet — do that in Participation Activity 3.3, or open the three
          starter accounts now.
        </p>
        <div className="activity__actions">
          <button type="button" className="btn" onClick={openStarterAccounts} disabled={busy}>
            Open my accounts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sandbox">
      <Status />

      <div className="accounts" style={{ gridTemplateColumns: 'minmax(190px, 260px)' }}>
        <AccountCard account={card} />
      </div>

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
          <span>
            <span className="meter__band">{pct(u, 1)}</span> of a {usd(limit)} limit
          </span>
          <span style={{ color: 'var(--ink-2)', textAlign: 'right' }}>{band.note}</span>
        </div>
      </div>

      <div className="dial" style={{ maxWidth: 300 }}>
        <label htmlFor="card-limit">
          <span>Credit limit</span>
          <output htmlFor="card-limit">{usd(limit)}</output>
        </label>
        <input
          id="card-limit"
          type="range"
          min={300}
          max={3000}
          step={100}
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
        />
      </div>

      <div className="activity__actions">
        {CARD_PURCHASES.map((item) => (
          <button key={item.label} type="button" className="btn btn--ghost btn--small" onClick={() => spend(item)} disabled={working}>
            {item.label} · {usd(item.amount, { cents: true })}
          </button>
        ))}
        <button type="button" className="btn btn--small" onClick={payOff} disabled={working || balance <= 0}>
          Pay statement in full
        </button>
      </div>

      {history.length > 0 && (
        <p style={{ fontSize: '0.85rem', color: 'var(--ink-2)', margin: 0 }}>
          The flight alone pushed utilization to {pct(creditUtilization({ balance: 214, limit }), 1)} on a{' '}
          {usd(limit)} limit. A single ordinary purchase can do that — which is why the limit, not the
          spending, is usually what needs to change.
        </p>
      )}

      <Wire log={log} />
    </div>
  );
}

/* ============================================================== loan */

function LoanSandbox() {
  const { checking, openStarterAccounts, note, log, busy } = useBank();
  const [amount, setAmount] = useState(27000);
  const [existing, setExisting] = useState([]);
  const [working, setWorking] = useState(false);
  const [failed, setFailed] = useState(null);

  const schedule = useMemo(
    () => amortize({ principal: amount, annualRate: R.federalUndergradLoanAPR, years: 10 }),
    [amount]
  );

  const load = useCallback(async () => {
    if (!checking) return;
    try {
      const list = (await loansApi.forAccount(checking._id)) || [];
      setExisting(list);
    } catch {
      setExisting([]);
    }
  }, [checking]);

  useEffect(() => {
    load();
  }, [load]);

  const record = useCallback(async () => {
    if (!checking) return;
    setWorking(true);
    setFailed(null);
    try {
      await loansApi.create(checking._id, {
        type: 'student',
        status: 'approved',
        credit_score: 710,
        monthly_payment: schedule.scheduledPayment,
        amount,
        description: `Direct Unsubsidized · ${pct(R.federalUndergradLoanAPR, 2)} fixed · 10-year standard`,
      });
      note('POST', `/accounts/${short(checking._id)}/loans`, `${usd(amount)} @ ${usd(schedule.scheduledPayment, { cents: true })}/mo`);
      await load();
    } catch (e) {
      setFailed(e.message || String(e));
    } finally {
      setWorking(false);
    }
  }, [checking, amount, schedule, note, load]);

  if (!checking) {
    return (
      <div className="sandbox">
        <Status />
        <div className="activity__actions">
          <button type="button" className="btn" onClick={openStarterAccounts} disabled={busy}>
            Open my accounts first
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sandbox">
      <Status />

      <div className="dial" style={{ maxWidth: 340 }}>
        <label htmlFor="loan-amount">
          <span>Amount borrowed</span>
          <output htmlFor="loan-amount">{usd(amount)}</output>
        </label>
        <input
          id="loan-amount"
          type="range"
          min={2000}
          max={60000}
          step={500}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
      </div>

      <dl className="readout__grid">
        <div className="readout__cell" data-tone="accent">
          <dt>Monthly payment</dt>
          <dd>{usd(schedule.scheduledPayment, { cents: true })}</dd>
        </div>
        <div className="readout__cell" data-tone="bad">
          <dt>Total interest</dt>
          <dd>{usd(schedule.totalInterest)}</dd>
        </div>
        <div className="readout__cell">
          <dt>Total repaid</dt>
          <dd>{usd(schedule.totalPaid)}</dd>
        </div>
      </dl>

      <div className="activity__actions">
        <button type="button" className="btn" onClick={record} disabled={working}>
          {working ? 'Recording…' : 'Record this loan on my portfolio'}
        </button>
      </div>

      {failed && (
        <p style={{ color: 'var(--incorrect)', fontSize: '0.85rem', margin: 0 }}>
          The sandbox rejected it: {failed}. Run <code>node scripts/nessie-probe.mjs &lt;key&gt;</code> to see
          which loan <code>type</code> values it accepts.
        </p>
      )}

      {existing.length > 0 && (
        <div className="table-scroll">
          <table className="spend-table">
            <thead>
              <tr>
                <th>Loan</th>
                <th>Type</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th style={{ textAlign: 'right' }}>Monthly</th>
              </tr>
            </thead>
            <tbody>
              {existing.map((l) => (
                <tr key={l._id}>
                  <td>{l.description || 'Student loan'}</td>
                  <td>{l.type}</td>
                  <td>{l.status}</td>
                  <td className="num">{usd(l.amount)}</td>
                  <td className="num">{usd(l.monthly_payment, { cents: true })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Wire log={log} />
    </div>
  );
}

/* ========================================================= portfolio */

function PortfolioSandbox() {
  const { accounts, customerId, card, refresh, mode } = useBank();
  const [rows, setRows] = useState([]);
  const [allLoans, setAllLoans] = useState([]);
  const [spend, setSpend] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!accounts.length) return;
    setLoading(true);
    try {
      const loanLists = await Promise.all(
        accounts.map((a) => loansApi.forAccount(a._id).catch(() => []))
      );
      setAllLoans(loanLists.flat().filter(Boolean));

      const checking = accounts.find((a) => (a.type || a.account_type) === 'Checking');
      if (checking) setSpend(await purchasesApi.byCategory(checking._id).catch(() => []));
    } finally {
      setLoading(false);
    }
  }, [accounts]);

  useEffect(() => {
    load();
  }, [load, mode]);

  const portfolio = useMemo(
    () => portfolioFromAccounts({ accounts, loans: allLoans }),
    [accounts, allLoans]
  );

  const maxSpend = Math.max(1, ...spend.map((s) => s.total));

  return (
    <div className="sandbox">
      <Status />

      <dl className="readout__grid">
        <div className="readout__cell" data-tone="good">
          <dt>Assets</dt>
          <dd>{usd(portfolio.assets, { cents: true })}</dd>
        </div>
        <div className="readout__cell" data-tone="bad">
          <dt>Liabilities</dt>
          <dd>{usd(portfolio.liabilities, { cents: true })}</dd>
        </div>
        <div className="readout__cell" data-tone={portfolio.net >= 0 ? 'good' : 'accent'}>
          <dt>Net worth</dt>
          <dd>{usd(portfolio.net, { cents: true })}</dd>
        </div>
      </dl>

      {accounts.length > 0 && (
        <div className="accounts">
          {accounts.map((a) => (
            <AccountCard key={a._id} account={a} />
          ))}
        </div>
      )}

      {spend.length > 0 && (
        <div className="table-scroll">
          <table className="spend-table">
            <thead>
              <tr>
                <th>Where the money went</th>
                <th style={{ width: 90, textAlign: 'right' }}>Total</th>
                <th style={{ width: 60, textAlign: 'right' }}>Count</th>
                <th style={{ width: '30%' }} />
              </tr>
            </thead>
            <tbody>
              {spend.map((s) => (
                <tr key={s.category}>
                  <td>{s.category}</td>
                  <td className="num">{usd(s.total, { cents: true })}</td>
                  <td className="num">{s.count}</td>
                  <td>
                    <div className="spend-bar" style={{ width: `${(s.total / maxSpend) * 100}%` }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {card && (
        <p style={{ fontSize: '0.85rem', color: 'var(--ink-2)', margin: 0 }}>
          Credit card balance {usd(card.balance, { cents: true })} — remember this one counts against you,
          which is why it sits in the liabilities column even though the bank calls it a balance like any other.
        </p>
      )}

      <div className="activity__actions">
        <button type="button" className="btn btn--ghost btn--small" onClick={() => { refresh(); load(); }} disabled={loading}>
          {loading ? 'Loading…' : 'Refresh from the bank'}
        </button>
        {customerId && (
          <span style={{ fontSize: '0.78rem', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
            customer {short(customerId)}
          </span>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------- dispatch */

const MODES = {
  'open-accounts': OpenAccounts,
  card: CardSandbox,
  loan: LoanSandbox,
  portfolio: PortfolioSandbox,
};

export default function Sandbox({ block }) {
  const Component = MODES[block.mode];
  if (!Component) return null;
  return (
    <Activity block={block} statusOverride="explore">
      <Component />
    </Activity>
  );
}
