# Help the team build Bubu

Bubu is a student hackathon starter, not a finished course. Help students make
small, understandable changes and explain what changed in plain language.
Ask about lesson goals or game rules before inventing them. Preserve their work.

## Start here

The student-facing Work path starts at `paths/work.path.md` (`/work.path` in the app).
Keep guidance in `paths/work/` so students and agents share the same source.

- `README.md`: install, run, sign in, and check the project.
- `paths/work/building.guide.md`: copyable lesson, screen, and completion patterns.
- `paths/work/art.guide.md`: character references, image prompts, and sprite checks.
- `paths/work/characters.guide.md`: Bubu and Dr.Bos roles and tutor-extension boundary.
- `paths/characters/*.agent.md`: canonical character names and model instructions.
- `paths/work/ai-setup.guide.md`: optional credentials and server-side tutor boundaries.
- `paths/work/dr-boss-chat.guide.md`: chat/thread architecture, chart extension recipe, and interaction checks.
- `plans/refs/`: historical design/reference material, not a required implementation checklist.

## Working rules

- Use the installed PathMX: `bun run pmx --help`, `bun run check`, and its [public docs](https://docs.pathmx.dev/).
  Verify APIs; do not invent PathMX tags, directives, or packages.
- Lessons live in `paths/lessons/` as Markdown. Reusable HTML belongs in
  `paths/components/game.components.md`; keep every `componentName` comment.
  Inside a component, `html`, `css`, and `js` fences execute; use `md` fences for examples.
- Keep progress in PathMX Completion. Do not add localStorage progress, fake grades,
  a second wallet, or an automatic pass when an AI request fails.
- A browser interaction alone does not mean a lesson is complete. The starter's
  completion is a learner acknowledgment, not evidence of mastery or an AI grade.
- Use the existing palette, shared icons, semantic links/buttons, and Source overlays.
  Generated images never contain interface labels, clickable controls, or charts.
- When writing learner-facing copy, follow the character language in
  `paths/characters/*.agent.md` (especially Dr.Bos voice). Do not use em dashes
  (`—`) or `---` as punctuation in sentences. Use a period, comma, colon, or
  parentheses. YAML frontmatter and Dr.Bos Block separators still use a line of
  `---` where PathMX requires it.
- Keep changes small. Prefer one working example over a new abstraction. Don't build
  the students' whole course or simulations unless they ask.
- Never put API keys in Markdown, client scripts, prompts, or commits. Future AI
  providers run server-side and cannot directly award completion or coins.
- Before finishing: `bun run check`, `bun run typecheck`, and `bun run test`.
  Open the affected screen at desktop and phone widths. Check keyboard use, Escape,
  focus return, reload persistence, and live updates for interaction changes.

When reporting back, name the files changed, how to try the result, and what is
still a placeholder. Keep it brief. Do not commit personal progress from `paths/people/*/state/`.
