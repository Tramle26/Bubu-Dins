---
title: Bubu — agent implementation specification
version: 1.0
prepared: 2026-09-15
status: ready for repository discovery
---

# Bubu implementation specification

## 1. Mission

Build a finished, narrowly scoped hackathon demonstration of an illustrated financial-learning world. The learner is a college student, already admitted to a demo session. They complete short lessons, practice financial reasoning, demonstrate understanding in a conversation with Dr.Bos, earn coins, and spend coins to provision learning simulations in Storyworld.

**Ship one coherent working experience, not a large collection of attractive dead-end screens.** The primary demonstration is housing; investing is a second complete, smaller instance of the same pattern.

The expected stack is PathMX Sources/Blocks/Paths, custom Markdown layouts, literate components, CSS, SVG, isolated generated raster artwork, and a small TypeScript plugin composition. No 3D engine, general-purpose game engine, extra SPA router, or separate CMS is required.

The application's financial decisions concern fictional characters and authored assumptions. It must not request bank connections, execute trades, predict actual investments, or recommend financial products to the learner.

## 2. Sources of authority

Use this order when requirements conflict:

1. Mark or Tram's explicit subsequent instructions and the destination repository's existing security constraints.
2. The supplied meeting notes: college-only demo; landscape/projector presentation; Dr.Bos tutors; Bubu encourages; lessons have instruction/practice/review; coins fund scenarios; House and Bank are the focus.
3. This handoff's explicit implementation defaults and numerical fixtures.
4. The sketches for information flow and the art references for style—not exact pixel geometry.
5. Existing examples and current platform documentation for how to implement the requirements.

Check the installed PathMX version before using any example. `PATHMX_INTEGRATION.md` records verified capabilities, not a promise about the version in the destination repo. Every `bubu.*` operation and custom component in this package is **project-owned work**, not a claimed built-in API.

## 3. Scope

### Required for the demo

- A pre-established college-student session, persisted on a writable local or controlled live host.
- Home/dashboard, two-topic catalog, three-stop topic journey, activity screen, Storyworld, House simulator, Bank simulator, and a simple saved-work collection.
- Two topics: **Housing choices** and **Investing with a plan**.
- Three activities per topic: **Learn**, **Try it**, **Review with Dr.Bos**.
- Actual authored instructional content and a working interaction in every included activity.
- A live finance-scoped tutor integration, plus an explicitly labelled fixture/rehearsal mode.
- Separate concepts for visited, submitted, passed, and reward granted.
- One-time coin rewards, validated spending, and durable scenario runs.
- Six illustrated world destinations; only House and Bank host simulations. College leads to lessons. Supermarket, Hospital, and Mall are explicit previews.
- A deterministic housing comparison and a deterministic fictional-investment simulation.
- Refresh/resume, duplicate-request safety, reset/rehearsal controls, and a reproducible demo script.
- Readable landscape layouts and keyboard-accessible equivalents of map controls.

### Not in scope

Login/signup UI; children-specific experiences; mobile-first redesign; real stocks or market feeds; Roth IRA/401(k) calculations; healthcare-insurance simulation; multiplayer; free-roaming avatar controls; inventory/cosmetic shops; leaderboards; streak punishment; lives; voice; unconstrained AI chat; a complete textbook retrieval system; general game-authoring tools; a paid image-generation pipeline running inside the learner app.

Do not add sponsor logos or suggest sponsor endorsement. The hackathon/sponsor context is supplied planning context, not independently verified promotional permission.

## 4. The essential user journey

Home → Housing topic → Learn → Try it → Review with Dr.Bos → confirmed pass and +100 coins → Storyworld → House → spend 40 coins once to provision its simulation → compare choices → predict a changed circumstance → inspect results → save reflection → collection.

The Bank repeats the pattern after the Investing topic. It uses the same wallet, topic/step model, review workflow, run lifecycle, and reusable result/feedback components. It does not create its own progress system.

A practice widget and a Storyworld scenario share the same calculation engine and UI core. `mode=guided` adds instructional prompts and a fixed starting case. `mode=explore` permits the authored choices and adds prediction/reflection. These modes do not change numerical truth.

## 5. Terminology and stable identities

| Term | Meaning |
| --- | --- |
| Topic | A financial-learning unit with a stable ID, learning objectives, a Path, and source packet |
| Step/activity | Learn, Try it, or Review; a linked authored Source, not a hand-coded screen index |
| Scenario | A versioned, authored simulation definition |
| Run | One learner's saved encounter with a scenario, including inputs, output snapshot, and reflection |
| Pass | The application accepts sufficient demonstrated understanding under a specific rubric version |
| Coins | Nonredeemable learning currency; not dollars, an investment return, or a measure of wealth |
| Simulation dollars | Fictional USD amounts inside a case; separately labelled from coins |
| Collection | Saved plans and reflections; not an investment account |

Suggested IDs: `housing`, `investing`; `housing.learn`, `housing.practice`, `housing.review`; `house-v1`, `bank-v1`. Keep IDs independent of copy, filenames used for art, positions on the map, and display order. Use actual PathMX canonical Source IDs from the running repository for links. Do not guess route normalization from these examples.

## 6. Screen and interaction requirements

### 6.1 Shared game shell

A shallow top bar contains a simple Bubu wordmark, **Learn**, **Storyworld**, **My collection**, a coin balance, and a college-student profile indicator. Home is the wordmark target. No permanent icon-only sidebar. Local labels remain ordinary HTML text.

Persisted status updates only after confirmed operations. Never animate a final reward on an optimistic request. Provide readable saving, saved, retry, and unavailable states. A small environment indicator distinguishes `Live tutor` from `Rehearsal tutor`.

Dr.Bos's panel is contextual and appears where teaching or review happens. Bubu is a small accent, not an always-blocking overlay. Only one character speaks prominently at a time.

### 6.2 Home

Left: Bubu, brief greeting, and one saved-work/progress summary. Right: one dominant **Continue** card, two topic cards, and **Visit Storyworld**. Continue resolves to the earliest unfinished activity in the selected topic, or to its unlocked scenario after passing review. A completed topic offers revisit rather than earning again.

Do not implement a dashboard chart unrelated to the learning loop. No empty AI-chat screen. The sketch's “workspace” becomes the scenario working area; its “portfolio” becomes My collection.

### 6.3 Topic journey

Exactly three prominent stops: Learn, Try it, Review. A short horizontal/diagonal winding path fits the landscape viewport; no giant vertical mobile road. Each stop has a real button/link, label, ordinal, and one explicit state: available, current, submitted/needs revision, passed, or unavailable.

Learn becomes acknowledged only after an explicit Continue/Finish action, not merely visiting it. Practice is complete after a valid decision and short prediction/reflection are saved; it need not be a “correct” preference. Review requires those prerequisites. Students may revisit earlier activities freely. Both topics are available from the start.

Map order comes from the topic Path. Coordinates supply only presentation. Provide a “List view” with the same data, order, links, and state. UI lock messages and server availability checks must agree.

### 6.4 Instruction

Use 2–3 short Blocks with readable headings, one concrete example, and at most one primary chart or widget per visible step. Supply definitions before relying on them. Dr.Bos may answer questions about the packet but must not prematurely mark the review passed.

Prefer an existing compatible Player for Block pacing after the integration spike. Preserve normal Source reading. Avoid competing Path navigation and a second application-owned step controller. A custom activity controller is acceptable only with a documented reason and with content remaining in Sources/Blocks.

### 6.5 Guided practice

Show the same housing/investing engine used by the building, with fewer editable inputs and an authored prompt. Ask for a prediction before revealing a comparison or event. Calculation updates are local and quick; saving a decision is a distinct action.

Changing a slider after submission creates a visible draft; it must not relabel a previous saved result as though it used the new values. Keep the last saved snapshot available until another save succeeds.

### 6.6 Review with Dr.Bos

Use a conversation next to the current topic summary or relevant chart. Show one question, an accessible response field, **Send**, and **Hint**. Suggested limits: 1,500 characters per answer; one model request at a time; 4,000 characters for a final reflection. The transcript can scroll, but the current task and composer remain clear.

Three criterion indicators say **Not yet shown**, **Needs another try**, or **Shown**. Do not show a fabricated percentage confidence or “AI certainty.” The agent can ask follow-ups; the server records the evaluator's rubric evidence and computes the pass rule. Learners may stop and resume. No lives, countdowns, punishment, or coin deductions for errors.

A successful pass opens a confirmation card with the exact earned amount and a **Try it in Storyworld** link. Reopening it must not animate or grant a second reward.

### 6.7 Storyworld

An illustrated terrain plate plus separately positioned buildings, SVG connectors, and HTML labels. House and Bank are clearly active once eligible; before eligibility their cards point to the associated topic. College opens Learn. Supermarket, Hospital, and Mall open a short, explicitly labelled preview—not a dead link or a fake playable simulation.

Selecting a building opens a card with its goal, requirements, cost or purchased status, and action. First provision shows **Spend 40 coins to start** with **Not now**. After purchase, it says **Resume** or **Try another case — no additional coins**. No surprise deduction when simply clicking a building.

An optional bus transition lasts at most 700 ms and can be skipped. Movement never controls navigation or correctness. No free-walking, pathfinding, or collision model.

### 6.8 House and Bank

Main area: task, controls, output chart, and a concise outcome summary. Side area: Dr.Bos and collapsible assumptions. Clear breadcrumbs/Back to world. A visible **Fictional learning simulation** label distinguishes results from real recommendations.

Housing: rent/buy comparison, 15/30-year loan term, 10/20% down payment, and 2/7-year stay. The precise model is in `SIMULATIONS.md`.

Bank: four fictional buckets, allocation totaling 100%, saved prediction, three authored events, and comparison against a declared reference allocation. No “best portfolio” badge. Run results never enter the global wallet.

Both save a reflection and output snapshot to My collection. Restarting a case preserves the old saved run and creates a fresh run ID without another debit after the entitlement exists.

### 6.9 Collection

Simple cards with topic, decision, a few numerical results, learner reflection, date/order, and **Open saved run**. No generic asset-management dashboard. Reopening displays the frozen inputs and model/fixture version used at that time. A later model change must not silently recompute an old result.

## 7. Design and layout contracts

### Presentation targets

Required viewports: 1366×768 and 1024×768 CSS pixels, plus a 1440×900 check. A 1920×1080 browser remains readable rather than stretching every line of text. Basic reflow below 900 px is sufficient for the demo; full mobile polish is deferred.

Use a max-width application shell around 1440 px. Typical header: 64–72 px. Main content gutters: 24 px, reducing to 16 px where necessary. Scenario layout: flexible workspace plus roughly 320 px tutor panel; at tighter widths, let the panel move below rather than clipping controls. Do not vertically constrain long instruction/reflection content simply to avoid scrolling.

Proposed typography: system/available readable sans-serif; 20 px main instructional copy where space allows, 18 px minimum at the target viewports, 15–16 px secondary copy, 28–36 px headings. Do not bake text into images or make all labels handwritten. Controls target at least 44×44 CSS px. Keyboard focus is conspicuous.

### Proposed color tokens

These are design defaults, not exact color samples: ink `#143F35`, primary `#205B46`, canvas `#FFFBEF`, panel `#EEF4E4`, secondary green `#91B77A`, gold `#F4C45E`, warm accent `#D77844`. Verify contrast for every text/control pairing. Status must not depend on color alone. Use a labelled `Needs another try` state, not a punitive red failure mascot.

### Map coordinates

Use one scene container with a **1200×720 logical viewBox**, scaled with `contain`, not `cover`. Convert anchors to positions inside that exact rendered container, including letterboxing. Decorative assets and SVG share that transform. HTML hit targets remain at least 44 px and labels retain readable sizing.

Proposed building centers: Mall (170,185), Bank (600,165), Hospital (1010,185), House (185,510), College (600,420), Supermarket (1010,510). These are adjustable presentation metadata. Define a bottom-center asset anchor and separate label anchor for each building. Avoid putting roads in the terrain image; render them in SVG so connections still meet buildings after adjustments.

Draw order: terrain → roads → building images → small props → character/bus → HTML labels/hit targets → popover/dialog. Decorative layers use `pointer-events:none`. Native links/buttons do the interaction. Do not put buttons inside buttons. Selection is not inferred from pixel colors.

### Motion and audio

Use small CSS transforms, expression swaps, and one reward burst. No continuous bobbing on every object. Respect `prefers-reduced-motion`; disable movement and celebratory particles while retaining immediate feedback. Sound is optional, off by default, and never necessary to understand state.

## 8. Architecture

### Separate five layers

1. **Authored content:** topics, Paths, lesson Blocks, rubrics, source packets, scenario definitions, copy.
2. **Presentation:** three custom layouts; literate visual components; CSS tokens; assets; SVG charts/maps.
3. **Domain services:** progress projection, validated review, wallet, entitlements, simulation runs.
4. **Tutor adapter:** model-independent message context, live provider integration, structured evaluator, approved chart tools, fixture mode.
5. **Host/storage:** PathMX Actor admission, permissions, transactional writes, persistent storage, operational diagnostics.

Prefer one repository plugin composition with modules `game`, `tutor`, `housing`, and `investing`; do not create a published framework. A small React island is allowed only where the existing repo convention or complex controls justify it. No replacement of PathMX navigation with a second router.

Suggested placement (adapt to the actual repository):

```text
paths/
  index.md
  layouts/{game,lesson,scenario}.layout.md
  ui/{mascot,cards,feedback}.components.md
  learn/index.page.md
  learn/housing/{index.path,learn.lesson,practice.lesson,review.lesson}.md
  learn/investing/{index.path,learn.lesson,practice.lesson,review.lesson}.md
  world/index.page.md
  world/{house,bank}.scenario.md
  collection/index.page.md
  assets/bubu/...
plugins/
  bubu/index.plugin.ts
  bubu/{components,actions,queries,schemas}/...
  bubu/domain/{progress,wallet,runs}.ts
  bubu/simulations/{housing,investing}.ts
  bubu/tutor/{adapter,context,evaluator,tools,fixtures}.ts
content-private/       # only if the host supports an explicitly nonpublic source/config boundary
  rubrics/...
  market-events/...
```

Private data placement is a security decision, not permission derived from a directory name. Do not publish hidden evaluator instructions or future market events through a static asset bundle or a public Source query.

### Authoring contract

A content author should add another activity using Markdown, stable IDs, a source packet/rubric, and validated metadata. Existing interaction types must not require changes to wallet, renderer, or tutor transport code. A genuinely new simulation engine can require code; do not claim arbitrary mini-games are configuration-only.

Keep display copy/configuration separate from behavior. Authoring validation should catch missing scenario references, duplicate IDs, missing rubric/source versions, broken asset paths, invalid percentages, and duplicate map placements.

## 9. State, authority, and transactions

### Owned records

- Topic/step progress: native Completion/Input/Assessment where suitable, with a Bubu review-pass projection. Never create an unrelated localStorage progress store.
- Review session: messages, question IDs, persisted student answers, content version, rubric version, and evaluation records.
- Wallet ledger: immutable grants/debits and a derived balance.
- Scenario entitlement: whether this learner has paid for House/Bank v1.
- Scenario runs: selected inputs, prediction, current event, calculation version, output snapshot, reflection, and status.
- UI state: temporary selected tabs, unsaved control values, open dialogs, and animation flags.

Grade, ledger, entitlement, and authoritative run results must be service-controlled learner-scoped records, **not directly editable user documents**. An owner-readable View projection may expose safe summaries. An editable learner Home alone is insufficient protection for coin/grade records. Verify actual permissions against general Source-edit actions and raw Markdown routes.

Derive Actor identity from admitted server context. Never accept authoritative `actorId`, balance, price, grade, output amount, or target path from browser payloads. Targets supplied by the browser must resolve to an admitted topic/scenario; all affected private record IDs are server-derived and bounded.

### Wallet defaults

- Fresh learner: 0 coins.
- First accepted pass of each topic: +100 coins.
- First provision of each scenario family/version: −40 coins, creating a persistent entitlement.
- Replays/new runs inside that purchased scenario version: no additional debit.
- No coin-to-dollar exchange rate. Spending provisions the scenario's fictional budget and world access; it does not represent buying a real financial asset.
- Housing receives a fixed fictional savings/income case. Bank receives a fixed $10,000 simulation budget.
- No simulation profits or losses feed back into global coins.

These defaults retain learn/earn/spend without forcing quiz grinding after mistakes. The copy must explain the distinction. Log any change to the rule with its fixtures and UX labels.

### Idempotency and concurrency

Use application-level stable keys in durable storage; a disabled button is not idempotency. Suggested reward key: `(actor, demoEpoch, topic, rewardPolicyVersion)`. Suggested entitlement key: `(actor, demoEpoch, scenarioFamilyVersion)`. Tie every submitted request ID to a canonical payload hash; same ID with different payload is a conflict.

In one bounded commit, validate the current pass/entitlement/balance, append the ledger event, and create its associated record. Serialize per learner or use verified compare-and-swap/unique-record facilities. Two tabs must not double-award or spend an old balance. Do not assume transaction support automatically supplies the uniqueness rule.

The application checks the existing receipt after ambiguous network errors. A successful write followed by a failed refresh triggers a read retry, not another grant. Changing content/rubric versions does not automatically earn another reward; re-earning requires an explicit new reward-policy version.

### Completion state machine

Learn: available → acknowledged.
Practice: available → draft → valid submitted attempt.
Review: ready → in progress → awaiting response/evaluation → needs more evidence OR passed.
Reward: absent → committed once, only from accepted review state.
Scenario: preview → eligible → provisioned → run in progress → reflected/completed.

Presentation states are projections of these records. Reloading or navigating must not synthesize missing transitions. Tests must cover a passed review with an already-granted reward, an interrupted evaluator request, stale review content, and a provisioned scenario with no current run.

## 10. Dr.Bos integration

Implement the full contract in `DR_BOSS.md`. Key requirements: one question at a time, topic-bounded help, evaluated evidence from actual student turns, safe chart tools, no external actions or arbitrary code, and separate tutoring from durable grading.

A live model request runs **outside** the transaction. First persist/identify the student answer; call the provider with an immutable context snapshot; validate the structured result; then commit it only if the answer/session/rubric versions still match. No network calls in an Action's transactional preparation or commit.

Do not pass a user-created “evaluation result” directly to a coin-grant action. The trusted server creates the evaluation record, computes the pass, and grants the eligible reward. Prompt rules are not the authorization boundary.

Fixture mode uses the same UI contracts but is always visibly labelled **Rehearsal tutor — scripted responses**. It must not award meaningful live-mode progress; namespace all rehearsal state. Invalid live responses and timeouts do not silently fall back to a passing fixture.

## 11. Security, privacy, and failure handling

Deploy the hackathon demo on localhost or a controlled host with a pre-provisioned session. A shared demonstration identity is permissible only in an explicitly controlled single-presenter environment. Do not auto-sign every public visitor into the same writable account. No public reset endpoint, model key, or unrestricted Actor impersonation.

Enforce origin/credential checks and per-session rate/size limits. Keep provider keys out of Sources, browser bundles, logs, and exported art metadata. Escape student/model text; render only a small safe Markdown subset if needed. Disallow HTML/script generation. Treat source documents and student answers as data, not instructions to the agent runtime.

No real financial details are required. Use synthetic profiles and do not request account numbers, balances, addresses, SSNs, or brokerage data. Log operational IDs/errors rather than full student transcripts by default. Clear demo records with a controlled reset; do not delete unrelated repository/user work.

Failures must retain work and offer a clear recovery: invalid allocation → inline error; tutor timeout → saved answer plus retry; permission failure → no optimistic success; insufficient balance → explanation and Learn link; missing image → labelled placeholder; failed chart → numeric table; unreadable Source → unavailable state, not private-data fallback.

## 12. Build milestones and gates

### M0 — Verify the repository

Read local instructions, inspect dependencies/lockfile, list plugins/commands, confirm a writable session, and locate any existing agent example. Produce `docs/integration-audit.md` recording exact versions, actual paths, APIs, and gaps. Do not reinitialize a nonempty repo or install an unpinned beta merely because an example says beta. A generic “Ada” account in public docs is not the user's Project 3 tutor.

### M1 — Build one real vertical slice

Use placeholder silhouettes as necessary. Home → Housing Path → a real Learn/Practice/Review → fixture-labelled evaluator → durable pass → single reward → scenario provision → saved run → reload. Prove Actor isolation and replay safety before art polish. Also perform an early live-provider smoke test so AI integration is not postponed until the end.

### M2 — Establish the visual system

Three layouts, component gallery, one finished journey section, and one composed town. Integrate approved masters and follow the asset contracts. Verify both target aspect ratios and list navigation. Do not spend the phase generating a new screenshot for each screen.

### M3 — Complete housing and Dr.Bos

Port/test the reference math, author the complete content packet, implement live bounded tutoring/evaluation, attach real saved results, and rehearse a prediction/change/reflection interaction.

### M4 — Add investing using the pattern

Add its content/rubric/configuration and market engine. Reuse the lesson UI, tutor adapter, wallet, entitlement/run workflow, and result collection. Any duplicated progression logic is a regression.

### M5 — Demo hardening

Run all acceptance tests, inspect browser screenshots, verify persistence after process restart, test timeout/ambiguous-write cases, preload only public active-route assets, and finalize the presentation script. Record known gaps honestly.

## 13. Required final implementation handoff

The implementing agent delivers the changed repository, exact startup commands, dependency/credential prerequisites, integration audit, content-authoring guide, passing test logs, screenshots at target sizes, asset provenance/status, and a five-minute presentation script. It must label any unimplemented feature and distinguish live AI from rehearsed output.

Do not mark the project complete because typechecking passes or a screenshot looks plausible. Completion requires the end-to-end coin/learning/world flow, numerical agreement with fixtures, real saved state, actor isolation, and visual inspection.

See `ACCEPTANCE.md` for the full checklist. Mark/Tram should approve character masters, the two learning rubrics, and the final presentation copy before the public demonstration.
