---
title: Project workspace
---

[@layout]: ../layouts/work.layout.md

# Project workspace

Open [Workspace](/project-workspace.page) from the main navigation.
Choose My project or Community project: each has a separate draft. Add a title,
notes, material links, and up to 12 tasks. Task checkboxes track project to-dos,
not lesson completion. Tasks create an ordered, selectable flowchart. Enter three
allocation amounts in a common unit to draw a proportional Sankey diagram.

The Dr.Bos tab prepares an editable request using the title, notes, and tasks.
Copy it into the existing chat overlay and send it after reviewing. Chat uses the
existing server-side provider and requires sign-in; there are no simulated replies.
An existing question is preserved until the learner clears it.

Drafts use browser localStorage, separated by learner and project type. They are
not synced, encrypted, or a replacement for shared team storage. Guest drafts are
shared on the same browser. Export project notes to download a Markdown copy.
Reload retains the draft; live updates retain the selected tab and draft fields.
Task changes do not award completion, grades, or coins.

The community hub is an external link supplied by the team. Case imports, discussion,
shared editing, attachments, multiple projects per type, and automatic chat context
transfer remain future work. Agree on actual case briefs and goals before adding them.

Implementation: `plugins/game/workspace.ts`, `plugins/game/workspace-client.ts`,
`paths/project-workspace.page.md`, and the workspace styles in `paths/styles/global.css`.
