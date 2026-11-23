---
name: ppt-screenshot-rebuild
description: Rebuild a slide from a screenshot as a visually faithful, editable PowerPoint, or replace photos in an existing screenshot-based recreation while preserving its layout. Use when the user supplies PPT screenshots and wants a PPTX that can be edited or have its image materials swapped.
---

# Screenshot to editable PowerPoint

This skill covers two related tasks: creating an editable `.pptx` from a slide screenshot, and replacing the image materials in an existing recreation. Read the available presentation-authoring guidance for the current environment before creating or modifying a deck. The user's requested accuracy, editing scope, supplied media, and exact wording take precedence over conventions in this skill.

## Decide what to build

1. Identify the reference screenshot, its pixel dimensions, any existing `.pptx`, and the media supplied for replacement. If an editable source deck exists, modify that deck; if only a screenshot exists, rebuild the slide.
2. Define success in terms the user can inspect: visual similarity, independently editable text and shapes, replaceable photo slots, correct content, and a PPTX that opens and renders.
3. Ask only about consequential uncertainty that cannot be verified from the materials, such as a person's name, award level, or unreadable source text. Continue with independent layout work while waiting. Do not silently invent factual content.
4. For strict visual matching, a background-fidelity complaint, or “1:1” reproduction, read [high-fidelity reconstruction](references/high-fidelity-reconstruction.md) before editing. Treat the original screenshot as the visual authority; the previous reconstruction is only an editable starting point. Explain the limits of screenshot-only input without treating those limits as a reason to skip achievable improvements.

## Reconstruct the slide

- Analyze the screenshot as layers: canvas and background, photos, panels, typography, icons, borders, highlights, and other effects. Record each region's approximate position, size, stacking order, color, font style, and role. Preserve the screenshot aspect ratio unless the user chooses another.
- Match background texture, light paths, panel corner geometry, translucency, and glow falloff explicitly. Do not replace a complex reference background with a convenient generic grid or gradient. Preserve clean source texture where possible; isolate repaired or generated regions and check for visible seams.
- Create titles, paragraphs, dates, figures, calligraphy approximations, ribbons, cards, frames, icons, arrows, and simple light effects as native editable PowerPoint objects. A photo, detailed certificate, complex logo, or photographic texture may remain an **independent picture object**; do not flatten the whole slide into one image.
- Give picture objects clear, stable names that identify their role and support replacement through the Selection Pane. Keep the foreground subject separate from its background when that materially improves replacement.
- Prefer the supplied original media. Crop and adjust it to fit the reference. When a screenshot is the only source, an extracted picture may include baked-in labels, borders, or occlusions; clean those only when needed for a separate photo layer. Preserve an unmodified source copy. Use image editing tools for image edits when available. Do not claim that generated or reconstructed pixels preserve identity or details exactly.
- Keep content faithful to the current reference. Do not transfer names, claims, numbers, certificates, or copy from another slide unless the user asks. If new media contradicts visible wording, verify the facts and update only the affected text when the user authorizes that change.

## Replace media in an existing slide

Map each new asset to a picture slot by subject, orientation, and narrative role. Optimize crop, exposure, and color consistency within the user's allowed scope. Retain the existing composition and unrelated text. If a replacement must change a factual headline or caption, edit that exact text and check the result in the slide.

## Verify and deliver

- Open and render the final PPTX in a presentation application when available. Compare the rendered slide against the reference at the same aspect ratio. Fix visible overflow, clipping, layering, image crop, and obvious alignment errors.
- For a fidelity correction, compare the previous and revised render against the original at identical dimensions, including background-only regions. Report visible remaining differences. Object counts and successful rendering verify structure, not visual equivalence; do not claim “1:1” or “fully editable” beyond what was actually verified.
- Inspect the file structure or selection inventory to confirm text and shapes are native objects and pictures are separate. Test picture replacement in a **temporary copy** when the user needs reusable slots; verify picture geometry and other slide regions remain intact.
- Deliver the `.pptx`, a rendered preview, and a concise explanation of what is editable and how to replace pictures. Disclose material limits: a screenshot does not contain the original project layers; fonts and effects may differ; text embedded inside photographs or certificates remains raster text unless separately rebuilt.
- Do not promise pixel-perfect or fully editable photographic detail from screenshot-only input. Describe achieved similarity and editability precisely.

For detailed extraction, mapping, object naming, and validation decisions, read [the reconstruction workflow](references/reconstruction-workflow.md).
