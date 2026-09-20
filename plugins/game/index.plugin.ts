import { BeautifulMermaidPlugin } from "@pathmx/mermaid/beautiful"
import { defineComponent, definePlugin, html, fragment } from "@pathmx/core"
import { renderIcon, hasIcon } from "@pathmx/core/icons"
import { completion, journey, learningCredit } from "./progress"
import { Dashboard, DashboardProfile } from "./dashboard"
import { Workspace } from "./workspace"
import { BankController, tramChatRoute } from "./tram"
import { BankBudget } from "./bank"
import { NessiePortfolio, nessiePortfolioRoute } from "./nessie"
import { PortfolioBoard } from "./portfolio-board"
import { PortfolioSection } from "./portfolio-section"
import { PortfolioPractice } from "./portfolio-practice"
import { Chat, chatRoute, chatStateRoute } from "./chat"
import { threadPresentation } from "./chat-thread"
import { HousingPractice, housingPracticePlugin } from "./housing-practice"
import { InvestingReview, investingReviewPlugin } from "./investing-review"

/** Lucide 24 × 24 geometry for the home marks the shared catalog does not carry. */
const extraIcons: Record<string, string> = {
  "arrow-right": `<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>`,
  "book-open": `<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>`,
  "folder": `<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>`,
  "message-circle-more": `<path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.412-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.776-4.719"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/>`,
}
/** One icon helper for both catalogs so every mark keeps the same class and box. */
function bubuIcon(name: string, size = 20) {
  const extra = extraIcons[name]
  if (extra) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-${name} bubu-icon" aria-hidden="true" focusable="false">${extra}</svg>`
  }
  return hasIcon(name) ? renderIcon(name, { size, className: "bubu-icon" })! : ""
}
const Icon = defineComponent({
  tag: "bubu:icon",
  render({ props }) {
    return bubuIcon(props.name ?? "graduation-cap", 20)
  },
})
const Continue = defineComponent({
  tag: "bubu:continue",
  async render(_use, _compiled, { view }) {
    const topics = [
      { title: "Housing choices", href: "/housing.path", image: "/assets/housing-thumb.png", progress: await journey(view) },
      { title: "Personal finance portfolio", href: "/portfolio.path", image: "/assets/budget-thumb.png", progress: await journey(view, "/portfolio.path") },
      { title: "Investing foundations", href: "/investing.page", image: "/assets/investing-thumb.png", progress: await journey(view, "/investing.page") },
    ]
    return html`<aside class="home-continue-card">
      <header class="home-continue-head">
        <h2>Continue learning</h2>
        <a href="/learn.page">View all <span aria-hidden="true">${fragment(bubuIcon("arrow-right", 18))}</span></a>
      </header>
      <ul class="home-topic-list">${topics.map(topic => html`<li>
        <a href="${topic.href}">
          <img src="${topic.image}" alt="" width="512" height="512" />
          <span><strong>${topic.title}</strong><progress max="${Math.max(1, topic.progress.steps.length)}" value="${topic.progress.complete}" aria-label="${topic.title}: ${topic.progress.complete} of ${topic.progress.steps.length} activities complete"></progress></span>
          ${fragment(bubuIcon("chevron-right", 18))}
        </a>
      </li>`)}</ul>
      <a class="storyworld-action" href="/storyworld.page"><span>${fragment(bubuIcon("book-open", 20))} Visit Storyworld</span><span aria-hidden="true">${fragment(bubuIcon("arrow-right", 20))}</span></a>
    </aside>`
  },
})
const Coins = defineComponent({
  tag: "bubu:coins",
  async render(_use, _compiled, { view }) {
    const credit = await learningCredit(view)
    // A completion badge expressed as points, not a spendable wallet/ledger.
    return html`<span class="coin-balance" title="Learning credit: $800 starting credit, plus $20 for Learn, $30 for Try it, and $40 for passing Review${(await journey(view)).finished ? " · 100 housing coins when housing is complete" : ""}"><i aria-hidden="true">$</i><span>${credit} credits</span></span>`
  },
})
const CompletionHelp = defineComponent({
  tag: "bubu:completion-help",
  render(use, _compiled, ctx) {
    if (ctx.session.type !== "anonymous" && use.origin.id === "/lessons/foundation/review.lesson") return html`<p>Submit your plan below. Meet all four criteria to save your pass and earn $40 in learning credit.</p>`
    if (ctx.session.type !== "anonymous") return html`<p>Check the completion box when you can explain your answer. Then close the lesson to see your next step on the map.</p>`
    const signIn = ctx.session.signIn?.href
    if (!signIn) return html`<p role="note">You're browsing without a learner account. Completion is read-only until sign-in is available.</p>`
    const href = new URL(signIn, "https://pathmx.local")
    href.searchParams.set("returnTo", ctx.view.readSource(use.origin.id)?.href ?? "/")
    const destination = href.origin === "https://pathmx.local" ? href.pathname + href.search : href.href
    return html`<aside class="completion-sign-in" aria-label="Sign in to complete this lesson">
      <strong>Ready for the next step?</strong>
      <p>Sign in to save your completion. You'll return here to mark the lesson complete and unlock the next step.</p>
      <a class="primary-action" href="${destination}" target="_top">Sign in to save and continue →</a>
    </aside>`
  },
})
const Journey = defineComponent({
  tag: "bubu:journey",
  client: new URL("./client.ts", import.meta.url),
  async render({ props }, _compiled, { view }) {
    const path = props.path ?? "/housing.path"
    const progress = await journey(view, path)
    const credit = path === "/investing.page" ? await learningCredit(view) : undefined
    const signedIn = view.principal.type === "actor"
    const stopY = credit === undefined ? [40, 52, 57] : [54, 52, 57]
    return html`<section class="journey-shell" data-bubu-journey data-pmx-prose="off">
      <header class="journey-title"><a class="back-link" href="/">← All topics</a><h1>${progress.title}</h1>
      <p role="status">${progress.complete} of ${progress.steps.length} activities complete${progress.finished && path === "/housing.path" ? " · +100 learning coins" : ""}</p>
      ${credit !== undefined ? html`<p>Learning credit: $${credit} · $800 starting credit · Learn +$20 · Try it +$30 · Pass Review +$40</p>` : null}
      <progress max="${Math.max(1, progress.steps.length)}" value="${progress.complete}" aria-label="${progress.title} journey progress"></progress></header>
      <div class="journey-map" aria-label="${progress.title} learning journey">
        <img class="journey-backdrop" src="/assets/journey-grove.png" alt="" width="1536" height="1024" />
        <ol class="journey-stops">${progress.steps.map((step, i) => html`<li class="journey-position" style="--step-x:${[14, 46, 85][i] ?? 85}%;--step-y:${stopY[i] ?? 57}%">
          ${step.state === "locked"
            ? html`<button class="journey-stop" type="button" data-state="locked" aria-disabled="true" data-locked-step="Finish ${progress.next?.label ?? "the current activity"} first."><span class="stop-medal">${fragment(renderIcon("circle-help")!)}</span><b>${i + 1}. ${step.label}</b><small>Finish ${progress.next?.label} first</small></button>`
            : html`<a class="journey-stop" href="${step.source.href}" data-pmx-source-open="overlay" data-state="${step.state}"><span class="stop-medal">${step.complete ? fragment(renderIcon("check")!) : i + 1}</span><b>${i + 1}. ${step.label}</b><small>${step.complete ? "Complete · revisit" : "Start here"}</small></a>`}
        </li>`)}</ol>
        <img class="journey-mascot" src="/assets/boo-boo.png" alt="Bubu cheers you on" width="1024" height="1024" />
      </div>
      <footer class="journey-actions">${!signedIn ? html`<p>Sign in above to save your progress.</p>` : ""}
      ${progress.finished ? html`<a class="primary-action" href="/storyworld.page">Explore Storyworld →</a>` : html`<a class="primary-action" href="${progress.next?.source.href ?? "/"}" data-pmx-source-open="overlay">${progress.next?.label ?? "Begin"} →</a>`}
      <button class="view-toggle" type="button" data-view-toggle aria-pressed="false">List view</button>
      <span class="journey-status" data-journey-status role="status"></span></footer>
    </section>`
  },
})
export default [BeautifulMermaidPlugin(), completion.plugin, housingPracticePlugin, investingReviewPlugin, definePlugin({
  id: "bubu",
  components: [PortfolioSection, PortfolioBoard, BankController, Dashboard, DashboardProfile, Icon, Continue, Coins, CompletionHelp, Journey, Chat, BankBudget, NessiePortfolio, PortfolioPractice, Workspace, HousingPractice, InvestingReview],
  routes: [tramChatRoute, chatRoute, chatStateRoute, nessiePortfolioRoute],
  ...threadPresentation,
  // Catch the missing declaration that previously made the home screen blank.
  lint(report, app) {
    for (const source of app.sources.all()) {
      if (source.type !== "components") continue
      for (const block of source.blocks) {
        if (block.fences.some(fence => fence.lang === "html") && !block.data.componentName)
          report(source, "A component Block with an HTML template needs <!-- componentName: your-tag --> before its heading.")
      }
    }
  },
})]
