import { afterAll, beforeAll, expect, spyOn, test } from "bun:test"
import { cp, mkdir, mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { PathMX } from "@pathmx/core/bun"
import { defaultPlugins } from "@pathmx/core/plugins"
import { readActorState } from "@pathmx/core/state"
import game from "../plugins/game/index.plugin"
import { completion, learningCredit } from "../plugins/game/progress"
import { criteria } from "../plugins/game/housing-assessment"
import { INVESTING_REVIEW } from "../plugins/game/investing-review"

let root: string
let app: Awaited<ReturnType<typeof PathMX>>
const learner = (name: string) => app.view({ type: "authenticated", actor: `/people/${name}.user`, signOut: null })
const answer = "Save $25 and leave $45 for surprises. Keep tuition money accessible for eight weeks. Check fund fees so less money goes to costs. Stocks can lose value."
const evaluation = {
  ...Object.fromEntries(criteria.map(key => [key, { met: true, evidence: "Stocks can lose value.", feedback: "You identified a risk." }])),
  encouragement: "Good start.", hint: "",
}
const providerReply = (value: unknown) => Response.json({ choices: [{ message: { content: JSON.stringify(value) } }] })
beforeAll(async () => {
  root = await mkdtemp(join(tmpdir(), "bubu-investing-review-"))
  await mkdir(join(root, "paths"))
  await cp(new URL("../paths/", import.meta.url).pathname, join(root, "paths"), {
    recursive: true, filter: path => !/\/(state|threads)(\/|$)/.test(path),
  })
  app = await PathMX(join(root, "paths"), { buildCache: false, plugins: [...defaultPlugins, ...game] })
})
afterAll(async () => { await app?.close(); if (root) await rm(root, { recursive: true, force: true }) })

test("review saves private feedback across restart with earned credit; failed evaluations preserve it", async () => {
  const oldKey = process.env.GEMINI_API_KEY
  process.env.GEMINI_API_KEY = "test-only"
  const provider = spyOn(globalThis, "fetch").mockImplementation(async () => providerReply(evaluation))
  const submit = (text: string) => learner("alex").actions.run("investing-review.assess", { answer: text }, { target: INVESTING_REVIEW })
  try {
    await expect(app.view({ type: "anonymous", signIn: null }).actions.run("investing-review.assess", { answer }, { target: INVESTING_REVIEW })).rejects.toThrow()
    await expect(submit(" ")).rejects.toThrow()
    expect(provider).not.toHaveBeenCalled()
    const mark = (id: string) => learner("alex").actions.run("completion.set", { key: "source/self", complete: "true" }, { target: id })
    expect(await learningCredit(learner("alex"))).toBe(800)
    await mark("/lessons/foundation/learn.lesson")
    expect(await learningCredit(learner("alex"))).toBe(820)
    await mark("/lessons/foundation/practice.lesson")
    expect(await learningCredit(learner("alex"))).toBe(850)
    await expect(mark(INVESTING_REVIEW)).rejects.toThrow()
    provider.mockImplementation(async () => providerReply({ ...evaluation, realistic: { met: false, evidence: "", feedback: "Explain risk." }, hint: "Consider losses." }))
    await submit(answer)
    expect(await learningCredit(learner("alex"))).toBe(850)
    provider.mockImplementation(async () => providerReply(evaluation))
    await submit(answer)
    expect(await learningCredit(learner("alex"))).toBe(890)
    expect(await learningCredit(learner("jordan"))).toBe(800)
    const payload = JSON.parse(provider.mock.calls[0]![1]!.body as string)
    expect(payload.messages[0].content).toContain("fictional student investing plan")
    expect(payload.messages[0].content).toContain("Maya's $70")
    expect(payload.messages.at(-1)).toEqual({ role: "user", content: answer })
    expect((await readActorState(learner("alex"), INVESTING_REVIEW, "investing-review"))?.data.answer).toBe(answer)
    expect(await readActorState(learner("jordan"), INVESTING_REVIEW, "investing-review")).toBeUndefined()
    expect((await completion.reader.summary(learner("alex"), { id: INVESTING_REVIEW })).status).toBe("complete")

    const revised = answer + " I would review the amount after a raise."
    await submit(revised)
    expect(await learningCredit(learner("alex"))).toBe(890)
    provider.mockResolvedValue(providerReply({ ...evaluation, realistic: { met: true, evidence: "invented quote", feedback: "No." } }))
    await expect(submit(answer)).rejects.toThrow()
    provider.mockResolvedValue(new Response("unavailable", { status: 503 }))
    await expect(submit(answer)).rejects.toThrow()
    delete process.env.GEMINI_API_KEY
    await expect(submit(answer)).rejects.toThrow()
    expect((await readActorState(learner("alex"), INVESTING_REVIEW, "investing-review"))?.data.answer).toBe(revised)
    expect((await completion.reader.summary(learner("alex"), { id: INVESTING_REVIEW })).status).toBe("complete")
    await app.close()
    app = await PathMX(join(root, "paths"), { buildCache: false, plugins: [...defaultPlugins, ...game] })
    expect((await readActorState(learner("alex"), INVESTING_REVIEW, "investing-review"))?.data.answer).toBe(revised)
    expect(await readActorState(learner("jordan"), INVESTING_REVIEW, "investing-review")).toBeUndefined()
    expect(await learningCredit(learner("alex"))).toBe(890)
  } finally {
    provider.mockRestore()
    if (oldKey === undefined) delete process.env.GEMINI_API_KEY
    else process.env.GEMINI_API_KEY = oldKey
  }
})
