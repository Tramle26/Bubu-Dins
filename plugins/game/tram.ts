import { defineComponent, html, privateResponse, route } from "@pathmx/core"
import { z } from "zod"

export const BankController = defineComponent({
  tag: "bubu:bank-controller",
  client: new URL("./bank-scene-client.js", import.meta.url),
  render() { return html`<span data-bank-controller hidden></span>` },
})

const Message = z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(4000) }).strict()
export const TramInput = z.object({
  message: z.string().trim().min(1).max(2000),
  history: z.array(Message).max(12).default([]),
  scenario: z.number().int().min(0).max(2),
}).strict()

// This adapter must be explicitly configured for an OpenAI-compatible gateway.
// A key alone never selects a provider or silently falls back to Gemini.
export function gatewayConfig(env = process.env) {
  const key = env.API_GATEWAY_KEY?.trim()
  const model = env.API_GATEWAY_MODEL?.trim()
  const endpoint = env.API_GATEWAY_URL?.trim()
  if (!key || !model || !endpoint || env.API_GATEWAY_FORMAT !== "openai-chat") return null
  const url = new URL(endpoint)
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash)
    throw new Error("Configure an HTTPS gateway endpoint without URL credentials.")
  return { key, model, endpoint: url.href }
}

const result = (body: object, status = 200) => privateResponse(Response.json(body, { status }))
const recent = new Map<string, number[]>()
const active = new Set<string>()

export const tramChatRoute = route.post("tram-chat", async ctx => {
  if (ctx.request.headers.get("origin") !== ctx.url.origin)
    return result({ error: "Send your question from the bank page." }, 403)
  const session = await ctx.session()
  if (session.type === "anonymous") return result({ error: "Sign in from the main app to talk to Tram." }, 401)
  let input: z.infer<typeof TramInput>
  try {
    if (!ctx.request.headers.get("content-type")?.startsWith("application/json")) throw new Error()
    const reader = ctx.request.body?.getReader()
    if (!reader) throw new Error()
    let body = "", bytes = 0
    const decoder = new TextDecoder()
    try {
      while (true) {
        const part = await reader.read()
        if (part.done) break
        bytes += part.value.byteLength
        if (bytes > 56000) throw new Error()
        body += decoder.decode(part.value, { stream: true })
      }
      input = TramInput.parse(JSON.parse(body + decoder.decode()))
    } finally { await reader.cancel().catch(() => {}) }
  } catch { return result({ error: "Please use a question of 2,000 characters or fewer." }, 400) }
  let config: ReturnType<typeof gatewayConfig>
  try { config = gatewayConfig() } catch { config = null }
  if (!config) return result({ error: "Tram's live chat is not configured. The project owner needs to set the gateway URL, model, API format and API_GATEWAY_KEY. You can still explore the written question choices." }, 503)
  const now = Date.now()
  for (const [actor, timestamps] of recent) if (timestamps.every(t => now - t > 60000)) recent.delete(actor)
  const timestamps = (recent.get(session.actor) ?? []).filter(t => now - t < 60000)
  if (active.has(session.actor) || timestamps.length >= 6)
    return result({ error: "Please wait a moment before asking another question." }, 429)
  const profile = ctx.view(session).readSource("/characters/tram.agent")
  if (!profile) return result({ error: "Tram's instructions are unavailable." }, 503)
  recent.set(session.actor, [...timestamps, now])
  active.add(session.actor)
  try {
    const upstream = await fetch(config.endpoint, {
      method: "POST", redirect: "error",
      signal: AbortSignal.any([ctx.request.signal, AbortSignal.timeout(25000)]),
      headers: { Authorization: `Bearer ${config.key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: config.model, stream: false, max_tokens: 700,
        messages: [
          { role: "system", content: `${profile.body}\nThe current fictional scenario is ${["opening accounts", "student credit card", "spending and repayment"][input.scenario]}.` },
          ...input.history,
          { role: "user", content: input.message },
        ],
      }),
    })
    if (!upstream.ok) throw new Error()
    const value = await upstream.json()
    const reply = z.string().trim().min(1).max(8000).parse(value.choices?.[0]?.message?.content)
    if (value.choices?.[0]?.finish_reason !== "stop") throw new Error()
    return result({ reply })
  } catch { return result({ error: "Tram could not finish the reply. Please retry. No progress or credit was awarded." }, 502) }
  finally { active.delete(session.actor) }
})
