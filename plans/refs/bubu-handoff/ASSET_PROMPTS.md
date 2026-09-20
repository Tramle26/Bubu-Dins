---
title: Bubu — GPT Image 2.5 asset prompt book
version: 1.0
prepared: 2026-09-15
status: ready-to-use prompts; outputs not yet generated
---

# GPT Image 2.5 demo asset prompts

Use this single document to browse/copy the 20 prompts. The ZIP also includes each prompt as a separate `.txt` file, all seven original image references, and machine-readable generation dependencies.

Read [ASSET_GUIDE.md](ASSET_GUIDE.md) for the full reference/approval workflow. Model identifiers and capabilities were checked against the [official prompting guide](https://developers.openai.com/api/docs/guides/image-prompting) and [image-generation guide](https://developers.openai.com/api/docs/guides/image-generation). These prompts have not yet been benchmarked or used to produce the assets.

**Use actual image attachments.** Attach reference files in the listed order. A reference under `assets/generated/` means an approved output from an earlier task. It does not exist in this handoff. Complete/approve that task first; a filename in the prompt is not a substitute for the image.

Start with the two character masters, then the terrain and Bank master. Only proceed to dependent pose/building edits after approval. Keep functional text, controls, charts, and paths out of the generated images.

## 01. Bubu identity master

**Output:** `assets/generated/boo-boo-master.png`  
**Starting settings:** `gpt-image-2.5-sunburst` · quality `high` · `1024x1024` · `transparent` background · PNG · one output.

**Reference images, in order:**

1. `references/art-ref-bubu-mascot-1.png`

**Prompt:**

```text
Create the canonical full-body companion character for Bubu, using image 1 as the character identity reference.
Image 1 is a character sheet; use its young orange-brown bull mascot with ROUND forest-green glasses, a cream hoodie,
and a dark-green backpack. Do not reproduce the sheet or its surrounding lettering.

Preserve the large cream muzzle, small dark nostrils, two cream horns, pinkish inner ears, short tufted dark-brown hair,
large expressive dark eyes, compact rounded body, short dark-brown hooves, and warm orange-brown fur. There is NO goatee,
NO tie, NO jacket, and NO square glasses. Simplify the clothing so the cream hoodie and backpack contain no lettering.
Pose: neutral welcoming front view with a slight turn toward the viewer's right, both forehooves relaxed, gentle closed-mouth smile.
The face is the focal point. Use one coherent anatomy and a natural attached tail.

Use the warm, soft-textured 2D illustration language of the supplied reference: rounded silhouettes, subtle gouache/paper grain within shapes, warm cream, forest and sage green, golden yellow, and terracotta. Readable game art for a college-student learning experience, not glossy 3D, photorealism, neon clip-art, or a nursery poster.
Output one isolated full-body character on a genuinely transparent background. Square canvas. Keep all horns, ears, hooves, and tail fully inside the frame with clear padding. Center the character; place the bottom of the supporting hooves at about 88% of image height and preserve comfortable headroom. No caption, letter, logo, watermark, border, scenery, floor, checkerboard, or cast shadow. Do not produce a character sheet or multiple versions in one image. Preserve clean alpha around the silhouette.
```

## 02. Dr.Bos identity master

**Output:** `assets/generated/dr-boss-master.png`  
**Starting settings:** `gpt-image-2.5-sunburst` · quality `high` · `1024x1024` · `transparent` background · PNG · one output.

**Reference images, in order:**

1. `references/art-ref-professor.png`

**Prompt:**

```text
Create the canonical full-body tutor character Dr.Bos from image 1, the supplied Professor Bubu character sheet.
Use the orange-brown bull professor's identity, not the collage layout. This is a teacher, not a physician.
Preserve RECTANGULAR forest-green glasses, cream horns, cream muzzle, pink inner ears, dark-brown hair tuft,
and a distinct small dark-brown goatee. Wear a warm cream academic jacket, forest-green sweater vest,
white shirt and green-and-gold striped tie, with orange-brown trousers and dark hooves. No stethoscope or medical accessories.

Pose: calm neutral three-quarter front view, looking slightly toward the viewer's left, one forehoof relaxed and the other
holding a small closed dark-green book at waist level. The book is unlettered. Friendly, thoughtful adult mentor;
not stern, smug, or babyish. Keep the professor visually distinct from a hoodie-wearing young companion.

Use the warm, soft-textured 2D illustration language of the supplied reference: rounded silhouettes, subtle gouache/paper grain within shapes, warm cream, forest and sage green, golden yellow, and terracotta. Readable game art for a college-student learning experience, not glossy 3D, photorealism, neon clip-art, or a nursery poster.
Output one isolated full-body character on a genuinely transparent background. Square canvas. Keep all horns, ears, hooves, and tail fully inside the frame with clear padding. Center the character; place the bottom of the supporting hooves at about 88% of image height and preserve comfortable headroom. No caption, letter, logo, watermark, border, scenery, floor, checkerboard, or cast shadow. Do not produce a character sheet or multiple versions in one image. Preserve clean alpha around the silhouette.
```

## 03. Bubu with blank encouragement sign

**Output:** `assets/generated/boo-boo-encourage.png`  
**Starting settings:** `gpt-image-2.5-sunburst` · quality `high` · `1024x1024` · `transparent` background · PNG · one output.

**Reference images, in order:**

1. `assets/generated/boo-boo-master.png`

**Prompt:**

```text
Input image 1 is the APPROVED Bubu master. Edit that same character; do not redesign or replace him. Preserve his round green glasses, cream muzzle and horns, hair tuft, orange-brown fur, cream unlettered hoodie, green backpack, exact face proportions, drawing texture, canvas size, body scale, and supporting-hoof baseline. Keep him youthful with no goatee, jacket, or tie.
Change only the forehoof pose and expression. Have Bubu hold a small completely blank warm-cream rectangular placard
at chest/waist height, with its front almost parallel to the image plane. Both forehooves grip its outer edges naturally.
Keep the face fully visible above it. Give him a gentle encouraging smile. The placard must have NO lettering, icons, or symbols;
the application's encouragement will be separate real text. Keep the sign inside the full-character frame without shrinking Bubu.
Output one isolated full-body character on a genuinely transparent background. Square canvas. Keep all horns, ears, hooves, and tail fully inside the frame with clear padding. Center the character; place the bottom of the supporting hooves at about 88% of image height and preserve comfortable headroom. No caption, letter, logo, watermark, border, scenery, floor, checkerboard, or cast shadow. Do not produce a character sheet or multiple versions in one image. Preserve clean alpha around the silhouette.
```

## 04. Bubu celebration pose

**Output:** `assets/generated/boo-boo-celebrate.png`  
**Starting settings:** `gpt-image-2.5-sunburst` · quality `high` · `1024x1024` · `transparent` background · PNG · one output.

**Reference images, in order:**

1. `assets/generated/boo-boo-master.png`

**Prompt:**

```text
Input image 1 is the APPROVED Bubu master. Edit that same character; do not redesign or replace him. Preserve his round green glasses, cream muzzle and horns, hair tuft, orange-brown fur, cream unlettered hoodie, green backpack, exact face proportions, drawing texture, canvas size, body scale, and supporting-hoof baseline. Keep him youthful with no goatee, jacket, or tie.
Change only the forehooves and expression into a modest celebration: one forehoof raised beside the head, the other held near the body,
a delighted smile, eyes naturally bright through unchanged round glasses. Both supporting hooves stay on the same baseline;
no jumping and no camera zoom. No confetti, stars, coins, signs, text, glow, or surrounding effects; the application adds those separately.
Output one isolated full-body character on a genuinely transparent background. Square canvas. Keep all horns, ears, hooves, and tail fully inside the frame with clear padding. Center the character; place the bottom of the supporting hooves at about 88% of image height and preserve comfortable headroom. No caption, letter, logo, watermark, border, scenery, floor, checkerboard, or cast shadow. Do not produce a character sheet or multiple versions in one image. Preserve clean alpha around the silhouette.
```

## 05. Bubu patient companion pose

**Output:** `assets/generated/boo-boo-thinking.png`  
**Starting settings:** `gpt-image-2.5-sunburst` · quality `high` · `1024x1024` · `transparent` background · PNG · one output.

**Reference images, in order:**

1. `assets/generated/boo-boo-master.png`

**Prompt:**

```text
Input image 1 is the APPROVED Bubu master. Edit that same character; do not redesign or replace him. Preserve his round green glasses, cream muzzle and horns, hair tuft, orange-brown fur, cream unlettered hoodie, green backpack, exact face proportions, drawing texture, canvas size, body scale, and supporting-hoof baseline. Keep him youthful with no goatee, jacket, or tie.
Change only the expression and near forehoof: an attentive, patient listening face with a slight curious head tilt,
one forehoof lightly near the muzzle and the other relaxed. Preserve glasses and the exact original head size.
The feeling is "take your time", not confusion, sadness, judgment, or teaching. No thought bubble, question mark, sign, text, or props.
Output one isolated full-body character on a genuinely transparent background. Square canvas. Keep all horns, ears, hooves, and tail fully inside the frame with clear padding. Center the character; place the bottom of the supporting hooves at about 88% of image height and preserve comfortable headroom. No caption, letter, logo, watermark, border, scenery, floor, checkerboard, or cast shadow. Do not produce a character sheet or multiple versions in one image. Preserve clean alpha around the silhouette.
```

## 06. Dr.Bos asking one question

**Output:** `assets/generated/dr-boss-question.png`  
**Starting settings:** `gpt-image-2.5-sunburst` · quality `high` · `1024x1024` · `transparent` background · PNG · one output.

**Reference images, in order:**

1. `assets/generated/dr-boss-master.png`

**Prompt:**

```text
Input image 1 is the APPROVED Dr.Bos master. Edit that same character; do not redesign or replace him. Preserve rectangular green glasses, cream muzzle and horns, hair tuft and small goatee, cream academic jacket, green vest, striped tie, exact face proportions, drawing texture, canvas size, body scale, and supporting-hoof baseline.
Change only the pose/expression: gently raised eyebrows, an attentive slight smile, one open forehoof gesturing toward the viewer's left
as if inviting a student to explain an idea. Keep the small closed book in the other forehoof. The gesture is calm, not a raised teacher's finger.
No question marks, speech bubbles, text, charts, board, or surrounding objects. Keep the head and supporting hooves at the master scale/baseline.
Output one isolated full-body character on a genuinely transparent background. Square canvas. Keep all horns, ears, hooves, and tail fully inside the frame with clear padding. Center the character; place the bottom of the supporting hooves at about 88% of image height and preserve comfortable headroom. No caption, letter, logo, watermark, border, scenery, floor, checkerboard, or cast shadow. Do not produce a character sheet or multiple versions in one image. Preserve clean alpha around the silhouette.
```

## 07. Dr.Bos contextual explanation pose

**Output:** `assets/generated/dr-boss-explain.png`  
**Starting settings:** `gpt-image-2.5-sunburst` · quality `high` · `1024x1024` · `transparent` background · PNG · one output.

**Reference images, in order:**

1. `assets/generated/dr-boss-master.png`

**Prompt:**

```text
Input image 1 is the APPROVED Dr.Bos master. Edit that same character; do not redesign or replace him. Preserve rectangular green glasses, cream muzzle and horns, hair tuft and small goatee, cream academic jacket, green vest, striped tie, exact face proportions, drawing texture, canvas size, body scale, and supporting-hoof baseline.
Change only the near arm and facial expression. Dr.Bos gently points with an open forehoof toward empty space on the viewer's left,
as if indicating a chart rendered elsewhere in the app. Keep the other forehoof holding the small closed book. Calm explanatory smile;
no oversized pointing hand, no aggressive stance, no pointer stick crossing the face. Do not draw the chart, axes, letters, numbers,
a board, a speech bubble, or a background. Keep identity, body scale, camera, and hoof baseline unchanged.
Output one isolated full-body character on a genuinely transparent background. Square canvas. Keep all horns, ears, hooves, and tail fully inside the frame with clear padding. Center the character; place the bottom of the supporting hooves at about 88% of image height and preserve comfortable headroom. No caption, letter, logo, watermark, border, scenery, floor, checkerboard, or cast shadow. Do not produce a character sheet or multiple versions in one image. Preserve clean alpha around the silhouette.
```

## 08. Dr.Bos acknowledges demonstrated understanding

**Output:** `assets/generated/dr-boss-approve.png`  
**Starting settings:** `gpt-image-2.5-sunburst` · quality `high` · `1024x1024` · `transparent` background · PNG · one output.

**Reference images, in order:**

1. `assets/generated/dr-boss-master.png`

**Prompt:**

```text
Input image 1 is the APPROVED Dr.Bos master. Edit that same character; do not redesign or replace him. Preserve rectangular green glasses, cream muzzle and horns, hair tuft and small goatee, cream academic jacket, green vest, striped tie, exact face proportions, drawing texture, canvas size, body scale, and supporting-hoof baseline.
Change only the expression and near forehoof into a small approving nod and warm restrained smile, with one forehoof held open near the chest.
He acknowledges thoughtful work rather than congratulating wealth. Keep the closed book in the other forehoof. Preserve the full head scale,
rectangular glasses, goatee, clothing, canvas, and supporting-hoof baseline. No grade letters, check marks, coins, certificate, text, sparkles, or scene.
Output one isolated full-body character on a genuinely transparent background. Square canvas. Keep all horns, ears, hooves, and tail fully inside the frame with clear padding. Center the character; place the bottom of the supporting hooves at about 88% of image height and preserve comfortable headroom. No caption, letter, logo, watermark, border, scenery, floor, checkerboard, or cast shadow. Do not produce a character sheet or multiple versions in one image. Preserve clean alpha around the silhouette.
```

## 09. Storyworld terrain plate

**Output:** `assets/generated/storyworld-terrain.png`  
**Starting settings:** `gpt-image-2.5-flare` · quality `high` · `1600x960` · `opaque` background · PNG · one output.

**Reference images, in order:**

1. `references/art-ref-bus-map.png`

**Prompt:**

```text
Create an original environment-only terrain plate for an interactive financial-learning town.
Input image 1 is ONLY a rendering-style and palette reference. Do not copy its bus, lettering, figures, signposts, buildings, or poster layout.

Composition: a wide 5:3 landscape field viewed from an elevated near-orthographic three-quarter overhead angle. No horizon or sky.
Soft sage-green grass, a few warmly painted bushes and tree groups around the outside edges, subtle cream-colored ground texture,
and tiny flowers sparingly near the edges. Keep the middle 80% visually quiet and spacious for separately rendered buildings and SVG roads.
Reserve six broad clear grass areas near these canvas centers: (14%,26%), (50%,23%), (84%,26%), (15%,71%), (50%,58%), (84%,71%).
Do not draw visible place markers in those areas. There must be no central obstacle, river crossing, cliff, or texture that dictates navigation.
The lower edge may have gentle foliage framing, but it must not cover the interior placement areas.

Use the warm, soft-textured 2D illustration language of the supplied reference: rounded silhouettes, subtle gouache/paper grain within shapes, warm cream, forest and sage green, golden yellow, and terracotta. Readable game art for a college-student learning experience, not glossy 3D, photorealism, neon clip-art, or a nursery poster.
This is one opaque background image, not a game screenshot. No roads or paths, no buildings, no vehicles, no people or mascots,
no labels, numbers, interface panels, buttons, coins, border, watermark, or checkerboard. Subtle composition, generous negative space.
```

## 10. Bank building master

**Output:** `assets/generated/building-bank.png`  
**Starting settings:** `gpt-image-2.5-sunburst` · quality `high` · `1024x1024` · `transparent` background · PNG · one output.

**Reference images, in order:**

1. `references/art-ref-bus-map.png`

**Prompt:**

```text
Create a single friendly neighborhood bank building for an illustrated learning town.
Input image 1 provides the soft painted rendering language and palette ONLY; do not copy its poster or bus.

Design: a small warm-cream community bank with three simple rounded columns, a forest-green roof,
wide central double doors, a small arched detail above the entrance, and warm honey-colored trim.
Its identity should read from architecture without a dollar sign or the word bank. Welcoming, modest, and contemporary-storybook,
not a grand stone government monument. No official seals or logos. A small side window may suggest depth.

Use the warm, soft-textured 2D illustration language of the supplied reference: rounded silhouettes, subtle gouache/paper grain within shapes, warm cream, forest and sage green, golden yellow, and terracotta. Readable game art for a college-student learning experience, not glossy 3D, photorealism, neon clip-art, or a nursery poster.
Elevated near-orthographic three-quarter view, looking down about 30 degrees, showing the front and right side. Warm light from upper left. Rounded, carefully drawn architecture with soft painted shading. No horizon, dramatic perspective, photorealism, or glossy 3D render. One complete building on true transparency; no ground tile or external cast shadow. Place the center of its base at approximately (50%, 88%) of the square canvas. Keep the whole roof and facade inside clear margins. No text, numbers, logos, readable signage, watermark, characters, vehicles, UI controls, or decorative frame.
```

## 11. House destination

**Output:** `assets/generated/building-house.png`  
**Starting settings:** `gpt-image-2.5-sunburst` · quality `high` · `1024x1024` · `transparent` background · PNG · one output.

**Reference images, in order:**

1. `assets/generated/building-bank.png`

**Prompt:**

```text
Input image 1 is the APPROVED bank building and fixes the camera, rendering, lighting, canvas, and footprint baseline.
Create a different building in that same asset family: a welcoming two-story home with a terracotta pitched roof,
warm cream walls, a forest-green front door, simple windows, and a small front porch. One compact attached shrub is acceptable,
but no yard tile, fence rectangle, large garden, road, or unrelated object. Keep it fully isolated.
Do not copy the bank's columns or institutional facade. Match its subtle paint grain, edge softness, upper-left light,
three-quarter angle, and front/right-side orientation so the two buildings can sit together on one map.
Elevated near-orthographic three-quarter view, looking down about 30 degrees, showing the front and right side. Warm light from upper left. Rounded, carefully drawn architecture with soft painted shading. No horizon, dramatic perspective, photorealism, or glossy 3D render. One complete building on true transparency; no ground tile or external cast shadow. Place the center of its base at approximately (50%, 88%) of the square canvas. Keep the whole roof and facade inside clear margins. No text, numbers, logos, readable signage, watermark, characters, vehicles, UI controls, or decorative frame.
```

## 12. College lessons destination

**Output:** `assets/generated/building-college.png`  
**Starting settings:** `gpt-image-2.5-sunburst` · quality `high` · `1024x1024` · `transparent` background · PNG · one output.

**Reference images, in order:**

1. `assets/generated/building-bank.png`

**Prompt:**

```text
Input image 1 is the APPROVED bank building and fixes camera, material rendering, lighting, and baseline.
Create a compact college building in the same illustrated town family: warm cream stone, a terracotta/green roof,
a modest central square tower, a welcoming arched entrance, and two short symmetrical wings.
Use an abstract unnumbered circular clock face on the tower if needed for recognition; no legible numerals, crests, banners, or flags.
It should look like a small friendly campus building, not a cathedral, castle, or enormous monumental university.
Preserve the bank reference's camera showing front and right side, light direction, texture, and clean isolated silhouette.
Elevated near-orthographic three-quarter view, looking down about 30 degrees, showing the front and right side. Warm light from upper left. Rounded, carefully drawn architecture with soft painted shading. No horizon, dramatic perspective, photorealism, or glossy 3D render. One complete building on true transparency; no ground tile or external cast shadow. Place the center of its base at approximately (50%, 88%) of the square canvas. Keep the whole roof and facade inside clear margins. No text, numbers, logos, readable signage, watermark, characters, vehicles, UI controls, or decorative frame.
```

## 13. Supermarket preview destination

**Output:** `assets/generated/building-supermarket.png`  
**Starting settings:** `gpt-image-2.5-sunburst` · quality `high` · `1024x1024` · `transparent` background · PNG · one output.

**Reference images, in order:**

1. `assets/generated/building-bank.png`

**Prompt:**

```text
Input image 1 is the APPROVED bank building and fixes the town's camera, light, texture, and baseline.
Create a small neighborhood grocery store in the same asset family: warm cream facade, low sage/forest-green roof,
wide front windows, a pale-green and cream awning, and two simple wooden produce crates immediately next to the entrance.
A few broad orange and green produce shapes can suggest groceries without tiny detail. No brand, letters, numbers, price tags,
carts, people, parking lot, or sidewalk tile. It should be instantly readable at small map size.
Elevated near-orthographic three-quarter view, looking down about 30 degrees, showing the front and right side. Warm light from upper left. Rounded, carefully drawn architecture with soft painted shading. No horizon, dramatic perspective, photorealism, or glossy 3D render. One complete building on true transparency; no ground tile or external cast shadow. Place the center of its base at approximately (50%, 88%) of the square canvas. Keep the whole roof and facade inside clear margins. No text, numbers, logos, readable signage, watermark, characters, vehicles, UI controls, or decorative frame.
```

## 14. Hospital preview destination

**Output:** `assets/generated/building-hospital.png`  
**Starting settings:** `gpt-image-2.5-sunburst` · quality `high` · `1024x1024` · `transparent` background · PNG · one output.

**Reference images, in order:**

1. `assets/generated/building-bank.png`

**Prompt:**

```text
Input image 1 is the APPROVED bank building and fixes the town's camera, light, texture, and baseline.
Create a compact neighborhood hospital/clinic building in the same asset family: warm cream walls,
muted teal-green roof, a wide central accessible entrance, two rows of simple windows, and one small green heart emblem above the door.
The heart is a simple pictorial mark, not a logo. Do not use a red cross, an official medical emblem, text, ambulances, people,
parking surfaces, or a ground tile. Friendly and calm, recognizable without alarming medical detail.
Elevated near-orthographic three-quarter view, looking down about 30 degrees, showing the front and right side. Warm light from upper left. Rounded, carefully drawn architecture with soft painted shading. No horizon, dramatic perspective, photorealism, or glossy 3D render. One complete building on true transparency; no ground tile or external cast shadow. Place the center of its base at approximately (50%, 88%) of the square canvas. Keep the whole roof and facade inside clear margins. No text, numbers, logos, readable signage, watermark, characters, vehicles, UI controls, or decorative frame.
```

## 15. Shopping mall preview destination

**Output:** `assets/generated/building-mall.png`  
**Starting settings:** `gpt-image-2.5-sunburst` · quality `high` · `1024x1024` · `transparent` background · PNG · one output.

**Reference images, in order:**

1. `assets/generated/building-bank.png`

**Prompt:**

```text
Input image 1 is the APPROVED bank building and fixes the town's camera, light, texture, and baseline.
Create a small shopping-center building in the same asset family: two attached warm-cream shopfronts,
a broad shared sage-green roof, generous front windows, one muted terracotta awning, and a small welcoming central entrance.
A simple unlettered shopping-bag pictogram above the entrance may identify shopping. Do not make it look like a grocery store;
no produce crates. No real brands, storefront words, price tags, crowds, cars, parking lots, or ground tile.
Elevated near-orthographic three-quarter view, looking down about 30 degrees, showing the front and right side. Warm light from upper left. Rounded, carefully drawn architecture with soft painted shading. No horizon, dramatic perspective, photorealism, or glossy 3D render. One complete building on true transparency; no ground tile or external cast shadow. Place the center of its base at approximately (50%, 88%) of the square canvas. Keep the whole roof and facade inside clear margins. No text, numbers, logos, readable signage, watermark, characters, vehicles, UI controls, or decorative frame.
```

## 16. Bubu journey bus

**Output:** `assets/generated/bubu-bus.png`  
**Starting settings:** `gpt-image-2.5-flare` · quality `high` · `1024x1024` · `transparent` background · PNG · one output.

**Reference images, in order:**

1. `references/art-ref-bus-map.png`

**Prompt:**

```text
Create one small right-facing yellow learning bus on a genuinely transparent background.
Input image 1 supplies the bus's warm rounded design language and soft painted style. Preserve the friendly golden body,
forest-green accents, rounded rectangular blue-gray windows, and dark charcoal tires, but create a standalone vehicle,
not a crop of the reference poster. No lettering, logos, leaf branding, humans, or mascots in the windows.

View: mild elevated three-quarter side view, mostly showing the long side and a little front on the viewer's right.
Keep both main wheels readable, with coherent axle placement and a complete bumper. One vehicle only; all edges inside the canvas.
Center it horizontally, with tire bottoms at about 84% of canvas height and comfortable transparent padding.
Use the warm, soft-textured 2D illustration language of the supplied reference: rounded silhouettes, subtle gouache/paper grain within shapes, warm cream, forest and sage green, golden yellow, and terracotta. Readable game art for a college-student learning experience, not glossy 3D, photorealism, neon clip-art, or a nursery poster.
No scenery, road, cast shadow, dust cloud, text, UI, border, watermark, or checkerboard. True transparent alpha.
```

## 17. Leaf learning coin

**Output:** `assets/generated/learning-coin.png`  
**Starting settings:** `gpt-image-2.5-flare` · quality `high` · `1024x1024` · `transparent` background · PNG · one output.

**Reference images, in order:**

1. `references/art-ref-bubu-mascot-1.png`

**Prompt:**

```text
Create one clear gold learning-reward coin for the Bubu interface.
Input image 1 provides the mascot world's soft painted palette and rounded rendering style, not its character composition.
A warm golden circular coin, near-front view with a very slight right-edge thickness, a simple embossed leaf at its center,
and a restrained highlight at upper left. It must read clearly at 24 to 48 pixels. Use only one leaf, no face, dollar sign,
letter, numeral, monetary symbol, text, brand, surrounding sparkles, pile of coins, or complex engraving.

Use the warm, soft-textured 2D illustration language of the supplied reference: rounded silhouettes, subtle gouache/paper grain within shapes, warm cream, forest and sage green, golden yellow, and terracotta. Readable game art for a college-student learning experience, not glossy 3D, photorealism, neon clip-art, or a nursery poster.
One centered object occupying about 72% of a square canvas. Genuinely transparent background with clean alpha;
no floor, cast shadow, border, watermark, checkerboard, or drop-shadow halo. Rendered shading stays within the coin.
```

## 18. Quiet lesson-journey grove

**Output:** `assets/generated/lesson-grove.png`  
**Starting settings:** `gpt-image-2.5-flare` · quality `high` · `1600x960` · `opaque` background · PNG · one output.

**Reference images, in order:**

1. `references/art-ref-bus-map.png`

**Prompt:**

```text
Create an original quiet background plate for a three-stop illustrated learning journey.
Input image 1 supplies only the warm 2D painted environment style and palette. Do not reproduce its bus, characters,
lettering, buildings, signs, or poster composition.

Wide 5:3 landscape frame. Elevated near-orthographic view of a small grassy grove. A few rounded trees and bushes frame
only the far corners and outer edges, with warm cream sunlight and a soft sage-green grassy center. Leave a broad uninterrupted
quiet band running from lower-left interior through the center to upper-right interior. The application will draw its own curved
SVG road and three interactive stops there. Therefore do NOT paint a road, path, stepping stones, platforms, arrows, stop markers,
coins, or shadows indicating where stops should go. Gentle tiny flowers near the edges are enough detail.

Use the warm, soft-textured 2D illustration language of the supplied reference: rounded silhouettes, subtle gouache/paper grain within shapes, warm cream, forest and sage green, golden yellow, and terracotta. Readable game art for a college-student learning experience, not glossy 3D, photorealism, neon clip-art, or a nursery poster.
One opaque scenery plate. No horizon, sky, prominent obstacle, buildings, text, interface, characters, border, watermark, or checkerboard.
The background must stay visually quieter than the future lesson labels.
```

## 19. Optional housing comparison decoration

**Output:** `assets/generated/housing-vignette.png`  
**Starting settings:** `gpt-image-2.5-flare` · quality `high` · `1536x1024` · `transparent` background · PNG · one output.

**Reference images, in order:**

1. `assets/generated/building-house.png`

**Prompt:**

```text
Create a small decorative housing vignette in the Bubu asset family.
Input image 1 is the approved House building and controls the architecture, paint texture, palette, and lighting.
Show that complete friendly cream-and-terracotta house beside a compact cream apartment building with muted green trim,
with clear separation between the two buildings. Equal visual importance: neither option is larger, brighter, triumphant,
broken, gloomy, or marked as a winner. No people, money, keys, ownership badges, arrows, comparison labels, values, or charts.

Use the same elevated three-quarter view, front and right sides visible, warm upper-left lighting, and soft textured 2D rendering.
Place both complete buildings on transparent space with a consistent baseline, not on a ground tile. Do not create a full UI screen.
One landscape composition with generous padding, true transparent background, no outside cast shadows, no lettering, no logos,
no border, no watermark, and no checkerboard. This is decoration only; all financial information will be application text and charts.
```

## 20. Optional investing scene decoration

**Output:** `assets/generated/investing-vignette.png`  
**Starting settings:** `gpt-image-2.5-flare` · quality `high` · `1536x1024` · `transparent` background · PNG · one output.

**Reference images, in order:**

1. `assets/generated/boo-boo-master.png`
2. `references/art-ref-bus-map.png`

**Prompt:**

```text
Create a small decorative investing-learning vignette for Bubu.
Input image 1 is the APPROVED Bubu master and fixes his identity; input image 2 is the environment rendering-style reference only.
Show the same youthful orange-brown bull with ROUND green glasses, cream hoodie with no lettering, and dark-green backpack,
sitting attentively beside a small open laptop. His forehooves rest naturally near the keyboard, with a calm curious smile.
Keep his face, horns, muzzle, tuft, outfit, and proportions consistent with the master; do not add a goatee or academic jacket.

The laptop screen is a simple blank muted green-gray plane with no chart, numbers, code, text, currency, or brand.
No coins, celebratory wealth, rockets, guaranteed-growth arrows, trading floor, or claim that investing always goes up.
Use soft textured 2D paint, warm cream and forest green, and restrained upper-left light. One complete compact vignette
on a genuinely transparent landscape canvas with generous padding. No floor rectangle, cast shadow, lettering, captions,
UI controls, border, watermark, checkerboard, or unrelated props.
```
