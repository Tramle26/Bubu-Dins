import { afterEach, expect, spyOn, test } from "bun:test"
import { loadNessiePortfolio } from "../plugins/game/nessie"

afterEach(() => {
  ;(globalThis.fetch as unknown as { mockRestore?: () => void }).mockRestore?.()
})

test("loads one customer's accounts, purchases, and loans without exposing the key", async () => {
  const seen: URL[] = []
  spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const url = new URL(String(input))
    seen.push(url)
    const path = url.pathname
    if (path === "/accounts")
      return Response.json([
        { _id: "checking", type: "Checking", nickname: "Daily", balance: 800, rewards: 0, account_number: "1111", customer_id: "customer-a" },
        { _id: "card", type: "Credit Card", nickname: "Student card", balance: 125, rewards: 12, account_number: "2222", customer_id: "customer-a" },
        { _id: "other", type: "Savings", nickname: "Other", balance: 999, rewards: 0, account_number: "3333", customer_id: "customer-b" },
      ])
    if (path.endsWith("/purchases"))
      return Response.json(path.includes("checking") ? [{ _id: "purchase-1", amount: 42, description: "Groceries", status: "completed", purchase_date: "2026-09-01" }] : [])
    if (path.endsWith("/deposits"))
      return Response.json([{ _id: "deposit-1", amount: 100, status: "completed", transaction_date: "2026-09-01" }])
    if (path.endsWith("/loans"))
      return Response.json(path.includes("checking") ? [{ _id: "loan-1", type: "Student", amount: 5000, monthly_payment: 100, description: "Student loan", status: "open" }] : [])
    return Response.json({ error: "missing fixture" }, { status: 404 })
  })

  const result = await loadNessiePortfolio("test-only-key", "")
  expect(result.customer_id).toBe("customer-a")
  expect(result.accounts.map((account) => account._id)).toEqual(["checking", "card"])
  expect(result.purchases[0]).toMatchObject({ _id: "purchase-1", account_id: "checking", amount: 42 })
  expect(result.loans[0]).toMatchObject({ _id: "loan-1", account_id: "checking", monthly_payment: 100 })
  expect(result.deposits?.[0]).toMatchObject({ amount: 100, account_id: "checking" })
  expect(seen.every((url) => url.searchParams.get("key") === "test-only-key")).toBe(true)
  expect(JSON.stringify(result)).not.toContain("test-only-key")
})

test("uses a configured Nessie customer directly", async () => {
  const seen: string[] = []
  spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const url = new URL(String(input))
    seen.push(url.pathname)
    return Response.json([])
  })
  const result = await loadNessiePortfolio("test-only-key", "pinned")
  expect(result).toEqual({ customer_id: "pinned", accounts: [], purchases: [], loans: [], deposits: [] })
  expect(seen).toEqual(["/customers/pinned/accounts"])
})

test("returns a usable empty portfolio for a fresh sandbox key", async () => {
  spyOn(globalThis, "fetch").mockImplementation(async () => Response.json([]))
  expect(await loadNessiePortfolio("test-only-key", "")).toEqual({
    customer_id: "",
    accounts: [],
    purchases: [],
    loans: [],
    deposits: [],
  })
})

test("a deposit outage preserves accounts but reports deposits as unavailable", async () => {
  spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const path = new URL(String(input)).pathname
    if (path === "/customers/pinned/accounts") return Response.json([
      { _id: "checking", type: "Checking", nickname: "Daily", balance: 800, customer_id: "pinned" },
    ])
    if (path.endsWith("/deposits")) return new Response("Unavailable", { status: 503 })
    return Response.json([])
  })
  const result = await loadNessiePortfolio("test-only-key", "pinned")
  expect(result.accounts[0]?.balance).toBe(800)
  expect(result.deposits).toBeNull()
  expect(result.purchases).toEqual([])
})
