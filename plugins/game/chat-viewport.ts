// Own only chat geometry and scroll intent; PathMX still owns document rendering.
export function chatViewport(
  root: HTMLElement,
  frame: HTMLIFrameElement,
  field: HTMLTextAreaElement,
  signal: AbortSignal,
) {
  root.dataset.embedded = String(window !== window.top)
  let following = true
  let frameEvents: AbortController | undefined
  let followBottom = () => {}
  const resizeField = () => {
    field.style.height = "auto"
    field.style.height = `${Math.min(140, field.scrollHeight)}px`
  }
  const fit = () => {
    const viewport = window.visualViewport
    const top = Math.max(
      0,
      root.getBoundingClientRect().top - (viewport?.offsetTop ?? 0),
    )
    const height = `${Math.max(240, (viewport?.height ?? window.innerHeight) - top)}px`
    if (root.style.getPropertyValue("--bos-height") !== height)
      root.style.setProperty("--bos-height", height)
  }
  frame.addEventListener(
    "load",
    () => {
      frameEvents?.abort()
      followBottom = () => {}
      const doc = frame.contentDocument
      const scroller = doc?.querySelector<HTMLElement>(
        '.pmx-document[data-type="thread"]',
      )
      if (!doc || !scroller) return
      following = true
      const events = (frameEvents = new AbortController())
      let scheduled = 0
      // Scroll the bounded document element, not a nested iframe's window. Safari
      // can overscroll/repaint that window incorrectly during resize/layout work.
      const schedule = () => {
        if (scheduled) return
        scheduled = requestAnimationFrame(() => {
          scheduled = 0
          if (following && scroller.isConnected) {
            const end = Math.max(
              0,
              scroller.scrollHeight - scroller.clientHeight,
            )
            if (Math.abs(scroller.scrollTop - end) > 1) scroller.scrollTop = end
          }
        })
      }
      followBottom = schedule
      scroller.addEventListener(
        "scroll",
        () => {
          following =
            scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight <
            100
        },
        { passive: true, signal: events.signal },
      )
      // Expanding a citation is reading, not a new reply. Keep the disclosure at
      // the reader's position even if they had been following the latest message.
      scroller.addEventListener(
        "click",
        (event) => {
          const target = event.target as Element | null
          if (target?.closest?.("summary")) following = false
        },
        { capture: true, signal: events.signal },
      )
      const sizes = new ResizeObserver(schedule)
      const observeBlocks = () => {
        sizes.disconnect()
        sizes.observe(scroller)
        for (const block of scroller.children) sizes.observe(block)
        schedule()
      }
      const changes = new MutationObserver(observeBlocks)
      changes.observe(scroller, {
        childList: true,
        subtree: true,
        characterData: true,
      })
      observeBlocks()
      events.signal.addEventListener(
        "abort",
        () => {
          sizes.disconnect()
          changes.disconnect()
          cancelAnimationFrame(scheduled)
        },
        { once: true },
      )
    },
    { signal },
  )
  field.addEventListener("input", resizeField, { signal })
  window.addEventListener("resize", fit, { signal })
  window.visualViewport?.addEventListener("resize", fit, { signal })
  window.visualViewport?.addEventListener("scroll", fit, { signal })
  document.addEventListener("pmx:render", fit, { signal })
  window.addEventListener("load", fit, { once: true, signal })
  signal.addEventListener("abort", () => frameEvents?.abort(), { once: true })
  fit()
  return {
    resizeField,
    follow() {
      following = true
      followBottom()
    },
  }
}
