import { mountPathMXBehavior } from "@pathmx/core/controls/browser"

type Account = {
  _id: string
  type: "Checking" | "Savings" | "Credit Card"
  nickname: string
  balance: number
  rewards: number
  account_number: string
}
type Purchase = {
  _id: string
  account_id: string
  amount: number
  description: string
  status: string
  transaction_date?: string
  purchase_date?: string
}
type Loan = {
  _id: string
  account_id: string
  type: string
  amount: number
  monthly_payment: number
  description: string
  status: string
}
type Portfolio = {
  customer_id: string
  accounts: Account[]
  purchases: Purchase[]
  loans: Loan[]
}
type Category = "needs" | "wants" | "goals"

const dollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
})
const money = (value: number) => dollars.format(Number.isFinite(value) ? value : 0)
const node = <K extends keyof HTMLElementTagNameMap>(name: K, className?: string) => {
  const element = document.createElement(name)
  if (className) element.className = className
  return element
}
const categoryFor = (purchase: Purchase): Category => {
  const words = purchase.description.toLowerCase()
  if (/loan|debt|payment|tuition|student/.test(words)) return "goals"
  if (/rent|grocery|market|utility|electric|water|gas|transit|health|medical|insurance|book/.test(words)) return "needs"
  return "wants"
}

function payoff(principal: number, annualRate: number, payment: number) {
  if (![principal, annualRate, payment].every(Number.isFinite) || principal < 0 || annualRate < 0 || payment <= 0) return null
  const rate = annualRate / 1200
  if (principal === 0) return { months: 0, interest: 0 }
  if (payment <= principal * rate) return null
  let balance = principal, interest = 0, months = 0
  while (balance > 0.005 && months < 1200) {
    const charge = balance * rate
    const paid = Math.min(payment, balance + charge)
    interest += charge
    balance -= paid - charge
    months++
  }
  return months === 1200 ? null : { months, interest }
}

mountPathMXBehavior("[data-nessie-portfolio]", (root, { signal }) => {
  let portfolio: Portfolio | undefined
  let actor = root.dataset.actor
  const categories = new Map<string, Category>()
  const status = root.querySelector<HTMLElement>("[data-nessie-status]")!
  const content = root.querySelector<HTMLElement>("[data-nessie-content]")!
  const accountName = (id: string) => portfolio?.accounts.find((account) => account._id === id)?.nickname ?? "Account"

  const setTab = (name: string) => {
    for (const tab of root.querySelectorAll<HTMLButtonElement>("[data-nessie-tab]")) {
      const selected = tab.dataset.nessieTab === name
      tab.setAttribute("aria-selected", String(selected))
      tab.tabIndex = selected ? 0 : -1
    }
    for (const panel of root.querySelectorAll<HTMLElement>("[data-nessie-panel]"))
      panel.hidden = panel.dataset.nessiePanel !== name
  }

  const renderAccounts = () => {
    if (!portfolio) return
    const deposits = portfolio.accounts.filter((account) => account.type !== "Credit Card").reduce((sum, account) => sum + account.balance, 0)
    const credit = portfolio.accounts.filter((account) => account.type === "Credit Card").reduce((sum, account) => sum + account.balance, 0)
    root.querySelector<HTMLElement>("[data-deposit-total]")!.textContent = money(deposits)
    root.querySelector<HTMLElement>("[data-credit-total]")!.textContent = money(credit)
    root.querySelector<HTMLElement>("[data-net-total]")!.textContent = money(deposits - credit)
    const list = root.querySelector<HTMLElement>("[data-account-list]")!
    list.replaceChildren()
    for (const kind of ["Checking", "Savings", "Credit Card"] as const) {
      const matching = portfolio.accounts.filter((account) => account.type === kind)
      if (!matching.length) {
        const empty = node("article", "nessie-account is-empty")
        const title = node("strong"); title.textContent = kind
        const copy = node("span"); copy.textContent = "No sandbox account"
        empty.append(title, copy); list.append(empty); continue
      }
      for (const account of matching) {
        const card = node("article", "nessie-account")
        const heading = node("div")
        const type = node("span"); type.textContent = account.type
        const title = node("h3"); title.textContent = account.nickname
        heading.append(type, title)
        const balance = node("strong"); balance.textContent = money(account.balance)
        const detail = node("small")
        const lastFour = account.account_number.slice(-4)
        detail.textContent = `${lastFour ? `•••• ${lastFour} · ` : ""}${account.type === "Credit Card" ? "amount owed" : "available snapshot"}${account.rewards ? ` · ${account.rewards} rewards` : ""}`
        card.append(heading, balance, detail); list.append(card)
      }
    }
  }

  const renderPurchases = () => {
    if (!portfolio) return
    const filter = root.querySelector<HTMLSelectElement>("[data-account-filter]")!
    const visible = portfolio.purchases.filter((purchase) => !filter.value || purchase.account_id === filter.value)
    const totals: Record<Category, number> = { needs: 0, wants: 0, goals: 0 }
    for (const purchase of visible) totals[categories.get(purchase._id) ?? categoryFor(purchase)] += Math.max(0, purchase.amount)
    const income = Number(root.querySelector<HTMLInputElement>('[name="income"]')!.value) || 0
    const results = root.querySelector<HTMLElement>("[data-allocation-results]")!
    results.replaceChildren()
    for (const [key, label, target] of [["needs", "Needs", .5], ["wants", "Wants", .3], ["goals", "Saving + debt", .2]] as const) {
      const item = node("article")
      const heading = node("div"); const name = node("strong"); name.textContent = label
      const value = node("span"); value.textContent = `${money(totals[key])} of ${money(income * target)}`
      heading.append(name, value)
      const meter = node("progress")
      meter.max = Math.max(1, income * target); meter.value = Math.min(meter.max, totals[key])
      meter.setAttribute("aria-label", `${label} spending compared with the ${Math.round(target * 100)} percent guide`)
      item.append(heading, meter); results.append(item)
    }
    const list = root.querySelector<HTMLElement>("[data-purchase-list]")!
    list.replaceChildren()
    if (!visible.length) {
      const empty = node("p"); empty.textContent = "No purchases are available for this account filter."
      list.append(empty); return
    }
    for (const purchase of [...visible].sort((a, b) => String(b.transaction_date ?? b.purchase_date ?? "").localeCompare(String(a.transaction_date ?? a.purchase_date ?? "")))) {
      const row = node("article", "nessie-purchase")
      const copy = node("div"); const title = node("strong"); title.textContent = purchase.description
      const detail = node("small"); detail.textContent = `${accountName(purchase.account_id)} · ${purchase.transaction_date ?? purchase.purchase_date ?? purchase.status}`
      copy.append(title, detail)
      const select = node("select")
      select.setAttribute("aria-label", `Category for ${purchase.description}`)
      for (const [value, label] of [["needs", "Need"], ["wants", "Want"], ["goals", "Saving/debt"]] as const) {
        const option = node("option"); option.value = value; option.textContent = label
        select.append(option)
      }
      select.value = categories.get(purchase._id) ?? categoryFor(purchase)
      select.addEventListener("change", () => { categories.set(purchase._id, select.value as Category); renderPurchases() }, { signal })
      const amount = node("strong"); amount.textContent = money(purchase.amount)
      row.append(copy, select, amount); list.append(row)
    }
  }

  const renderPayoff = () => {
    const form = root.querySelector<HTMLFormElement>("[data-payoff-form]")!
    const value = (name: string) => Number(new FormData(form).get(name))
    const principal = value("principal"), rate = value("apr"), payment = value("payment"), extra = value("extra")
    const baseline = payoff(principal, rate, payment)
    const accelerated = payoff(principal, rate, payment + extra)
    const result = root.querySelector<HTMLElement>("[data-payoff-result]")!
    result.replaceChildren()
    if (!baseline || !accelerated) {
      result.textContent = "The payment must be greater than the monthly interest charge. Check the balance, APR, and payment."
      return
    }
    const values = [
      ["With this plan", `${accelerated.months} months`],
      ["Estimated interest", money(accelerated.interest)],
      ["Time saved", `${baseline.months - accelerated.months} months`],
      ["Interest saved", money(Math.max(0, baseline.interest - accelerated.interest))],
    ]
    for (const [label, value] of values) {
      const item = node("article"); const name = node("span"); name.textContent = label
      const strong = node("strong"); strong.textContent = value
      item.append(name, strong); result.append(item)
    }
  }

  const chooseLoan = (loan: Loan) => {
    const form = root.querySelector<HTMLFormElement>("[data-payoff-form]")!
    form.querySelector<HTMLInputElement>('[name="principal"]')!.value = String(loan.amount)
    form.querySelector<HTMLInputElement>('[name="payment"]')!.value = String(loan.monthly_payment)
    renderPayoff()
    form.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }

  const renderLoans = () => {
    if (!portfolio) return
    const list = root.querySelector<HTMLElement>("[data-loan-list]")!
    list.replaceChildren()
    if (!portfolio.loans.length) {
      const empty = node("p"); empty.textContent = "No loans are attached to these sandbox accounts. Use the sample payoff numbers below."
      list.append(empty); renderPayoff(); return
    }
    for (const loan of portfolio.loans) {
      const card = node("article", "nessie-loan")
      const copy = node("div"); const title = node("h3"); title.textContent = loan.description || loan.type
      const detail = node("p"); detail.textContent = `${accountName(loan.account_id)} · ${loan.type} · ${loan.status}`
      copy.append(title, detail)
      const balance = node("strong"); balance.textContent = money(loan.amount)
      const payment = node("span"); payment.textContent = `${money(loan.monthly_payment)}/month`
      const use = node("button"); use.type = "button"; use.textContent = "Explore payoff"
      use.addEventListener("click", () => chooseLoan(loan), { signal })
      card.append(copy, balance, payment, use); list.append(card)
    }
    chooseLoan(portfolio.loans[0]!)
  }

  const render = () => {
    if (!portfolio) return
    const filter = root.querySelector<HTMLSelectElement>("[data-account-filter]")!
    filter.replaceChildren(new Option("All accounts", ""))
    for (const account of portfolio.accounts) filter.add(new Option(`${account.nickname} · ${account.type}`, account._id))
    renderAccounts(); renderPurchases(); renderLoans()
    status.textContent = `Loaded ${portfolio.accounts.length} accounts, ${portfolio.purchases.length} purchases, and ${portfolio.loans.length} loans from the Nessie sandbox.`
    content.hidden = false
  }

  const load = async () => {
    if (root.dataset.ready !== "true") return
    status.textContent = "Loading sandbox accounts…"
    root.querySelector<HTMLButtonElement>("[data-nessie-reload]")!.disabled = true
    try {
      const response = await fetch("/api/bubu/nessie-portfolio", {
        headers: { Accept: "application/json" }, credentials: "same-origin", signal,
      })
      const body = await response.json() as Portfolio & { error?: string }
      if (!response.ok) throw new Error(body.error ?? "The sandbox portfolio could not be loaded.")
      portfolio = body; categories.clear(); render()
    } catch (error) {
      if (signal.aborted) return
      content.hidden = true
      status.textContent = error instanceof Error ? error.message : "The sandbox portfolio could not be loaded."
    } finally {
      root.querySelector<HTMLButtonElement>("[data-nessie-reload]")!.disabled = false
    }
  }

  root.addEventListener("click", (event) => {
    const tab = (event.target as Element).closest<HTMLButtonElement>("[data-nessie-tab]")
    if (tab) setTab(tab.dataset.nessieTab!)
  }, { signal })
  root.addEventListener("keydown", (event) => {
    const tab = (event.target as Element).closest<HTMLButtonElement>("[data-nessie-tab]")
    if (!tab || !["ArrowLeft", "ArrowRight"].includes(event.key)) return
    event.preventDefault()
    const tabs = [...root.querySelectorAll<HTMLButtonElement>("[data-nessie-tab]")]
    const offset = event.key === "ArrowRight" ? 1 : -1
    const next = tabs[(tabs.indexOf(tab) + offset + tabs.length) % tabs.length]!
    setTab(next.dataset.nessieTab!); next.focus()
  }, { signal })
  root.querySelector("[data-nessie-reload]")!.addEventListener("click", load, { signal })
  root.querySelector("[data-account-filter]")!.addEventListener("change", renderPurchases, { signal })
  root.querySelector("[data-allocation-form]")!.addEventListener("input", renderPurchases, { signal })
  root.querySelector("[data-payoff-form]")!.addEventListener("input", renderPayoff, { signal })
  load()
  return { update() {
    if (actor !== root.dataset.actor) { actor = root.dataset.actor; portfolio = undefined; content.hidden = true; load() }
  } }
})
