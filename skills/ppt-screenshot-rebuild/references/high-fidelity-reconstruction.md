# High-fidelity screenshot reconstruction

Read this when the user asks for exact matching or identifies visual differences in a prior recreation. The goal is faithful appearance with useful native editing, not a stylistic redesign.

## Establish the comparison

- Separate the original slide screenshot from screenshots of a PowerPoint window. Crop application chrome or surrounding margins only for comparison; retain the original files. Match the original slide canvas and aspect ratio.
- Open the existing editable deck and inspect its object inventory. Fix the relevant objects or their authoring source without unnecessarily changing unrelated text or photos. Save a new revision unless overwriting is explicitly requested.
- Compare at the same pixel dimensions. Record concrete differences by region: outer background, panel interiors, frames, headers, typography, photos, connectors, footer. Start with the differences the user identified.

## Preserve background fidelity

- Inventory background-only artwork independently of foreground content: dotted waves, perspective floor, gradients, highlights, curved light trails and irregular texture. Match their positions, density, direction, color and falloff; generic line grids are not equivalent to the source.
- Use clean source pixels for complex texture when available. Keep texture as a named, independently replaceable picture. Use native paths and gradients for editable borders, badges, arrows, and reproducible light accents.
- Repair only obscured regions that need to be revealed. A generative reconstruction can change geometry and detail; label it as repaired, inspect it, and never describe it as unchanged source pixels.
- Source patches must not contain text, labels, frames or arrows that are meant to be editable elsewhere. Inspect patches in isolation and test moving or deleting the foreground objects to detect residual baked-in duplicates.
- Inspect patch joins at full resolution. Do not retain raw rectangular patches merely to claim source preservation when their seams make the result less faithful. Prefer coherent texture reconstruction over visible collage edges, and disclose the reconstruction.
- Do not put the unmodified screenshot underneath editable overlays as a shortcut. It preserves ghost text and prevents meaningful removal, recoloring or photo replacement.

## Match native geometry and type

- Reconstruct clipped corners, skewed ribbons, curve control points and line widths from measurements. Rounded rectangles are not substitutes for chamfered panels.
- In Office, a glow on a translucent filled shape can brighten its whole area. Separate an opaque dark panel from a no-fill glowing outline when necessary; judge the actual PowerPoint render.
- Check Chinese glyph width, height, weight, tracking and line spacing, not only nominal font size. Stylized calligraphy reconstructed with a substitute font must remain text and be disclosed as an approximation unless the user prefers a raster treatment.
- Avoid repeated automatic shrinking against an already-shrunk preview. Use the original measurement baseline or persist per-object final dimensions and sizes. Recheck the complete line after each adjustment.
- Keep scientific illustrations and photos independently replaceable. Reconstructed scientific pixels are illustrative; preserve qualifiers such as “示意图，非实测SEM”.

## Verify both appearance and editability

1. Render the final saved PPTX in PowerPoint or another available presentation application. Check every affected region against the reference, and inspect the complete slide for cropping, overflow and stray off-canvas lines.
2. Check a few representative native edits in a temporary copy: change a percentage or heading; recolor a border; move a connector. Confirm the original text or line does not remain baked into a background picture.
3. Replace content images in a temporary copy and render it. Check position, size, clipping and surrounding text/frames. A pixel comparison outside the image regions is useful for detecting unintended changes. Treat decorative texture separately so a full-slide background does not make this test vacuous.
4. A difference image or regional pixel-error measure can locate regressions, but antialiasing, font substitution and effects prevent such measures from proving semantic editability. Do not invent an accuracy percentage from subjective impressions or object counts.
5. Deliver the revised PPTX and its actual rendered preview. For exact-match requests, state any remaining font, effect, texture or photographic differences. If pixel identity is still required, request the original PPTX, fonts, or clean background assets needed to resolve those specific gaps; do not claim success that the comparison disproves.

## Skill improvement after a real failure

When the user also asks to improve this skill, back up the installed files, make a focused change based on observed failures, validate frontmatter and reference links, and install the updated files in the same discoverable skill directory. Avoid storing user slide images or project-specific paths inside the reusable skill. Preserve existing invocation policy and unrelated metadata.
