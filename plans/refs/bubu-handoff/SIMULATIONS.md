---
title: Fictional simulation models and numerical contracts
version: 1.0
prepared: 2026-09-15
---

# Simulation specification

All rates, prices, company names, budgets, and event paths below are **invented teaching assumptions**. They are not quotations of current prices/rates, forecasts, or personalized recommendations. The included numbers are designed to exercise different outcomes, not represent a typical college graduate's finances.

Use `fixtures/housing.json` and `fixtures/investing.json` as the machine-readable inputs. `tools/reference_math.py` implements the specified arithmetic; `fixtures/expected-results.json` contains computed results. Port the model into tested application code and compare against these fixtures. Do not call an LLM to calculate outputs.

## 1. Common model rules

Amounts crossing storage/action boundaries use integer cents. Allocation percentages use integer basis points (10,000 = 100%). Use a decimal library or equivalent tested precision internally; do not rely on binary-float `Math.round` accidentally matching half-cent cases. Round currency half-up, nonnegative ties away from zero. Preserve internal precision for fractional shares until valuation; display currency to cents.

Every saved result includes scenario version, calculation version, input snapshot, output snapshot, and timestamp/order. The server recomputes submitted results from admitted inputs. Browser calculations are previews, not authoritative submissions.

Model constraints are visible next to the results. Always provide a numeric table alternative to a chart. Do not label one option “correct,” “best,” or “recommended” because its ending value is higher.

## 2. House: rent versus buy

### Teaching purpose

Compare cash requirements, nonrecoverable expenses, liquidity, and equity under stated assumptions. Ask how a changed expected stay affects the decision. The comparison deliberately uses the same initial savings and monthly available budget for each branch.

Ownership costs can extend beyond principal and interest, and a comparison depends on assumptions and the expected period of ownership. These teaching concepts are grounded in the [CFPB homebuying material](https://www.consumerfinance.gov/owning-a-home/prepare/consider-whether-its-the-right-time-for-you-to-buy/) and [budgeting guidance](https://www.consumerfinance.gov/owning-a-home/prepare/figure-out-how-much-you-want-to-spend/). Numerical percentages below are fixture choices, not sourced “typical” values.

### Fixed fictional starting case

| Parameter | Value |
| --- | --- |
| Home price | $240,000 |
| Starting savings, both branches | $72,000 |
| Monthly money available after nonhousing spending | $3,000 |
| Annual nominal loan interest rate | 6%, monthly accrual |
| Purchase transaction cost | 3% of home price, paid upfront |
| Sale transaction cost | 6% of ending home value |
| Home value growth | 2% annually, compounded by fractional years |
| Annual property tax | 1.2% of original price, held fixed |
| Homeowners insurance | $1,200 per year, held fixed |
| Maintenance expense | 1% of original price per year, evenly incurred monthly |
| Fictional mortgage-insurance assumption | 0.5% of original loan/year when down payment is 10%; fixed through the displayed horizon |
| Initial monthly rent | $1,750 |
| Rent increase | 2% at each completed 12-month anniversary |
| Renters insurance | $20 per month |
| Rental security deposit | $1,750 at start, fully returned at the end |
| Nonrefundable rental move-in fee | $300 |
| Return on unspent cash | 0% in both branches |

Editable choices: down payment **10% or 20%**; loan term **15 or 30 years**; stay **2 or 7 years**. Default: 20%, 30 years, 7 years. Advanced arbitrary inputs are unnecessary for v1.

**Disclosures:** maintenance is treated as incurred spending, not an accumulating reserve; transaction costs exclude prepaid items already represented monthly; mortgage insurance is a deliberately simplified fixture, not an eligibility/cancellation model. No income taxes, deductions, inflation adjustment, utilities differences, HOA fees, major one-off repairs, refinance, credit underwriting, selling delay, or opportunity return on cash. A fixed 0% cash return can materially influence this illustrative comparison. The case is not a loan offer.

### Mortgage kernel

Let `H` = home price, `d` = down fraction, `L = H(1-d)`, `r = annual nominal interest / 12`, and `N = years × 12`.

```text
If L = 0: scheduledPayment = 0
Else if r = 0: scheduledPayment = roundCents(L / N)
Else: scheduledPayment = roundCents(L * r / (1 - (1+r)^(-N)))
```

For month `t`, round interest on the outstanding principal to cents. Principal paid is the smaller of outstanding principal and `scheduledPayment - interest`. On the final contractual month, adjust principal/payment to exactly retire the balance. Never pay negative principal or accumulate negative loan balances. Retain the actual payment used in each schedule row.

Persisted expected fixtures use this rounded monthly schedule, not a closed-form unrounded balance. The displayed scheduled payment and the sum of schedule rows must reconcile to within the documented final-payment adjustment.

### Upfront cash

```text
buyCash[0]  = savings - downPayment - purchaseTransactionCost
rentCash[0] = savings - rentalDeposit - rentalMoveInFee
```

Down payment is a conversion of cash to home equity, not a nonrecoverable fee. The refundable rental deposit is an encumbered asset until returned. Do not subtract either twice from ending wealth.

### Monthly accounting

For month `t = 1..m`:

```text
buyOutflow[t] = actualMortgagePayment[t]
             + propertyTaxMonthly
             + homeownersInsuranceMonthly
             + maintenanceMonthly
             + fixtureMortgageInsuranceMonthly

rent[t] = roundCents(initialRent * (1 + annualRentGrowth)^floor((t-1)/12))
rentOutflow[t] = rent[t] + rentersInsuranceMonthly

buyCash[t]  = buyCash[t-1]  + monthlyAvailable - buyOutflow[t]
rentCash[t] = rentCash[t-1] + monthlyAvailable - rentOutflow[t]
```

Tax, insurance, maintenance, and fixture mortgage insurance are rounded to cents as monthly expenses. Mortgage insurance is charged only while an outstanding loan exists and the fixture's starting-down-payment rule applies. It is intentionally not a legal cancellation implementation.

Do not clamp negative cash to zero. Show a **budget shortfall** and mark the case infeasible under its assumptions. An unaffordable input must not be presented as a successful financial plan.

### End-of-stay comparison

```text
endingHomeValue = roundCents(H * (1 + annualHomeGrowth)^(m/12))
endingSaleCost = roundCents(endingHomeValue * saleCostRate)
remainingPrincipal = balance after month m
netSaleProceeds = endingHomeValue - endingSaleCost - remainingPrincipal

buyEndingPosition = buyCash[m] + netSaleProceeds
rentEndingPosition = rentCash[m] + returnedRentalDeposit
```

Show upfront cash, first monthly outflow, cumulative interest, principal repaid, ending liquid cash before sale, equity before sale costs, net sale proceeds, and ending position under assumptions. Disclose that ending position assumes the owner sells and the tenant receives the deposit back.

A useful UI separates **cost**, **cash flow**, and **equity**; it does not describe all mortgage payments as lost cost or all home value as liquid savings. Do not describe the result as an opportunity-cost-complete wealth comparison.

### Interaction and evidence

Before revealing the 2-year comparison, ask the learner to predict which items change and why. Save the prediction, reveal recomputed results, then ask for a short decision explanation referencing at least one changed quantity and one nonnumerical consideration. No particular rent/buy choice is required to pass.

### Required numerical tests

Match every included fixture within one cent per output field. Test zero interest, zero principal, first/last payment, 15/30-year cases, 10/20% down, 24/84-month horizons, invalid negative inputs, and a budget shortfall. Ensure total principal repaid plus remaining balance equals original principal. Compare total interest only for equal original principal/rate and a clearly stated horizon.

## 3. Bank: a fictional investment case

### Teaching purpose

Make an allocation, predict a risk, observe the same authored event path under different choices, and explain why a good/bad short outcome alone does not prove the original decision was sensible/unsensible. Concepts of allocation, diversification, horizon, and risk tolerance are grounded in [Investor.gov](https://www.investor.gov/introduction-investing/getting-started/asset-allocation).

Starting budget: **$10,000 fictional dollars**, fixed after the scenario is provisioned. Four fictional buckets:

| Bucket | Initial | Round 1 | Round 2 | Round 3 |
| --- | ---: | ---: | ---: | ---: |
| Bobo Incorporated | 100 | 120 | 72 | 90 |
| Cedar Goods | 100 | 98 | 90 | 102 |
| Meadow Basket Fund | 100 | 106 | 95 | 108 |
| Cash unit | 1 | 1 | 1 | 1 |

These are authored unit values in dollars, not sampled markets. Meadow represents a basket of fictional businesses; it does not imply that every fund is diversified. Cash is constant in nominal terms in this model; it does not teach that real cash has no inflation or institutional risk.

Round narratives: a company-specific surge; a broad setback; a partial recovery. Narratives explain the fixture, not a deterministic real-world cause-and-effect law. Do not annualize returns or claim statistical risk measures from three rounds.

### Allocation and valuation

Allow 0–100% per bucket in 1% steps; require the total to equal 100%. Use sliders paired with number inputs and a visible remaining percentage. Fractions of shares are permitted. No contributions, rebalancing, dividends, taxes, transaction fees, or borrowing.

```text
initialBucketAmount[i] = budget * allocationBps[i] / 10000
units[i] = initialBucketAmount[i] / initialPrice[i]
valueAtRound[t] = roundCents(sum(units[i] * price[i,t]))
return[t] = valueAtRound[t] / budget - 1
maxDrawdown = max over t of (priorPeak - valueAtRound[t]) / priorPeak
```

A chart includes initial value and all revealed rounds. Label drawdown as **largest drop from an earlier peak in this example**, not forecast risk. The sum of displayed components should reconcile with total using a documented display-rounding policy.

### Comparable decisions

Default learner fixture: 30% Bobo, 20% Cedar, 40% Meadow, 10% Cash. The explicit reference comparison is 20%, 20%, 40%, 20%. Both run against exactly the same prices and time points. The reference is illustrative, not a recommended portfolio. A 100% Bobo fixture tests concentration. Do not choose market outcomes adaptively to reward the learner or guarantee the comparison allocation wins.

At each event, advance through a validated server action using the expected previous round and run version. Refreshing and repeated requests must not advance twice. Future event values stay out of the live tutor context until revealed. Static authored fixtures can be public in development, but a production-like blind-prediction mode must keep future data server-side.

The ending portfolio stays inside the run. It cannot credit the game wallet. Replay creates a new run using the same fixed event path unless the author explicitly selects another versioned case.

### Expected baseline

The default fixture values are $10,000 → $10,800 → $8,760 → $10,060. That is a $60 final change, or 0.6%, with an approximately 18.89% largest peak-to-trough decline across these points. These are calculations from the invented fixture, not market observations.

## 4. No hidden model changes

Version rates/events/formulas and content together. The learner's saved reflection must remain attached to the numbers they actually saw. If a bug fix alters results, preserve the original snapshot and label any recalculation. Do not retroactively change a learner's pass based on a new price path.
