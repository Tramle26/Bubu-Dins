# Bubu screen prototypes

Generated with the built-in image-generation tool on 2026-09-15. These are
design references, not screenshots of working software or sources of
authoritative content and calculations.

## Screens

1. `01-home-dashboard.png` establishes the shared shell, strong Continue
   action, topic cards, Bubu's scale, and the Storyworld entrance.
2. `02-housing-journey.png` demonstrates a three-stop illustrated path with
   explicit complete/current/locked states and a list-view alternative.
3. `03-storyworld.png` demonstrates a clickable town, separate destination
   markers, an explicit purchase confirmation, and honest preview buildings.
4. `04-house-simulation.png` demonstrates the scenario workspace, comparison
   results, assumptions, and the persistent Dr.Bos teaching panel.

## Implementation translation

- Generate the terrain, characters, buildings, bus, and decorative plants as
  reusable raster assets.
- Implement navigation, headings, topic cards, progress states, dialogs,
  controls, forms, tutor messages, and destination labels in HTML/CSS.
- Implement roads, stop connectors, map markers, charts, and status icons in
  SVG/CSS where practical.
- Keep the map and journey usable through equivalent list views.
- Treat all numbers and progress shown here as illustrative. Runtime values
  come from the domain state and deterministic simulation engines.
- Use a shared shell and design tokens across all screens. Do not recreate each
  prototype as one full-screen background image.

## Visual system to carry forward

- Warm cream surface cards over lush green/blue illustrated scenes.
- Deep forest-green primary actions, gold current/reward accents, muted gray
  locked states, and clear text labels in addition to color.
- Large rounded controls and restrained shadows suitable for 1366x768 and
  1024x768 presentation.
- Bubu provides atmosphere and encouragement. Dr.Bos occupies a stable,
  task-focused teaching panel.

The generated copy is not final. Verify coin balances, progress, building
availability, financial labels, and accessibility text against the handoff.
