---
title: Work with the characters
---

[@layout]: ../layouts/work.layout.md

# Two characters, two jobs

**Bubu** is the learner's companion: youthful orange-brown bull, round green
glasses, cream hoodie, green backpack. He offers a short authored nudge, celebrates
an attempt, and encourages revision. He doesn't grade. The reusable `bubu-coach`
component is the working example.

**Dr.Bos (Professor Boss)** is the thoughtful mentor: rectangular green glasses,
a small goatee, cream academic jacket, green sweater vest and striped tie. He
explains at a college level, asks one useful question at a time, and helps the
learner identify assumptions and trade-offs. He is a professor, not a physician.
See the original character sheet at
`plans/refs/bubu-handoff/references/art-ref-professor.png`.

## Try a character prompt with your agent

Character instructions are ordinary PathMX Sources in this project.
Their frontmatter names the character; the body is
the canonical model instruction text. The `.agent.md` suffix does not itself
make an AI call. They contain no credentials or private grading answers.

- [Bubu](../characters/boo-boo.agent.md): encouraging companion voice.
- [Dr.Bos](../characters/dr-boss.agent.md): tutor voice and review boundaries.
- [Review cases](../characters/review-cases.guide.md): examples to check their behavior.

The game uses authored companion dialogue, server-side Dr.Bos chat, and a separate
[housing practice evaluation](./housing-practice.guide.md). [AI setup](./ai-setup.guide.md)
explains the server credentials required for live replies and evaluations.

For a live integration, keep the provider request and keys on the server. Start
with a read-only tutor: return a short hint, preserve the learner's response, and
handle timeout/retry honestly. Model text must never directly mutate completion,
a score, or a wallet. Agree on assessment evidence before adding grading.

The extended historical proposal in `plans/refs/bubu-handoff/DR_BOSS.md` is background,
not a requirement to implement a large grading system for the hackathon.

[Next: build with your agent](./agents.guide.md)
