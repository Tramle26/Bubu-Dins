# Bubu — Building Your Financial Portfolio

A college-tier lesson for the Bubu lesson library: zyBook-style reading interleaved with
interactive practice, wired to Capital One's **Nessie** sandbox so students open real accounts,
post real purchases, and record a real student loan as they work through it.

```bash
npm install
npm run dev              # → http://localhost:5173
```

**The sandbox key is already in `.env`**, which `.gitignore` excludes — your `AGENTS.md` rule is
"never put API keys in Markdown, client scripts, prompts, or commits," and a gitignored `.env` is
the version of this that respects it. `.env.example` is the committed copy with the field blank.

It also runs with no key at all: leave `VITE_NESSIE_KEY` empty and the sandbox blocks fall back to
Bubu's built-in practice bank, which has identical shapes and a pre-seeded month of spending.

### Run the probe first

The key has **not** been verified against the live API — the machine this was built on blocks
`api.nessieisreal.com` at the network level, so every call in here has only ever run against the
mock. Before you trust a field name, spend thirty seconds on this:

```bash
npm run probe -- $(grep VITE_NESSIE_KEY .env | cut -d= -f2)
```

It prints the real shape of every object the lesson touches. Anything that disagrees with
`src/services/nessie.js`, the probe is right. Add `--seed` to create the demo customer and print a
`VITE_NESSIE_CUSTOMER_ID` for `.env`.

---

## What is in here

| Path | What it is |
| --- | --- |
| `src/content/portfolioLesson.js` | **All lesson copy and activity definitions, as data.** Edit wording, swap numbers, add an activity — no component changes. |
| `src/lib/financeEngine.js` | Pure money math: net worth, compounding, amortization, utilization, minimum-payment payoff, the allocation feedback engine. No React, no I/O. |
| `src/services/nessie.js` | The Nessie client — accounts, purchases, loans, plus customers/merchants/deposits/withdrawals/transfers/bills. |
| `src/services/nessieMock.js` | In-memory bank with identical shapes, used when the sandbox is unreachable. |
| `src/components/` | Lesson shell, progress rail, block renderers, and one component per activity type. |
| `src/hooks/useLessonProgress.jsx` | Per-activity results. This is what a mastery bar, streak, or Bubu health meter reads. |
| `src/hooks/useBank.jsx` | One bank shared across the whole lesson, so Section 3's accounts are Section 7's portfolio. |
| `scripts/nessie-probe.mjs` | Verifies what the live API actually returns, and seeds a demo portfolio. |
| `netlify/functions/nessie.js` | Production proxy. **You will need this.** See "The https problem" below. |
| `tests/financeEngine.test.mjs` | 18 tests pinning every figure quoted in the lesson. `npm test`. |

## Mounting it in the Bubu app

`src/App.jsx` exports `<PortfolioLesson />`, already wrapped in its two providers. Route to it
from the lesson library and nothing else has to change:

```jsx
import PortfolioLesson from './lessons/portfolio/App.jsx';

<Route path="/lessons/college/financial-portfolio" element={<PortfolioLesson />} />
```

The providers are scoped to that subtree, so they will not collide with app-level state.
If you already have a design system, delete `import './styles/lesson.css'` from `App.jsx`
and map the tokens at the top of that file to yours — every color in the lesson is a token.

---

## The https problem — read this before you deploy

`api.nessieisreal.com` is served over **plain http**. Its https URL answers but 302-redirects
back to http, so the moment your app is on https (Netlify, Vercel, GitHub Pages), the browser
blocks every Nessie call as mixed content — silently, with no error a student would understand.

Two places this is handled:

- **Dev:** `vite.config.js` proxies `/nessie` → `http://api.nessieisreal.com`. This also
  sidesteps CORS. Use `npm run dev`, not `vite preview`, when you want live API calls.
- **Production:** deploy `netlify/functions/nessie.js` and set
  `VITE_NESSIE_BASE=/.netlify/functions/nessie`. The browser talks https to your domain; the
  function talks http to Nessie.

Set `NESSIE_KEY` as a server-side variable on that function and drop `VITE_NESSIE_KEY` entirely,
and the key never ships to the browser. That is the version to show judges if secrets come up.

If none of that is in place, the lesson does not break — it falls back to the practice bank and
says so in a status pill. **The demo will not die on stage.**

## Verify the API before you trust it

Nessie's docs render client-side and it publishes no machine-readable schema, so the field names
in `nessie.js` come from its SDK sources and community projects. Run this once with your key:

```bash
node scripts/nessie-probe.mjs <YOUR_KEY>          # prints the real shape of every object
node scripts/nessie-probe.mjs <YOUR_KEY> --seed   # + creates a demo customer and portfolio
```

The `--seed` run prints the `VITE_NESSIE_CUSTOMER_ID` to paste into `.env`. If any field name
differs from what the probe prints, the probe is right and `nessie.js` needs the edit — the one
worth checking first is the accepted `type` values on `POST /accounts/{id}/loans`.

## Which endpoints the lesson touches

| Lesson moment | Call |
| --- | --- |
| §3 Open your three accounts | `POST /customers/{id}/accounts` × 3 — `Checking`, `Savings`, `Credit Card` |
| §5 Spend on the card | `POST /accounts/{id}/purchases` → balance and utilization re-read from the API |
| §5 Pay the statement | `POST /accounts/{id}/withdrawals` on the card and on checking |
| §6 Record the loan | `POST /accounts/{id}/loans` with the payment the student's own amortization produced |
| §7 Portfolio snapshot | `GET /customers/{id}/accounts` + `/purchases` + `/loans`, totalled into net worth |

Nessie stores one unsigned `balance` per account and has no concept of a credit line, so the
lesson reads a `Credit Card` balance as **money owed** — which is why a payment is a withdrawal
and why `portfolioFromAccounts()` flips it into the liabilities column. That mapping is the one
piece of Nessie semantics you have to keep in your head.

---

## The lesson

Seven sections, 24 activities (16 graded), about 50 minutes.

1. **What a portfolio actually is** — assets − liabilities, and the stock/flow distinction that trips everyone
2. **What your money is for** — needs that quietly turn into wants, then the five layers: cash flow → safety → credit → debt payoff → growth
3. **Three accounts, and what the bank charges you** — checking/savings/card, APY vs APR, the six fees that actually drain a student account + *open them for real*
4. **When you need it decides where it goes** — horizon-matching, with a compounding explorer
5. **Credit is a record, not a resource** — score bands, FICO weights, utilization, the closed-card trap, the minimum-payment trap + *live card*
6. **Student loans, and how to pay debt down** — subsidized vs unsubsidized, capitalization, amortization, snowball vs avalanche + *record the loan*
7. **Put it together** — capstone with a rule-based checker and a 12-month projection

### Where the content comes from

The framing and most of the practical detail in sections 2, 3, 5 and 6 are drawn from Kara Ross,
*Personal Finance for Teens and College Students* (Publishing Forte, 2021): needs turning into
wants and her three questions to ask before buying, the bank fee list and the avoidance move for
each, the credit-card statement vocabulary, the closed-card utilization trap, and the debt
snowball/avalanche comparison. Ideas are paraphrased and attributed in the lesson text, never
lifted. The figures are current ones from primary sources rather than the book's 2021 numbers.

Dr. Bos speaks in the first person in the `tone: 'bos'` callouts. That's a deliberate voice
choice — it's where the lesson stops explaining and starts advising, including the place in
section 6 where he declines to answer a question. Keep that split if you extend the lesson.

Activity types the renderer supports: `sort`, `order`, `match`, `mcq`, `numeric`, `explorer`,
`sandbox`, `allocate`. Adding a new one means a component in `components/activities/` and a line
in the `RENDERERS` map in `components/Blocks.jsx`.

### Rates are in one place

Every figure the lesson quotes reads from `REFERENCE_RATES` in `financeEngine.js`:

| | | as of |
| --- | --- | --- |
| Undergraduate Direct loans | 6.52% fixed | 2026–27 |
| Graduate Direct Unsubsidized | 8.07% | 2026–27 |
| Direct PLUS | 9.07% | 2026–27 |
| Direct loan origination fee | 1.057% | current |
| National average savings | 0.64% APY | Sept 2026 |
| Online savings | ~4.2% APY | Sept 2026 |
| Average APR, balances carrying interest | 21.52% | Q1 2026 |
| Average APR, new card offers | 23.79% | June 2026 |

Update that object once a year and every sentence, activity and answer key updates with it.
`npm test` pins the derived numbers, so a bad edit fails loudly.

### On giving advice

The lesson teaches the arithmetic and refuses the recommendation. Section 6 states plainly that
whether to prepay a loan or invest is not a question it will answer, and the closing note tells
students to talk to their financial aid office. That is a deliberate stance and it matches the
"Dr. Bos doesn't give investment advice" rule from the Bubu brief — worth keeping if you extend it.

---

## Next: the story-world scenarios

The lesson leaves a populated sandbox behind: three accounts, a spending history, a loan. Bubu's
world scenarios read the same portfolio, so consequences carry between the lesson and gameplay.
The four that follow naturally from this lesson:

1. **Opening day at the bank** — account choice under a teller's questions
2. **A month of spending** — `purchases` in real time, categorised against a budget
3. **The loan office** — borrow for a semester; see the payment you signed up for
4. **The unexpected expense** — a $600 bill against whatever cushion the student actually built

Each one needs a scenario definition and a scene component; the service layer and finance engine
they need are already here.
