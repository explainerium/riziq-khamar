/**
 * Cloudinary delivery URLs and uploads from the browser. Transformations are
 * placed right after /upload/, so a stored URL can serve any width.
 */
export function cloudinaryUrl(url: string, transformation: string): string {
  return url.includes("/upload/") ? url.replace("/upload/", `/upload/${transformation}/`) : url;
}

/** `thrifty` for small repeated photos, like a grid of product cards. */
export const cloudinaryWidth = (url: string, width: number, thrifty = false): string =>
  cloudinaryUrl(url, `f_auto,${thrifty ? "q_auto:eco" : "q_auto"},c_limit,w_${width}`);

export interface UploadSignature {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  allowedFormats: string;
  signature: string;
}

export interface UploadedImage {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

/** Sends one image straight to Cloudinary. XHR, because fetch cannot report upload progress. */
export function uploadToCloudinary(
  file: Blob,
  signed: UploadSignature,
  onProgress: (percent: number) => void,
): Promise<UploadedImage> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("file", file);
    form.append("api_key", signed.apiKey);
    form.append("timestamp", String(signed.timestamp));
    form.append("folder", signed.folder);
    form.append("allowed_formats", signed.allowedFormats);
    form.append("signature", signed.signature);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onerror = () => reject(new Error("network"));
    xhr.onload = () => {
      try {
        const body = JSON.parse(xhr.responseText) as {
          secure_url?: string;
          public_id?: string;
          width?: number;
          height?: number;
          error?: { message?: string };
        };
        if (xhr.status >= 200 && xhr.status < 300 && body.secure_url && body.public_id && body.width && body.height) {
          resolve({ url: body.secure_url, publicId: body.public_id, width: body.width, height: body.height });
        } else {
          reject(new Error(body.error?.message ?? "upload"));
        }
      } catch {
        reject(new Error("upload"));
      }
    };
    xhr.send(form);
  });
}
