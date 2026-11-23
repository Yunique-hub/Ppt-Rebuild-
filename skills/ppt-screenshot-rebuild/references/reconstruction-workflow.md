# Reconstruction workflow details

Read this reference when building a dense slide from a screenshot or when replacing several images in an existing recreation. It captures the operational lessons of a multi-slide project with blue and gold technical layouts, people, industry scenes, certificates, data cards, and timeline photos. These are methods, not a required theme.

## 1. Inventory before editing

List the reference images and supplied assets. Check dimensions and image formats. Distinguish three kinds of content:

| Content | Preferred representation in PPTX | Why |
|---|---|---|
| Headings, body copy, names, numbers | Native text boxes and formatted runs | Direct wording and style edits |
| Panels, ribbons, outlines, icons, arrows, simple charts, glows | Native shapes, paths, gradients, lines | Recolor, resize, reorder |
| People, landscape, factory scenes, certificates, complex logos | Independent picture objects | Replace source material without moving surrounding layout |

When the user says “fully editable,” explain that the **composition and rebuilt text/shapes** are editable. Photographic pixels and text already printed inside a photo are still raster content. Rebuild an image's printed words separately only if the user actually needs to edit those words and they can be read reliably.

## 2. Measure and transcribe

- Use the screenshot width and height as the coordinate system. Build a region table with approximate `x, y, width, height`, z-order, and text hierarchy. Convert coordinates proportionally if the slide size changes.
- Transcribe visible text into an inventory before writing it to the slide. Identify emphasis within a line, such as gold award level or bold keyword, as text runs rather than separate images.
- Record uncertainty explicitly. A stylized name, tiny certificate text, or cropped line is a candidate for clarification. Keep working on regions that do not depend on the answer.
- Derive color and type hierarchy from the screenshot, but expect a nearby installed font to produce different glyph widths. Inspect the actual rendered output and adjust box width, font size, spacing, and baseline.

## 3. Prepare the picture layers

- Match each source image to a semantic slot, not merely to whichever crop fits. For a narrative sequence, keep its intended order.
- Crop photographs to each frame without stretching them. For certificates, preserve names, award levels, seals, and other important content; use a contained fit when a fill crop would remove these.
- For a person over a background, a transparent cutout and a separate background picture are useful if the user intends to swap only the portrait. Verify that the cutout still resembles the source; generative extraction may alter the face, hair, hands, or clothing.
- If removing baked-in overlay text from a screenshot crop, rebuild only the occluded region needed for the background. Compare the result with the reference and report meaningful differences. Do not rewrite factual marks, awards, logos, or names inside certificate images with generative tools.
- Keep original files or copied source assets untouched so the user can replace or revise the treatment later.

## 4. Author for later editing

- Name picture slots by function, for example `Portrait — replace image`, `Certificate 01 — replace image`, or `Step 03 photo — replace image`. Match the language of the deck. Names in the PowerPoint Selection Pane reduce accidental edits to the wrong layer.
- Separate frames and overlays from the pictures inside them. A picture swap should affect the picture, not its caption, frame, badge, or connector.
- Use native text boxes with inline formatting for mixed-color copy. Use native paths and preset shapes for icons where feasible. Many small shapes are acceptable if the visual and editability benefit justifies them; do not add invisible complexity without purpose.
- Avoid importing the entire screenshot as a background behind rebuilt elements: this leaves duplicated text and prevents meaningful picture replacement. If a small decorative photographic texture must remain, keep it clearly scoped.
- Use an existing editable deck when provided. Preserve unrelated layout and copy; adjust only the affected picture slots and the text changes the user requested.

## 5. Check the actual file

The important test is the rendered PowerPoint slide, not only the code or file creation. When possible:

1. Open the PPTX, render every changed slide, and compare it visually with the reference at matching proportions.
2. Check for text overflow using rendered bounds or a native PowerPoint inspection method. Pay special attention to stylized names, long Chinese lines, and numbers with separate unit glyphs.
3. Inspect object types: text should be native text boxes or text runs; decorative vectors should be shapes; image slots should be distinct picture objects.
4. In a disposable copy, change each picture source and verify its position, size, crop behavior, frame, and surrounding text. If practical, compare exported pixels outside the picture regions to catch unintended changes.
5. Verify factual content and the order of the photo story. Confirm that media replacements did not leave stale captions or claims.

Object counts are evidence of layering, not a quality target. Do not increase counts merely to appear editable. Package integrity checks support the result, but they do not replace an actual PowerPoint open and render.

## 6. Hand-off wording

Provide the final PPTX and one preview image. Explain the fastest replacement path: open PowerPoint's Selection Pane (`Alt+F10` on Windows), select a picture with a clear role name, and use **Change Picture → From a File**; adjust **Crop** if the new aspect ratio differs. Summarize which parts are native and which are raster. If the reference was screenshot-only, state that ornate fonts, generated cutouts, repaired backgrounds, and complex effects may differ from the original image.
