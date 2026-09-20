export type ChatMessage = {
  role: "system" | "user" | "assistant"
  content: string
}

export async function* streamReply(
  messages: ChatMessage[],
  signal: AbortSignal,
) {
  const key = process.env.GEMINI_API_KEY?.trim()
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
    method: "POST",
    signal,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model:
        process.env.DR_BOS_CHAT_MODEL?.trim() ||
        process.env.DR_BOSS_MODEL?.trim() ||
        "gemini-2.5-flash",
      stream: true,
      max_completion_tokens: 2400,
      messages,
    }),
  })
  if (!response.ok || !response.body)
    throw new Error("The AI provider is unavailable. Please retry.")
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
  let buffer = ""
  try {
    while (true) {
      const next = await reader.read()
      if (next.done) break
      buffer += next.value
      if (buffer.length > 64000)
        throw new Error("The provider sent an oversized event.")
      const lines = buffer.split("\n")
      buffer = lines.pop()!
      for (const line of lines) {
        if (!line.startsWith("data:")) continue
        const data = line.slice(5).trim()
        if (data === "[DONE]") return
        if (!data) continue
        const event = JSON.parse(data)
        if (event.error)
          throw new Error("The AI provider could not finish. Please retry.")
        const choice = event.choices?.[0]
        if (choice?.finish_reason && choice.finish_reason !== "stop")
          throw new Error("The reply was cut short. Try a smaller question.")
        if (typeof choice?.delta?.content === "string")
          yield choice.delta.content as string
      }
    }
    throw new Error("The AI connection ended before the reply finished.")
  } finally {
    await reader.cancel().catch(() => {})
  }
}
