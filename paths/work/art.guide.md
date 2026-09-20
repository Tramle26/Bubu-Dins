---
title: Create art and sprites
---

[@layout]: ../layouts/work.layout.md

# Make art that belongs in Bubu

Use any image-capable agent or tool. Give it a reference image, one focused prompt,
and a clear output purpose. Save the final prompt alongside the asset so another
teammate can reproduce the direction. No particular paid provider or agent is required.

## Working assets

| Asset | Use | Reference / prompt |
| --- | --- | --- |
| `paths/assets/boo-boo.png` | Real transparent companion sprite | `paths/assets/prompts/boo-boo-runtime.txt` |
| `paths/assets/boo-boo-walk.png` | Transparent walking pose for the homepage | `paths/assets/prompts/boo-boo-walk.txt` |
| `paths/assets/dr-boss-avatar.png` | Opaque cream-background Dr.Bos chat portrait | `paths/assets/prompts/dr-boss-avatar.txt` |
| `paths/assets/journey-grove.png` | 3:2 map with three painted stops | `paths/assets/prompts/journey-grove-runtime.txt` |
| `paths/assets/housing-card.png` | House/apartment topic illustration | `paths/assets/prompts/housing-card.txt` |
| `paths/assets/investing-card.png` | Bubu planning topic illustration | `paths/assets/prompts/investing-card.txt` |
| `paths/assets/housing-thumb.png` | Homepage housing topic icon | `paths/assets/prompts/housing-thumb.txt` |
| `paths/assets/budget-thumb.png` | Homepage budget topic icon | `paths/assets/prompts/budget-thumb.txt` |
| `paths/assets/investing-thumb.png` | Homepage investing topic icon | `paths/assets/prompts/investing-thumb.txt` |
| `paths/assets/home-street.png` | Earlier homepage town street, preserved | `paths/assets/prompts/home-street.txt` |
| `paths/assets/home-reference-scene.png` | Reference-matched homepage street with decorative walking Bubu | `paths/assets/prompts/home-reference-scene.txt` |
| `paths/assets/home-reference-scene-signs.png` | Homepage street with BANK and CAFÉ painted onto the buildings | `paths/assets/prompts/home-reference-scene-signs.txt` |
| `paths/assets/storyworld-explore.png` | 16:9 Storyworld neighborhood map | `paths/assets/prompts/storyworld-explore.txt` |

The two topic cards were created with the built-in image-generation tool on
2026-09-16, using the runtime art as style/identity references. They are opaque
1536×1024 PNGs. Bubu and the grove are the pre-existing scaffold assets.

## Town map

The homepage uses `home-reference-scene-signs.png`; its BANK and CAFÉ words are
painted environmental signs, while links and controls remain accessible HTML.

`paths/assets/storyworld-explore.png` is the 16:9 Storyworld background. Its
repeatable brief is `paths/assets/prompts/storyworld-explore.txt`. The map has
eight landmarks: house, bank, hospital, shopping mall, college, cafe, bus stop,
and supermarket, plus river and bridge. Earlier 3:2 variants such as
`storyworld-kingdom.png` are preserved. It was generated with the built-in image
tool from a labeled mockup, then stripped of title, pills, and other interface.
`paths/storyworld.page.md` places HTML destinations with percentage coordinates
on that same canvas. Keep the art uncropped and check labels after replacing it.
Home and Bank open real Sources; the other buildings are future destinations.
On phones the map scrolls sideways, with ordinary links under All places.

## Character identity

Bubu: round green glasses, cream hoodie, green backpack, youthful face.
Dr.Bos: rectangular green glasses, small goatee, cream academic jacket, green
vest and striped tie. Use the original Professor sheet only as a character reference.
Never swap their glasses, clothes, age, or roles.

See `paths/assets/prompts/dr-boss-sprite.txt` for the repeatable generation brief.
The attempted Dr.Bos cutouts from this scaffold pass were rejected: they contained
an opaque painted checkerboard. No rejected image is referenced by the game.

## A solid sprite pattern

Start with one approved PNG per pose, not a generated sheet of inconsistent characters.
For new pose families use a fixed square canvas, shared scale, center x=50%, and feet
at y=88%; keep horns/tail fully inside. Match the baseline and scale of the approved
master before swapping poses. Existing Bubu is the static master; don't assume a
new 88% baseline will align with it without checking.

Use the same-sized HTML image box for every pose (`object-fit: contain`), with text
in a separate bubble. Set width/height so loading or swapping doesn't shift controls.
See `bubu-coach` and `.home-mascot` for working examples. A sprite is decoration;
a button or link owns the interaction and accessible label.

Reject an asset if it has a painted checkerboard, opaque background, clipped horns,
identity drift, edge halo, or a different baseline. An image *looking* transparent
in a preview is not proof: inspect its alpha channel, then view on light and dark.
For a quick metadata check on macOS: `sips -g hasAlpha paths/assets/boo-boo.png`.

If animation is added later, begin with two approved aligned poses, not a complex
sprite engine. Reserve the same box, keep motion subtle, and honor
`prefers-reduced-motion`. Never animate keyboard focus targets away from the learner.

## Topic-card prompt pattern

Attach the grove for style; attach Bubu only if he appears. Ask for one landscape
3:2 illustration, soft textured gouache, cream/forest/sage/terracotta palette,
readable silhouettes at thumbnail size, and generous padding. No lettering, charts,
UI, logos, or watermarks. Keep titles and financial meaning in HTML.

## Check before shipping

1. Inspect the full image and the actual small card/sprite size.
2. Check identity, edge quality, contrast, aspect ratio, and intended crop.
3. Keep asset filenames stable once used; create a new variant while iterating.
4. Compress large delivery files without changing their intended transparency.
5. Check the page at laptop and phone sizes. For maps, one coordinate system must
   own both art and clickable stops.

Historical provider-specific commands live in the earlier planning material. Don't
require teammates to copy an agent installation path or put API keys in this repo.

[Next: work with the characters](./characters.guide.md)
