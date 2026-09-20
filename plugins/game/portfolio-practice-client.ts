import { mountPathMXBehavior } from "@pathmx/core/controls/browser"

mountPathMXBehavior("[data-portfolio-practice]", (root, { signal }) => {
  const formValues = (form: HTMLFormElement) => Object.fromEntries(new FormData(form))
  const category = root.querySelector<HTMLFormElement>("[data-category-check]")!
  const jobs = root.querySelector<HTMLFormElement>("[data-jobs-check]")!
  const dollar = root.querySelector<HTMLFormElement>("[data-dollar-check]")!

  category.addEventListener("submit", (event) => {
    event.preventDefault()
    const values = formValues(category)
    const correct = values.groceries === "needs" && values.concert === "wants" && values.card === "goals"
    root.querySelector("[data-category-result]")!.textContent = correct
      ? "That works: groceries support a basic need, the concert is optional, and the extra card payment advances a debt goal."
      : "Try again. Ask whether each item is necessary now, optional, or moves saving/debt forward."
  }, { signal })

  jobs.addEventListener("submit", (event) => {
    event.preventDefault()
    const values = formValues(jobs)
    const correct = values.cash === "1" && values.safety === "2" && values.credit === "3" && values.debt === "4" && values.growth === "5"
    root.querySelector("[data-jobs-result]")!.textContent = correct
      ? "You built the sequence: cash flow → safety → credit → debt payoff → long-term growth."
      : "Not quite. Cover current cash flow first, then safety, credit, existing debt, and finally long-term growth."
  }, { signal })

  dollar.addEventListener("submit", (event) => {
    event.preventDefault()
    const choice = formValues(dollar).choice
    root.querySelector("[data-dollar-result]")!.textContent = choice === "card"
      ? "In this simplified comparison, paying the 21.5% card balance avoids the largest certain cost. The investment return is only an estimate."
      : choice
        ? "Compare certain interest avoided with uncertain returns. Here, the 21.5% card cost is higher than 6.5% or the hypothetical 7% return."
        : "Choose one option before comparing."
  }, { signal })

  return { update() {} }
})
