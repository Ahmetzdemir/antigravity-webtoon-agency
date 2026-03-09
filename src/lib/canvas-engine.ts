import type { ImageSlice } from './image-utils';
import type { TranslationResult } from './gemini';

/**
 * Draws the translated text onto the image slice by first masking the original text
 * and then dynamically sizing the new text to fit the bounding box.
 */
export const renderTranslationsToCanvas = async (
  slice: ImageSlice,
  translationData: TranslationResult
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('No canvas context');

      canvas.width = img.width;
      canvas.height = img.height;

      // 1. Draw original image
      ctx.drawImage(img, 0, 0);

      // 2. Iterate through translations to mask and draw
      translationData.texts.forEach((item) => {
         // Gemini returns [ymin, xmin, ymax, xmax] scaled 0-1000
         const [ymin, xmin, ymax, xmax] = item.box_2d;

         // Convert to absolute pixel coordinates
         const x = (xmin / 1000) * canvas.width;
         const y = (ymin / 1000) * canvas.height;
         const width = ((xmax - xmin) / 1000) * canvas.width;
         const height = ((ymax - ymin) / 1000) * canvas.height;

         // ADD PADDING TO MASK (to ensure we cover the edges of original text)
         const padding = 5;
         const maskX = x - padding;
         const maskY = y - padding;
         const maskW = width + (padding * 2);
         const maskH = height + (padding * 2);

         // --- MASKING (Cleaning) ---
         // For now, assuming standard white speech bubbles.
         ctx.fillStyle = '#FFFFFF';
         ctx.fillRect(maskX, maskY, maskW, maskH);

         // --- TYPESETTING (Smart fitting) ---
         let fontSize = 40; // Max font size
         const minFontSize = 10;
         const fontFamily = '"Comic Neue", "Anime Ace", sans-serif';
         const text = item.translated_text;
         let lines: string[] = [];

         ctx.fillStyle = '#000000'; // Black text
         ctx.textAlign = 'center';
         ctx.textBaseline = 'middle';

         // Function to wrap text
         const getLines = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
            const words = text.split(' ');
            const lines = [];
            let currentLine = words[0];

            for (let i = 1; i < words.length; i++) {
                const word = words[i];
                const measure = ctx.measureText(currentLine + " " + word);
                if (measure.width < maxWidth) {
                    currentLine += " " + word;
                } else {
                    lines.push(currentLine);
                    currentLine = word;
                }
            }
            lines.push(currentLine);
            return lines;
         };

         // Binary/Iterative search for the right font size
         while (fontSize >= minFontSize) {
            ctx.font = `bold ${fontSize}px ${fontFamily}`;
            // Leave a little margin inside the bounding box
            lines = getLines(ctx, text, width - 10);
            
            const totalTextHeight = lines.length * (fontSize * 1.2);
            
            if (totalTextHeight <= height - 10) {
               break; // It fits!
            }
            fontSize -= 2; // Reduce and try again
         }

         // Draw the wrapped text centered in the bounding box
         const lineHeight = fontSize * 1.2;
         const totalTextHeight = lines.length * lineHeight;
         // Start Y so the block of text is centered vertically
         let startY = y + (height / 2) - (totalTextHeight / 2) + (fontSize / 2);
         const centerX = x + (width / 2);

         lines.forEach((line) => {
            ctx.fillText(line, centerX, startY);
            startY += lineHeight;
         });
      });

      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.onerror = reject;
    img.src = slice.dataUrl;
  });
};
