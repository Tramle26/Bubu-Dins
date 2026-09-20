---
title: Bank simulation with Tram
---

[@layout]: ../layouts/work.layout.md

# Bank simulation with Tram

Open Storyworld → Bank, or `/world/bank.page`. The scene reuses the supplied
[Bubu at the Bank artifact](https://claude.ai/artifact/6TRn9GJVzhfMniKa8v78Bs),
including its artwork, layout, choice drawer, notifications and three scenarios.
Its source is in `paths/components/game.components.md`, styles in
`paths/styles/bank-scene.css`, and behavior in `plugins/game/bank-scene-client.js`.

## What the numbers mean

The top badge is existing Completion-based learning credit. The $850 case budget,
$320 fictional paycheck, accounts and scenario transactions are temporary practice
numbers. Questions do not award coins or completion. Rates, fees and requirements
in the written script are illustrative case assumptions, not current bank offers.
Reload or Start over resets the visit and conversation. Saved Completion is unchanged.

## Capital One

Open **Capital One sandbox data** from the scene. This uses the existing authenticated
server route with `NESSIE_API_KEY` from private `.env`; optional `NESSIE_CUSTOMER_ID`
selects a customer. The key is never in the browser. Real sandbox records are read
only and are separate from practice records. Failed sandbox loads show an error,
not invented balances. The simulation does not create sandbox accounts or payments.
The original investing cases are preserved at `/world/bank-investing.page`.

## Tram's live chat

Written choices use the reference's authored conversation. Typed questions always
call `/api/bubu/tram-chat`; no keyword answer masquerades as a live AI reply.
Tram uses the same `GEMINI_API_KEY` as Dr.Bos. See [AI setup](./ai-setup.guide).
Restart the server after changing the key. Missing configuration shows unavailable.

Typed questions and the last six typed question/reply pairs go to Gemini. Do not
enter personal financial information. No Nessie data or API keys are included in
the prompt. Replies are displayed as text. The character's instructions are in
`paths/characters/tram.agent.md`. AI cannot change balances, Completion, or
learning credit. A failed reply does not count toward the two-question
conversation gate. That gate is navigation only, not a mastery check.

Test desktop and phone layouts, the choice drawer and notification Escape/focus
return, sign-in errors, Gemini failures, the three scenarios and reload behavior.
