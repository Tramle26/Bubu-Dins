---
title: PathMX integration and discovery gate
version: 1.0
verified: 2026-09-15
---

# PathMX integration

## 1. Verify before implementation

The target repository was not supplied with this handoff. No claim is made about its installed version, plugin composition, tutor API, or hosting configuration. The agent must inspect the actual repository before writing integration code.

Read `AGENTS.md`, any imported agent instructions, `package.json`, the lockfile, project configuration, and relevant installed examples/types. Preserve the project's package manager. In a new empty project, follow the current [Quickstart](https://docs.pathmx.dev/docs/start/first-site.guide); in an existing one, do not run an initializer over it.

Record in `docs/integration-audit.md`:

| Area | Record evidence |
| --- | --- |
| Runtime | Package manager, runtime version, startup command |
| Core | Exact pinned `@pathmx/core` version |
| Extensions | Installed Path, Completion, Input, Assessment, Player, credential and agent plugins |
| Auth/state | How an Actor is admitted; where private state lives; persistence across restart |
| Presentation | Working custom layout and literate component examples |
| Operations | Actual Action/query registration and browser invocation contracts |
| Tutor | Actual existing agent implementation, or an explicit missing-reference note |
| UI lifecycle | Mount, retained-render, cleanup, and navigation behavior |
| Commands | Actual lint, typecheck, unit test, browser test, and build/serve commands |

Public [agent guidance](https://docs.pathmx.dev/docs/agents) documents command discovery, authored Markdown alternatives, and project instructions. Use the installed command help before assuming flags. Typical checks include `bun run pmx --help`, `bun run pmx tree`, `bun run pmx plugins list`, and `bun run pmx lint --format json`; adapt the runner to the repo. The optional authoring skill comes from the installed Core package, not a guessed remote version.

If documentation and installed types disagree, record the mismatch, use the verified installed contract, and raise a narrow upgrade decision. Do not silently rewrite the app against remembered APIs.

## 2. Verified platform capabilities

This table summarizes public documentation inspected during preparation. It intentionally avoids copying whole APIs into the spec.

| Capability | Verified contract | Bubu decision |
| --- | --- | --- |
| [Layouts](https://docs.pathmx.dev/docs/site/layouts.reference) | `.layout.md` surrounds a represented Source with one `<x-source-content />` outlet per layout; root/type or local declarations select layouts | Three layout types. Keep Source-field interpolation inside literate components rather than raw layout HTML |
| [Literate components](https://docs.pathmx.dev/docs/authoring/components.reference) | `.components.md` Blocks use `componentName` topmatter and `html`, `css`, `js` fences; component files are explicitly imported | Use for mascot presentation, cards, dialogue framing, and feedback |
| [Template data](https://docs.pathmx.dev/docs/authoring/components.reference) | Field interpolation supports Source/Block data; not arbitrary loops or expressions | Use plugin rendering for dynamic collections and domain projections |
| [Custom plugins](https://docs.pathmx.dev/docs/extend/plugins.guide) | Repository plugin entrypoints can contribute components, routes, operations, and client behavior | Implement game/tutor/simulation modules in a small composition |
| [Paths](https://docs.pathmx.dev/docs/learning/path.reference) | Ordered linked activities have stable step IDs; `path.steps` provides admitted order, targets, and progress | Render the same Path as an illustrated journey and a list |
| [Completion](https://docs.pathmx.dev/docs/learning/completion.reference) | Provides progress readers and configurable state/derived completion | Project review-pass rules must not be confused with simple visit/submission |
| [Input/Assessment](https://docs.pathmx.dev/docs/learning/assessment.reference) | Input handles response state/submission; Assessment supplies question/evaluation contributions. Ordinary assessment completion is submission-based, not necessarily correctness-based | Keep submission, mastery evidence, pass, and reward distinct |
| [Player](https://docs.pathmx.dev/docs/learning/player.reference) | Supports paced Source/Block presentation; navigation through content is not automatically a completed activity | Spike one lesson before writing a new runner |
| [Actions](https://docs.pathmx.dev/docs/extend/actions.reference) | Validated `plugin.member` operations run through admitted Views, with bounded effects; static export alone is not a writable Action host | Use for domain writes; verify same-origin admission and persistence |

## 3. Boundary between native and project code

**Native concepts to reuse:** Sources, Blocks, canonical links, Paths, admitted Views, Input state, appropriate Completion/Assessment readers, Actions, live rendering, component lifecycle.

**Project concepts to implement:** a Bubu review rubric, grade evidence record, reward policy, wallet ledger, scenario entitlement, simulation run, map placement metadata, fictional market events, safe chart-tool selection, and tutor context.

Do not invent `@pathmx/agent`, `usePathMX()`, `agent.quiz()`, `wallet.credit()`, or a built-in game engine. Names in `contracts/domain.ts` and `HANDOFF.md` describe the desired domain, not installed exports. Locate the actual Ada/Project 3 code in the provided repo or a supplied reference before reusing it. The public docs' example account named Ada is not evidence of that tutor implementation.

A missing Ada reference is not a reason to stop all work: isolate a provider adapter, build the fixture-labelled flow, and use verified server/plugin interfaces. Report what is missing and the precise adapter that remains to be connected. A complete demo still requires a live-provider smoke test before it is labelled ready.

## 4. Platform-specific implementation cautions

Keep public, repeatable component compilation separate from viewer-specific rendering. Private learner data must not enter shared compile caches or public assets. Use current View reads, not unrestricted repository enumeration, for learner-facing queries. Respect actual component mount/update/disposal contracts so navigating away does not retain duplicate handlers or pending chart instances. See the [plugin guide](https://docs.pathmx.dev/docs/extend/plugins.guide) and [component lifecycle](https://docs.pathmx.dev/docs/authoring/components.reference).

Use a single configured Input/Assessment/Completion composition rather than registering duplicate plugin owners. Follow the [Assessment setup](https://docs.pathmx.dev/docs/learning/assessment.reference) for whichever release is installed. A custom pass provider/projection can adapt the review record; it must not require a second unrelated content tree.

The [Action contract](https://docs.pathmx.dev/docs/extend/actions.reference) distinguishes preparation from a bounded commit and reports rejected/partial/uncertain outcomes. External AI calls belong outside transactional work. Service effects must be derived from authorized domain rules, not copied from browser paths. The proposed idempotency keys and grade/ledger ownership in this handoff are additional Bubu requirements, not automatic framework guarantees.

## 5. Suggested verification spike

Before expanding content, prove these facts in the destination repo:

1. A custom layout renders an actual Source and preserves normal navigation.
2. A literate component mounts, updates, and cleans up correctly.
3. A real Path renders identical ordered steps in custom and native/list presentations.
4. A pre-admitted Actor can save a response; another Actor cannot read or overwrite it.
5. A project Action can atomically write its authorized records; a duplicate request does not repeat the domain effect.
6. A plugin can make an authenticated server-side provider request without exposing the key.
7. Saved work survives page refresh and a server restart in the chosen deployment mode.

Save the evidence and exact commands. A screenshot of an unsigned-in mock does not satisfy this spike.

## 6. Local session and deployment

Reuse the destination repo's credential/session mechanism or the current documented local Actor/Home setup. A prelogged-in demo is an intentional session configuration, not permission to remove authorization. Bind local demos to localhost; use a controlled credential/proxy setup on a live host. Never expose a shared mutable account to all public visitors.

Do not promise writable offline operation merely because assets are cached. Fixture/rehearsal tutor mode can work without the model provider while the local application host remains running. True offline browser publication is a separate capability to verify and is not required for this demo.
