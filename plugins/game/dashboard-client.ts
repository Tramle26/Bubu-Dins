import type { NessiePortfolio, NessiePurchase } from "./nessie"
import { mountPathMXBehavior } from "@pathmx/core/controls/browser"
const LILIA = "/people/jordan.user"

const money = (n: number, digits = 2) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n)

const names = ["Groceries", "Transportation", "Entertainment", "Bills", "Dining Out"]
const colors = ["#59be91", "#8ac4fc", "#ffd56a", "#ff96a5", "#c7a1ed"]

export function purchaseCategory(description: string) {
  const value = description.toLowerCase()
  if (/grocery|groceries|market/.test(value)) return 0
  if (/bus|transit|transport|fuel|uber/.test(value)) return 1
  if (/rent|utility|utilities|electric|phone|bill/.test(value)) return 3
  if (/café|cafe|restaurant|dining|coffee/.test(value)) return 4
  return 2
}

const monthOffset = (key: string, offset: number) => {
  const [year, month] = key.split("-").map(Number)
  const date = new Date(year!, month! - 1 + offset, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

function fictionalPortfolio(month: string): NessiePortfolio {
  const purchase = (id: string, description: string, amount: number, day: number, offset = 0): NessiePurchase => ({
    _id: id,
    account_id: "anatassia-checking",
    medium: "balance",
    status: "completed",
    amount,
    description,
    purchase_date: `${monthOffset(month, offset)}-${String(day).padStart(2, "0")}`,
  })
  const purchases = [
    purchase("freshmart", "FreshMart Grocery", 54.32, 18),
    purchase("bus-pass", "City Bus Pass", 40, 16),
    purchase("sunny-cafe", "Sunny Day Café", 7.5, 14),
    purchase("books", "Riverside Books & Entertainment", 28.99, 12),
    purchase("utilities", "Home Utilities", 120, 10),
    purchase("greenway", "Greenway Market", 144.21, 8),
    purchase("fuel", "Transit Fuel Card", 71.67, 7),
    purchase("cinema", "Neighborhood Cinema", 70.27, 6),
    purchase("phone", "Mobile Phone Bill", 28.9, 5),
    purchase("restaurant", "Garden Restaurant", 54.54, 4),
    purchase("prior-1", "Previous month purchases", 721.4, 15, -1),
    purchase("prior-2", "Earlier monthly purchases", 400, 15, -2),
    purchase("prior-3", "Earlier monthly purchases", 470, 15, -3),
    purchase("prior-4", "Earlier monthly purchases", 470, 15, -4),
    purchase("prior-5", "Earlier monthly purchases", 280, 15, -5),
  ]
  return {
    customer_id: "anatassia-practice",
    accounts: [
      { _id: "anatassia-checking", customer_id: "anatassia-practice", type: "Checking", nickname: "Everyday Checking", balance: 850, rewards: 0, account_number: "0425" },
      { _id: "anatassia-savings", customer_id: "anatassia-practice", type: "Savings", nickname: "Vacation Fund", balance: 3400, rewards: 0, account_number: "2718" },
    ],
    purchases,
    loans: [{ _id: "student-loan", account_id: "anatassia-checking", type: "Student", creation_date: `${monthOffset(month, -2)}-01`, status: "open", credit_score: 742, monthly_payment: 0, amount: 0, description: "Practice credit profile" }],
    deposits: [{ _id: "income", account_id: "anatassia-checking", amount: 2250, transaction_date: `${month}-02`, status: "completed", description: "Monthly income" }],
  }
}

function emptyPortfolio(): NessiePortfolio {
  return { customer_id: "", accounts: [], purchases: [], loans: [], deposits: [] }
}

mountPathMXBehavior("[data-dashboard]", (root, { signal }) => {
  const el = <T extends HTMLElement = HTMLElement>(selector: string) =>
    root.querySelector<T>(selector)!
  const set = (selector: string, value: string) => {
    el(selector).textContent = value
  }
  const row = (label: string, value: string, detail = "") => {
    const item = document.createElement("div")
    item.className = "dashboard-row"
    const text = document.createElement("span")
    text.textContent = label
    if (detail) {
      const small = document.createElement("small")
      small.textContent = detail
      text.append(small)
    }
    const strong = document.createElement("strong")
    strong.textContent = value
    item.append(text, strong)
    return item
  }

  const month = el<HTMLInputElement>("[data-month]")
  const today = new Date()
  month.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`
  let actor = root.dataset.actor ?? ""
  const empty = () => actor === LILIA || root.dataset.empty === "true"
  const source = () => (empty() ? emptyPortfolio() : fictionalPortfolio(month.value))
  let data = source()
  let all = false

  const render = () => {
    const credit = empty() ? 0 : Number(root.dataset.learningCredit ?? 0)
    const purchases = data.purchases.filter((purchase) => purchase.status === "completed" && purchase.amount >= 0)
    const date = (purchase: NessiePurchase) => purchase.purchase_date ?? purchase.transaction_date ?? ""
    const current = purchases.filter((purchase) => date(purchase).slice(0, 7) === month.value)
    const total = current.reduce((sum, purchase) => sum + purchase.amount, 0)
    const previous = purchases
      .filter((purchase) => date(purchase).slice(0, 7) === monthOffset(month.value, -1))
      .reduce((sum, purchase) => sum + purchase.amount, 0)
    const income = data.deposits
      ?.filter((deposit) => deposit.status === "completed" && deposit.transaction_date?.slice(0, 7) === month.value)
      .reduce((sum, deposit) => sum + deposit.amount, 0) ?? 0

    set("[data-balance]", empty() ? "—" : credit.toLocaleString("en-US"))
    const scores = data.loans
      .filter((loan) => loan.credit_score !== undefined)
      .sort((a, b) => (b.creation_date ?? "").localeCompare(a.creation_date ?? ""))
    set("[data-score]", scores.length ? String(scores[0]!.credit_score) : empty() ? "—" : "742")
    if (empty()) {
      el("[data-score-meta]").textContent = "No score yet"
      el("[data-balance-change]").textContent = "vs. last month"
    }
    set("[data-spending]", empty() ? "—" : money(total))
    set("[data-total]", empty() ? "—" : Math.round(total).toLocaleString("en-US"))
    set("[data-in]", empty() ? "—" : money(income))
    set("[data-out]", empty() ? "—" : money(total))
    set("[data-income-value]", empty() ? "—" : money(income, 0))
    set("[data-cash-value]", empty() ? "—" : money(total, 0))

    const change = previous ? Math.round(((total - previous) / previous) * 100) : 0
    const changeNode = el("[data-change]")
    if (empty()) {
      changeNode.replaceChildren(document.createTextNode("vs. last month"))
    } else {
      const badge = document.createElement("span")
      badge.className = `metric-change ${change <= 0 ? "positive" : "negative"}`
      badge.textContent = `${change <= 0 ? "▼" : "▲"} ${change > 0 ? "+" : "−"}${Math.abs(change)}%`
      changeNode.replaceChildren(badge, document.createTextNode(" vs. last month"))
    }

    const saving = data.accounts
      .filter((account) => account.type === "Savings")
      .reduce((sum, account) => sum + account.balance, 0)
    const goal = empty() ? 0 : 5000
    const goalPercent = goal ? Math.min(100, Math.round((saving / goal) * 100)) : 0
    set("[data-goal-percent]", empty() ? "—" : `${goalPercent}%`)
    el<HTMLProgressElement>("[data-goal-progress]").value = goalPercent
    const goalCopy = el("[data-goal-copy]")
    goalCopy.replaceChildren()
    const coin = document.createElement("i")
    coin.className = "dashboard-coin small"
    coin.setAttribute("aria-hidden", "true")
    coin.textContent = "$"
    goalCopy.append(coin, document.createTextNode(empty() ? "— / —" : `${saving.toLocaleString("en-US")} / ${goal.toLocaleString("en-US")}`))
    const goalName = document.createElement("span")
    goalName.textContent = "Vacation Fund"
    goalCopy.append(goalName)

    const totals = names.map((_, index) =>
      current
        .filter((purchase) => purchaseCategory(purchase.description) === index)
        .reduce((sum, purchase) => sum + purchase.amount, 0),
    )
    const legend = el("[data-legend]")
    legend.replaceChildren()
    let start = 0
    const stops: string[] = []
    names.forEach((name, index) => {
      const percent = total ? (totals[index]! / total) * 100 : 0
      stops.push(`${colors[index]} ${start}% ${start + percent}%`)
      start += percent
      const item = row(name, empty() ? "—" : `${Math.round(percent)}%`)
      item.style.setProperty("--category-color", colors[index]!)
      legend.append(item)
    })
    el("[data-donut]").style.background = total
      ? `conic-gradient(${stops.join(",")})`
      : "#e9eef0"

    const budgetTargets = empty() ? [0, 0, 0, 0] : [300, 120, 100, 300]
    const budgets = el("[data-budgets]")
    budgets.replaceChildren()
    names.slice(0, 4).forEach((name, index) => {
      const item = row(name, empty() ? "—" : `${Math.round(totals[index]!)} / ${budgetTargets[index]}`)
      item.style.setProperty("--category-color", colors[index]!)
      const progress = document.createElement("progress")
      progress.max = Math.max(1, budgetTargets[index]!)
      progress.value = empty() ? 0 : Math.min(progress.max, totals[index]!)
      progress.setAttribute("aria-label", `${name} spending against budget`)
      item.append(progress)
      budgets.append(item)
    })

    const list = el("[data-transactions]")
    list.replaceChildren()
    const sorted = [...current].sort((a, b) => date(b).localeCompare(date(a)))
    sorted.slice(0, all ? undefined : 5).forEach((purchase) => {
      const displayDate = new Date(`${date(purchase)}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      const item = row(purchase.description, `− ${money(purchase.amount)}`, displayDate)
      item.style.setProperty("--category-color", colors[purchaseCategory(purchase.description)]!)
      list.append(item)
    })
    if (!sorted.length) list.textContent = "No completed purchases for this month."

    const count = Number(el<HTMLSelectElement>("[data-trend]").value)
    const series = Array.from({ length: count }, (_, index) => {
      const key = monthOffset(month.value, index - count + 1)
      return {
        key,
        value: purchases
          .filter((purchase) => date(purchase).slice(0, 7) === key)
          .reduce((sum, purchase) => sum + purchase.amount, 0),
      }
    })
    const maximum = Math.max(1, ...series.map((point) => point.value))
    const divisor = Math.max(1, count - 1)
    const points = series
      .map((point, index) => `${40 + (index * 440) / divisor},${180 - (point.value / maximum) * 145}`)
      .join(" ")
    const axis = (value: number) => (empty() ? "—" : money(value, 0))
    el("[data-chart]").innerHTML = `<svg viewBox="0 0 520 220" role="img" aria-label="Monthly spending trend"><text x="8" y="38" font-size="11" fill="#52749a">${axis(maximum)}</text><text x="18" y="90" font-size="11" fill="#52749a">${axis(maximum * .66)}</text><text x="18" y="142" font-size="11" fill="#52749a">${axis(maximum * .33)}</text><path d="M40 35H480 M40 85H480 M40 135H480 M40 180H480" stroke="#e2eaf0" fill="none"/><polygon points="40,180 ${points} 480,180" fill="#59be9130"/><polyline points="${points}" fill="none" stroke="#25b47c" stroke-width="3"/>${series.map((point, index) => `<circle cx="${40 + (index * 440) / divisor}" cy="${180 - (point.value / maximum) * 145}" r="5" fill="#25b47c"><title>${point.key}: ${empty() ? "—" : money(point.value)}</title></circle><text x="${40 + (index * 440) / divisor}" y="205" text-anchor="middle" font-size="11" fill="#52749a">${new Date(`${point.key}-01T12:00:00`).toLocaleDateString("en-US", { month: "short" })}</text>`).join("")}</svg>`

    const cashMaximum = Math.max(1, total, income)
    el("[data-cash-bar]").style.height = empty() ? "8px" : `${Math.max(20, (total / cashMaximum) * 105)}px`
    el("[data-income-bar]").style.height = empty() ? "8px" : `${Math.max(20, (income / cashMaximum) * 105)}px`
    set("[data-in-copy]", empty() ? "vs. last month" : "↑ +5% vs. last month")
    const outCopy = el("[data-out-copy]")
    if (outCopy) outCopy.textContent = empty() ? "vs. last month" : "↓ −14% vs. last month"
    set("[data-status]", empty()
      ? `No practice bank numbers yet for ${root.dataset.learner}. The dashboard layout is ready.`
      : actor
        ? `Fictional Capital One-style practice data for ${root.dataset.learner}. No real bank account is connected.`
        : "Fictional practice data. Sign in to match the balance to your saved learning credit.")
  }

  const load = async () => {
    data = source()
    render()
    if (!actor || empty()) return
    try {
      const response = await fetch("/api/bubu/nessie-portfolio", { credentials: "same-origin", signal })
      const body = await response.json()
      if (!response.ok) throw new Error("Sandbox data unavailable")
      if (body.accounts?.length && body.purchases?.length) data = body
    } catch {
      data = source()
    }
    if (!signal.aborted) render()
  }

  month.addEventListener("change", () => {
    data = source()
    render()
  }, { signal })
  el("[data-trend]").addEventListener("change", render, { signal })
  el("[data-see-all]").addEventListener("click", () => {
    all = !all
    set("[data-see-all]", all ? "Show less" : "See all")
    el("[data-see-all]").setAttribute("aria-expanded", String(all))
    render()
  }, { signal })
  load()

  return {
    update() {
      if (actor !== root.dataset.actor) {
        actor = root.dataset.actor ?? ""
        load()
      } else render()
    },
  }
})
