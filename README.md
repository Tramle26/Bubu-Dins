# Bubu learning-game starter

A PathMX starter for a student team building a playful learning experience.
It includes a polished home, a three-stop housing journey, real saved learner
completion, and a small Storyworld. The team owns the actual course and gameplay.

## Run it

Install [Bun](https://bun.sh) 1.4.0 or newer, then:

```sh
bun install --frozen-lockfile
bun run dev
```

Open **http://localhost:3017/**. Choose **Sign in**, then **Annastasiia** or **Lilia**.
Each learner has separate progress. No API keys are needed for the starter.
The packages are pinned; this repository does not require a sibling PathMX checkout.

For Mark’s local HTTPS route, use the built-in development admin login:

```sh
pathmx-route add bubu 3017
bun run dev --admin /people/alex.user --admin-origin https://bubu.pathmx.dev
```

Open **https://bubu.pathmx.dev/**, sign in, then select **Annastasiia** or **Lilia**
in the local admin bar to test learner permissions. This is a local development
setup; the default localhost learner picker does not accept custom hostnames.

Open **Learn**, select the first map stop, read the lesson, and check its completion
control. Close the overlay: the next stop is now available. Refresh to check that
progress is saved. Signing out does not delete it. Development sessions may require
sign-in again after a server restart; the saved files remain.

```sh
bun run check      # authored Sources and links
bun run typecheck  # project Plugin types
bun run test       # curriculum/progress regression checks
```

## Build your part

Open the [Team Work path](http://localhost:3017/work.path) in your running app for
the guided sequence, agent prompts, and demo checklist. The game footer links to it too.

- [Building guide](paths/work/building.guide.md): add a lesson, screen, or activity.
- [Art and sprites](paths/work/art.guide.md): repeatable prompts and asset QA.
- [Character guide](paths/work/characters.guide.md): Bubu and Dr.Bos.
- [Agent instructions](AGENTS.md): shared guidance for any coding agent.

Try asking your agent: “Read AGENTS.md. Help me add a housing practice activity.
Show me the learner experience first, then make one small working change.”

## What is real, and what is left to build?

Real: Markdown lessons, Source overlays, local learner sign-in, private saved
Completion Sources, a live progress map, and a completion badge worth 100 learning
coins. Coins are derived from completed lessons; there is no spendable wallet.
Learn and Review use self-acknowledgment. Housing Try it uses Dr.Bos's AI feedback
against four beginner-friendly criteria, with unlimited revisions; passing all four
records completion. See [practice expectations](paths/work/housing-practice.guide.md).

Student work: deepen the lesson content, build the investing journey, create
simulations, refine Storyworld, and configure Dr.Bos’s AI provider and select textbook sources.
The House remains a short authored prompt. The Bank includes a server-side Capital One Nessie sandbox dashboard when `NESSIE_API_KEY` is configured, plus the original investing decision practice.

For maintainers: [handoff and PathMX follow-ups](docs/HANDOFF.md).

## Optional AI

On a fresh checkout, build the PDF reference index before using Dr.Bos or running
the full test suite. This generated file is intentionally not committed:

```sh
python3 -m venv .venv-materials
source .venv-materials/bin/activate
python -m pip install -r scripts/materials-requirements.txt
bun run materials:index
```

Restart the app after rebuilding the index. See the [AI setup guide](paths/work/ai-setup.guide.md)
for credentials and reference-library limitations.

Character instructions live in `paths/characters/*.agent.md`. Dr.Bos chat is available from the top bar; AI replies require server configuration. See [AI setup](paths/work/ai-setup.guide.md) before configuring optional
Gemini credentials in a private `.env` file.
The [Dr.Bos integration guide](paths/work/dr-boss-chat.guide.md) explains the native
thread prototype; [visual examples](http://localhost:3017/work/dr-bos-demo.page) work without AI.

## Sharing your project

Run `bun run dev` from this project folder and open the localhost address printed
in your terminal (port 3017 by default). Keep that terminal running while you work;
press Ctrl+C to stop the server.

Local account switching works only on localhost. Before hosting the project for
others, configure [PathMX authentication](https://docs.pathmx.dev/docs/accounts/auth.reference)
and persistent storage for saved learner progress. Use your deployment's URL for
its origin settings. Do not expose a development account chooser publicly.

The [Dr.Bos team guide](paths/work/dr-boss-chat.guide.md) owns chat architecture,
visual components, safe extension recipes, and the browser verification checklist.
