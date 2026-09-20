import { createElement } from "react"
import { createRoot } from "react-dom/client"
import { mountPathMXBehavior } from "@pathmx/core/controls/browser"
import { PortfolioSection } from "./portfolio-artifact/reference"

mountPathMXBehavior("[data-portfolio-section]", host => {
  const root = createRoot(host)
  return {
    update() {
      const section = host.dataset.portfolioSection
      root.render(createElement(PortfolioSection, { section, key: section }))
    },
    dispose: () => root.unmount(),
  }
})
