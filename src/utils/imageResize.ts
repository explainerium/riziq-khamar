const MAX_SIDE = 2000;
const QUALITY = 0.85;
/** Small enough to send as it is. */
const SEND_AS_IS_BYTES = 1.5 * 1024 * 1024;

function readSize(file: Blob): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("decode"));
    };
    image.src = url;
  });
}

/**
 * Shrinks a phone photo before upload: a large original is slow on mobile data
 * and can be over Cloudinary's file limit. If the browser cannot decode the
 * file (an unusual format, or too little memory), the original is sent.
 */
export async function resizeForUpload(file: File): Promise<Blob> {
  try {
    const { width, height } = await readSize(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(width, height));
    if (scale === 1 && file.size <= SEND_AS_IS_BYTES) return file;

    const targetWidth = Math.round(width * scale);
    const targetHeight = Math.round(height * scale);
    const bitmap = await createImageBitmap(file, {
      resizeWidth: targetWidth,
      resizeHeight: targetHeight,
      resizeQuality: "high",
    });

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", QUALITY));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}
