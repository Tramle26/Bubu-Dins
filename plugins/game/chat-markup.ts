import { maskNativeNotation, validateMermaid } from "./chat-visuals"
// Deliberately small authoring grammar. Never compile unchecked model output.
const containers = new Set([
  "bos-steps",
  "bos-compare",
  "bos-flow",
  "bos-chart",
])
const cards = new Set(["bos-step", "bos-option", "bos-node"])
const prose = new Set(["p", "strong", "em", "ul", "ol", "li"])

export function inertText(value: string) {
  return value.replace(/[&<>"'\[\]{}\r\n`]/g, (c) => `&#${c.charCodeAt(0)};`)
}

export function validateReplyBlock(input: string) {
  const body = input.trim()
  if (body.length > 6000) throw new Error("Reply Block is too long.")
  if (body.startsWith("```mermaid")) return validateMermaid(body)
  const checked = maskNativeNotation(body)
  if (
    !body ||
    /[\[\]{}]|&(?:#|[a-zA-Z]+;)|`|~|<!--|^\s{4}\S|^\t|^\s*(?:---|===)\s*$/m.test(
      checked,
    )
  )
    throw new Error("Use ordinary prose and the approved visual components.")
  const stack: string[] = []
  let cardsInVisual = 0,
    visuals = 0,
    bars = 0
  checked.replace(/<[^>]*>|[<>]/g, (tag) => {
    const match = /^<(\/)?([a-z-]+)( name="title"| value="[0-9]{1,3}")?>$/.exec(
      tag,
    )
    if (!match) throw new Error("Unapproved markup.")
    const [, closing, name, attribute] = match
    if (
      !name ||
      !(
        containers.has(name) ||
        cards.has(name) ||
        prose.has(name) ||
        name === "slot" ||
        name === "bos-bar"
      )
    )
      throw new Error("Unapproved component.")
    if (closing) {
      if (attribute || stack.pop() !== name)
        throw new Error("Unbalanced component.")
      if (
        containers.has(name) &&
        name !== "bos-chart" &&
        (cardsInVisual < 2 || cardsInVisual > 4)
      )
        throw new Error("Use two to four cards.")
    } else {
      if (name === "bos-bar") {
        if (
          !attribute?.startsWith(' value="') ||
          Number(attribute.slice(8, -1)) > 100 ||
          stack.at(-1) !== "bos-chart" ||
          ++bars > 8
        )
          throw new Error("Use at most eight percentage bars inside a chart.")
      } else if (
        name === "slot" ? attribute !== ' name="title"' : Boolean(attribute)
      )
        throw new Error(
          "Only title slots and chart bar values accept attributes.",
        )
      const parent = stack.at(-1)
      if (containers.has(name)) {
        if (parent || ++visuals > 1)
          throw new Error("Use one visual per Block.")
        cardsInVisual = 0
      }
      if (cards.has(name)) {
        if (
          parent !==
          (name === "bos-step"
            ? "bos-steps"
            : name === "bos-node"
              ? "bos-flow"
              : "bos-compare")
        )
          throw new Error("Card outside its visual.")
        cardsInVisual++
      }
      if (
        name === "slot" &&
        (!parent || !(containers.has(parent) || cards.has(parent)))
      )
        throw new Error("Title outside its component.")
      if (stack.length >= 8) throw new Error("Visual nesting is too deep.")
      stack.push(name)
    }
    return tag
  })
  if (stack.length) throw new Error("Incomplete visual.")
  return body
}

// The delimiter is transport framing, never model-supplied Source metadata.
export function completedBlocks(buffer: string) {
  const parts = buffer.split(/\r?\n---\r?\n/)
  return { blocks: parts.slice(0, -1), rest: parts.at(-1)! }
}
