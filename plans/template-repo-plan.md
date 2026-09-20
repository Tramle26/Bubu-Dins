# Bubu template repo plan

## Goal

Give Tram's team a runnable PathMX starter that demonstrates the complete
learn → practice → review → earn → apply loop. Housing is the working example;
investing is added through the same authoring and state pattern. The demo is
college-focused and readable on a landscape laptop or projector.

## Build sequence

1. **Lock the screen language.** Use `plans/screen-prototypes/` to define the
   shared shell, cards, map/journey layers, tutor panel, controls, and responsive
   behavior. Translate the references into HTML/CSS/SVG primitives and a short
   asset list before generating production art.
2. **Establish the repo and integration audit.** Add the project package,
   lockfile, configuration, Git ignore rules, and useful `AGENTS.md`/README.
   Verify the installed PathMX layout, Path, component, Action, Actor, storage,
   and plugin contracts. Record real commands and the status of the Ada tutor
   reference and provider credentials in `docs/integration-audit.md`.
3. **Build one durable housing slice.** Author three linked Markdown activities
   (Learn, Try it, Review), a topic journey, and a House entry. Use one housing
   calculation engine in guided practice and the independent scenario. Save
   learner answers and results; grant +100 coins once after an accepted review
   and charge 40 coins once when the learner confirms House access. Refresh and
   replay must preserve progress without repeating either transaction.
4. **Make the game shell useful.** Add Home, Storyworld, Collection, three
   custom layouts, and a list alternative to the illustrated maps. House and
   Bank have clear destinations; College leads to lessons; the other buildings
   are labelled previews. Controls, labels, roads, and charts stay HTML/SVG.
   Use temporary art placeholders until character and world assets are reviewed.
5. **Connect Dr.Bos.** First prove one server-side provider request and a
   private learner-scoped write. Then use topic packets, authored rubrics, and
   validated evaluator output. Application code decides pass/reward; Bubu
   uses short authored messages. Keep an explicitly labelled rehearsal mode.
6. **Add investing as the extension example.** Author its three activities and
   Bank scenario using the existing progress, wallet, tutor, and run services.
   Use the handoff's deterministic fictional event path; do not credit market
   gains to the coin wallet.
7. **Verify and hand off.** Run repository checks and the applicable items in
   `ACCEPTANCE.md`; inspect 1366×768 and 1024×768 screens. Provide startup,
   reset/demo presets, an authoring guide, asset provenance, and a short demo
   script. Report any unrun or blocked acceptance items plainly.

## Team-ready checkpoint

After step 3, the repo should start from a frozen lockfile and complete the
housing loop with honest placeholder art and a labelled tutor fixture. That is
the first useful handoff to Tram's team. Steps 4–7 complete the presentation
demo without changing the core learning and state pattern.

## Decisions to settle during discovery

- Which installed PathMX version and host/storage mode this new repo will use.
- Whether the Ada/Project 3 tutor implementation is available to reuse.
- Which live tutor provider and reviewed finance content packets the team will use.
- Whether Tram has a newer Dr.Bos character reference; generated masters need
  visual approval before entering runtime assets.

Keep `plans/refs/bubu-handoff/` as private reference material. Its duplicated
original images and the watermarked forest reference are not runtime assets.
