import {
  fragment,
  html,
  type Plugin,
  type ServerContext,
  type Source,
} from "@pathmx/core"
import { inertText } from "./chat-markup"

export const threadType = "dr-bos"
export const isThread = (source: Pick<Source, "data">) =>
  source.data.plugin === threadType
type ThreadBlocks = {
  blocks: readonly {
    id: string
    type: string
    data: Readonly<Record<string, unknown>>
    body: string
  }[]
}
export const turns = (source: ThreadBlocks) =>
  source.blocks.filter(
    (b) => b.type === "bos-message" && b.data.role === "user",
  )
export const questionText = (block: { body: string }) =>
  block.body
    .replace(/^<p>|<\/p>$/g, "")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
export const version = (source: ThreadBlocks) => turns(source).length
export const threadPath = (home: string, id: string) =>
  `${home}/threads/dr-bos/${id}.thread`

export async function threadList(ctx: ServerContext, topic: string) {
  const session = await ctx.session()
  const home = await ctx.actorHome()
  if (session.type === "anonymous" || !home) return []
  const view = ctx.view(session)
  return (
    await view.query("sources", {
      type: "thread",
      from: `${home}/threads/dr-bos`,
    })
  )
    .flatMap((row) => {
      const source = view.readSource(row.id)
      return source && isThread(source) && source.data.topic === topic
        ? [
            {
              id: source.id
                .split("/")
                .at(-1)!
                .replace(/\.thread$/, ""),
              href: source.href,
              title: source.meta.title,
              version: version(source),
              created: String(source.data.created),
            },
          ]
        : []
    })
    .sort((a, b) => b.created.localeCompare(a.created))
}

export async function beginTurn(
  ctx: ServerContext,
  input: {
    thread: string
    turn: string
    version: number
    message: string
    topic: string
  },
) {
  const home = await ctx.actorHome()
  if (!home) throw new Error("Your account needs a personal path.")
  const id = threadPath(home, input.thread)
  let duplicate = false
  await ctx.mutate(async (tx) => {
    let current: Source | undefined
    if (await tx.exists(id)) {
      current = await tx.readSource(id)
      if (!isThread(current) || current.data.topic !== input.topic)
        throw new Error("This conversation is unavailable.")
      const prior = turns(current).find((b) => b.data.turn === input.turn)
      if (prior) {
        if (questionText(prior) !== input.message)
          throw new Error("This request ID was already used.")
        duplicate = true
        return
      }
      if (version(current) !== input.version)
        throw new Error(
          "This conversation changed in another tab. Reopen it before sending.",
        )
      if (Number(current.data.busyUntil) > Date.now())
        throw new Error("Dr.Bos is already replying in this conversation.")
    } else if (input.version !== 0)
      throw new Error("This conversation is unavailable.")
    const draft = tx.source(id)
    if (!current)
      draft
        .create()
        .data({
          title: input.message.slice(0, 70),
          plugin: threadType,
          topic: input.topic,
          created: new Date().toISOString(),
          layout: false,
        })
        .appendBlock({
          id: "setup",
          body: "[@styles]: /styles/global.css\n[@visuals]: /components/dr-bos.components.md",
        })
    // A previous process may have stopped while a turn was generating.
    if (current)
      for (const prior of turns(current))
        if (prior.data.status === "streaming")
          draft.updateBlock(prior.id, { data: { status: "interrupted" } })
    // Learner prose belongs in the inert body, never inside YAML comment metadata.
    draft
      .data({ activeTurn: input.turn, busyUntil: Date.now() + 90000 })
      .appendBlock({
        id: `turn-${input.turn}`,
        type: "bos-message",
        data: {
          role: "user",
          turn: input.turn,
          created: new Date().toISOString(),
          status: "streaming",
        },
        body: `<p>${inertText(input.message)}</p>`,
      })
  })
  return { id, duplicate }
}

export async function appendReply(
  ctx: ServerContext,
  id: string,
  turn: string,
  part: number,
  body: string,
  sources: { file: string; page: number }[],
) {
  await ctx.mutate(async (tx) => {
    const source = await tx.readSource(id)
    if (source.data.activeTurn !== turn)
      throw new Error("This reply is no longer active.")
    tx.source(id).appendBlock({
      id: `reply-${turn}-${part}`,
      type: "bos-message",
      data: {
        role: "assistant",
        turn,
        part,
        created: new Date().toISOString(),
        sources,
      },
      body,
    })
  })
}

export async function finishTurn(
  ctx: ServerContext,
  id: string,
  turn: string,
  status: "complete" | "interrupted",
) {
  await ctx.mutate(async (tx) => {
    const source = await tx.readSource(id)
    if (source.data.activeTurn !== turn) return
    tx.source(id)
      .data({ activeTurn: "", busyUntil: 0 })
      .updateBlock(`turn-${turn}`, { data: { status } })
  })
}

export const threadPresentation: Pick<Plugin, "postcompile"> = {
  postcompile(compiled, ctx) {
    if (!isThread(ctx.source) || ctx.block?.type !== "bos-message")
      return compiled
    const user = ctx.block.data.role === "user"
    const sources = Array.isArray(ctx.block.data.sources)
      ? (ctx.block.data.sources as { file: string; page: number }[])
      : []
    return html`<article
      class="bos-thread-message ${user ? "bos-thread-user" : ""}"
    >
      ${user || ctx.block.data.part === 0 ? html`<strong class="bos-speaker">${user ? "You" : "Dr.Bos"}</strong>` : ""}
      ${fragment(compiled)}
      ${user && ctx.block.data.status === "interrupted" ? html`<small class="bos-interrupted">Reply interrupted. Saved content is kept; ask again to continue.</small>` : ""}
      ${
        sources.length
          ? html`<details class="bos-sources">
              <summary>Sources</summary>
              <ul>
                ${sources.map((s) => html`<li>${s.file} · PDF page ${s.page}</li>`)}
              </ul>
            </details>`
          : ""
      }
    </article>`.toString()
  },
}
