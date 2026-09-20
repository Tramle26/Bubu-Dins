---
title: Connect the characters to AI
---

[@layout]: ../layouts/work.layout.md

# Connect the characters to AI

Housing **Try it** now uses a separate server-side evaluation with the same
credentials and model. See [practice expectations](./housing-practice.guide.md).
It saves learner answers and feedback privately and derives a practice pass through
PathMX Completion only after all four criteria are met. Chat cannot grant a pass.

The starter runs without AI credentials. Dr.Bos now has a chat interface and a
server-side provider connection, which stays unavailable until configured.
Bubu still uses authored content.

Copy `.env.example` to a private `.env` only when configuring a service. Never put
keys in Markdown, browser scripts, screenshots, prompts, or commits.

## One Gemini key for Dr.Bos

Set `GEMINI_API_KEY` in a private `.env`. Chat, housing Try it, and investing
review all use that key through Gemini's OpenAI-compatible Chat Completions API.
Create the key in [Google AI Studio](https://aistudio.google.com/apikey).

Optional model overrides:

- `DR_BOSS_MODEL` (default `gemini-2.5-flash`) for housing/investing evaluation
- `DR_BOS_CHAT_MODEL` for chat only; otherwise chat uses `DR_BOSS_MODEL`

Restart the server after changing credentials. Local sign-in may need to be repeated.
Changing the chat model does not change the evaluators. Use a Gemini model ID
that supports streaming text.

The [chat integration guide](./dr-boss-chat.guide) explains saved private threads,
visual components, validation, request limits and the current prototype boundaries.
Messages, relevant lessons and retrieved PDF excerpts go to the configured provider;
provider retention follows its policy.

## Build or update the reference library

Install Python 3, then run these commands from the project root:

```sh
python3 -m venv .venv-materials
source .venv-materials/bin/activate
python -m pip install -r scripts/materials-requirements.txt
bun run materials:index
```

Activate that environment again before future indexing runs. Restart the app after indexing.
Run this after adding, replacing, or removing a PDF, and on each fresh deployment.
The generated `materials/search-index.json` stays server-side and is ignored by Git;
deploy it alongside the app or generate it during setup. A missing index returns
an unavailable response rather than silently answering without references.

This is local keyword retrieval (BM25), not model training or semantic search.
Only matching excerpts are sent to the existing AI provider with the conversation.
The full PDF collection is not uploaded. `[M1]` references are resolved by the
server to real filenames and physical PDF pages; these may differ from printed
page numbers. Incorrect reference identifiers are rejected, but valid citations
do not guarantee that the model's claims are supported: review answers against
the cited pages. No system can promise zero hallucinations.

The indexer reports short or empty pages in `skippedPages` for each document.
Image-only pages, diagrams, and scanned tables need OCR or reviewed text before
Dr.Bos can use them reliably. Keyword search may miss paraphrases. The tutor is
instructed to acknowledge missing evidence and distinguish author opinions,
historical figures, and jurisdiction-specific information from general concepts.

Try questions about compound interest, budgeting, diversification, and insurance.
Check the cited PDF pages. Also ask an unrelated question and verify that Dr.Bos
acknowledges the lack of supporting material. `bun run test` checks retrieval and
reference validation; live answer quality still needs review with an API key.
