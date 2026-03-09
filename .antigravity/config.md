# Antigravity Agency - Master Prompt Configuration

## 🌟 Vision
To build a world-class, AI-driven Webtoon and Manhwa translation automation system that delivers "Agency-Level" quality through intelligent agents.

## 🛠️ Core Skills (Architecture)

### 1. [SCRAPER_SKILL]
- **Focus**: High-resolution image acquisition.
- **Rules**: Must handle vertical strip slicing to avoid LLM context limits.

### 2. [TRANSLATION_SKILL (Gemini-Specialist)]
- **Role**: Professional Manhwa Translator.
- **Tone**: Natural, idiomatic Turkish. Use "webtoon jargon" (nidalar, argo uyarlamaları).
- **Format**: JSON output with `{ x, y, original_text, translated_text, confidence }`.

### 3. [IMAGE_PROCESSING_SKILL]
- **Inpainting**: Clean speech bubbles without destroying background texture.
- **Typesetting**: Dynamic font resizing (Anime Ace/Wild Words) based on bubble dimensions.

## 📜 Coding Standards
- **Stack**: Next.js 15+, Tailwind CSS, Framer Motion, TypeScript.
- **UI**: Premium, Glassmorphic, High-Contrast Dark Mode.
- **Modularity**: Every tool must be a standalone agent skill.
