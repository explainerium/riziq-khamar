import "server-only";
import { v2 as cloudinary } from "cloudinary";
import { UPLOAD_FOLDER } from "@/constants/site";
import type { UploadSignature } from "@/utils/cloudinary";
import { env } from "../../config/env";
import { ApiError } from "../../http/ApiError";

const ALLOWED_FORMATS = "jpg,jpeg,png,webp,heic,heif,avif";

function credentials() {
  const { CLOUDINARY_CLOUD_NAME: cloudName, CLOUDINARY_API_KEY: apiKey, CLOUDINARY_API_SECRET: apiSecret } = env;
  return cloudName && apiKey && apiSecret ? { cloudName, apiKey, apiSecret } : null;
}

/**
 * Lets the browser upload one photo straight to Cloudinary, so a large phone
 * photo never passes through this server. The secret stays here; the folder
 * and formats are part of what is signed, so they cannot be changed.
 */
export function signUpload(): UploadSignature {
  const account = credentials();
  if (!account) throw new ApiError(503, "uploadNotConfigured");

  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { allowed_formats: ALLOWED_FORMATS, folder: UPLOAD_FOLDER, timestamp },
    account.apiSecret,
  );

  return {
    cloudName: account.cloudName,
    apiKey: account.apiKey,
    timestamp,
    folder: UPLOAD_FOLDER,
    allowedFormats: ALLOWED_FORMATS,
    signature,
  };
}

/** Removes photos a product no longer uses. Best effort: a leftover file costs nothing but space. */
export async function destroyImages(publicIds: string[]): Promise<void> {
  const account = credentials();
  const ours = publicIds.filter((id) => id.startsWith(`${UPLOAD_FOLDER}/`));
  if (!account || ours.length === 0) return;

  cloudinary.config({
    cloud_name: account.cloudName,
    api_key: account.apiKey,
    api_secret: account.apiSecret,
    secure: true,
  });

  const results = await Promise.allSettled(ours.map((id) => cloudinary.uploader.destroy(id)));
  for (const result of results) {
    if (result.status === "rejected") console.error("[upload] could not delete image", result.reason);
  }
}
