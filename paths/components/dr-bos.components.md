<!-- componentName: bos-steps -->

# A short process

Use two to four steps when order matters. Each step is an ordinary readable card.
Numbered cards carry the order without requiring a tall SVG diagram.

```html
<section class="bos-visual bos-sequence"><h3><slot name="title" /></h3><div class="bos-cards"><slot /></div></section>
```

```css
.bos-visual { margin: 16px 0; padding: 20px; border: 1px solid #dbe2cf; border-radius: 18px; background: #fffdf4; color: #183f35; }
.bos-visual > h3 { margin: 0 0 18px; font-size: 19px; line-height: 1.3; }
.bos-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 160px), 1fr)); gap: 14px; counter-reset: steps; }
.bos-sequence .bos-card { counter-increment: steps; }
.bos-sequence .bos-number::before { content: counter(steps); display: grid; place-content: center; width: 28px; height: 28px; border-radius: 50%; background: #245c45; color: #fffdf4; margin-bottom: 12px; font-size: 13px; }
```

---

<!-- componentName: bos-step -->

# One step

Keep the title short and give one concrete explanation in the body.

```html
<article class="bos-card"><span class="bos-number" aria-hidden="true"></span><h4><slot name="title" /></h4><div><slot /></div></article>
```

```css
.bos-card { min-width: 0; padding: 16px; border-radius: 12px; background: #edf1e5; overflow-wrap: anywhere; }
.bos-card h4 { margin: 0 0 8px; font-size: 16px; line-height: 1.35; }
.bos-card p { margin: 0; font-size: 14px; line-height: 1.55; }
```

---

<!-- componentName: bos-compare -->

# Compare alternatives

Use the same comparison dimensions in both options. This visual does not choose
for the learner or imply one option is always better.

```html
<section class="bos-visual bos-comparison"><h3><slot name="title" /></h3><div class="bos-cards"><slot /></div></section>
```

---

<!-- componentName: bos-option -->

# One alternative

Use a descriptive title and a short paragraph or list of trade-offs.

```html
<article class="bos-card"><h4><slot name="title" /></h4><div><slot /></div></article>
```

---

<!-- componentName: bos-flow -->

# A connected process graph

Use two to four nodes for a directed, linear process. Arrows mean “next,” not
causation or a guarantee. DOM order is reading order; decorative arrows are hidden
from assistive technology. On narrow screens the graph runs down the page.
This deliberately small graph does not represent branches or numeric data.

```html
<section class="bos-visual bos-flow"><h3><slot name="title" /></h3><ol class="bos-flow-nodes"><slot /></ol></section>
```

```css
.bos-flow-nodes { display: flex; gap: 32px; list-style: none; margin: 0; padding: 0; }
.bos-flow-node { flex: 1; min-width: 0; position: relative; padding: 16px; border: 2px solid #47775a; border-radius: 16px; background: #edf1e5; overflow-wrap: anywhere; }
.bos-flow-node h4 { margin: 0 0 8px; font-size: 16px; }
.bos-flow-node p { margin: 0; font-size: 14px; line-height: 1.55; }
.bos-flow-arrow { position: absolute; left: calc(100% + 3px); top: 50%; width: 28px; height: 2px; background: #47775a; }
.bos-flow-arrow::after { content: ""; position: absolute; right: 0; top: -4px; width: 8px; height: 8px; border-right: 2px solid #47775a; border-top: 2px solid #47775a; transform: rotate(45deg); }
.bos-flow-node:last-child .bos-flow-arrow { display: none; }
@container (max-width: 600px) {
  .bos-flow-nodes { flex-direction: column; }
  .bos-flow-arrow { left: 50%; top: calc(100% + 3px); width: 2px; height: 28px; }
  .bos-flow-arrow::after { right: -4px; top: auto; bottom: 0; transform: rotate(135deg); }
}
.bos-flow { container-type: inline-size; }
```

---

<!-- componentName: bos-node -->

# A graph node

Give each node one short label and one concrete action. The containing ordered
list preserves the process for screen readers without reading decorative arrows.

```html
<li class="bos-flow-node"><h4><slot name="title" /></h4><slot /><span class="bos-flow-arrow" aria-hidden="true"></span></li>
```

---

<!-- componentName: bos-chart -->

# A labeled numeric graph

Use native Datatype notation with a title and a paragraph listing the units,
categories, and exact values. The component enlarges the native chart glyphs;
it does not introduce another chart engine. Label hypothetical data explicitly.

```html
<section class="bos-visual bos-chart"><h3><slot name="title" /></h3><slot /></section>
```

```css
.bos-chart .pmx-datatype { font-size: clamp(32px, 7vw, 56px); max-width: 100%; }
.bos-chart { overflow-x: auto; }
.bos-chart p { margin: 12px 0; }
```

---

<!-- componentName: bos-bar -->

# A labeled percentage bar

Place up to eight bars directly inside `bos-chart`. The `value` attribute is an
integer from 0 to 100; the body names the category. Every bar shares the same
0–100 percent scale. The native meter provides an accessible numeric value.
Use Datatype for tiny inline charts; use these bars when comparing labeled shares.
The server validates values before saving model output. Do not use this component
for dollars, negative values, or unnormalized quantities.

```html
<label class="bos-bar"><span class="bos-bar-label"><span><slot /></span><strong>{{ value }}%</strong></span><meter min="0" max="100" value="{{ value }}">{{ value }} percent</meter></label>
```

```css
.bos-bar { display: block; margin: 16px 0; font: 14px/1.5 system-ui, sans-serif; }
.bos-bar-label { display: flex; justify-content: space-between; gap: 16px; margin-bottom: 6px; }
.bos-bar-label strong { font-variant-numeric: tabular-nums; }
.bos-bar meter { display: block; width: 100%; height: 14px; border: 0; background: #e3eadd; border-radius: 8px; }
.bos-bar meter::-webkit-meter-bar { background: #e3eadd; border: 0; border-radius: 8px; }
.bos-bar meter::-webkit-meter-optimum-value { background: #47775a; border-radius: 8px; }
.bos-bar meter::-moz-meter-bar { background: #47775a; border-radius: 8px; }
```

```md
<bos-chart><slot name="title">Fictional budget shares</slot>
<p>Percent of a fictional monthly budget, not a recommended split.</p>
<bos-bar value="50">Needs</bos-bar>
<bos-bar value="30">Wants</bos-bar>
<bos-bar value="20">Savings</bos-bar>
</bos-chart>
```
