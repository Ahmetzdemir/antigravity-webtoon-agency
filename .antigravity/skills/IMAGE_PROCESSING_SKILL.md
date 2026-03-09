# Skill: Visual Processing (Inpainting & Typesetting)

This skill handles the final stage of the pipeline: taking translated text coordinates and rendering them back onto the webtoon panel.

## 🎯 Objective
1. **Clean:** Remove original text without destroying the artwork.
2. **Typeset:** Render translated text dynamically to fit the original bubble.

## 🛠️ Technical Workflow (Client-Side Canvas)

### 1. The Masking (Cleaning) Phase
- We receive `[ymin, xmin, ymax, xmax]` normalized coordinates (0 to 1000) from the Gemini Translation Skill.
- Convert these to absolute pixel coordinates `(x, y, width, height)` based on the original image dimensions.
- **Agency Action:** Draw a `#FFFFFF` (white) rectangle over the bounding box to "erase" the Korean/English text. This assumes standard white speech bubbles. 
*(Future Enhancement: Sample the edge pixels of the bounding box to fill with non-white backgrounds, true inpainting).*

### 2. The Smart Typesetting Phase
- The translated Turkish text must be drawn inside the newly cleaned bounding box.
- Start with a large font size (e.g., 40px `Comic Neue` or `Anime Ace`).
- Calculate text width and apply word-wrapping based on the bounding box `width`.
- Calculate total text height after wrapping. If it exceeds bounding box `height`, reduce font size and recalculate.
- Iterate until the text fits perfectly.
- Draw the text centered both horizontally and vertically within the bounding box.

## 📜 Rendering Rules
- **Font Face:** `Comic Neue` (or available comic font), bold.
- **Color:** `#000000` (Black).
- **Alignment:** Center.
- **Line Height:** 1.2
