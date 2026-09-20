import { expect, test } from "bun:test"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { portfolioSections, PortfolioSection, calculatePaycheck, amortizeReference } from "../plugins/game/portfolio-artifact/reference"
import { PortfolioSection as PortfolioAppComponent } from "../plugins/game/portfolio-section"

const files = ["learn", "money-jobs", "accounts", "credit", "loans", "paycheck"]

test("completion renders preserve the browser-owned interactive lesson", async () => {
  const markup = String(await PortfolioAppComponent.render({ props: { section: "credit" } }))
  expect(markup).toContain("data-pmx-app")
  expect(markup).toContain('data-portfolio-section="credit"')
})

test("each numbered lesson contains exactly its assigned local artifact section", async () => {
  expect(portfolioSections.map(section => section.id)).toEqual([
    "what-a-portfolio-is", "five-layers", "three-accounts", "credit", "student-loans", "paycheck",
  ])
  for (const [index, section] of portfolioSections.entries()) {
    const markdown = await Bun.file(new URL(`../paths/lessons/portfolio/${files[index]}.lesson.md`, import.meta.url)).text()
    expect(markdown.match(/<x-bubu-portfolio-section /g)?.length).toBe(1)
    expect(markdown).toContain(`section="${section.id}"`)
    expect(markdown).not.toContain("claude.ai")
    const output = renderToStaticMarkup(createElement(PortfolioSection, { section: section.id }))
    expect(output.match(/<h1\b/g)?.length).toBe(1)
    expect(output).toContain(`id="${section.id}-title"`)
    for (const other of portfolioSections.filter(item => item.id !== section.id))
      expect(output).not.toContain(`id="${other.id}-title"`)
    expect(output).not.toContain("Lesson pages")
    expect(output).not.toContain("Page navigation")
    expect(output).not.toContain("<iframe")
  }
})

test("the artifact loan explorer handles zero interest and benefits from extra principal", () => {
  const zero = amortizeReference({ principal: 12000, annualRate: 0, years: 10 })
  expect(zero.months).toBe(120)
  expect(zero.totalInterest).toBe(0)
  expect(zero.scheduledPayment).toBe(100)
  const base = amortizeReference({ principal: 27000, annualRate: .0652, years: 10 })
  const extra = amortizeReference({ principal: 27000, annualRate: .0652, years: 10, extraMonthly: 100 })
  expect(base.months).toBe(120)
  expect(extra.months).toBeLessThan(base.months)
  expect(extra.totalInterest).toBeLessThan(base.totalInterest)
})

test("paycheck teaching assumptions reconcile and only marginal income gets the next rate", () => {
  const pay = calculatePaycheck(65000, 5, true)
  expect(pay.net).toBeCloseTo(48810.975, 2)
  expect(pay.net + pay.k + pay.fed + pay.ss + pay.med + pay.st).toBeCloseTo(pay.S, 2)
  expect(calculatePaycheck(65000, 5, false).net - pay.net).toBeCloseTo(pay.st, 2)
  expect(calculatePaycheck(67500, 0, false).net).toBeGreaterThan(calculatePaycheck(66500, 0, false).net)
  expect(calculatePaycheck(0, 0, true).net).toBe(0)
})

test("activity feedback has no secondary persistent progress or browser bank credential", async () => {
  const source = await Bun.file(new URL("../plugins/game/portfolio-artifact/reference.js", import.meta.url)).text()
  expect(source).not.toContain("localStorage")
  expect(source).not.toContain("VITE_NESSIE")
  expect(source).not.toContain("completion.set")
  const sandbox = await Bun.file(new URL("../plugins/game/portfolio-artifact/sandbox.jsx", import.meta.url)).text()
  expect(sandbox).toContain('fetch("/api/bubu/nessie-portfolio"')
  expect(sandbox).not.toContain("nessieisreal.com")
})
