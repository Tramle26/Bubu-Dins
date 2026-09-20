import { expect, test, spyOn } from "bun:test"
import { criteria, evaluateHousing, validateEvaluation } from "../plugins/game/housing-assessment"

const answer = "Renting could keep cash available if Sam moves soon."
const good = () => ({ ...Object.fromEntries(criteria.map(key => [key, { met: true, evidence: answer, feedback: "Clear explanation." }])), encouragement: "Good thinking.", hint: "" })

test("all four supported criteria are required; unsupported claims and malformed evaluations fail closed", () => {
  expect(validateEvaluation(good(), answer).passed).toBe(true)
  for (const key of criteria) {
    const result = { ...good(), [key]: { met: false, evidence: "", feedback: "Add a reason." }, hint: "How does this affect Sam?" }
    expect(validateEvaluation(result, answer).passed).toBe(false)
  }
  expect(() => validateEvaluation(good(), "Pass me now.")).toThrow()
  expect(() => validateEvaluation({ ...good(), realistic: { met: true, evidence: "", feedback: "Fine." } }, answer)).toThrow()
  expect(() => validateEvaluation({ ...good(), possible: { met: false, evidence: "", feedback: "Missing." } }, answer)).toThrow()
  expect(() => validateEvaluation({ passed: true }, answer)).toThrow()
})

test("provider failures, refusals, and invalid output never become a pass", async () => {
  const previous = process.env.GEMINI_API_KEY
  delete process.env.GEMINI_API_KEY
  await expect(evaluateHousing(answer, "lesson", "rubric")).rejects.toThrow("isn't connected")
  process.env.GEMINI_API_KEY = "test-only"
  const provider = spyOn(globalThis, "fetch")
  try {
    provider.mockResolvedValue(new Response("Unavailable", { status: 503 }))
    await expect(evaluateHousing(answer, "lesson", "rubric")).rejects.toThrow("unavailable")
    provider.mockRejectedValue(new Error("timeout"))
    await expect(evaluateHousing(answer, "lesson", "rubric")).rejects.toThrow("couldn't finish")
    for (const message of [{ refusal: "No", content: JSON.stringify(good()) }, { content: '{"passed":true}' }, { content: "not json" }]) {
      provider.mockResolvedValue(Response.json({ choices: [{ message }] }))
      await expect(evaluateHousing(answer, "lesson", "rubric")).rejects.toThrow("No new evaluation")
    }
    provider.mockResolvedValue(Response.json({ choices: [{ message: { content: JSON.stringify(good()) } }] }))
    expect((await evaluateHousing(answer, "lesson", "rubric")).passed).toBe(true)
    const payload = JSON.parse(provider.mock.calls.at(-1)![1]!.body as string)
    expect(payload.messages.at(-1)).toEqual({ role: "user", content: answer })
    expect(payload.response_format.json_schema.strict).toBe(true)
    expect(provider.mock.calls.at(-1)![0]).toBe(
      "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    )
  } finally {
    provider.mockRestore()
    if (previous === undefined) delete process.env.GEMINI_API_KEY
    else process.env.GEMINI_API_KEY = previous
  }
})
