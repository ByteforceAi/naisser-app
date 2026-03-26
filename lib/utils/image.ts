/** 이미지 리사이즈 유틸 — Vercel Blob 업로드 전 리사이즈 */

const MAX_WIDTH = 800;
const MAX_HEIGHT = 800;
const QUALITY = 0.85;

export async function resizeImage(
  file: File,
  maxWidth = MAX_WIDTH,
  maxHeight = MAX_HEIGHT
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas 컨텍스트를 생성할 수 없습니다."));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("이미지 변환에 실패했습니다."));
        },
        "image/webp",
        QUALITY
      );
    };
    img.onerror = () => reject(new Error("이미지를 로드할 수 없습니다."));
    img.src = URL.createObjectURL(file);
  });
}
