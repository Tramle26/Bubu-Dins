---
title: Dr.Bos visual vocabulary
---

[@layout]: ../layouts/work.layout.md
[@visuals]: ../components/dr-bos.components.md

# Dr.Bos visual vocabulary

These are the same literate components used in saved AI replies. This example
works without an AI request. Edit their definitions in the
[component Source](../components/dr-bos.components) and see the result update.

[Try a live conversation](../dr-boss.page) · [Integration guide](./dr-boss-chat.guide)

---

## A process

Compare the same kinds of costs for each housing option.

<bos-steps>
<slot name="title">Compare housing costs</slot>
<bos-step><slot name="title">Upfront costs</slot><p>List what you would need before moving in.</p></bos-step>
<bos-step><slot name="title">Monthly costs</slot><p>Include recurring costs for each option.</p></bos-step>
<bos-step><slot name="title">Room for surprises</slot><p>Identify unexpected costs your comparison leaves out.</p></bos-step>
</bos-steps>

Which cost have you included, and which still needs checking?

---

## A comparison

Compare the same dimensions without declaring a universal winner.

<bos-compare>
<slot name="title">Two housing options</slot>
<bos-option><slot name="title">Renting</slot><p>Examine the lease's flexibility and which costs remain your responsibility.</p></bos-option>
<bos-option><slot name="title">Buying</slot><p>Examine the costs of changing homes and the ongoing responsibility for maintenance.</p></bos-option>
</bos-compare>

How does the person's time horizon change this comparison?

---

## A connected graph

An illustrative process; requirements vary by bank and location.

<bos-flow>
<slot name="title">Opening an account: a planning example</slot>
<bos-node><slot name="title">Compare accounts</slot><p>Check fees, access, and the terms that matter to you.</p></bos-node>
<bos-node><slot name="title">Check requirements</slot><p>Ask the bank which documents and eligibility rules apply.</p></bos-node>
<bos-node><slot name="title">Apply and review</slot><p>Follow the bank’s application process and review the terms before agreeing.</p></bos-node>
</bos-flow>

---

## A branching Mermaid graph

An illustrative process: compare accounts, clarify requirements with the bank if
needed, then review the application and terms. This is not a universal checklist.

```mermaid
flowchart TD
A["Compare accounts"]
B{"Requirements clear?"}
C["Ask the bank"]
D["Review application and terms"]
A --> B
B -->|No| C
B -->|Yes| D
C --> B
```

---

## Native numeric charts

<bos-chart><slot name="title">Fictional budget shares</slot><p>Percent, in order: needs 50, wants 30, savings 20.</p><p>{b:50,30,20}</p></bos-chart>

Fictional savings progress (percent of a goal), weeks 1–4: 10, 20, 30, 40.

<bos-chart><slot name="title">Fictional weekly progress</slot><p>{l:10,20,30,40}</p><p>Weeks 1–4: 10, 20, 30, 40 percent.</p></bos-chart>

Fictional savings goal: 25 percent complete.

<bos-chart><slot name="title">Fictional savings goal</slot><p>{p:25}</p><p>25 percent complete.</p></bos-chart>

---

## Native math

In a fictional example, saving 200 out of an income of 1,000 is 20 percent:

$$
\frac{200}{1000} \times 100 = 20
$$

Inline notation works too: $200 + 300 = 500$.

---

## Labeled percentage bars

<bos-chart><slot name="title">Fictional budget shares</slot>
<p>Percent of a fictional monthly budget, not a recommended split.</p>
<bos-bar value="50">Needs</bos-bar>
<bos-bar value="30">Wants</bos-bar>
<bos-bar value="20">Savings</bos-bar>
</bos-chart>
