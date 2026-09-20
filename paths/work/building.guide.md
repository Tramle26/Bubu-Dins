---
title: Build a playable lesson
---

[@layout]: ../layouts/work.layout.md

# Build one small playable loop

Start with `paths/lessons/housing/learn.lesson.md`. It is the complete pattern:
one idea, a fictional example, a learner prompt, an optional hint, and a saved
completion acknowledgment. Try it and Review are deliberately small examples.

## A lesson you can copy

Create `paths/lessons/housing/your-idea.lesson.md`:

```md
---
title: Your lesson title
completion:
  label: I can explain the idea in my own words.
---

[@layout]: ../../layouts/lesson.layout.md
[@styles]: ../../styles/global.css
[@game]: ../../components/game.components.md

# Your lesson title

Explain one idea with a short, fictional example.

<bubu-coach>Try one small step. You can revise your answer.</bubu-coach>

## Your move

Ask the learner to make or explain a choice.

<details>
<summary>Need a nudge?</summary>

Offer a hint, not a completed answer.

</details>

<x-bubu-completion-help />
<x-completion-outline />
<x-completion-progress />
```

The explicit stylesheet matters: Source overlays render the lesson body without
its page layout. Both its standalone route and its overlay need the same styles.
The completion control records acknowledgment, not a grade. Use stable lesson
filenames: progress follows the Source identity. Change the prose freely.

Keep `x-bubu-completion-help` beside the completion control. Signed-out readers
see one sign-in button; the misleading read-only square and progress bar are hidden.
Sign-in opens outside the overlay and returns to the same lesson. Signed-in
learners retain the normal PathMX Completion controls.

## Put the lesson on the map

Edit the ordered lesson links in `paths/housing.path.md`. The game Plugin reads
those links in order; there is no parallel JavaScript list of lesson IDs.
The first incomplete activity is the next stop. Later stops are visually locked;
completed lessons remain available to revisit. The ordinary lesson links remain
available under “All lesson links.” This is navigation guidance, not access control.

The supplied landscape has three painted stops. Replacing a lesson is immediate;
adding a fourth needs a new map layout as well as a new link. Adjust the coordinate
list in `plugins/game/index.plugin.ts` together with the art. Small screens use the
same steps as a vertical list. Never stretch/crop the road independently of its stops.

A lesson with no completion target must not count as complete. Signed-out visitors
can read but cannot save. Empty journeys award nothing.

## How progress works

`plugins/game/progress.ts` creates one PathMX Completion Plugin with `storage: "actor"`.
Every view reads its admitted learner's records through `completion.reader.summary`.
The home, map, and coin badge share this reader. There is no client counter to drift
out of sync. Completing all housing lessons derives a 100-coin badge; uncompleting
one removes that badge. Repeated visits cannot accumulate coins.

Files are saved below `paths/people/<learner>/state/completion/`. Each learner's Home
has an explicit private ownership claim. These files are ignored by Git. Keep the
Home claims when adding users. Use Annastasiia and Lilia to verify separate progress.
The package override keeps Zod at one compatible version across PathMX packages;
update it deliberately with the package set, then test a clean install.

Before adding scored activities, agree on what counts as evidence. A form submission,
a tutor message, and a learner acknowledgment are different things. Use PathMX Input
or Assessment when appropriate, and derive completion from their real saved results.
A spendable wallet needs a separate server-owned ledger; don't reinterpret the badge
as a bank balance.

## Screens and components

- `paths/index.md` imports `bubu-home` from `paths/components/game.components.md`.
  The home street and walking Bubu are decoration; headlines and topic links stay in HTML.
- `paths/layouts/app.layout.md` owns navigation and the overlay destination.
- `paths/styles/global.css` owns the palette, game layouts, and responsive presentation.
- `paths/styles/work.css` owns the Work reading styles; it is imported by global.css.
- `paths/characters/*.agent.md` owns character instructions, ready for a future server-side tutor.
- `plugins/game/index.plugin.ts` owns computed progress and SVG icons.
- `plugins/game/client.ts` only owns temporary map/list presentation; it saves no progress.

Keep `<!-- componentName: bubu-home -->` before its heading. Removing it unregisters
the component. Our small project lint check catches that mistake.

Navigation icons come from PathMX's Lucide-derived catalog. Write
`<x-bubu-icon name="map" />`; use the installed `@pathmx/core/icons` catalog to check
names. Not every name in the full Lucide library is included.

To open a new real Source inside the game overlay:

```html
<a href="/world/house.page" data-pmx-source-open="overlay">Step inside</a>
```

Keep a real link: copying, opening a new tab, and navigation without JavaScript
still work. PathMX owns modal focus, Escape, and cleanup.

## Useful agent requests

- “Help me write one worked example for this lesson. Ask me the learning goal first.”
- “Add a Try it interaction that keeps learner input intact during live updates.”
- “Use the housing example to build an investing Learn/Try/Review journey. Show me
  the proposed activities before writing all the content.”
- “Check this screen at phone and laptop widths, with keyboard-only navigation.”

Use [PathMX's current authoring docs](https://docs.pathmx.dev/docs/authoring/components.reference)
and [Completion reference](https://docs.pathmx.dev/docs/learning/completion.reference)
to verify syntax against the installed version. Historical plans are optional context.

[Next: create art and sprites](./art.guide.md)
