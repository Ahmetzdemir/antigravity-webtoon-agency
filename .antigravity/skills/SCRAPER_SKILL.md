# Skill: Webtoon Scraper & Slicer

This skill enables the Antigravity Agency to handle high-resolution, long vertical webtoon strips by slicing them into manageable chunks for AI processing.

## 🎯 Objective
Automate the ingestion and preparation of manhwa images for OCR and translation while maintaining visual context.

## 🛠️ Technical Workflow

### 1. Ingestion
- Support for Single Image (PNG/JPG).
- Support for Batch Upload / ZIP files.
- URL-based scraping (future extension).

### 2. Slicing Logic (The "Agency" Secret Sauce)
Long manhwa pages often exceed the "vision window" or token limits of LLMs.
- **Slice Height**: Target 2000px height per slice.
- **Overlap**: Include a 100px vertical overlap between slices to ensure speech bubbles that are cut in half can be reconstructed correctly.
- **Resolution**: Maintain original DPI for maximum OCR accuracy.

### 3. Metadata Generation
Every slice must be tagged with:
- `original_file_id`
- `slice_index`
- `dimensions`
- `coordinate_offset` (important for mapping translated text back to the original image).

## 📜 Implementation Rules
- Always use client-side Canvas for slicing when possible to minimize server load.
- If a slice contains no detected speech bubbles, mark as "clean" (optimizes translation costs).
