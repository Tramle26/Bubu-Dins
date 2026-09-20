import { learningCredit } from "./progress"
import { defineComponent, fragment, html } from "@pathmx/core"
import { renderIcon } from "@pathmx/core/icons"
const LILIA = "/people/jordan.user"

const icon = (name: string) =>
  fragment(renderIcon(name, { size: 24, className: "bubu-icon" }) ?? "")

export const DashboardProfile = defineComponent({
  tag: "bubu:dashboard-profile",
  render(_use, _compiled, { view }, app) {
    const actor = view.principal.type === "actor" ? view.principal.actor : ""
    const learnerName = actor
      ? (app.actors.meta(actor)?.title ?? "Learner")
      : "Bubu"
    return html`<a class="profile-dashboard-link" href="/dashboard.page">Hi, ${learnerName}!</a>`
  },
})

export const Dashboard = defineComponent({
  tag: "bubu:dashboard",
  client: new URL("./dashboard-client.ts", import.meta.url),
  async render(_use, _compiled, { view }, app) {
    const actor = view.principal.type === "actor" ? view.principal.actor : ""
    const learnerName = actor
      ? (app.actors.meta(actor)?.title ?? "Learner")
      : "Bubu"
    const empty = actor === LILIA
    const credit = empty ? 0 : await learningCredit(view)
    return html`<section class="user-dashboard" data-dashboard data-actor="${actor}" data-learner="${learnerName}" data-learning-credit="${credit}" data-empty="${empty ? "true" : "false"}" data-pmx-prose="off">
      <nav class="dashboard-rail" aria-label="Dashboard sections">
        <a href="#dashboard-home" aria-current="page">${icon("panels-top-left")}<span>Home</span></a>
        <a href="#dashboard-balance">${icon("folder-kanban")}<span>Wallet</span></a>
        <a href="#dashboard-insights">${icon("list")}<span>Insights</span></a>
        <a href="#dashboard-goals">${icon("route")}<span>Goals</span></a>
        <a href="#dashboard-cash-flow">${icon("clipboard-list")}<span>Cards</span></a>
        <a href="#dashboard-statement">${icon("sliders-horizontal")}<span>Settings</span></a>
      </nav>
      <div class="dashboard-body" id="dashboard-home">
        <input type="month" data-month id="dashboard-statement" hidden />
        <p class="dashboard-status" role="status" aria-live="polite" data-status>${empty ? "No practice bank numbers yet." : "Loading fictional practice activity…"}</p>
        <div class="dashboard-metrics">
          <article class="dashboard-card" id="dashboard-balance"><span class="dashboard-symbol">${icon("folder-kanban")}</span><div><span class="metric-label">Current Balance</span><strong><i class="dashboard-coin" aria-hidden="true">$</i><span data-balance>${empty ? "—" : credit}</span></strong><small data-balance-change>${empty ? html`<span>vs. last month</span>` : html`<span class="metric-change positive">▲ +12%</span> <span>vs. last month</span>`}</small></div></article>
          <article class="dashboard-card"><span class="dashboard-symbol score">${icon("circle-check-big")}</span><div><span class="metric-label">Credit Score</span><strong data-score>${empty ? "—" : "742"}</strong><small data-score-meta>${empty ? html`<span>No score yet</span>` : html`<span class="metric-change positive">▲ +8</span> <span class="metric-grade">Good</span>`}</small></div></article>
          <article class="dashboard-card"><span class="dashboard-symbol gold">${icon("clipboard-list")}</span><div><span class="metric-label">Spending This Month</span><strong data-spending>${empty ? "—" : "$620.40"}</strong><small data-change>${empty ? html`<span>vs. last month</span>` : html`<span class="metric-change positive">▼ −14%</span> <span>vs. last month</span>`}</small></div></article>
          <article class="dashboard-card" id="dashboard-goals"><span class="dashboard-symbol">${icon("route")}</span><div><span class="metric-label">Savings Goal</span><strong data-goal-percent>${empty ? "—" : "68%"}</strong><progress data-goal-progress max="100" value="${empty ? 0 : 68}" aria-label="Savings goal progress"></progress><small data-goal-copy><i class="dashboard-coin small" aria-hidden="true">$</i>${empty ? "— / —" : "3,400 / 5,000"} <span>Vacation Fund</span></small></div></article>
        </div>
        <div class="dashboard-middle" id="dashboard-insights">
          <article class="dashboard-card"><header><h2>${icon("list")} Spending Trends</h2><select data-trend aria-label="Spending trend period"><option value="6">Last 6 months</option><option value="12">Last 12 months</option></select></header><div data-chart class="dashboard-chart">Loading spending trends…</div></article>
          <article class="dashboard-card"><header><h2>${icon("layout-grid")} Purchase Stats</h2></header><div class="dashboard-stats"><div class="dashboard-donut" data-donut><strong><i class="dashboard-coin small" aria-hidden="true">$</i><span data-total>${empty ? "—" : "620"}</span></strong><small>Total</small></div><div data-legend></div></div></article>
        </div>
        <div class="dashboard-bottom">
          <article class="dashboard-card"><header><h2>${icon("panels-top-left")} Budget Overview</h2><button type="button">View all⌄</button></header><div data-budgets>Loading budget overview…</div></article>
          <article class="dashboard-card"><header><h2>${icon("list")} Recent Transactions</h2><button data-see-all type="button" aria-expanded="false">See all</button></header><div data-transactions>Loading transactions…</div></article>
          <article class="dashboard-card" id="dashboard-cash-flow"><header><h2>${icon("waypoints")} Cash Flow</h2><button type="button">This Month⌄</button></header><div class="dashboard-cash"><div><span>Money In</span><strong data-in>${empty ? "—" : "$2,250.00"}</strong><small data-in-copy>${empty ? "vs. last month" : "↑ +5% vs. last month"}</small></div><div><span>Money Out</span><strong data-out>${empty ? "—" : "$620.40"}</strong><small data-out-copy>${empty ? "vs. last month" : "↓ −14% vs. last month"}</small></div></div><div class="dashboard-cash-chart"><div><b data-income-value>${empty ? "—" : "$2,250"}</b><span data-income-bar></span><small>Income</small></div><div><b data-cash-value>${empty ? "—" : "$620"}</b><span data-cash-bar></span><small>Expenses</small></div></div></article>
        </div>
      </div>
    </section>`
  },
})
