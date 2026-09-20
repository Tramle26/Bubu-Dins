---
title: Lesson planning for student activities — user-supplied transcription
meeting_date: 2026-09-15
source: pasted by Mark in the conversation
status: transcription; names and some words may be inaccurate
---

# Lesson planning for student activities

Tue, 15 Sept 26

## App Concept: AI Jackpot Financial Education Platform

- Gamified financial literacy app targeting middle school, high school, and college students.
- Map-based world (“Storyworld”) with clickable buildings: bank, college, supermarket, hospital, shopping mall, house.
- Students earn in-game currency by completing lessons, then spend it in scenario simulations.
- Demo will target college students only, with other age groups mentioned as directional.
- Characters: Dr.Bos is an AI teaching assistant who quizzes and evaluates students. Bubu is a companion who gives short motivational nudges and tips and holds up signs.

## Lesson and Activity Structure

- Lessons organized by topic: stocks, credit cards, investing, mortgages, etc.
- Each lesson has instructional content (text, graphs, widgets), practice/project-based activity, and review.
- Show only 3–5 activities at a time to avoid overwhelming students.
- Dr.Bos drills students with questions; passing the quiz earns coins.
- Bubu provides light encouragement, not specific guidance.

## Demo Scope and Presentation Plan

- Presenting at a hackathon at Virginia Tech; notes identify Capital One and Deloitte as sponsors/judges.
- Demo from a laptop in landscape/iPad aspect ratio for projector clarity. Mobile responsiveness is a future goal, not demo priority.
- Assume the user is already logged in as a college student; skip auth flow.
- Show only 2–3 focused scenarios, not the full app.
- Recommended scenarios: renting versus buying (house/car, leaning toward house), and an investment simulation.
- Use fictional stocks and company names, such as “Bobo Incorporated,” to avoid real financial advice.
- Building directions: Bank—stocks, Roth IRA, 401(k); College—education investment/career; Supermarket—grocery budgeting; Hospital—insurance; House—mortgage term and down-payment decisions.

## Pathwright / PathMX Integration

- PathMX will scaffold lesson and agent infrastructure.
- Custom plugins handle game-like UX and the AI chat/quiz agent.
- Mark will provide a repo template with agent plugin setup/reference, game-like layout with an example lesson/map, and guided documentation for the team and agents.
- Finance-scoped AI chatbox; no off-topic answers; visual explainers/graphs where possible.
- Reference: Ada agent from Mark’s Project 3 as a model for quiz/iteration flow.
- Ground the agent in a finance textbook or relevant GitHub repos.

## Next Steps Recorded in the Meeting

Send sketches/mood board to Mark; scaffold the repo template; share the AI conversation and Dr.Bos reference; obtain the teammate’s map document and finance content; check in Wednesday evening via Zoom after Mark’s conference commitments.

These are historical planning notes. This handoff does not schedule meetings, send messages, inspect the unnamed repository, or claim those items have been completed.
