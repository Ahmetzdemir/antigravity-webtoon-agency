/**
 * Premium Image Utilities for Webtoon Processing
 */

export interface ImageSlice {
  id: string;
  dataUrl: string;
  offsetY: number;
  height: number;
}

/**
 * Slices a long vertical image into smaller chunks with overlap.
 */
export const sliceWebtoonImage = async (
  file: File,
  sliceHeight = 2000,
  overlap = 100
): Promise<ImageSlice[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const slices: ImageSlice[] = [];
        const { width, height } = img;
        let currentY = 0;
        let index = 0;

        while (currentY < height) {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }

          // Calculate actual height for this slice
          const remainingHeight = height - currentY;
          const drawHeight = Math.min(sliceHeight + overlap, remainingHeight);
          
          canvas.width = width;
          canvas.height = drawHeight;

          ctx.drawImage(
            img,
            0, currentY, width, drawHeight, // Source
            0, 0, width, drawHeight          // Destination
          );

          slices.push({
            id: `${file.name}-slice-${index}`,
            dataUrl: canvas.toDataURL('image/jpeg', 0.9),
            offsetY: currentY,
            height: drawHeight
          });

          // Move down, but subtract overlap for the next slice
          currentY += sliceHeight;
          index++;
          
          // Break if we've reached the end
          if (currentY >= height) break;
        }

        resolve(slices);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
