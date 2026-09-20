---
title: Build with Dr.Bos's native chat
---

[@layout]: ../layouts/work.layout.md

# Build with Dr.Bos's native chat

The prototype is working: Dr.Bos writes short explanations and visual components
into a private, live PathMX thread. Reopening chat restores the latest conversation.
**New chat** starts a separate thread and keeps earlier conversations available.
Chat cannot change lesson completion, grades, or learning credit.

[Open Dr.Bos](../dr-boss.page) · [See the visual components](./dr-bos-demo.page)

## Try it

1. Follow [AI setup](./ai-setup.guide), start the app, and sign in as Annastasiia.
2. Ask “Show the steps for comparing housing costs.” The opening explanation
   appears first, followed by a visual and a follow-up question.
3. Ask “Compare the two options.” The server supplies the saved conversation.
4. Close and reopen chat, or reload. Your conversation remains.
5. Open **Conversation history**, then select **Open conversation document** to inspect the same thread as an ordinary PathMX page.
   Sign in as Lilia to verify that Annastasiia's conversations are private.

**Stop response** keeps your question and any complete reply Blocks already saved.
Retrying sends another turn. A retry whose original acknowledgment was lost first
checks the original request ID, avoiding duplicate saved questions. If another tab
is writing, wait for it to finish and select/reopen the conversation before sending.

---

## Where to make changes

| Your goal | Owning file |
| --- | --- |
| Change Dr.Bos's teaching voice | `paths/characters/dr-boss.agent.md` |
| Teach the model which visual to choose | `paths/characters/dr-bos-output.guide.md` |
| Change visual appearance | `paths/components/dr-bos.components.md` |
| Try a visual without an AI request | `paths/work/dr-bos-demo.page.md` |
| Change the approved output grammar | `plugins/game/chat-markup.ts` |
| Change context, request limits, or orchestration | `plugins/game/chat.ts` |
| Change provider/model transport | `plugins/game/chat-provider.ts` |
| Change saved-thread handling/presentation | `plugins/game/chat-thread.ts` |
| Change composer behavior | `plugins/game/chat-client.ts` |
| Change viewport sizing or follow-latest scrolling | `plugins/game/chat-viewport.ts` |
| Change chat layout and bubbles | `paths/styles/global.css` and `paths/dr-boss.page.md` |
| Change native graph/chart/math validation | `plugins/game/chat-visuals.ts` |

The agent reads the output guide, not all component implementation code. Keep
examples complete and small. Explain when a component helps; include examples
where plain prose is better. Add a new component only for a concrete teaching need,
then update its grammar, examples, and tests together.

A useful coding-agent request:

> Read AGENTS.md and the Dr.Bos integration guide. Help us improve one visual
> explanation. Show the authored component example first. Preserve private
> threads, request validation, and the separation from Completion. Verify the
> rendered result at phone and laptop widths before expanding the vocabulary.

---

## How the prototype stays native

The browser sends only the question, topic, thread ID, turn ID, and expected
conversation version. The server derives the owner from the session and reads
history from Sources. Threads live under
`paths/people/<learner>/threads/dr-bos/<uuid>.thread.md`, inside the existing Home
access boundary. They are runtime learner work and are ignored by Git.

The provider streams text. `---` separates reply Blocks. The server buffers an
unfinished Block, checks its component grammar and citation identifiers, and
appends only accepted content. One automatic repair attempt handles a malformed
Block; if repair fails, earlier valid Blocks remain and the turn is interrupted.
The final turn is marked complete only after all saves finish.

Thread Sources use `layout: false`; thread-scoped CSS suppresses the local admin
bar in both embedded and standalone conversation documents. Authentication and
learner permissions remain unchanged. The outer app retains its user switcher.

An embedded native thread page updates through PathMX's existing live-Source
connection. It uses the same literate components as **Open document**; there is no
second Markdown renderer, diagram engine, or React chat app. The composer is a
small browser-owned component so document updates do not replace its draft or focus.

The model may use prose, headings, lists, tables, steps, connected flow graphs, comparisons, Mermaid flowcharts, Datatype charts, and math. It cannot
write Source metadata, directives, links, images, executable code fences, scripts, arbitrary
attributes, or unapproved components. Learner text is stored inertly. Citation
markers become a Sources disclosure with actual PDF filenames and physical pages.
Valid identifiers do not independently prove that an explanation is supported.

---

## Current limits and useful next experiments

This is **Block streaming**, not token-by-token partial-Markdown repair. A visual
appears when its complete markup validates. PathMX already coalesces live Source
updates and preserves document identity; incomplete-syntax repair remains a future
framework/plugin experiment. Don't add a separate renderer to fake that capability.

Generation has a 60-second timeout, at most eight reply Blocks, and six requests
per minute per learner in one server process. The browser also stops waiting after
70 seconds, including time before the server acknowledges the question. A timeout
is reported separately from a learner stopping a reply. Server `chat.interrupted`
logs record elapsed time, saved Block count, repair use, and the failure reason
without recording learner messages. Formatting repair sends only the output
vocabulary and malformed Block, rather than resending conversation and references.
Context includes up to 24 recent
message Blocks / 24,000 characters; older work stays saved but may not be sent.
A 90-second durable lease prevents concurrent turns and expires after a crashed
process. Reopening a conversation after a crash does not automatically restart a
provider call; a new question can proceed after that lease expires.

The current components explain a process or comparison; Mermaid supports bounded branching flowcharts. Larger graph types,
interactive simulations, general-purpose numeric charting beyond percentage bars and Datatype, editable artifacts, cross-thread memory,
thread deletion UI, shared rate limits, and durable background generation are not
implemented. Closing the panel can interrupt generation. Export/retention controls
and bounded thread-list pagination should be resolved before a public rollout.

The best next experiment is a small set of real student questions: compare the
same examples across models and judge useful teaching, faithful sources, valid
markup, first useful response time, and cost. Curate the PDF collection before
assuming every retrieval match is a suitable authority.

Run `bun run check`, `bun run typecheck`, and `bun run test`. Tests cover private
access, real Source persistence and restart, concurrent requests, cancellation,
request idempotency, malformed output/repair, and the existing completion rules.
Use the browser to check readable mobile visuals, keyboard controls, focus and
expanded Sources disclosures during live updates. Do not publish learner threads
or credentials while sharing this prototype.


## Native visual formats

PathMX already supplies Math (native MathML) and Datatype (font-based bar,
sparkline, and pie charts). `@pathmx/mermaid` 0.6.7 adds server-rendered SVG graphs
and the native diagram enlargement dialog. The game plugin registers it once.
The shared stylesheet fits the entire expanded SVG to both viewer dimensions,
including the shorter viewport inside chat. The dotted canvas keeps the whole
flow visible; close or Escape returns to the original diagram button.

The output guide contains complete examples; `chat-visuals.ts` validates the
allowed notation before a Block is saved. This prototype accepts small Mermaid
flowcharts with declared nodes and edges, numeric Datatype values from 0 to 100,
and a bounded arithmetic TeX vocabulary. It does not enable arbitrary Mermaid
configuration, click actions, HTML, or executable fences. Explain graphs in
adjacent prose and include chart labels, units, and exact values. Fictional data
must be labeled as fictional.

Test the [visual vocabulary page](./dr-bos-demo.page), then ask Dr.Bos:
“Show a branching Mermaid flowchart for planning a bank account application.”
For a numeric example: “Use fictional budget percentages 50, 30, 20 to show a
Datatype bar chart, and explain 200 divided by 1000 with a math formula.”


---

## Chat interaction ownership

The standalone chat page has `layout: false` and imports the shared stylesheet.
The same chat component also works inside the existing Source overlay. Its header
and bottom composer do not scroll; the embedded thread is the one scrolling
conversation area. The outer app keeps the local development user switcher.
`chat-viewport.ts` sizes the chat to the visual viewport, including keyboard
resize events, and cleans up frame listeners when the component unmounts.

The textarea grows to a bounded height. Desktop Enter sends; Shift+Enter inserts
a newline. On a touch device, Enter inserts a newline and the arrow button sends.
The input clears only when the server acknowledges saving the question. The
learner can draft the next question during a reply. A failed or stopped reply
restores the submitted question only if the learner has not started another draft.

The thread’s `.pmx-document` is the bounded scroll container; never scroll the
nested iframe window. Schedule clamped scroll writes after layout, outside
ResizeObserver callbacks. Sources expansion pauses following and keeps its reading
position. New replies follow the bottom when the learner is already near it. Scrolling up
pauses following; returning near the bottom resumes it. Sending a question resumes
following. Do not replace the iframe or textarea on each reply event: that loses
reading position, expanded disclosures, and input focus. Transport events update
status; native Source updates render the conversation.

History and the direct document link live behind **Conversation history**. Escape
closes that menu and returns focus. **New chat** keeps previous conversations.
There is no durable draft storage yet; a full page reload can discard unsent text.

## Add or change a chart: one complete example

The current visual choices are:

| Teaching need | Format |
| --- | --- |
| Readable labeled percentages | `bos-chart` with `bos-bar` children |
| Tiny inline bar, sparkline, or pie | Native Datatype notation inside `bos-chart` or prose |
| A short linear process | `bos-flow` with `bos-node` children |
| A branching process | A complete native Mermaid flowchart Block |
| Calculation or formula | Native inline or display math |
| Alternatives with trade-offs | `bos-compare` with `bos-option` children |

A complete, supported bar chart:

```md
<bos-chart><slot name="title">Fictional budget shares</slot>
<p>Percent of a fictional budget, not a recommended split.</p>
<bos-bar value="50">Needs</bos-bar>
<bos-bar value="30">Wants</bos-bar>
<bos-bar value="20">Savings</bos-bar>
</bos-chart>
```

Each bar uses the same 0–100 scale. `value` must be an integer in that range;
there can be at most eight bars. Labels and visible values accompany native
accessible meters. These are percentage charts, not general dollar charts.
Use exact learner-provided data or clearly labeled fictional numbers. Do not
invent data, silently normalize it, or change the scale to exaggerate differences.

For a new visual, work in this order:

1. Add one authored example to `dr-bos-demo.page.md` and inspect its rendering.
2. Implement the reusable component in `dr-bos.components.md`. Its prose explains
   purpose, allowed inputs, units, accessibility, and limitations; HTML/CSS fences
   implement it. Keep example markup in `md` fences.
3. Add the smallest matching rule to `chat-markup.ts` or `chat-visuals.ts`. Model
   output must not gain arbitrary attributes, scripts, imports, or data queries.
4. Teach when to choose it in `dr-bos-output.guide.md`, including one full example.
5. Add a test for native saved rendering and invalid input rejection in
   `tests/chat.test.ts`. Try one real AI reply, not just the offline demo.

A good agent task: “Read this guide and AGENTS.md. Improve the existing percentage
chart for one concrete learner question. Preserve native rendering, private Home
access, and the allowed output grammar. Show the demo first; update the prompt,
validation, and tests together. Do not introduce a second chat renderer.”

## Handoff verification

Run `bun run check`, `bun run typecheck`, and `bun run test`. In the browser, check:

- Desktop and narrow phone widths: header and composer stay visible; only the
  conversation scrolls; long labels and formulas do not widen the whole page.
- Keyboard send, multiline input, history Escape/focus return, and touch targets.
- During a reply, type a draft and scroll up: preserve the textarea DOM object,
  draft, focus, earlier message DOM objects, and reading position.
- New chat, history selection, reload, interruption, and the standalone document.
- A real generated chart with correct labels/values; Mermaid enlargement and math.

The current prototype uses ordinary published PathMX packages. Keep consumer
behavior here until another app proves a reusable plugin contract. Any eventual
plugin extraction should retain the same ownership boundaries: server-owned
private Sources and validation, native rendering, and a small browser composer.
