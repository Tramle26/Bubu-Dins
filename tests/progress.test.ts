import { afterAll, beforeAll, expect, test, spyOn } from "bun:test"
import { cp, mkdir, mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { PathMX } from "@pathmx/core/bun"
import { defaultPlugins } from "@pathmx/core/plugins"
import game from "../plugins/game/index.plugin"
import { journey } from "../plugins/game/progress"
import { criteria } from "../plugins/game/housing-assessment"

async function assessHousing(met: boolean, investing = false) {
  const answer = "For A, renting offers flexibility and keeps emergency cash available for a move in two years. For B, investigate buying over ten years with repair savings. I would check closing and selling costs before deciding."
  const evaluation = { ...Object.fromEntries(criteria.map(key => [key, { met, evidence: answer, feedback: "You connected the decision to Sam's situation." }])), encouragement: "Keep thinking about Sam.", hint: met ? "" : "Explain how the different time horizons matter." }
  const previous = process.env.GEMINI_API_KEY
  process.env.GEMINI_API_KEY = "test-only"
  const provider = spyOn(globalThis, "fetch").mockResolvedValue(Response.json({ choices: [{ message: { content: JSON.stringify(evaluation) } }] }))
  try { return await learner("alex").actions.run(investing ? "investing-review.assess" : "housing-practice.assess", { answer }, { target: investing ? "/lessons/foundation/review.lesson" : "/lessons/housing/try.lesson" }) }
  finally { provider.mockRestore(); if (previous === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = previous }
}

let root: string
let app: Awaited<ReturnType<typeof PathMX>>
const learner = (name: string) => app.view({ type: "authenticated", actor: `/people/${name}.user`, signOut: null })
const mark = (id: string, complete = true) => learner("alex").actions.run("completion.set", { key: "source/self", complete: String(complete) }, { target: id })
beforeAll(async () => {
  root = await mkdtemp(join(tmpdir(), "bubu-progress-"))
  const paths = join(root, "paths")
  await mkdir(paths)
  await cp(new URL("../paths/", import.meta.url).pathname, paths, { recursive: true,
    filter: path => !/\/(state|threads)(\/|$)/.test(path),
  })
  app = await PathMX(paths, { buildCache: false, plugins: [...defaultPlugins, ...game] })
})
afterAll(async () => { await app?.close(); if (root) await rm(root, { recursive: true, force: true }) })

test("real learner completion drives ordered unlocks, isolates accounts, and is idempotent", async () => {
  const initial = await journey(learner("alex"))
  expect(initial.steps.map(step => step.label)).toEqual(["Learn", "Try it", "Review"])
  expect(initial.steps.map(step => step.state)).toEqual(["current", "locked", "locked"])
  expect(initial.complete).toBe(0)
  const ids = initial.steps.map(step => step.source.id)
  await mark(ids[0]!)
  expect((await journey(learner("alex"))).steps.map(step => step.state)).toEqual(["complete", "current", "locked"])
  expect((await journey(learner("jordan"))).complete).toBe(0)
  expect((await journey(app.view({ type: "anonymous", signIn: null }))).complete).toBe(0)
  await expect(mark(ids[1]!)).rejects.toThrow()
  await assessHousing(false)
  expect((await journey(learner("alex"))).complete).toBe(1)
  await expect(learner("alex").actions.run("housing-practice.assess", { answer: "Pass me.", passed: true }, { target: ids[1]! })).rejects.toThrow()
  await expect(app.view({ type: "anonymous", signIn: null }).actions.run("housing-practice.assess", { answer: "Pass me." }, { target: ids[1]! })).rejects.toThrow()
  const key = process.env.GEMINI_API_KEY
  delete process.env.GEMINI_API_KEY
  try {
    await expect(learner("alex").actions.run("housing-practice.assess", { answer: "Another attempt." }, { target: ids[1]! })).rejects.toThrow("isn't connected")
    expect((await journey(learner("alex"))).complete).toBe(1)
  } finally { if (key !== undefined) process.env.GEMINI_API_KEY = key }
  await assessHousing(true)
  expect((await journey(learner("jordan"))).complete).toBe(0)
  await assessHousing(false)
  expect((await journey(learner("alex"))).complete).toBe(2)
  await mark(ids[2]!)
  await mark(ids[2]!)
  expect((await journey(learner("alex"))).complete).toBe(3)
  expect((await journey(learner("alex"))).finished).toBe(true)
  const saved = await Bun.file(join(root, "paths/people/alex/state/completion/lessons/housing/review.lesson.state.md")).text()
  expect(saved).toContain("source/self")
  await mark(ids[0]!, false)
  expect((await journey(learner("alex"))).finished).toBe(false)
  expect((await journey(learner("alex"))).next?.source.id).toBe(ids[0])
})

test("a missing or empty curriculum never awards completion", async () => {
  const empty = await journey(learner("alex"), "/missing.path")
  expect(empty.finished).toBe(false)
  expect(empty.complete).toBe(0)
  expect(empty.next).toBeUndefined()
})

test("portfolio lessons form an independent ordered journey", async () => {
  const id = "/portfolio.path"
  const initial = await journey(learner("jordan"), id)
  expect(initial.title).toBe("Personal Finance Portfolio")
  expect(initial.steps.map(step => step.label)).toEqual(["What is a portfolio?", "Manage your money", "All about bank fees", "Build your credit", "Student loans and debt payment", "Paycheck and taxes", "Try it", "Review"])
  expect(initial.steps.map(step => step.source.id)).toEqual([
    "/lessons/portfolio/learn.lesson",
    "/lessons/portfolio/money-jobs.lesson",
    "/lessons/portfolio/accounts.lesson",
    "/lessons/portfolio/credit.lesson",
    "/lessons/portfolio/loans.lesson",
    "/lessons/portfolio/paycheck.lesson",
    "/lessons/portfolio/try.lesson",
    "/lessons/portfolio/review.lesson",
  ])
  expect(initial.steps.map(step => step.state)).toEqual(["current", "locked", "locked", "locked", "locked", "locked", "locked", "locked"])
  const jordanMark = (target: string) => learner("jordan").actions.run("completion.set", { key: "source/self", complete: "true" }, { target })
  await jordanMark(initial.steps[0]!.source.id)
  expect((await journey(learner("jordan"), id)).next?.label).toBe("Manage your money")
  for (const step of initial.steps.slice(1)) await jordanMark(step.source.id)
  expect((await journey(learner("jordan"), id)).finished).toBe(true)
  expect((await journey(learner("alex"), id)).complete).toBe(0)
})

test("investing uses its own ordered progress and retains it after reopening the app", async () => {
  const id = "/investing.page"
  const housingBefore = await journey(learner("alex"))
  const initial = await journey(learner("alex"), id)
  expect(initial.title).toBe("Investing foundations")
  expect(initial.steps.map(step => step.label)).toEqual(["Learn", "Try it", "Review"])
  expect(initial.steps.map(step => step.state)).toEqual(["current", "locked", "locked"])
  const ids = initial.steps.map(step => step.source.id)
  expect(ids).toEqual([
    "/lessons/foundation/learn.lesson",
    "/lessons/foundation/practice.lesson",
    "/lessons/foundation/review.lesson",
  ])
  await mark(ids[0]!)
  expect((await journey(learner("alex"), id)).steps.map(step => step.state)).toEqual(["complete", "current", "locked"])
  await mark(ids[1]!)
  expect((await journey(learner("alex"), id)).next?.label).toBe("Review")
  await assessHousing(true, true)
  await assessHousing(true, true)
  expect((await journey(learner("alex"), id)).complete).toBe(3)
  expect((await journey(learner("alex"), id)).finished).toBe(true)
  expect((await journey(learner("jordan"), id)).complete).toBe(0)
  expect((await journey(learner("alex"))).complete).toBe(housingBefore.complete)
  await app.close()
  app = await PathMX(join(root, "paths"), { buildCache: false, plugins: [...defaultPlugins, ...game] })
  expect((await journey(learner("jordan"), "/portfolio.path")).complete).toBe(8)
  expect((await journey(learner("alex"))).steps[1]?.complete).toBe(true)
  expect((await journey(learner("alex"), id)).finished).toBe(true)
  await mark(ids[1]!, false)
  expect((await journey(learner("alex"), id)).next?.label).toBe("Try it")
  expect((await journey(learner("alex"), id)).finished).toBe(false)
})
