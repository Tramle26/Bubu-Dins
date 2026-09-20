import {
  defineComponent,
  html,
  privateResponse,
  route,
} from "@pathmx/core"
import { z } from "zod"

const NESSIE_ORIGIN = "https://prod-api.nessieisreal.com"
const amount = z.preprocess(
  (value) => (typeof value === "string" ? Number(value) : value),
  z.number().finite(),
)
const Account = z
  .object({
    _id: z.string().min(1),
    type: z.enum(["Checking", "Savings", "Credit Card"]),
    nickname: z.string().default("Account"),
    balance: amount,
    rewards: amount.optional().default(0),
    account_number: z.string().optional().default(""),
    customer_id: z.string().min(1),
  })
  .passthrough()
const Purchase = z
  .object({
    _id: z.string().min(1),
    medium: z.string().optional().default("balance"),
    transaction_date: z.string().optional(),
    purchase_date: z.string().optional(),
    status: z.string().optional().default("completed"),
    amount,
    description: z.string().optional().default("Purchase"),
    merchant_id: z.string().optional(),
  })
  .passthrough()
const Deposit = z.object({
  _id: z.string().min(1),
  amount,
  transaction_date: z.string().optional(),
  status: z.string(),
  description: z.string().optional().default("Deposit"),
})
const Loan = z
  .object({
    _id: z.string().min(1),
    type: z.string().optional().default("Loan"),
    creation_date: z.string().optional(),
    status: z.string().optional().default("open"),
    credit_score: amount.optional(),
    monthly_payment: amount,
    amount,
    description: z.string().optional().default("Loan"),
  })
  .passthrough()

export type NessieAccount = z.infer<typeof Account>
export type NessiePurchase = z.infer<typeof Purchase> & { account_id: string }
export type NessieLoan = z.infer<typeof Loan> & { account_id: string }
export type NessiePortfolio = {
  customer_id: string
  accounts: NessieAccount[]
  purchases: NessiePurchase[]
  loans: NessieLoan[]
  deposits: (z.infer<typeof Deposit> & { account_id: string })[] | null
}

async function nessieJson(path: string, key: string) {
  const url = new URL(path, NESSIE_ORIGIN)
  url.searchParams.set("key", key)
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(10_000),
  })
  if (!response.ok)
    throw new Error(`Nessie returned status ${response.status}.`)
  return response.json()
}

/** Fetch and normalize only the sandbox fields used by the learner dashboard. */
export async function loadNessiePortfolio(
  key: string,
  configuredCustomer = process.env.NESSIE_CUSTOMER_ID?.trim(),
): Promise<NessiePortfolio> {
  let customerId = configuredCustomer
  let accounts: NessieAccount[]
  if (customerId) {
    accounts = z
      .array(Account)
      .parse(await nessieJson(`/customers/${encodeURIComponent(customerId)}/accounts`, key))
  } else {
    const all = z.array(Account).parse(await nessieJson("/accounts", key))
    customerId = all[0]?.customer_id
    if (!customerId)
      return { customer_id: "", accounts: [], purchases: [], loans: [], deposits: [] }
    accounts = all.filter((account) => account.customer_id === customerId)
  }

  const activity = await Promise.all(
    accounts.map(async (account) => {
      const id = encodeURIComponent(account._id)
      const [purchases, loans, deposits] = await Promise.all([
        nessieJson(`/accounts/${id}/purchases`, key).then((value) =>
          z.array(Purchase).parse(value),
        ),
        nessieJson(`/accounts/${id}/loans`, key).then((value) =>
          z.array(Loan).parse(value),
        ),
        nessieJson(`/accounts/${id}/deposits`, key).then((value) =>
          z.array(Deposit).parse(value),
        ).catch(() => null),
      ])
      return {
        purchases: purchases.map((purchase) => ({
          ...purchase,
          account_id: account._id,
        })),
        loans: loans.map((loan) => ({ ...loan, account_id: account._id })),
        deposits: deposits?.map((deposit) => ({ ...deposit, account_id: account._id })) ?? null,
      }
    }),
  )
  return {
    customer_id: customerId,
    accounts,
    purchases: activity.flatMap((item) => item.purchases),
    loans: activity.flatMap((item) => item.loans),
    deposits: activity.some((item) => item.deposits === null) ? null : activity.flatMap((item) => item.deposits!),
  }
}

const response = (body: object, status = 200) =>
  privateResponse(Response.json(body, { status }))

export const nessiePortfolioRoute = route.get("nessie-portfolio", async (ctx) => {
  if ((await ctx.session()).type === "anonymous")
    return response({ error: "Sign in to open the sandbox portfolio." }, 401)
  const key = process.env.NESSIE_API_KEY?.trim()
  if (!key)
    return response({ error: "The Nessie sandbox is not configured yet." }, 503)
  try {
    return response(await loadNessiePortfolio(key))
  } catch (error) {
    ctx.log.warn("nessie.portfolio", {
      reason: error instanceof Error ? error.message : "Unknown error",
    })
    return response(
      { error: "Nessie could not load this sandbox portfolio. Try again shortly." },
      502,
    )
  }
})

export const NessiePortfolio = defineComponent({
  tag: "bubu:nessie-portfolio",
  client: new URL("./nessie-client.ts", import.meta.url),
  render(_use, _compiled, { view }) {
    const actor = view.principal.type === "actor" ? view.principal.actor : ""
    const configured = Boolean(process.env.NESSIE_API_KEY?.trim())
    return html`<section
      class="nessie-portfolio"
      data-nessie-portfolio
      data-actor="${actor}"
      data-ready="${actor && configured ? "true" : "false"}"
      data-pmx-prose="off"
    >
      <header class="nessie-heading">
        <div><p class="nessie-eyebrow">Capital One Nessie sandbox</p>
        <h2>My financial portfolio</h2>
        <p>Explore mock accounts and transactions. No real bank account is connected and no payments are sent.</p></div>
        <button type="button" data-nessie-reload>Refresh data</button>
      </header>
      <p class="nessie-status" data-nessie-status role="status" aria-live="polite">
        ${!actor ? "Sign in to load the sandbox portfolio." : !configured ? "Ask the project owner to configure the Nessie sandbox." : "Loading sandbox accounts…"}
      </p>
      <div data-nessie-content hidden>
        <div class="nessie-tabs" role="tablist" aria-label="Portfolio tools">
          <button type="button" role="tab" aria-selected="true" aria-controls="nessie-accounts" id="nessie-tab-accounts" data-nessie-tab="accounts">Accounts</button>
          <button type="button" role="tab" aria-selected="false" aria-controls="nessie-purchases" id="nessie-tab-purchases" data-nessie-tab="purchases">Purchases</button>
          <button type="button" role="tab" aria-selected="false" aria-controls="nessie-loans" id="nessie-tab-loans" data-nessie-tab="loans">Loans</button>
        </div>

        <section role="tabpanel" id="nessie-accounts" aria-labelledby="nessie-tab-accounts" data-nessie-panel="accounts">
          <div class="nessie-metrics">
            <article><span>Checking + savings</span><strong data-deposit-total>—</strong></article>
            <article><span>Credit-card balance</span><strong data-credit-total>—</strong></article>
            <article><span>Snapshot net</span><strong data-net-total>—</strong></article>
          </div>
          <div class="nessie-account-list" data-account-list></div>
          <p class="nessie-disclosure">Snapshot net subtracts credit-card balances from checking and savings balances. It excludes loans, pending interest, holds, and unlisted assets.</p>
        </section>

        <section role="tabpanel" id="nessie-purchases" aria-labelledby="nessie-tab-purchases" data-nessie-panel="purchases" hidden>
          <div class="nessie-tool-grid">
            <form class="nessie-settings" data-allocation-form>
              <h3>Monthly allocation</h3>
              <label for="nessie-income">Take-home money to plan</label>
              <input id="nessie-income" name="income" type="number" min="0" step="10" value="2000" />
              <label for="nessie-account-filter">Account activity</label>
              <select id="nessie-account-filter" data-account-filter><option value="">All accounts</option></select>
              <p>Starting guide: 50% needs · 30% wants · 20% saving and debt payments. Change each purchase category to make the tracker fit the scenario.</p>
            </form>
            <div class="nessie-allocation" data-allocation-results aria-live="polite"></div>
          </div>
          <div class="nessie-purchase-list" data-purchase-list></div>
          <p class="nessie-disclosure">Categories are local estimates based on descriptions and your edits. They are not supplied by Nessie and clear on reload.</p>
        </section>

        <section role="tabpanel" id="nessie-loans" aria-labelledby="nessie-tab-loans" data-nessie-panel="loans" hidden>
          <div class="nessie-loan-list" data-loan-list></div>
          <form class="nessie-payoff" data-payoff-form>
            <h3>Student-loan payoff explorer</h3>
            <div class="nessie-field-grid">
              <label>Balance ($)<input name="principal" type="number" min="0" step="0.01" value="10000" required /></label>
              <label>APR (%)<input name="apr" type="number" min="0" max="100" step="0.01" value="6.5" required /></label>
              <label>Monthly payment ($)<input name="payment" type="number" min="0.01" step="0.01" value="200" required /></label>
              <label>Extra each month ($)<input name="extra" type="number" min="0" step="1" value="0" required /></label>
            </div>
            <div class="nessie-payoff-result" data-payoff-result role="status"></div>
          </form>
          <p class="nessie-disclosure">The API supplies the sandbox balance and scheduled payment; you supply an illustrative APR because Nessie loans do not include a rate. Results use monthly amortization, assume a fixed rate and on-time payments, and do not change the sandbox debt.</p>
        </section>
      </div>
    </section>`
  },
})
