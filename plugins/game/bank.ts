import { defineComponent, html } from "@pathmx/core"
import { learningCredit } from "./progress"

export const BankBudget = defineComponent({
  tag: "bubu:bank-budget",
  client: new URL("./bank-client.ts", import.meta.url),
  async render(_use, _compiled, { view }) {
    const credit = await learningCredit(view)
    return html`<section class="bank-budget" data-bank-budget data-credit="${credit}" data-actor="${view.principal.type === "actor" ? view.principal.actor : ""}">
      <h3>Your practice allocation</h3>
      <p>Available: $${credit}. Course target: $${(credit / 2).toFixed(2)}.</p>
      ${credit === 0 ? html`<p>Complete the investing Learn activity to earn your first $20. You can still explore the questions and bank chat.</p>` : null}
      <form><label for="bank-fund">Meadowbridge fund ($)</label><input id="bank-fund" name="fund" type="number" min="0" max="${credit}" step="0.01" value="0" required />
      <label for="bank-shares">Lantern shares ($)</label><input id="bank-shares" name="shares" type="number" min="0" max="${credit}" step="0.01" value="0" required />
      <p>Any unallocated credit stays in Easy Access savings.</p>
      <button class="primary-action" type="submit">Explore my plan →</button></form>
      <p data-bank-result role="status">Enter amounts to compare your plan with the course deadline and market-drop scenario.</p>
      <label for="bank-reason">Why this plan? What would change your mind?</label><textarea id="bank-reason" rows="3" maxlength="2000" placeholder="I would keep… accessible because… Before investing, I would ask…"></textarea>
      <p><small>Practice only. Amounts and notes clear when this panel closes or reloads. Your earned credit stays saved through lesson completion.</small></p>
    </section>`
  },
})
