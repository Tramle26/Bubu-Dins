import { defineAction, defineComponent, definePlugin, html, type AppContext } from "@pathmx/core"
import { actorStateId, defineActorState, readActorState } from "@pathmx/core/state"
import type { DerivedCompletionProvider } from "@pathmx/completion"
import { z } from "zod"
import { criteria, evaluateHousing, Evaluation, HOUSING_PRACTICE } from "./housing-assessment"

const Saved = z.object({ answer: z.string(), evaluation: Evaluation, passed: z.boolean(), evaluatedAt: z.string() })
const states = defineActorState({ plugin: "housing-practice", read(source) { return Saved.parse(source.data) } }).create()
let app: AppContext
const recent = new Map<string, number[]>()

export const housingCompletion: DerivedCompletionProvider = {
  targets: source => source.id === HOUSING_PRACTICE ? [{ key: "source/self", label: "My explanation meets the four practice criteria." }] : [],
  async isComplete(view) {
    const saved = await readActorState(view, HOUSING_PRACTICE, "housing-practice")
    return saved ? Saved.parse(saved.data).passed : false
  },
}

const assess = defineAction({
  title: "Ask Dr.Bos to review my answer",
  target: source => source.id === HOUSING_PRACTICE,
  input: z.object({ answer: z.string().trim().min(1).max(4000) }).strict(),
  available: ({ view }) => view.principal.type === "actor" && Boolean(app?.access.home(view.principal.actor)),
  async prepare({ answer }, { operation, target, view }) {
    const now = Date.now()
    for (const [actor, times] of recent) if (times.every(t => now - t >= 60000)) recent.delete(actor)
    const times = (recent.get(operation.actor) ?? []).filter(t => now - t < 60000)
    if (times.length >= 6) throw new Error("Take a moment to revise, then retry in a minute. You have unlimited attempts.")
    const rubric = view.readSource("/work/housing-practice.guide")
    const lesson = view.readSource("/lessons/housing/learn.lesson")
    if (!rubric || !lesson) throw new Error("The lesson or rubric is unavailable. Please retry later.")
    recent.set(operation.actor, [...times, now])
    const result = await evaluateHousing(answer, `${lesson.body}\n${target.body}`, rubric.body)
    const current = states.resolve(operation.actor, target)
    const actorHome = app.access.home(operation.actor)
    const id = current?.source.id ?? actorStateId(actorHome, "housing-practice", target.id)
    return {
      effects: current ? { read: [id], update: [id] } : { create: [id] },
      run({ tx }) {
        states.write(tx, { actorHome, origin: target, current, data: { answer, ...result, passed: result.passed || current?.data.passed === true, evaluatedAt: new Date().toISOString() } })
        return result
      },
    }
  },
})

export const HousingPractice = defineComponent({
  tag: "bubu:housing-practice",
  client: new URL("./housing-practice-client.ts", import.meta.url),
  async render(_use, _compiled, { view }) {
    const source = await readActorState(view, HOUSING_PRACTICE, "housing-practice")
    const saved = source ? Saved.parse(source.data) : undefined
    const actor = view.principal.type === "actor" ? view.principal.actor : ""
    const latestPassed = saved && criteria.every(key => saved.evaluation[key].met)
    return html`<section class="boss-chat housing-practice" data-housing-practice data-actor="${actor}" data-revision="${saved?.evaluatedAt ?? ""}" data-pmx-prose="off">
      <h2>Your turn with Dr.Bos</h2>
      <p>A few clear sentences are enough. Explain both cases in your own words. You can revise and try as many times as you need.</p>
      <p>${!actor ? "Sign in to get feedback and save your pass." : !process.env.GEMINI_API_KEY?.trim() ? "AI evaluation isn't connected yet. You can draft an answer, then retry after setup." : "Dr.Bos is ready to review your reasoning."}</p>
      <form ${actor ? html`action="/actions/housing-practice.assess" data-pmx-action data-pmx-action-target="${HOUSING_PRACTICE}"` : null} method="post">
        <input type="hidden" name="_target" value="${HOUSING_PRACTICE}" />
        <label for="housing-answer">Your answer for Case A and Case B</label>
        <textarea id="housing-answer" name="answer" rows="7" maxlength="4000" required aria-describedby="housing-help" placeholder="For Case A, I would investigate… because…&#10;For Case B…&#10;One cost or assumption I would check is…">${saved?.answer ?? ""}</textarea>
        <p id="housing-help" class="boss-footnote">Submitted answers and feedback are saved privately to your learner account. Your answer is sent to the AI provider for evaluation. Unsaved edits clear when you close or reload.</p>
        <button type="submit" class="primary-action" ${!actor ? html`disabled` : null}>${saved ? "Try again with Dr.Bos" : "Check my answer"}</button>
        <p data-practice-status role="status"></p>
      </form>
      <div data-practice-feedback aria-live="polite" aria-atomic="true">${saved ? html`<h3>${latestPassed ? "Passed — nice reasoning!" : "Not yet — let's improve your answer"}</h3>
        <p>${saved.evaluation.encouragement}</p>
        <ul>${criteria.map(key => html`<li><strong>${key[0]!.toUpperCase() + key.slice(1)} · ${saved.evaluation[key].met ? "Meets expectations" : "Needs a little work"}</strong><p>${saved.evaluation[key].feedback}</p></li>`)}</ul>
        ${!latestPassed ? html`<p><strong>Dr.Bos's hint:</strong> ${saved.evaluation.hint}</p>` : null}
        <p>${saved.passed ? "Your lesson pass is saved. Close the lesson to continue to Review." : "Revise your answer above and try again. There is no attempt limit."}</p>` : null}</div>
    </section>`
  },
})

export const housingPracticePlugin = definePlugin({
  id: "housing-practice", requires: ["state"], actions: { assess },
  source(transition, context) {
    app = context
    const actors = new Set(states.source(transition, context).map(state => state.actorId))
    if (actors.size) return { dependencies: [...actors].map(key => ({ type: "plugin" as const, plugin: "housing-practice", key })), targets: [{ type: "actor" as const, actors }] }
  },
})
