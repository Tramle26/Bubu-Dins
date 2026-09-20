import { defineAppComponent, html } from "@pathmx/core"

const sections: Record<string, string> = {
  "what-a-portfolio-is": "What is a portfolio?",
  "five-layers": "Manage your money",
  "three-accounts": "All about bank fees",
  credit: "Build your credit",
  "student-loans": "Student loans and debt payment",
  paycheck: "Paycheck and taxes",
}

export const PortfolioSection = defineAppComponent({
  tag: "bubu:portfolio-section",
  client: new URL("./portfolio-section-client.js", import.meta.url),
  render({ props }) {
    const section = props.section ?? ""
    if (!sections[section]) return html`<p role="alert">This lesson section is unavailable.</p>`
    return html`<div class="portfolio-section-host" data-portfolio-section="${section}" data-pmx-prose="off"><h1>${sections[section]}</h1><p role="status">Loading your interactive lesson…</p></div>`
  },
})
