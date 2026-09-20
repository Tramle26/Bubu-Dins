# Capital One API key use

Bubu uses Capital One's **Nessie** teaching sandbox, not a live Capital One
customer API. The credential is `NESSIE_API_KEY`. It stays on the server. This
file inventories every place that key is configured, read, or used to fetch
simulated banking data.

Do not put a real key in this file, in Markdown, in browser scripts, in prompts,
or in Git. Copy `.env.example` to a private `.env` only.

## What the key is

| Item | Value |
| --- | --- |
| Environment variable | `NESSIE_API_KEY` |
| Optional companion | `NESSIE_CUSTOMER_ID` (pin one sandbox customer) |
| API host | `https://prod-api.nessieisreal.com` |
| How the key is sent | Query string `?key=…` on every Nessie GET |
| Auth for Bubu's route | Signed-in learner session (`same-origin`) |
| Writes to Nessie | None. The app only GETs accounts, purchases, and loans. |

The sandbox never connects to a real bank and never sends a payment. Learning
credits stay separate from Nessie balances.

## Configure the key

`.env.example` documents the server-side variables:

```
# Capital One Nessie teaching sandbox, server-side only.
# NESSIE_API_KEY=
# Optional: pin the dashboard to one customer instead of the first sandbox account.
# NESSIE_CUSTOMER_ID=
```

Set them in the ignored `.env` file and restart the server. If `NESSIE_CUSTOMER_ID`
is omitted, the integration uses the customer attached to the first account
returned by `GET /accounts`.

Setup copy lives in `paths/work/bank.guide.md` and `README.md`.

## Where the key is read

The key is read in **one module**: `plugins/game/nessie.ts`.

| Location | What it does |
| --- | --- |
| `nessiePortfolioRoute` | Reads `process.env.NESSIE_API_KEY`. Anonymous callers get `401`. A missing key returns `503` ("The Nessie sandbox is not configured yet."). A failed Nessie fetch returns `502`. |
| `NessiePortfolio` render | Checks `Boolean(process.env.NESSIE_API_KEY?.trim())` so the Bank / Try it widget can say "configure the Nessie sandbox" instead of loading. The key itself is not written into HTML. |
| `loadNessiePortfolio(key)` | Passes the key into `nessieJson`, which appends `?key=` to each Nessie URL. |
| `NESSIE_CUSTOMER_ID` | Optional second env var. When set, the loader skips `GET /accounts` and calls `GET /customers/{id}/accounts`. |

The route is registered in `plugins/game/index.plugin.ts` as `nessiePortfolioRoute`
and exposed to the browser as **`GET /api/bubu/nessie-portfolio`**.

The browser never receives the key. Client scripts call Bubu's authenticated
route with `credentials: "same-origin"` and render the JSON portfolio.

## Nessie endpoints the key unlocks

`nessieJson` in `plugins/game/nessie.ts` is the only function that talks to
Capital One. All calls are GET, 10-second timeout, `Accept: application/json`.

| Nessie path | When it runs | Fields kept |
| --- | --- | --- |
| `/accounts` | No `NESSIE_CUSTOMER_ID` | First customer's checking, savings, and credit-card accounts |
| `/customers/{customerId}/accounts` | `NESSIE_CUSTOMER_ID` is set | That customer's accounts only |
| `/accounts/{accountId}/purchases` | Once per loaded account | Amount, dates, status, description |
| `/accounts/{accountId}/loans` | Once per loaded account | Balance, monthly payment, type, optional credit score |

Response shapes are validated with Zod (`Account`, `Purchase`, `Loan`). Extra
Nessie fields are ignored. The returned portfolio is:

```
{ customer_id, accounts[], purchases[], loans[] }
```

The API key is not copied into that JSON. Tests assert this.

## Screens that consume the portfolio (no key)

Two client widgets fetch `/api/bubu/nessie-portfolio`. Neither imports
`NESSIE_API_KEY`.

### 1. Bank / portfolio widget (`bubu:nessie-portfolio`)

- Server: `plugins/game/nessie.ts` (`NessiePortfolio`)
- Browser: `plugins/game/nessie-client.ts`
- Embedded on:
  - Storyworld Bank: `paths/world/bank.page.md` → `/world/bank.page`
  - College Try it: `paths/lessons/portfolio/try.lesson.md`

Uses of the fetched data:

- **Accounts tab:** checking + savings total, credit-card balance, snapshot net
  (deposits minus cards). Cards show nickname, last four digits, rewards.
- **Purchases tab:** 50/30/20 allocation against a local take-home amount.
  Categories are guessed from descriptions and edited in the browser. They are
  not supplied by Nessie and clear on reload.
- **Loans tab:** sandbox balance and scheduled payment. The learner types an
  illustrative APR because Nessie loans do not include a rate. Payoff math is
  local amortization and does not change sandbox debt.

### 2. User dashboard (`bubu:dashboard`)

- Server: `plugins/game/dashboard.ts`
- Browser: `plugins/game/dashboard-client.ts`
- Embedded on: `paths/dashboard.page.md` → `/dashboard.page`

Uses of the same route and payload:

- Current balance (checking + savings)
- Latest sandbox loan `credit_score` (or "Unavailable")
- Spending for the selected statement month
- Savings-goal progress against a visit-only target
- Estimated purchase categories, budget bars, recent transactions
- Spending-trend chart and cash-out for completed purchases
- Wallet / cards lists (nickname, type, last four, balance)

Planning targets on the dashboard reset on reload. Sandbox balances are never
changed.

## Tests

`tests/nessie.test.ts` calls `loadNessiePortfolio` with a fake `"test-only-key"`
and a mocked `fetch`. It checks:

- The first customer's accounts, purchases, and loans are kept; other customers
  are dropped.
- Every outbound URL includes `key=test-only-key`.
- The returned portfolio JSON does **not** contain the key.
- A configured customer hits `/customers/{id}/accounts` only.
- An empty sandbox returns a usable empty portfolio.

No test talks to the live Nessie host.

## Learner-facing mentions (no key)

These pages describe the sandbox. They do not contain the credential.

| File | Mention |
| --- | --- |
| `README.md` | Bank dashboard works when `NESSIE_API_KEY` is configured |
| `paths/work/bank.guide.md` | How to set the key; key never goes in markup or browser JS |
| `paths/world/bank.page.md` | "Capital One's Nessie teaching sandbox" |
| `paths/lessons/portfolio/try.lesson.md` | Part B: explore simulated Nessie data |
| `paths/portfolio.path.md` | Journey copy: simulated Capital One Nessie data |
| `paths/learn.page.md` | Portfolio topic teaser |

Sponsor notes in `plans/` mention Capital One as a hackathon judge. They are
not API usage.

## What the key is not used for

- Gemini / Dr.Bos chat (`GEMINI_API_KEY`)
- Magic-link email (`RESEND_API_KEY`)
- PathMX Completion, learning credits, or lesson grades
- Creating, updating, or deleting Nessie customers, accounts, purchases, loans,
  or transfers
- Real Capital One production banking
- Browser `localStorage` or client-side env

## How to try it

1. Copy `.env.example` to `.env` and set `NESSIE_API_KEY` (optional:
   `NESSIE_CUSTOMER_ID`).
2. Restart the app and sign in.
3. Open `/world/bank.page`, `/lessons/portfolio/try.lesson`, or `/dashboard.page`.
4. Confirm accounts load, then confirm View Source / Network: the browser only
   calls `/api/bubu/nessie-portfolio`, not `nessieisreal.com`.
