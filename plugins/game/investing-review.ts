import { defineAction, defineComponent, definePlugin, html, type AppContext } from "@pathmx/core"
import { actorStateId, defineActorState, readActorState } from "@pathmx/core/state"
import type { DerivedCompletionProvider } from "@pathmx/completion"
import { z } from "zod"
import { criteria, Evaluation, evaluateExplanation } from "./housing-assessment"

export const INVESTING_REVIEW = "/lessons/foundation/review.lesson"
const Saved = z.object({ answer: z.string(), evaluation: Evaluation, passed: z.boolean().default(false), evaluatedAt: z.string() })
const states = defineActorState({ plugin: "investing-review", read(source) { return Saved.parse(source.data) } }).create()
let app: AppContext
const recent = new Map<string, number[]>()
const labels = { realistic: "Realistic", possible: "Affordable", applicable: "Fits Maya's situation", impactful: "Explains why" }

export const investingCompletion: DerivedCompletionProvider = {
  targets: source => source.id === INVESTING_REVIEW ? [{ key: "source/self", label: "My plan meets all four review criteria." }] : [],
  async isComplete(view) {
    const saved = await readActorState(view, INVESTING_REVIEW, "investing-review")
    return saved ? Saved.parse(saved.data).passed : false
  },
}

const assess = defineAction({
  title: "Get feedback on my investing plan",
  target: source => source.id === INVESTING_REVIEW,
  input: z.object({ answer: z.string().trim().min(1).max(2000) }).strict(),
  available: ({ view }) => view.principal.type === "actor" && Boolean(app?.access.home(view.principal.actor)),
  async prepare({ answer }, { operation, target, view }) {
    const now = Date.now()
    for (const [actor, times] of recent) if (times.every(t => now - t >= 60000)) recent.delete(actor)
    const times = (recent.get(operation.actor) ?? []).filter(t => now - t < 60000)
    if (times.length >= 6) throw new Error("Take a moment to revise, then retry in a minute.")
    const rubric = view.readSource("/work/investing-review.guide")
    const lesson = view.readSource("/lessons/foundation/learn.lesson")
    if (!rubric || !lesson) throw new Error("The lesson or review guide is unavailable. Please retry later.")
    recent.set(operation.actor, [...times, now])
    const { evaluation, passed } = await evaluateExplanation(answer, `${lesson.body}\n${target.body}`, rubric.body, "fictional student investing plan")
    const current = states.resolve(operation.actor, target)
    const actorHome = app.access.home(operation.actor)
    const id = current?.source.id ?? actorStateId(actorHome, "investing-review", target.id)
    return {
      effects: current ? { read: [id], update: [id] } : { create: [id] },
      run({ tx }) {
        states.write(tx, { actorHome, origin: target, current, data: { answer, evaluation, passed: passed || current?.data.passed === true, evaluatedAt: new Date().toISOString() } })
        return { evaluation }
      },
    }
  },
})

export const InvestingReview = defineComponent({
  tag: "bubu:investing-review",
  client: new URL("./housing-practice-client.ts", import.meta.url),
  async render(_use, _compiled, { view }) {
    const source = await readActorState(view, INVESTING_REVIEW, "investing-review")
    const saved = source ? Saved.parse(source.data) : undefined
    const actor = view.principal.type === "actor" ? view.principal.actor : ""
    return html`<section class="boss-chat housing-practice" data-investing-review data-actor="${actor}" data-revision="${saved?.evaluatedAt ?? ""}" data-pmx-prose="off">
      <h2>Your plan for Maya</h2>
      <p>${!actor ? "Sign in above to submit your answer for feedback." : !process.env.GEMINI_API_KEY?.trim() ? "AI feedback isn't connected yet. You can draft here and retry after setup." : "Dr.Bos will check your reasoning and suggest one useful improvement."}</p>
      <form ${actor ? html`action="/actions/investing-review.assess" data-pmx-action data-pmx-action-target="${INVESTING_REVIEW}"` : null} method="post">
        <input type="hidden" name="_target" value="${INVESTING_REVIEW}" />
        <label for="investing-answer">Your answer · 3–5 sentences</label>
        <textarea id="investing-answer" name="answer" rows="5" maxlength="2000" required aria-describedby="investing-answer-help" placeholder="Maya could start with… because…&#10;For her tuition money…&#10;Before choosing a fund, I would check…">${saved?.answer ?? ""}</textarea>
        <p id="investing-answer-help" class="boss-footnote">Submitted answers and feedback are saved privately to your learner account. Your answer goes to the AI provider. Unsaved edits clear when you close or reload. AI feedback can make mistakes.</p>
        <button type="submit" class="primary-action" ${!actor ? html`disabled` : null}>${saved ? "Check my revised answer" : "Get feedback"}</button>
        <p data-practice-status role="status"></p>
      </form>
      <div data-practice-feedback aria-live="polite" aria-atomic="true">${saved ? html`<h3>${criteria.every(key => saved.evaluation[key].met) ? "Passed — nice reasoning!" : "Not yet — revise your plan"}</h3>
        <p>${saved.evaluation.encouragement}</p>
        <ul>${criteria.map(key => html`<li><strong>${labels[key]} · ${saved.evaluation[key].met ? "Looks good" : "Revisit this"}</strong><p>${saved.evaluation[key].feedback}</p></li>`)}</ul>
        ${saved.evaluation.hint ? html`<p><strong>Try this next:</strong> ${saved.evaluation.hint}</p>` : null}
        <p>${saved.passed ? "Your pass is saved. You earned $40 in learning credit." : "Meet all four criteria to pass and earn $40 in learning credit. Revise and try again."}</p>` : null}</div>
    </section>`
  },
})

export const investingReviewPlugin = definePlugin({
  id: "investing-review", requires: ["state"], actions: { assess },
  source(transition, context) {
    app = context
    const actors = new Set(states.source(transition, context).map(state => state.actorId))
    if (actors.size) return { dependencies: [...actors].map(key => ({ type: "plugin" as const, plugin: "investing-review", key })), targets: [{ type: "actor" as const, actors }] }
  },
})
