const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME!;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY!;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET!;
const CLOUDINARY_UPLOAD_PRESET = "fmi_unsigned"; // Create this in Cloudinary dashboard

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  format: string;
  bytes: number;
  original_filename: string;
}

/**
 * Server-side signed upload using Cloudinary REST API
 */
export async function uploadToCloudinary(
  file: Buffer | string,
  options: {
    folder?: string;
    resourceType?: "image" | "video" | "raw" | "auto";
    publicId?: string;
  } = {}
): Promise<CloudinaryUploadResult> {
  const { folder = "fmi", resourceType = "auto", publicId } = options;

  const timestamp = Math.round(new Date().getTime() / 1000);
  const paramsToSign: Record<string, string | number> = {
    timestamp,
    folder,
  };
  if (publicId) paramsToSign.public_id = publicId;

  // Create signature
  const crypto = await import("crypto");
  const sortedParams = Object.keys(paramsToSign)
    .sort()
    .map((k) => `${k}=${paramsToSign[k]}`)
    .join("&");
  const signature = crypto
    .createHash("sha256")
    .update(`${sortedParams}${CLOUDINARY_API_SECRET}`)
    .digest("hex");

  const formData = new FormData();
  formData.append("timestamp", timestamp.toString());
  formData.append("api_key", CLOUDINARY_API_KEY);
  formData.append("signature", signature);
  formData.append("folder", folder);
  if (publicId) formData.append("public_id", publicId);

  if (typeof file === "string") {
    formData.append("file", file);
  } else {
    formData.append("file", new Blob([file as any]));
  }

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
    { method: "POST", body: formData }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Cloudinary upload failed: ${JSON.stringify(err)}`);
  }

  return response.json();
}

/**
 * Get the public unsigned upload URL for client-side uploads
 */
export function getCloudinaryUploadUrl(resourceType: "image" | "video" | "raw" | "auto" = "auto") {
  return `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;
}

export { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET };
