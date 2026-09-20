import { mountPathMXBehavior } from "@pathmx/core/controls/browser"

type Draft = Record<string, string>
mountPathMXBehavior("[data-workspace]", (root, { signal }) => {
  let actor = root.getAttribute("data-actor"),
    kind = "student",
    tab = 0,
    draft: Draft = {}
  const q = <T extends Element = HTMLElement>(selector: string) =>
    root.querySelector<T>(selector)!
  const key = () => `bubu-project-draft-v1:${actor}:${kind}`
  let status = ""
  function load() {
    draft = {}
    try {
      const value: unknown = JSON.parse(localStorage.getItem(key()) ?? "{}")
      if (value && typeof value === "object" && !Array.isArray(value))
        for (const [k, v] of Object.entries(value))
          if (typeof v === "string") draft[k] = v
      status = "Browser draft ready."
    } catch {
      status = "Browser storage unavailable. Export your notes before leaving."
    }
  }
  function save() {
    try {
      localStorage.setItem(key(), JSON.stringify(draft))
      status = "Saved in this browser."
    } catch {
      status = "Could not save. Export your notes before leaving."
    }
    q("[data-save-status]").textContent = status
  }
  const tasks = () =>
    (draft.tasks ?? "")
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 12)
  function visuals() {
    q("[data-flow-detail]").textContent = ""
    q("[data-allocation-detail]").textContent = ""
    const flow = q("[data-flow]"),
      list = q("[data-task-list]")
    flow.replaceChildren()
    list.replaceChildren()
    tasks().forEach((task, i) => {
      const label = document.createElement("label"),
        check = document.createElement("input")
      check.type = "checkbox"
      check.checked = draft[`done:${task}`] === "yes"
      check.addEventListener("change", () => {
        draft[`done:${task}`] = check.checked ? "yes" : "no"
        save()
      })
      label.append(check, document.createTextNode(task))
      list.append(label)
      const button = document.createElement("button")
      button.type = "button"
      button.textContent = `${i + 1}. ${task}`
      button.addEventListener("click", () => {
        q("[data-flow-detail]").textContent = `Step ${i + 1}: ${task}`
      })
      if (i) {
        const arrow = document.createElement("span")
        arrow.textContent = "→"
        arrow.setAttribute("aria-hidden", "true")
        flow.append(arrow)
      }
      flow.append(button)
    })
    if (!tasks().length) flow.textContent = "Add tasks to start your flowchart."
    const values = [0, 1, 2].map((i) =>
      Math.min(1e9, Math.max(0, Number(draft[`value${i}`]) || 0)),
    )
    const total = values.reduce((a, b) => a + b, 0),
      chart = q("[data-sankey]")
    chart.replaceChildren()
    if (!total) {
      chart.textContent = "Add allocation amounts to draw your Sankey diagram."
      return
    }
    const ns = "http://www.w3.org/2000/svg",
      svg = document.createElementNS(ns, "svg")
    svg.setAttribute("viewBox", "0 0 600 260")
    svg.setAttribute("role", "img")
    svg.setAttribute(
      "aria-label",
      `Resource allocation, total ${total}. Exact values are in the buttons below.`,
    )
    let start = 30
    values.forEach((value, i) => {
      if (!value) return
      const width = (value / total) * 180,
        end = start + i * 20 + width / 2,
        path = document.createElementNS(ns, "path")
      path.setAttribute(
        "d",
        `M 25 ${start} C 270 ${start}, 300 ${end - width / 2}, 575 ${end - width / 2} L 575 ${end + width / 2} C 300 ${end + width / 2}, 270 ${start + width}, 25 ${start + width} Z`,
      )
      path.setAttribute("fill", ["#245c45", "#d5a638", "#699894"][i]!)
      path.setAttribute("opacity", "0.7")
      svg.append(path)
      start += width
    })
    chart.append(svg)
    values.forEach((value, i) => {
      const button = document.createElement("button"),
        name = draft[`label${i}`] || `Use ${i + 1}`
      button.type = "button"
      button.textContent = `${name}: ${value} (${Math.round((value / total) * 100)}%)`
      button.addEventListener("click", () => {
        q("[data-allocation-detail]").textContent =
          `${name} receives ${value} of ${total} total units.`
      })
      chart.append(button)
    })
  }
  function render() {
    if (actor !== root.getAttribute("data-actor")) {
      actor = root.getAttribute("data-actor")
      load()
    }
    q<HTMLSelectElement>("[data-kind]").value = kind
    q("[data-kind-description]").textContent =
      kind === "student"
        ? "Start with your own idea: fundraising, investing research, event planning, or seeking sponsorships."
        : "Bring a case from the community hub. Explore it on your own or plan with a team. Paste the case brief into Notes."
    root
      .querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("[data-field]")
      .forEach((field) => {
        if (field.value !== (draft[field.dataset.field!] ?? ""))
          field.value = draft[field.dataset.field!] ?? ""
      })
    root.querySelectorAll<HTMLButtonElement>("[data-tab]").forEach((button) => {
      const active = Number(button.dataset.tab) === tab
      button.setAttribute("aria-selected", String(active))
      button.tabIndex = active ? 0 : -1
    })
    root.querySelectorAll<HTMLElement>("[data-panel]").forEach((panel) => {
      panel.hidden = Number(panel.dataset.panel) !== tab
    })
    q("[data-save-status]").textContent = status
    visuals()
  }
  root.addEventListener(
    "input",
    (event) => {
      const field = event.target as HTMLInputElement
      if (!field.matches("[data-field]")) return
      draft[field.dataset.field!] = field.value
      save()
      if (
        field.dataset.field === "tasks" ||
        /^(label|value)/.test(field.dataset.field!)
      )
        visuals()
    },
    { signal },
  )
  root.addEventListener(
    "change",
    (event) => {
      if (event.target === q("[data-kind]")) {
        kind = q<HTMLSelectElement>("[data-kind]").value
        load()
        render()
      }
    },
    { signal },
  )
  root.addEventListener(
    "click",
    (event) => {
      const button =
        event.target instanceof Element ? event.target.closest("button") : null
      if (!button) return
      if (button.hasAttribute("data-tab")) {
        tab = Number(button.dataset.tab)
        render()
      }
      if (button.hasAttribute("data-prepare")) {
        if (draft.question?.trim()) {
          status =
            "Your existing question is preserved. Clear it first to prepare a new request."
          q("[data-save-status]").textContent = status
          return
        }
        draft.question =
          `Help me plan this student project step by step. Ask about missing goals and constraints, then suggest a small next action with reasons.\nProject: ${draft.title || "Untitled"}\nNotes: ${(draft.notes || "No notes yet").slice(0, 1000)}\nTasks: ${(draft.tasks || "No tasks yet").slice(0, 500)}`.slice(
            0,
            2000,
          )
        save()
        render()
        q<HTMLTextAreaElement>("#project-question").focus()
      }
      if (button.hasAttribute("data-export")) {
        const content = `# ${draft.title || "Untitled project"}\n\n## Notes\n${draft.notes || ""}\n\n## Materials\n${draft.materials || ""}\n\n## Tasks\n${tasks()
          .map((t) => `- [${draft[`done:${t}`] === "yes" ? "x" : " "}] ${t}`)
          .join(
            "\n",
          )}\n\n## Allocations\n${[0, 1, 2].map((i) => `${draft[`label${i}`] || `Use ${i + 1}`}: ${draft[`value${i}`] || 0}`).join("\n")}\n\n## Question for Dr.Bos\n${draft.question || ""}\n`
        const url = URL.createObjectURL(
            new Blob([content], { type: "text/markdown" }),
          ),
          link = document.createElement("a")
        link.href = url
        link.download = `${kind}-project.md`
        link.click()
        setTimeout(() => URL.revokeObjectURL(url), 1000)
      }
    },
    { signal },
  )
  root.addEventListener(
    "keydown",
    (event) => {
      if (
        !(event.target instanceof Element) ||
        !event.target.matches("[data-tab]")
      )
        return
      const keyboard = event as KeyboardEvent
      if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(keyboard.key))
        return
      keyboard.preventDefault()
      tab =
        keyboard.key === "Home"
          ? 0
          : keyboard.key === "End"
            ? 4
            : (tab + (keyboard.key === "ArrowRight" ? 1 : 4)) % 5
      render()
      q<HTMLButtonElement>(`[data-tab="${tab}"]`).focus()
    },
    { signal },
  )
  load()
  render()
  return { update: render }
})
