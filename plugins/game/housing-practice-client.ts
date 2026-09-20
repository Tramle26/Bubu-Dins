import { mountPathMXBehavior } from "@pathmx/core/controls/browser"

mountPathMXBehavior("[data-housing-practice], [data-investing-review]", (root, { signal }) => {
  const field = () => root.querySelector<HTMLTextAreaElement>("textarea")!
  let actor = root.getAttribute("data-actor"), draft = field().value
  let revision = root.getAttribute("data-revision"), dirty = false
  root.addEventListener("input", () => { draft = field().value; dirty = true; pending() }, { signal })
  const pending = () => {
    const waiting = root.querySelector("form")!.hasAttribute("data-pmx-pending")
    root.querySelector("[data-practice-status]")!.textContent = waiting ? "Dr.Bos is reviewing your explanation…" : dirty && revision ? "Your edits haven't been evaluated yet. Submit again for updated feedback." : ""
  }
  document.addEventListener("pmx:pending", pending, { signal })
  return { update() {
    const nextActor = root.getAttribute("data-actor"), nextRevision = root.getAttribute("data-revision")
    if (nextActor !== actor) { actor = nextActor; dirty = false; draft = field().defaultValue }
    if (nextRevision !== revision) {
      revision = nextRevision
      if (draft.trim() === field().defaultValue.trim()) dirty = false
      if (!dirty) draft = field().defaultValue
    }
    field().value = draft
    pending()
  } }
})
