---
title: Portfolio board
---

[@layout]: ../layouts/work.layout.md

# Portfolio board and lessons

The map remains the supplied reference composition: `paths/assets/portfolio-reference.png`, `plugins/game/portfolio-board.ts`, and `paths/styles/portfolio-board.css`. Phones can pan across the same seven visible stops. The progress line reads saved PathMX Completion.

The first six ordered links in `paths/portfolio.path.md` each open exactly one local section:

| Stop | Lesson source | Local section |
| --- | --- | --- |
| 1. Start | `learn.lesson.md` | What is a portfolio? |
| 2 | `money-jobs.lesson.md` | Manage your money |
| 3 | `accounts.lesson.md` | All about bank fees |
| 4 | `credit.lesson.md` | Build your credit |
| 5 | `loans.lesson.md` | Student loans and debt payment |
| 6 | `paycheck.lesson.md` | Paycheck and taxes |

The supplied *Building Your Financial Portfolio* artifact was retrieved on 2026-09-20. Its six sections, sorting and matching exercises, ordering activity, charts, credit simulation, loan explorer, and paycheck comparison live in `plugins/game/portfolio-artifact/reference.js`. This is an adapted local snapshot, not a remote embed or a live mirror. The source URL is retained in its code comment for provenance. No learner-facing artifact links, external scripts, or artifact navigation remain.

`plugins/game/portfolio-section.ts` admits the six known section IDs. It uses PathMX `defineAppComponent` so live completion updates preserve the interactive controls. Its client mounts the selected section with the project's installed React. `paths/styles/portfolio-lesson.css` contains the imported chart styles and a Bubu skin with locally hosted Nunito and Fredoka fonts, shared icons, cream cards, green controls, and gold section numbers. The Markdown lesson owns its Source identity and completion control.

## Completion and banking

Activity answers and feedback last for the visit only. They never award coins or save a second progress record. PathMX Completion stores the learner's separate acknowledgment. Existing learner records keep their Source IDs. Try it and Review remain the last two Bubu completion items, with Review reached from Try it. The existing six-session credit rule remains $20 each, up to $120.

`plugins/game/portfolio-artifact/sandbox.jsx` replaces the artifact's mock bank and browser credential integration. The account, credit, and loan sections request only `GET /api/bubu/nessie-portfolio` with the learner's session. Each shows only the matching data. API keys remain on the server; these lessons do not create accounts, send purchases, or change loans. Unconfigured, signed-out, failed, and empty responses are explicit and never grant completion.

Rates, tax parameters, and credit-score estimates are the supplied snapshot's teaching assumptions, not verified current quotes or personalized advice. The paycheck tool retains the snapshot's simplified single-filer model. Updating that model requires checking the cited primary tax sources.

## Check the integration

Run `bun run check`, `bun run typecheck`, and `bun run test`. The section tests verify one section per lesson, browser ownership during completion renders, calculator invariants, and the absence of secondary persistent progress.

Open every numbered stop from `/portfolio.path`. Check sorting with Enter and the labeled column buttons, matching and ordering feedback, slider updates, and the paycheck comparison. Check desktop and phone layouts, Escape and focus return, sign-in, live completion updates, and persistence after reload. Reopening an activity clears its practice answers but keeps its separate Completion acknowledgment.
