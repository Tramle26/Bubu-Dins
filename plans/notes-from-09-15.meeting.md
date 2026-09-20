# Lesson planning for student activities

Tue, 15 Sept 26

#### App Concept: AI Jackpot Financial Education Platform

- Gamified financial literacy app targeting middle school, high school, and college students
- Map-based world (“Storyworld”) with clickable buildings: bank, college, supermarket, hospital, shopping mall, house
- Students earn in-game currency by completing lessons, then spend it in scenario simulations
- Demo will target college students only, with other age groups mentioned as directional
- Characters:
  - Dr.Bos: AI teaching assistant, quizzes and evaluates students
  - Bubu: companion character, gives short motivational nudges and tips (holds up signs)

#### Lesson and Activity Structure

- Lessons organized by topic (stocks, credit cards, investing, mortgages, etc.)
- Each lesson has three activity types:
  1. Instructional content (text, graphs, widgets)
  2. Practice/project-based activity
  3. Review
- Show only 3-5 activities at a time to avoid overwhelming students
- Agent (Dr.Bos) drills students with questions; passing the quiz earns coins
- Bubu provides light encouragement, not specific guidance

#### Demo Scope and Presentation Plan

- Presenting at a hackathon (Virginia Tech); judges include Capital One and Deloitte as sponsors
- Demo from laptop in landscape/iPad aspect ratio, not mobile, for projector clarity
  - Mobile responsiveness is a future goal, not demo priority
- Assume user is already logged in as a college student; skip auth flow
- Show only 2-3 focused scenarios, not the full app
- Recommended scenarios to showcase:
  1. Renting vs. buying (house/car, leaning toward house)
  2. Investment simulation (aligns with sponsor interests)
- Use fictional stocks and company names (e.g., “Bobo Incorporated”) to avoid real financial advice
- Each building in Storyworld offers a distinct simulation:
  - Bank: stocks, Roth IRA, 401k
  - College: education investment, career
  - Supermarket: grocery budgeting
  - Hospital: insurance
  - House: mortgage (15 vs. 30 year, down payment decisions)

#### Pathwright Integration

- Pathwright (PathMX) will scaffold the lesson and agent infrastructure
- New version supports custom plugins, which will handle game-like UX and the AI chat/quiz agent
- Mark will provide a repo template with:
  - Agent plugin setup and reference
  - Game-like Layout with example lesson + map
  - Guided doc for the team and agents to follow
- AI chatbox should be finance-scoped: no off-topic answers, visual explainers (graphs) where possible
- Reference: Ada agent from Mark’s Project 3 as a model for the quiz/iteration flow
- Team should feed the agent a finance textbook or relevant GitHub repos for grounding

#### Next Steps

- **Send sketches and mood board to Mark**
  - Provides visual and structural context for the Pathwright scaffold and UI direction.
- **Scaffold Pathwright repo template with agent and plugin setup** (Mark)
  - Include chat quiz plugin, agent reference, and guided doc; send tonight.
- **Share AI chat conversation with Dr.Bos mascot reference**
  - Helps Mark understand the character and tone for the agent setup.
- **Have teammate send map document and finance content**
  - Map doc was not shared as promised; finance textbook or GitHub repo also needed for agent grounding.
- **Check in on Wednesday evening via Zoom**
  - Mark is at a conference until ~4pm; available in the evening to troubleshoot or hack on setup together.
