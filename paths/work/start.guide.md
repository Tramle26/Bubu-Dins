---
title: Start and explore
---

[@layout]: ../layouts/work.layout.md

# Start and explore

## Run your copy

Open the project folder in your editor. Install Bun if needed, then run these
commands in the project's terminal:

```sh
bun install --frozen-lockfile
bun run dev
```

Keep the terminal running and open **http://localhost:3017/** (or the address
printed by the server if you changed its port). No AI provider keys are needed. Your agent can
help with setup: ask it to read `README.md` and `AGENTS.md` first.

## Play one complete loop

1. On localhost, choose **Sign in**, then **Annastasiia**.
2. Open **Learn**, then the first housing map stop.
3. Read the example and do the activity. Use the completion control when you're ready.
4. Close the lesson. The next stop should unlock. Finish Try it and Review.
5. Refresh: Annastasiia's progress stays saved. Switch to Lilia to see a separate learner.

If you share a hosted preview, local test-account sign-in is still available only
on localhost. A restart may require signing in again, but saved progress remains.
Completion currently means the learner acknowledges doing the activity. It is not
a test score. The 100-coin reward is a completion badge, not spendable money.

## Make your first change

Edit one sentence in `paths/lessons/housing/learn.lesson.md`, save, and watch the
open lesson update. Keep its filename and completion settings intact. For home
changes, start in `paths/components/game.components.md` and keep its
`componentName` comments — those register the components.

If a preview looks blank, check the terminal and run `bun run check`. Share the
exact error with your agent before changing unrelated code.

Before building more, tell your teammate: **Who is learning, what should they be
able to do, and what choice will they practice?**

[Next: build a playable lesson](./building.guide.md)
