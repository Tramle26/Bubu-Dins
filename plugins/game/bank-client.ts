import { mountPathMXBehavior } from "@pathmx/core/controls/browser"

mountPathMXBehavior("[data-bank-budget]", (root, { signal }) => {
  let actor = root.dataset.actor
  let fund = "0", shares = "0", reason = "", explored = false
  const input = (name: string) => root.querySelector<HTMLInputElement>(`[name="${name}"]`)!
  const notes = () => root.querySelector<HTMLTextAreaElement>("textarea")!
  const money = (amount: number) => `$${amount.toFixed(2)}`
  const render = () => {
    if (actor !== root.dataset.actor) { actor = root.dataset.actor; fund = shares = "0"; reason = ""; explored = false }
    input("fund").value = fund; input("shares").value = shares; notes().value = reason
    const result = root.querySelector<HTMLElement>("[data-bank-result]")!
    if (!explored) { result.textContent = "Enter amounts to compare your plan with the course deadline and market-drop scenario."; return }
    const credit = Number(root.dataset.credit), f = Number(fund), s = Number(shares)
    if (!fund.trim() || !shares.trim() || !Number.isFinite(f + s) || f < 0 || s < 0 || Math.round(f * 100) + Math.round(s * 100) > credit * 100) {
      result.textContent = `Use nonnegative amounts totaling no more than your ${money(credit)} earned credit.`; return
    }
    const cash = credit - f - s, target = credit / 2
    result.textContent = `Savings: ${money(cash)}. Course target: ${money(target)}. ${cash >= target ? "Your savings cover the course target in this example." : `You would need another ${money(target - cash)} for the course; what happens if investments fall?`} After the hypothetical drop: fund ${money(f * .8)}, shares ${money(s * .6)}; total including savings ${money(cash + f * .8 + s * .6)}. This excludes interest and fees and assumes investments can be sold at those values. What trade-off does your plan make?`
  }
  root.addEventListener("input", () => { fund = input("fund").value; shares = input("shares").value; reason = notes().value; if (explored) render() }, { signal })
  root.addEventListener("submit", event => { event.preventDefault(); explored = true; render() }, { signal })
  return { update: render }
})
