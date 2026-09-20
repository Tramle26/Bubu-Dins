---
title: Build with your agent
---

[@layout]: ../layouts/work.layout.md

# Build with your agent

Use whichever coding agent you know. `AGENTS.md` at the project root contains
shared instructions; if your tool doesn't load it automatically, ask it to read
that file. These Work guides are ordinary Markdown in `paths/work/`, so both you
and your agent can read and improve them.

When you ask an agent to write lesson copy, screen text, or character dialogue,
tell it to follow the language in `paths/characters/*.agent.md`. Do not let it
use em dashes (`—`) or `---` in sentences. PathMX frontmatter still starts and
ends with `---`.

## Give it a small, clear task

Copy this and replace the brackets:

```text
Read AGENTS.md and the relevant guides in paths/work/.
Our learner is [who]. They should learn to [one specific action].
Help me change [one lesson or screen] so they can [practice or interaction].
Ask me about any learning goals or game rules that are missing.
Use the existing housing example and installed PathMX patterns.
Make one small working change, explain it, and show me how to try it.
Leave the rest of the course for our team.
```

You own the learning goal and game rules. Ask the agent to explain unfamiliar
code in plain language, and ask for a simpler version when you can't follow it.
Before accepting a change, try the learner experience yourself.

## Useful focused requests

- “Read the housing lesson. Suggest one practice choice that tests its idea without adding new concepts.”
- “Help me turn this Storyworld room into one choice and consequence. Show the proposed interaction first.”
- “Use the art guide to write a new sprite prompt. Keep Bubu's identity and check real transparency.”
- “Check this screen on a phone and with only a keyboard. Fix the first usability problem you find.”
- “Explain which files changed, how to try the result, and anything still unfinished.”

## Work together

Pick different files when possible. Tell your agent which files another teammate
is editing. Don't replace their work to resolve an error. Keep personal learner
state and secrets out of commits. Ask for help before adding a new service,
changing completion rules, or introducing a paid dependency.

[Next: check and demo](./demo.guide.md)
