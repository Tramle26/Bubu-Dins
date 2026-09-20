import { mountPathMXBehavior } from "@pathmx/core/controls/browser"

mountPathMXBehavior("[data-bubu-journey]", (root, { signal }) => {
  let list = false
  const render = () => {
    root.classList.toggle("is-list", list)
    const toggle = root.querySelector<HTMLButtonElement>("[data-view-toggle]")
    if (toggle) {
      toggle.textContent = list ? "Map view" : "List view"
      toggle.setAttribute("aria-pressed", String(list))
    }
  }
  root.addEventListener("click", event => {
    const target = event.target instanceof Element ? event.target : undefined
    if (target?.closest("[data-view-toggle]")) { list = !list; render() }
    const locked = target?.closest<HTMLElement>("[data-locked-step]")
    const status = root.querySelector("[data-journey-status]")
    if (locked && status) status.textContent = locked.dataset.lockedStep ?? ""
  }, { signal })
  return { update: render }
})
