import { defineComponent, html } from "@pathmx/core"
import { journey, portfolioLearningCredit } from "./progress"

// Percentage hit areas follow the supplied 1672 × 941 reference. Review is
// reached from Try it, keeping the seven visible tiles in the reference.
const tiles = [
  [3, 45, 25, 43], [27, 56, 13, 19], [39, 45, 12, 16],
  [48, 57, 13, 18], [59.5, 57, 12, 17], [68.5, 45, 12, 16],
  [82, 39, 16.5, 29],
]

export const PortfolioBoard = defineComponent({
  tag: "bubu:portfolio-board",
  async render(_use, _compiled, { view }) {
    const progress = await journey(view, "/portfolio.path")
    const credit = await portfolioLearningCredit(view)
    return html`<div class="portfolio-viewport" role="region" aria-label="Portfolio map. On small screens, scroll horizontally to explore all stops." tabindex="0">
      <section class="portfolio-board" data-pmx-prose="off" aria-label="Personal finance learning board">
        <header class="portfolio-heading">
          <a href="/learn.page" class="portfolio-back"><span class="portfolio-sr-only">All topics</span></a>
          <h1 class="portfolio-sr-only">Personal Finance Portfolio</h1>
          <div class="portfolio-live-progress">
            <p role="status">${progress.complete} of ${progress.steps.length} activities complete</p>
            <progress max="${Math.max(1, progress.steps.length)}" value="${progress.complete}" aria-label="Portfolio progress"></progress>
            <p class="portfolio-credit">Learning credit: $${credit.earned} of $${credit.total} · $20 per lesson finished</p>
          </div>
        </header>
        <a class="portfolio-wordmark" href="/" aria-label="Bubu home"></a>
        <ol class="portfolio-tiles">${progress.steps.slice(0, 7).map((step, i) => {
          const [x, y, w, h] = tiles[i]!
          return html`<li class="portfolio-position" style="--x:${x}%;--y:${y}%;--w:${w}%;--h:${h}%">
            <a class="portfolio-tile" href="${step.source.href}" data-pmx-source-open="overlay" aria-current="${step.state === "current" ? "step" : "false"}" aria-label="${i === 6 ? "Try it" : i === 0 ? `1. Start: ${step.label}` : `${i + 1}. ${step.label}`}${step.complete ? ", complete" : ""}">
              <span class="portfolio-sr-only">${step.label}${step.complete ? ", complete" : ""}</span>
            </a>
          </li>`
        })}</ol>
        <nav class="portfolio-navigation" aria-label="Main navigation">
          <a href="/dashboard.page" aria-label="Dashboard"></a>
          <a href="/" aria-label="Homepage"></a>
          <a href="/storyworld.page" aria-label="Storyworld"></a>
        </nav>
      </section>
    </div>`
  },
})
