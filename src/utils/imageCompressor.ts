/**
 * Client-side image compressor utility
 * Resizes images to max dimensions and converts to JPEG/PNG Data URLs
 * to ensure questions with illustrations remain lightweight in localStorage.
 */

export async function compressImageFile(file: File, maxWidth = 800, maxHeight = 600, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    // If it's already an SVG, keep it as text data URL without lossy rasterization
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Default to image/webp if supported, or image/jpeg
        const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(mime, quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Gagal memproses file gambar.'));
      img.src = event.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
