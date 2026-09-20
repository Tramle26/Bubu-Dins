---
title: Bubu — demo asset generation guide
version: 1.0
prepared: 2026-09-15
target_models: GPT Image 2.5 Sunburst and Flare
status: prompts and planned assets; no generated outputs included
---

# Demo asset generation

## 1. The production strategy

Generate **reusable illustrated parts**, not screenshots of the application. A character pose, building, vehicle, terrain plate, or decorative vignette is an asset. A button, financial graph, chart label, course title, coin balance, road connector, or conversation is application UI.

Use transparent raster art for isolated objects. Use opaque terrain plates for backgrounds. Build roads/lines/status markers in SVG and all readable interface labels in HTML. A prompt asking for “vector-like” artwork does not produce an editable SVG; do not depend on that for functional UI.

The 20 numbered files in `prompts/images/` are full, copy-ready prompts. `assets/generation-plan.json` supplies their reference order, output path, size, background, and model defaults. They are **designed for** GPT Image 2.5 reference/edit workflows, not empirically optimized or guaranteed. This handoff has not generated or approved their results.

## 2. Current model settings

OpenAI's [image-generation guide](https://developers.openai.com/api/docs/guides/image-generation) and [prompting guide](https://developers.openai.com/api/docs/guides/image-prompting) currently document `gpt-image-2.5-sunburst` and `gpt-image-2.5-flare`. Sunburst is the quality/precise-editing starting point; Flare is the speed-oriented alternative. Availability in the selected account or UI still needs checking.

Our proposed starting configuration:

| Task | Starting choice | Output |
| --- | --- | --- |
| Character masters and identity-critical pose edits | Sunburst, `high` | 1024×1024 PNG, transparent |
| Building masters and perspective-matched building edits | Sunburst, `high` | 1024×1024 PNG, transparent |
| Terrain and journey backgrounds | Flare, `high`; compare Sunburst if composition fails | 1600×960 PNG, opaque |
| Bus/coin and optional vignettes | Flare, `high`; keep a reviewed result as reference | Size/background specified per task |

The documented API supports transparent PNG/WebP and custom supported sizes. The selected 1600×960 landscape size is divisible by 16 in both dimensions and comfortably below the documented experimental high-resolution range. See the [edit API](https://developers.openai.com/api/reference/resources/images/methods/edit/).

Set a model explicitly. Do not copy legacy `input_fidelity`, seed, stylization, or negative-prompt parameters without checking support in the actual endpoint. The supplied text expresses exclusions in ordinary language. Start at `high`; test `xhigh` only for an identified unmet quality requirement, not as a substitute for fixing composition/reference conflicts.

Use the editing/reference-image workflow whenever a task supplies images. Attach those actual files in the specified order. A filename mentioned in text is not an image input. If an approved dependent master is missing, generate and approve it first; do not invent it or use an unrelated stock mascot. In a UI, upload the images and paste the `.txt` prompt; set size/background with available controls. Through an API, keep these settings in request parameters as well as stating the visual requirement in the prompt.

## 3. Reference hierarchy

| Reference | Role | Important constraint |
| --- | --- | --- |
| `art-ref-bubu-mascot-1.png` | Primary Bubu identity | Round forest-green glasses, youthful face, cream hoodie, backpack; no professor goatee |
| `art-ref-bubu-mascot-2.png` | Secondary pose ideas | Do not blend competing proportions into the master |
| `art-ref-professor.png` | Proposed Dr.Bos identity | Rectangular green glasses, goatee, cream jacket, green vest, tie; teacher, not a hospital physician |
| `art-ref-bus-map.png` | Rendering style and bus design | Texture/color reference; no replication of its poster, lettering, or human passengers |
| `drawings-screens-2.png` | World topology | Build topology in application coordinates, not generated lettering |
| `drawings-screens-1.png` | UI flow | Layout implementation reference; not an image-generation input |
| `art-reference-forest-path.png` | Winding-route composition only | Watermarked stock reference; do not edit, remove watermark, crop for deployment, or submit as a generation reference |

Master candidates are not approved merely because the output filename contains “master.” A human (Mark/Tram) approves identity and style. Thereafter, **the approved master outranks the original mood board** in all pose edits. Do not send all seven images with every request.

The professor mapping is provisional until Tram's separate Dr.Bos reference is supplied. Retain his distinct visual role; do not make Bubu a professor or Dr.Bos a second hoodie character.

## 4. Art direction

Soft textured 2D storybook/game illustration. Rounded silhouettes; muted forest and sage greens; warm cream; golden yellow; terracotta/orange-brown fur; selective paper/gouache texture. Light comes from the upper left. Avoid glossy 3D, photorealism, heavy black outlines, neon colors, stock clip-art, tiny noise, or a flat geometric style inconsistent with the mascots.

The audience is college students: playful but not nursery-school decoration. Keep the interfaces restrained and let the characters/scenery carry the warmth. Never add sponsor branding or invent a financial company's logo.

Buildings share an elevated near-orthographic three-quarter view with the front and right side visible, roughly 30 degrees looking down, without a horizon or dramatic vanishing point. Characters use front/near-front view for readable dialogue. These are separate art categories; do not force characters into the map building camera.

## 5. Asset geometry

**Character sprites:** 1024×1024, full figure including horns/feet/tail, bottom-center anchor `(0.50,0.88)`, minimum clear edge margin around all extremities. Keep the same pixel head/torso scale and hoof baseline across the character's pose family. A pose may extend an arm but cannot zoom the entire figure. No scene, border, caption, contact sheet, or baked cast shadow. CSS supplies consistent grounding shadows.

**Buildings:** 1024×1024, complete building, same view/light, bottom-center footprint anchor `(0.50,0.88)`, no ground tile. Architectural hierarchy may affect the width placed in the world, but generation should preserve a predictable canvas/padding convention. Runtime placement metadata controls scale, not inconsistent padding hidden in files.

**Terrain/journey plates:** 1600×960, opaque, corresponding to the world's 5:3 logical frame. These contain low-detail scenery, not roads, labels, buildings, controls, or stop markers. Their interior is deliberately quiet for functional overlays.

**Bus:** 1024×1024, right-facing, transparent, complete vehicle, no text. **Coin:** 1024×1024, transparent, simple leaf motif—not a dollar sign. These visually distinguish game rewards from simulation dollars.

Runtime may need transparent edge-normalization or canvas padding after generation. Preserve proportions; record any resize/crop and anchor update. Do not crop closely around every pose independently, which causes visible scale jumps. Keep source masters before optimization.

## 6. Generation order and minimal demo set

**First approve identity:** 01 Bubu master, 02 Dr.Bos master.

**Then prove the composed world:** 09 terrain, 10 Bank, 11 House, 12 College. House/College use the approved Bank as the perspective/style reference in addition to the environmental style sheet.

**Then complete the core UI:** 03 encouragement, 06 question, 07 explanation, 17 coin, 18 lesson grove. A static master can temporarily stand in for other poses without breaking the experience.

**Then polish:** celebration/thinking/approval poses, preview buildings, bus, and optional House/Bank vignettes. The 19/20 vignettes are decorative accents, not replacements for the functional simulation.

Generate one candidate at a time initially. Do not spend on a large batch before the first composed scene is inspected at the actual UI size. Preserve request settings, references, output, and approval status per candidate.

## 7. Identity-preserving edit workflow

For a new pose, use the approved master as input image 1 and ask for the smallest pose/expression change. Restate the invariant face, glasses, horns, clothes, texture, canvas, scale, and baseline. Do not regenerate every pose from the original collage.

When a result is almost correct, use a narrow repair prompt, for example:

> Edit only the raised forehoof so that it points gently toward the open space on the character's right. Keep the head, face, glasses, horns, clothing, body proportions, canvas dimensions, and hoof baseline unchanged. Preserve true transparency. Do not add any object, text, background, or shadow.

If the face or proportions have drifted, return to the approved master rather than chaining additional edits onto an already-drifted candidate. If a transparent result contains a painted checkerboard, reject it; do not call it transparent because the picture resembles an editing canvas.

## 8. Quality gate

Inspect each candidate on light cream and dark green backgrounds, at full size and at intended runtime size. Verify actual alpha values, clean semi-transparent edges, no clipped horns/ears/hooves, no repeated anatomy, no random text, correct glasses, consistent colors/texture, correct camera, and useful negative space. Check that transparent holes between limbs are actually transparent.

The app should never ship a whole character reference sheet as a tiny sprite. Each runtime file contains a single intended asset. Do not infer pose-frame alignment from a generated sprite sheet.

A sprite can pass technical dimensions and still fail visual identity. Mark approval only after human/vision inspection. Record the rejected reason rather than silently replacing a master.

## 9. Manifest and provenance

`assets/manifest.json` is a **planned asset contract**, with every status initially `planned`. Its `output` paths are generation-workspace targets under `assets/generated/`, not claims that the files exist. Its `runtimePath` is a suggested destination under the implementation repo's served asset root; confirm that root before copying.

For each generated candidate record: prompt filename/version, actual provider/model, generation date, dimensions, background/quality, input references, output hash, approval status, and postprocessing. Retain `references/` as private authoring material. Do not publish original mood boards, watermark-bearing files, or font files.

Preserve PNG masters. Optimize runtime raster files to appropriate WebP/PNG variants with alpha retained, selecting dimensions based on rendered size and device pixel ratio. Initial performance targets: keep the visible world's optimized art around 2 MB where feasible, and keep inactive pose families/scenario art out of first-load work. These are budgets to measure, not provider guarantees.

## 10. Reusable rendering conventions

Bind images by stable asset ID, not hard-coded filesystem paths spread through components. Give decorative images empty alt text when adjacent HTML already names the destination; meaningful character messages remain real text. Build labels, rewards, charts, and focus treatments independently of raster assets. All screens must remain navigable while optional art is missing or loading.
