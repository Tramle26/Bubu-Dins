// Admit bounded native notation without opening arbitrary executable authoring.
export function validateMermaid(body: string) {
  const fence = /^```mermaid\n([\s\S]+)\n```$/.exec(body)
  if (!fence) throw new Error("Use one complete Mermaid fence per Block.")
  const lines = fence[1]!
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
  if (!/^flowchart (TD|LR)$/.test(lines.shift() ?? ""))
    throw new Error("Use flowchart TD or LR.")
  const nodes = new Set<string>(),
    edges: string[][] = []
  for (const line of lines) {
    const node =
      /^([A-Z][A-Z0-9]*)\["([a-zA-Z0-9 ,.:?()/'-]{1,100})"\]$/.exec(line) ??
      /^([A-Z][A-Z0-9]*)\{"([a-zA-Z0-9 ,.:?()/'-]{1,100})"\}$/.exec(line)
    if (node) {
      if (nodes.has(node[1]!)) throw new Error("Duplicate graph node.")
      nodes.add(node[1]!)
      continue
    }
    const edge =
      /^([A-Z][A-Z0-9]*) -->(?:\|[a-zA-Z0-9 ?'-]{1,30}\|)? ([A-Z][A-Z0-9]*)$/.exec(
        line,
      )
    if (!edge)
      throw new Error(
        "Use simple labeled nodes and directed edges; no Mermaid directives or actions.",
      )
    edges.push([edge[1]!, edge[2]!])
  }
  if (
    nodes.size < 2 ||
    nodes.size > 12 ||
    !edges.length ||
    edges.length > 16 ||
    edges.some((edge) => edge.some((id) => !nodes.has(id)))
  )
    throw new Error("Use 2–12 declared nodes and 1–16 edges.")
  return body
}

const mathCommands = new Set([
  "frac",
  "text",
  "times",
  "cdot",
  "div",
  "left",
  "right",
  "sqrt",
  "sum",
  "percent",
  "approx",
  "le",
  "ge",
  "neq",
])

// Mask only validated notation for the surrounding HTML/Source grammar check.
// Return the original body for PathMX's normal Math and Datatype plugins.
export function maskNativeNotation(body: string) {
  let masked = body.replace(
    /\$\$([\s\S]+?)\$\$|(?<![\\$])\$(?![\s$])([^$\n]+?)(?<!\s)\$(?![\d$])/g,
    (_all, display, inline) => {
      const tex: string = display ?? inline
      if (
        tex.length > 600 ||
        !/^[a-zA-Z0-9\s\\{}_^+*=().,:/%-]+$/.test(tex) ||
        tex.includes("{{") ||
        tex.includes("}}")
      )
        throw new Error("Use a short arithmetic formula.")
      let depth = 0
      for (const char of tex) {
        if (char === "{") depth++
        if (char === "}" && --depth < 0) throw new Error("Unbalanced math.")
      }
      if (
        depth ||
        [...tex.matchAll(/\\([a-zA-Z]+)/g)].some(
          (match) => !mathCommands.has(match[1]!),
        )
      )
        throw new Error("Unsupported math command.")
      return "FORMULA"
    },
  )
  masked = masked.replace(
    /\{([blp]):([^{}\n]+)\}/g,
    (_all, kind, values: string) => {
      const items = values.split(",").map((item) => item.trim())
      if (
        !items.length ||
        items.length > (kind === "p" ? 1 : 20) ||
        items.some((item) => !/^\d{1,3}$/.test(item) || Number(item) > 100)
      )
        throw new Error("Datatype values must be whole numbers from 0 to 100.")
      return "CHART"
    },
  )
  return masked
}
