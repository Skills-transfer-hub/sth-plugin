# STH plugin branding

These are the existing, unmodified STH Buddy brand assets from
`skills-transfer-hub/assets/brand/` in the adjacent STH workspace.

| File | Host theme | Source | Size | Background | Buddy |
| --- | --- | --- | --- | --- | --- |
| `sth-icon-light.png` | Light | `icon-light-512.png` | 512 × 512 | `#FFFFFF` | `#0A0A0A` |
| `sth-icon-dark.png` | Dark | `icon-512.png` | 512 × 512 | `#0A0A0A` | `#FAFAFA` |

Both files are PNGs with opaque backgrounds. Use the matching image for the
plugin logo and composer icon in each host theme.

Buddy is the canonical three-line terminal mark, rendered in JetBrains Mono Bold
from `Buddy.renderBuddyBox("^.^", 3)`. The original artwork and neutral color
palette are preserved. Do not redraw, recolor, stretch, or substitute the mark.

The colors above were checked against the actual image pixels. The source color
tokens are `oklch(1 0 0)`, `oklch(0.145 0 0)`, and `oklch(0.985 0 0)` in the STH
design system.

## Transparent Buddy logos

`buddy-logo-light.png` and `buddy-logo-dark.png` are transparent 512 × 512
versions for host surfaces. They render the actual output of
`design-system/assets/buddy.js` → `Buddy.renderBuddyBox("^.^", 3)`:

```text
╭───╮
│^.^│
╰───╯
```

The three text lines were rendered by Chromium in a `<pre>` with JetBrains Mono
Bold, `font-size: 154px`, `line-height: 1`, and no letter spacing. The font comes
from `sth-waitlist/src/app/_og-assets/JetBrainsMono-Bold.ttf`. The light-theme
logo uses `#0A0A0A`; the dark-theme logo uses `#FAFAFA`. Font loading and the
rendered text were checked before capture. No tile, additional border, hand-drawn
shape, or image rescaling was added. The font's box-drawing glyphs join to form
the rounded terminal outline.

Both new files were visually inspected. Their nontransparent content occupies
pixels `(63, 91)` through `(448, 415)`; all canvas corners are transparent.
The original opaque tile assets above are preserved separately.
