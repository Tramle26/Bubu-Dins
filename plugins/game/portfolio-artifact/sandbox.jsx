import { useEffect, useState } from "react"

const money = (value) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)

/** The imported lesson only reads Bubu's authenticated server route. */
export function PortfolioSandbox({ block }) {
  const [data, setData] = useState(null)
  const [message, setMessage] = useState("Loading connected sandbox data…")
  const [attempt, setAttempt] = useState(0)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setData(null)
    setMessage("Loading connected sandbox data…")
    fetch("/api/bubu/nessie-portfolio", { credentials: "same-origin", signal: controller.signal })
      .then(async response => {
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || "Sandbox data is unavailable. Try again.")
        setData(result)
        setMessage(`Loaded ${result.accounts.length} accounts and ${result.loans.length} loans from Capital One Nessie.`)
      })
      .catch(error => { if (!controller.signal.aborted) setMessage(error.message || "Sandbox data is unavailable. Try again.") })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [attempt])
  const card = block.mode === "card"
  const loan = block.mode === "loan"
  const accounts = data?.accounts.filter(account => !card || account.type === "Credit Card") ?? []
  return <section className="activity portfolio-sandbox" aria-label="Connected Capital One sandbox">
    <header className="activity__bar"><span>CAPITAL ONE NESSIE</span><span>Connected sandbox</span></header>
    <div className="activity__body">
      <h2>{loan ? "Your sandbox loans" : card ? "Your sandbox credit cards" : "Your three account types"}</h2>
      <p>{loan ? "Compare the recorded balance and monthly payment with the loan explorer above." : card ? "Compare the amount owed with the utilization explorer above. Nessie does not supply a credit limit, so the explorer's limit is an example." : "Identify checking, savings, and credit cards in the connected account snapshot."}</p>
      <p role="status" aria-live="polite">{message}</p>
      {data && <div className="portfolio-bank-cards">
        {loan ? data.loans.length ? data.loans.map(item => <article key={item._id}><span>{item.type}</span><h3>{item.description}</h3><strong>{money(item.amount)}</strong><p>{money(item.monthly_payment)} per month</p></article>) : <p>No loans are recorded in this sandbox.</p>
          : accounts.length ? accounts.map(account => <article key={account._id}><span>{account.type}</span><h3>{account.nickname}</h3><strong>{money(account.balance)}</strong><p>{account.type === "Credit Card" ? "Amount owed" : "Account balance"}</p></article>) : <p>{card ? "No credit-card accounts are recorded in this sandbox." : "No accounts are recorded in this sandbox yet."}</p>}
      </div>}
      <button type="button" className="btn btn--ghost" disabled={loading} onClick={() => setAttempt(value => value + 1)}>{loading ? "Loading…" : "Refresh sandbox data"}</button>
      <p className="activity__note">Simulated data, read from the server. These activities do not create accounts, make purchases, or change loan balances.</p>
    </div>
  </section>
}
