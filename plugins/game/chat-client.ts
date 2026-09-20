import { mountPathMXBehavior } from "@pathmx/core/controls/browser"

import { chatViewport } from "./chat-viewport"

type Thread = { id: string; href: string; title: string; version: number }
mountPathMXBehavior("[data-boss-chat]", (root, { signal }) => {
  const field = root.querySelector<HTMLTextAreaElement>("textarea")!
  const select = root.querySelector<HTMLSelectElement>("[data-conversations]")!
  const frame = root.querySelector<HTMLIFrameElement>("[data-thread-frame]")!
  const open = root.querySelector<HTMLAnchorElement>("[data-open-thread]")!
  const send = root.querySelector<HTMLButtonElement>("[data-send]")!
  const stop = root.querySelector<HTMLButtonElement>("[data-stop]")!
  const status = root.querySelector<HTMLElement>("[data-chat-status]")!
  const viewport = chatViewport(root, frame, field, signal)
  const history = root.querySelector<HTMLDetailsElement>(".bos-history")!
  let available = !send.disabled,
    actor = root.dataset.actor
  let threads: Thread[] = [],
    selected: Thread | undefined,
    pending: AbortController | undefined
  let retry:
    | { turn: string; message: string; thread: string; version: number }
    | undefined
  let newId = crypto.randomUUID(),
    touched = false
  function choose(thread?: Thread) {
    selected = thread
    select.value = thread?.id ?? ""
    frame.hidden = !thread
    open.hidden = !thread
    root.querySelector<HTMLElement>("[data-welcome]")!.hidden = Boolean(thread)
    if (thread) {
      if (frame.getAttribute("src") !== thread.href) frame.src = thread.href
      open.href = thread.href
    } else frame.removeAttribute("src")
  }
  async function refresh(initial = false) {
    const requestingActor = actor
    const response = await fetch(`/api/bubu/chat?topic=${root.dataset.topic}`, {
      signal,
    })
    const result = await response.json()
    if (!response.ok) throw new Error(result.error)
    if (actor !== requestingActor) return
    threads = result.threads
    select.replaceChildren(
      new Option("New conversation", ""),
      ...threads.map((t) => new Option(t.title, t.id)),
    )
    if (initial && !touched) choose(threads[0])
    else if (selected)
      choose(threads.find((t) => t.id === selected!.id) ?? selected)
  }
  // Overlay layout selection can move the host during initial document startup.
  // Start embedded navigation after load, when that native document is settled.
  const initialize = () => {
    if (root.dataset.actor)
      void refresh(true).catch((error) => {
        status.textContent = error.message
      })
  }
  if (document.readyState === "complete") initialize()
  else window.addEventListener("load", initialize, { once: true, signal })
  root.addEventListener(
    "change",
    (event) => {
      if (event.target === select && !pending) {
        retry = undefined
        choose(threads.find((t) => t.id === select.value))
        newId = crypto.randomUUID()
        status.textContent = ""
        history.open = false
      }
    },
    { signal },
  )
  root.addEventListener(
    "click",
    (event) => {
      const button =
        event.target instanceof Element
          ? event.target.closest<HTMLButtonElement>("button")
          : null
      if (
        history.open &&
        event.target instanceof Element &&
        !history.contains(event.target)
      )
        history.open = false
      if (button?.dataset.prompt) {
        field.value = button.dataset.prompt
        viewport.resizeField()
        field.focus()
      }
      if (button?.hasAttribute("data-stop")) pending?.abort()
      if (button?.hasAttribute("data-new") && !pending) {
        touched = true
        choose()
        retry = undefined
        newId = crypto.randomUUID()
        field.value = ""
        viewport.resizeField()
        status.textContent = ""
        history.open = false
        field.focus()
      }
    },
    { signal },
  )
  field.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key === "Enter" &&
        !event.shiftKey &&
        !event.isComposing &&
        !matchMedia("(pointer: coarse)").matches
      ) {
        event.preventDefault()
        if (!pending) field.closest("form")!.requestSubmit()
      }
    },
    { signal },
  )
  root.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape" && history.open) {
        event.preventDefault()
        event.stopPropagation()
        history.open = false
        history.querySelector<HTMLElement>("summary")!.focus()
      }
    },
    { signal },
  )
  root.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault()
      if (pending || !available || !field.value.trim()) return
      touched = true
      field.focus({ preventScroll: true })
      const message = field.value.trim(),
        thread = selected?.id ?? newId
      const request =
        retry?.message === message && retry.thread === thread
          ? retry
          : {
              thread,
              turn: crypto.randomUUID(),
              version: selected?.version ?? 0,
              message,
            }
      retry = request
      const controller = new AbortController()
      pending = controller
      send.disabled = true
      send.hidden = true
      select.disabled = true
      stop.hidden = false
      root.querySelector<HTMLButtonElement>("[data-new]")!.disabled = true
      status.textContent = "Dr.Bos is thinking…"
      viewport.follow()
      let finished = false,
        acknowledged = false
      try {
        const response = await fetch("/api/bubu/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.any([
            signal,
            controller.signal,
            AbortSignal.timeout(70000),
          ]),
          body: JSON.stringify({ ...request, topic: root.dataset.topic }),
        })
        if (!response.ok) {
          const problem = await response.json()
          if (response.status === 409) retry = undefined
          throw new Error(problem.error)
        }
        if (
          response.headers.get("content-type")?.includes("application/json")
        ) {
          const saved = await response.json()
          choose({
            id: saved.thread,
            href: saved.href,
            title: message.slice(0, 70),
            version: saved.version,
          })
          acknowledged = true
          status.textContent =
            "This request is already saved. Reopen the document to check its reply."
          retry = undefined
        } else {
          const reader = response
            .body!.pipeThrough(new TextDecoderStream())
            .getReader()
          let buffer = ""
          while (true) {
            const chunk = await reader.read()
            if (chunk.done) break
            buffer += chunk.value
            const lines = buffer.split("\n")
            buffer = lines.pop()!
            for (const line of lines) {
              if (!line) continue
              const event = JSON.parse(line)
              if (event.type === "start") {
                acknowledged = true
                if (field.value.trim() === message) {
                  field.value = ""
                  viewport.resizeField()
                }
                choose({
                  id: thread,
                  href: event.href,
                  title: message.slice(0, 70),
                  version: event.version,
                })
                status.textContent = "Dr.Bos is replying…"
              }
              if (event.type === "saved")
                status.textContent = "Dr.Bos is replying…"
              if (event.type === "error") throw new Error(event.error)
              if (event.type === "finish") {
                finished = true
                retry = undefined
                status.textContent = ""
              }
            }
          }
          if (!finished)
            throw new Error(
              "The connection ended. Saved content is kept; retry your question.",
            )
        }
      } catch (error) {
        if (acknowledged) retry = undefined
        if (!field.value) {
          field.value = message
          viewport.resizeField()
        }
        status.textContent = controller.signal.aborted
          ? "Reply stopped. Your question is ready to retry."
          : error instanceof Error && error.name === "TimeoutError"
            ? "Dr.Bos took too long to reply. Your question is ready to retry."
          : error instanceof Error
            ? error.message
            : "Couldn't connect. Please retry."
      } finally {
        pending = undefined
        if (!signal.aborted) {
          send.disabled = !available
          send.hidden = false
          select.disabled = false
          stop.hidden = true
          root.querySelector<HTMLButtonElement>("[data-new]")!.disabled = false
          await refresh().catch(() => {})
        }
      }
    },
    { signal },
  )
  return {
    update() {
      if (actor === root.dataset.actor) return
      pending?.abort()
      touched = false
      actor = root.dataset.actor
      available = root.dataset.ready === "true"
      retry = undefined
      choose()
      field.value = ""
      status.textContent = ""
      send.disabled = !available
      select.replaceChildren(new Option("New conversation", ""))
      if (actor) void refresh(true).catch(() => {})
    },
  }
})
