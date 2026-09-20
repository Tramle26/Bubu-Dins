import { defineComponent, html } from "@pathmx/core"

export const PortfolioPractice = defineComponent({
  tag: "bubu:portfolio-practice",
  client: new URL("./portfolio-practice-client.ts", import.meta.url),
  render() {
    const rank = (name: string, label: string) => html`<label>${label}<select name="${name}" required>
      <option value="">Choose a position</option>
      <option value="1">1 — first</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5 — last</option>
    </select></label>`
    return html`<section class="portfolio-practice" data-portfolio-practice data-pmx-prose="off">
      <article>
        <p class="nessie-eyebrow">Activity 1</p><h2>Give expenses a job</h2>
        <p>Classify each example. “Goal/debt” includes saving and paying balances down.</p>
        <form data-category-check>
          <label>Weekly groceries<select name="groceries"><option value="">Choose</option><option value="needs">Need</option><option value="wants">Want</option><option value="goals">Goal/debt</option></select></label>
          <label>Concert ticket<select name="concert"><option value="">Choose</option><option value="needs">Need</option><option value="wants">Want</option><option value="goals">Goal/debt</option></select></label>
          <label>Extra credit-card payment<select name="card"><option value="">Choose</option><option value="needs">Need</option><option value="wants">Want</option><option value="goals">Goal/debt</option></select></label>
          <button type="submit">Check categories</button><p data-category-result role="status"></p>
        </form>
      </article>
      <article>
        <p class="nessie-eyebrow">Activity 2</p><h2>Put the five jobs in order</h2>
        <p>Use each position once. Start with money needed now, then build toward growth.</p>
        <form data-jobs-check>
          ${rank("cash", "Cash flow — checking and bills")}
          ${rank("safety", "Safety — emergency savings")}
          ${rank("credit", "Credit — avoid new high-cost balances")}
          ${rank("debt", "Debt payoff — loans and existing balances")}
          ${rank("growth", "Growth — long-term investing")}
          <button type="submit">Check the order</button><p data-jobs-result role="status"></p>
        </form>
      </article>
      <article>
        <p class="nessie-eyebrow">Activity 3</p><h2>Where can the next dollar work hardest?</h2>
        <p>Assume a credit card costs 21.5% APR, a student loan costs 6.5%, and a diversified investment has a hypothetical 7% average return that is not guaranteed.</p>
        <form data-dollar-check>
          <label><input type="radio" name="choice" value="card" /> Pay the credit card</label>
          <label><input type="radio" name="choice" value="student" /> Pay the student loan</label>
          <label><input type="radio" name="choice" value="invest" /> Invest it</label>
          <button type="submit">Compare the choices</button><p data-dollar-result role="status"></p>
        </form>
      </article>
      <p class="nessie-disclosure">These are simplified teaching examples. Real decisions also depend on minimum payments, emergency savings, taxes, employer benefits, loan terms, and individual goals.</p>
    </section>`
  },
})
