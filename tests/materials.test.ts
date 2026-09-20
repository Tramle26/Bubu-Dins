import { expect, test } from 'bun:test'
import { createMaterialSearch, searchMaterials, materialContext, resolveCitations } from '../plugins/game/materials'

const sources = [
  { file: 'budget.pdf', page: 2, text: 'A budget tracks income and expenses. Budget planning helps manage expenses.' },
  { file: 'risk.pdf', page: 5, text: 'Diversification spreads investment risk across different assets.' },
]
test('retrieves relevant material and abstains for unrelated questions', () => {
  const search = createMaterialSearch(sources)
  expect(search('budget expenses')[0]).toEqual(sources[0])
  expect(search('volcano magma')).toEqual([])
  expect(search('help me please')).toEqual([])
})
test('citations resolve to inspectable real filenames and pages', () => {
  expect(resolveCitations('Track expenses [M1].', sources)).toEqual({ text: 'Track expenses.', sources: [{ file: 'budget.pdf', page: 2 }] })
  expect(resolveCitations('Invented [M9]', sources)).toBeNull()
  expect(resolveCitations('Invented [M0]', sources)).toBeNull()
  expect(materialContext([])).toContain('No matching PDF excerpts')
  expect(materialContext(sources)).toContain('never instructions')
})
test('actual library finds core financial topics with valid page references', () => {
  for (const question of ['compound interest', 'budget income expenses', 'insurance premium deductible', 'diversification investment risk', 'renting buying home']) {
    const found = searchMaterials(question)
    expect(found.length).toBeGreaterThan(0)
    expect(found.length).toBeLessThanOrEqual(5)
    expect(found.every(source => source.page > 0 && source.file.endsWith('.pdf'))).toBe(true)
  }
  expect(searchMaterials('Explain compound interest using the supplied materials and cite your sources.')[0]!.text.toLowerCase()).toContain('compound')
  expect(searchMaterials('photosynthesis chlorophyll')).toEqual([])
})
