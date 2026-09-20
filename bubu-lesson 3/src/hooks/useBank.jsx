import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import nessie, {
  accounts as accountsApi,
  customers as customersApi,
  onModeChange,
  state as nessieState,
  retryLive,
} from '../services/nessie.js';

/**
 * One bank per lesson. Every sandbox block reads from this, so the accounts a
 * student opens in Section 3 are the same ones Section 5 charges and Section 7
 * totals up — which is the whole reason for wiring the lesson to a real API
 * rather than to four independent toy widgets.
 */

const BankContext = createContext(null);

const env = (typeof import.meta !== 'undefined' && import.meta.env) || {};

export function BankProvider({ children }) {
  const [customerId, setCustomerId] = useState(env.VITE_NESSIE_CUSTOMER_ID || null);
  const [accounts, setAccounts] = useState([]);
  const [mode, setMode] = useState(nessieState.mode);
  const [reason, setReason] = useState(nessieState.reason);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [log, setLog] = useState([]);

  useEffect(() => onModeChange((s) => {
    setMode(s.mode);
    setReason(s.reason);
  }), []);

  const note = useCallback((method, path, detail) => {
    setLog((l) => [{ method, path, detail, at: Date.now() }, ...l].slice(0, 6));
  }, []);

  /** Finds or creates the student's customer record, then loads their accounts. */
  const connect = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      let id = customerId;
      if (!id) {
        const created = await customersApi.create({
          first_name: 'Bubu',
          last_name: 'Learner',
          address: {
            street_number: '1',
            street_name: 'Campus Dr',
            city: 'Greenville',
            state: 'SC',
            zip: '29613',
          },
        });
        id = created?._id;
        note('POST', '/customers', `created ${id}`);
        setCustomerId(id);
      }
      const list = (await accountsApi.forCustomer(id)) || [];
      note('GET', `/customers/${short(id)}/accounts`, `${list.length} account${list.length === 1 ? '' : 's'}`);
      setAccounts(list);
      return id;
    } catch (e) {
      setError(e.message || String(e));
      return null;
    } finally {
      setBusy(false);
    }
  }, [customerId, note]);

  const refresh = useCallback(async () => {
    if (!customerId) return;
    try {
      const list = (await accountsApi.forCustomer(customerId)) || [];
      setAccounts(list);
    } catch (e) {
      setError(e.message || String(e));
    }
  }, [customerId]);

  const openStarterAccounts = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const id = customerId || (await connect());
      if (!id) return [];
      const made = await nessie.ensureStarterAccounts(id);
      note('POST', `/customers/${short(id)}/accounts`, 'Checking · Savings · Credit Card');
      setAccounts(made);
      return made;
    } catch (e) {
      setError(e.message || String(e));
      return [];
    } finally {
      setBusy(false);
    }
  }, [customerId, connect, note]);

  // Connect once on mount. In mock mode this is instantaneous and offline-safe.
  useEffect(() => {
    connect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const byType = useMemo(() => {
    const map = {};
    for (const a of accounts) map[a.type || a.account_type] = a;
    return map;
  }, [accounts]);

  const value = useMemo(
    () => ({
      customerId,
      accounts,
      byType,
      checking: byType.Checking,
      savings: byType.Savings,
      card: byType['Credit Card'],
      mode,
      reason,
      busy,
      error,
      log,
      note,
      connect,
      refresh,
      openStarterAccounts,
      retryLive: async () => {
        const s = await retryLive();
        setMode(s.mode);
        setReason(s.reason);
        await refresh();
      },
    }),
    [customerId, accounts, byType, mode, reason, busy, error, log, note, connect, refresh, openStarterAccounts]
  );

  return <BankContext.Provider value={value}>{children}</BankContext.Provider>;
}

export function useBank() {
  const ctx = useContext(BankContext);
  if (!ctx) throw new Error('useBank must be used inside <BankProvider>');
  return ctx;
}

export const short = (id) => (id ? `${String(id).slice(0, 6)}…` : '—');
