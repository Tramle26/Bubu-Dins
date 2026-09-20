These notes make the project much more specific. **The core is an AI-guided “learn → demonstrate understanding → earn → apply” loop, presented through a game-like world.** The illustrations, lesson path, tutor, and simulations all support that loop.

I would revise two important parts of my earlier proposal: **Dr.Bos belongs in the first demo, and the currency should be usable in simulations—not merely cosmetic.** I’d also replace the grocery-budgeting starting point with the housing and investment scenarios from the meeting, and design for a landscape presentation rather than mobile.

Here’s the updated direction I’d use for the scaffold.

## 1. Define the demo around one promise

> **Students learn a financial concept, demonstrate their understanding to Dr.Bos, and use what they earn to explore financial decisions in a fictional world.**

That gives the hackathon presentation a coherent story rather than a tour of several loosely related features.

| Decision               | Demo scope                                                          |
| ---------------------- | ------------------------------------------------------------------- |
| **Audience**           | A college student, already signed in                                |
| **Presentation**       | Laptop / landscape tablet composition, readable on a projector      |
| **Content**            | Two focused topics: housing decisions and investing                 |
| **Learning structure** | Instruction → practice → review                                     |
| **World**              | One illustrated town; House and Bank are playable                   |
| **AI**                 | Dr.Bos teaches, questions, and evaluates within the current topic |
| **Companion**          | Bubu offers brief encouragement, not tutoring                    |
| **Progression**        | Passing a review earns currency that can fund simulation choices    |

Middle school, high school, additional buildings, and mobile layouts remain **directional—not partially implemented promises**.

I’d leave the product name provisional because “AI Jackpot” may be a transcription issue. For the working specification, the character names can follow the notes: **Dr.Bos** and **Bubu**, with the illustrated _bubu_ branding reconciled later.

## 2. Clarify how lessons and Storyworld connect

The cleanest distinction is:

**Lessons are guided preparation. Storyworld is independent application.**

A lesson introduces a concept, lets the student practice it, and checks understanding. The corresponding building lets them use that concept in a situation with choices and consequences.

The full loop becomes:

**Choose a topic → learn → practice → review with Dr.Bos → earn coins → enter a Storyworld scenario → make a decision → inspect the outcome → explain or revise.**

### Avoid building two versions of every activity

The practice activity and the Storyworld simulation should use **the same underlying interaction**, configured differently.

For example:

| Guided housing practice          | Independent House scenario                             |
| -------------------------------- | ------------------------------------------------------ |
| Fixed starting assumptions       | A choice of starting circumstances                     |
| Prompts explain each control     | Student decides which controls matter                  |
| One comparison at a time         | Several consequences shown together                    |
| Immediate instructional feedback | Prediction first, outcome second, reflection afterward |

That is both a scope reduction and an authoring advantage: the team builds one housing simulator, not a lesson widget plus an unrelated housing game.

### Make the path match the three-part structure

For each topic, the initial path can contain exactly three prominent stops:

**Learn → Try it → Check understanding**

There is no need for an enormous winding road in the demo. Show the current topic’s three stops, perhaps with the next topic hinted at beyond them. That preserves Tram’s “3–5 activities at a time” constraint.

The path should answer **“What comes next?”** The town should answer **“Where can I use this?”**

## 3. Give the two characters sharply different jobs

This distinction is stronger than my earlier suggestion of two loosely differentiated mascots.

### Dr.Bos: the instructional agent

Dr.Bos should know the current lesson, learning objectives, student response, relevant source material, and current simulation state.

A proposed review interaction:

> **Dr.Bos:** “Two options have different monthly payments. What else would you need to compare before choosing?”
>
> **Student:** “How much I pay overall.”
>
> **Dr.Bos:** “That matters. Name one cost outside the loan payment that you would include.”

The agent should ask **one question at a time**, diagnose a missing concept, provide a bounded hint, and ask a follow-up. Once the student satisfies the authored criteria, the application records a passing result.

I would make its role contextual rather than opening with a blank chatbox. The panel might begin with **“Ready to check your understanding?”**, a specific question, or **“Ask about this chart.”**

### Bubu: encouragement and atmosphere

Bubu should use short, mostly authored messages:

> “One step at a time.”
> “Ready for another try?”
> “You finished this topic!”

Bubu should not explain mortgage calculations, suggest portfolio allocations, or contradict Dr.Bos. For the demo, it does not need its own model calls. An event-to-message mapping is sufficient: activity started, answer submitted, retry available, topic passed, scenario completed.

That gives the two characters distinct purposes while keeping cost and behavior predictable.

## 4. Build two scenarios, but make one the primary demonstration

I’d make **housing the primary end-to-end demonstration** and investing the second example that proves the approach generalizes.

### House: “Rent or buy after graduation?”

**Learning goal:** Identify relevant costs and explain a choice under stated assumptions—not discover that renting or buying is universally superior.

Start with a fictional graduate deciding where to live. Give the student a few controls: expected time in the home, down payment, and a choice between two loan terms. Keep other assumptions visible but fixed initially.

The outcome panel should distinguish **monthly cash requirements, upfront cash, remaining savings, and equity**. A housing comparison needs more than rent versus the mortgage payment: ownership can involve taxes, insurance, maintenance, transaction costs, and uncertainty about the property’s future value. The CFPB also emphasizes that assumptions and expected time in the home can materially change a rent-versus-buy comparison. ([Consumer Financial Protection Bureau][1])

For the demo, I would deliberately keep the model small and label its exclusions. **Do not display a definitive “buying wins” result from a model that omits important costs.**

A useful interaction would be:

> “You now expect to move after two years instead of seven. Before changing the slider, predict which parts of your comparison will change.”

That creates something meaningful for Dr.Bos to evaluate.

The **15- versus 30-year mortgage comparison can live inside this scenario** rather than becoming a third separate feature.

### Bank: “Build a fictional portfolio”

**Learning goal:** Explain allocation, concentration, and uncertainty—not pick the stock that happens to rise fastest.

The student allocates simulated funds among a small set of fictional options: perhaps two companies, a diversified fund, and cash. They state a goal or prediction, advance through a few authored market events, and inspect what happened.

Time horizon, risk tolerance, and diversification are appropriate concepts to ground this scenario in; Investor.gov describes them as interconnected considerations rather than one universally correct allocation. ([Investor.gov][2])

I would use **predefined market sequences for the demo**, with every portfolio evaluated against the same sequence. The AI must not invent market movements in response to the student’s choice.

Most importantly, **passing should depend on the explanation, not the ending balance**. A student should not fail because a thoughtful decision encountered an unfavorable simulated outcome, or pass simply because a concentrated bet got lucky.

Fictional companies help keep the exercise separate from real product recommendations. The interface should also clearly label the prices, returns, and events as invented scenario data—not forecasts.

## 5. Make the AI conversational, but keep its authority narrow

I would separate three responsibilities:

| Responsibility                                       | Owner                            |
| ---------------------------------------------------- | -------------------------------- |
| Ask questions, explain, identify misconceptions      | Dr.Bos                         |
| Calculate payments, balances, and simulated outcomes | Tested application code          |
| Record completion, grant coins, and deduct spending  | Validated application operations |

**The model can explain the calculation; it should not be the calculator or the wallet.**

For visual explanations, let Dr.Bos request an approved chart type with validated parameters. The application renders it from known data. Do not have the agent generate arbitrary executable chart code or improvise numbers.

### Use authored review criteria

Each review needs a small rubric: what the learner must demonstrate, likely misconceptions, allowed hints, and the condition for another attempt.

The evaluator can return a structured result containing the criterion, supporting evidence from the student’s response, feedback, and whether more evidence is needed. Application code should validate that result and enforce the progression rule. This makes the decision inspectable; it does not make model evaluation infallible.

PathMX’s ordinary Assessment completion is submission-based, while correct-answer scoring is separate. Consequently, **“submitted,” “passed,” and “reward granted” need to remain distinct in this application** rather than mapping every completion event to coins. ([PathMX][3])

I’d use the Ada reference to implement the questioning-and-revision pattern, but I would not assume a particular existing agent API until the actual Project 3 implementation is supplied.

### Ground each topic with a small content packet

Rather than starting by feeding an entire textbook or repository into the agent, prepare a compact packet for each demo topic:

**Learning objectives, reviewed explanations, source references, scenario assumptions, and an evaluation rubric.**

A textbook can inform those packets. Code repositories can provide implementation examples. Neither should be treated as automatically authoritative without review.

During a lesson, Dr.Bos should receive only the relevant packet and state. Off-topic questions should get a brief redirection; questions requiring unsupported facts should get an explicit limitation rather than invented guidance.

## 6. Retain the earned-currency loop without making mistakes expensive

The meeting notes make currency part of the experience, so I would preserve that.

The key distinction is between **learning-earned currency** and **what happens to funds inside a simulation**.

Coins can fund purchases or allocations in Storyworld, with a clearly disclosed conversion or starting-budget rule where needed. A housing scenario, for example, should not obscure the scale of a mortgage by treating a few quiz coins as literal real-world dollars.

I’d apply three rules:

**Award once.** Passing the same review again must not repeatedly grant the original reward.

**Keep learning progress.** Losing simulated investment value must not erase demonstrated understanding.

**Permit retries.** A student should not need to grind quizzes to recover from an educational experiment.

For the hackathon, I would avoid transferring investment profits into a persistent cross-world economy. Let the investment result belong to that scenario run. Otherwise, the team has to design a financial game economy in addition to the learning experience.

The implementation should record grants and spending as identifiable transactions, not merely modify a number in the browser. PathMX Actions provide a documented boundary for validated operations and bounded writes; the reward and spending rules would be project-specific code on top of that. ([PathMX][4])

## 7. Scaffold three layouts and a small set of reusable components

I would not build a separate frontend application alongside PathMX unless the first integration experiment reveals a concrete need.

The current documentation supports custom `.layout.md` Sources and reusable literate `.components.md` definitions containing markup, styling, and browser behavior. Those fit the presentation layer you described. ([PathMX][5])

### The three layouts

**Game layout:** Home, topic selection, learning path, and Storyworld. Shared navigation and wallet display; large illustrated content area.

**Lesson layout:** Instruction or practice in the main area, with Dr.Bos beside it. Bubu appears occasionally without competing for attention.

**Scenario layout:** Large interactive workspace, visible assumptions and outcomes, and a contextual Dr.Bos panel.

Use the illustrated assets for characters, buildings, and scenery; SVG for roads, connectors, and charts; and actual HTML controls for everything clickable or editable.

The existing Bubu references supply a coherent cream, green, orange, and brown visual direction. I’d carry that into the interface rather than mixing it with the forest reference’s different rendering style.

### The plugin boundary

I’d keep the custom code divided conceptually into:

| Area                       | Responsibility                                                  |
| -------------------------- | --------------------------------------------------------------- |
| **Game progression**       | Wallet, unlocks, map state, scenario runs                       |
| **Dr.Bos integration**   | Conversation context, model adapter, evaluation, approved tools |
| **Simulation logic**       | Housing calculations and fictional market sequences             |
| **Literate UI components** | Cards, markers, character messages, panels, feedback            |

These can be modules within a small plugin setup; they do not need to become separately published packages.

PathMX’s plugin guide explicitly positions TypeScript plugins as the extension point for computed output, domain operations, and integrations, while authored components handle reusable presentation. ([PathMX][6])

### Treat landscape as the design target

I’d verify the important screens in both a **4:3 landscape composition and a typical widescreen laptop viewport**. Avoid simply shrinking a fixed illustration until all the text becomes unreadable.

The path should show only a few large stops. The scenario should have one primary chart and one clear action. The tutor panel should show the current exchange prominently rather than a long, tiny transcript.

Mobile can wait; basic keyboard operation and clear control labels do not need to.

## 8. Make the scaffold a working example, not an empty framework

The handoff should leave the team extending an established pattern.

| Deliverable              | What it should contain                                            |
| ------------------------ | ----------------------------------------------------------------- |
| **Runnable starter**     | Pinned dependencies, environment example, documented startup      |
| **One complete topic**   | Instruction, practice, review, passing result, coin grant         |
| **Connected map**        | A lesson path and Storyworld entrance linked to real state        |
| **One working scenario** | Housing inputs, deterministic results, reflection                 |
| **Tutor reference**      | Dr.Bos behavior, topic context, rubric, model adapter           |
| **Authoring guide**      | How to add a topic, building, scenario, and asset                 |
| **Agent instructions**   | Repository conventions, allowed edits, verification commands      |
| **Demo controls**        | Seeded college-student state, reset, and presentation checkpoints |

Skipping the login screen should mean **a pre-established demo session**, not making every write anonymously available. AI credentials belong on the server. PathMX Actions require an admitted Actor and a writable host, so the starter needs that working even though authentication is absent from the presentation. ([PathMX][4])

For reliability, include a clearly labelled prerecorded or fixture-backed tutor interaction as a fallback—not an undisclosed imitation of live AI. The simulations themselves should remain functional without model calls.

The remaining handoff inputs are the actual Ada/Project 3 reference, the Dr.Bos character reference, the teammate’s map document, and the selected finance material. Those can plug into the structure without delaying the shared layout and sample flow.

## The demonstration I would build toward

**Open on the learner’s dashboard → resume the housing topic → answer a Dr.Bos review question → receive coins → enter the House → make a choice and inspect the consequences → briefly open the Bank to show the same learning-and-application pattern in another domain.**

That shows the whole concept without touring every possible building.

The scaffold’s success criterion is not “the town looks complete.” It is this:

> **After seeing one working topic, Tram’s team can add the second primarily by authoring content, configuring a scenario, and supplying assets—without having to reinvent the connection between lessons, the tutor, progress, currency, and the world.**

[1]: https://www.consumerfinance.gov/ask-cfpb/what-are-some-of-the-financial-considerations-of-buying-a-home-en-119/?utm_source=chatgpt.com "What are some of the financial considerations of buying a home? | Consumer Financial Protection Bureau"
[2]: https://www.investor.gov/introduction-investing/getting-started/asset-allocation?utm_source=chatgpt.com "Asset Allocation and Diversification | Investor.gov"
[3]: https://docs.pathmx.dev/docs/learning/assessment.reference "Assessment"
[4]: https://docs.pathmx.dev/docs/extend/actions.reference "Actions"
[5]: https://docs.pathmx.dev/docs/site/layouts.reference "Layouts"
[6]: https://docs.pathmx.dev/docs/extend/plugins.guide "Make a custom Plugin"
