import type { View } from "@pathmx/core"
import { createCompletionPlugin } from "@pathmx/completion"
import { housingCompletion } from "./housing-practice"

import { investingCompletion } from "./investing-review"

export const completion = createCompletionPlugin({
  storage: "actor",
  derived: [housingCompletion, investingCompletion],
})

// The ordered lesson links in the Path are the curriculum. No second step list.
export async function journey(view: View, id = "/housing.path") {
  const path = await view.describeSource(id)
  const seen = new Set<string>()
  const lessons = (path?.relations ?? []).flatMap((relation) => {
    if (!relation.target || seen.has(relation.target.id)) return []
    const source = view.readSource(relation.target.id)
    if (!source || source.type !== "lesson") return []
    seen.add(source.id)
    return [{ source, label: relation.label || source.meta.title }]
  })
  const steps = await Promise.all(
    lessons.map(async (lesson) => ({
      ...lesson,
      complete:
        (await completion.reader.summary(view, { id: lesson.source.id }))
          .status === "complete",
    })),
  )
  const current = steps.findIndex((step) => !step.complete)
  return {
    title: path?.source.meta.title ?? "Learning journey",
    steps: steps.map((step, index) => ({
      ...step,
      state: step.complete
        ? "complete"
        : index === current
          ? "current"
          : "locked",
    })),
    complete: steps.filter((step) => step.complete).length,
    next: current < 0 ? undefined : steps[current],
    finished: steps.length > 0 && current === -1,
  }
}

export const STARTING_LEARNING_CREDIT = 800

// Derived from the signed-in learner and saved Completion, never an incrementing
// client-side balance or a second spendable wallet.
export async function learningCredit(view: View) {
  const progress = await journey(view, "/investing.page")
  const rewards: Record<string, number> = {
    "/lessons/foundation/learn.lesson": 20,
    "/lessons/foundation/practice.lesson": 30,
    "/lessons/foundation/review.lesson": 40,
  }
  const earned = progress.steps.reduce(
    (total, step) =>
      total + (step.complete ? (rewards[step.source.id] ?? 0) : 0),
    0,
  )
  return (view.principal.type === "actor" ? STARTING_LEARNING_CREDIT : 0) + earned
}

// $20 for finishing one of the six lesson-and-activity sessions; the closing
// review isn't a paid session.
export async function portfolioLearningCredit(view: View) {
  const progress = await journey(view, "/portfolio.path")
  const sessions = progress.steps.slice(0, 6)
  return {
    earned: sessions.filter((step) => step.complete).length * 20,
    total: sessions.length * 20,
  }
}
