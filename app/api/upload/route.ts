import { NextRequest } from "next/server";
import { z } from "zod";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { handleApiError, sendSuccess } from "@/lib/utils/api-response";
import { requireApiSession } from "@/lib/security/api-auth";
import { ValidationError } from "@/lib/errors/app-error";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
const UploadSchema = z.object({
  folder: z.string().regex(/^[a-zA-Z0-9/_-]{1,80}$/).default("fmi"),
});

export async function POST(request: NextRequest) {
  try {
    await requireApiSession(request.headers);
    const formData = await request.formData();
    const file = formData.get("file");
    const folder = formData.get("folder");
    const parsed = UploadSchema.parse({ folder: typeof folder === "string" ? folder : undefined });

    if (!(file instanceof File)) throw new ValidationError("No file uploaded");
    if (file.size > MAX_UPLOAD_BYTES) throw new ValidationError("File exceeds 10MB limit");
    if (!ALLOWED_MIME_TYPES.has(file.type)) throw new ValidationError("Unsupported file type");

    const buffer = Buffer.from(await file.arrayBuffer());
    const baseName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 80);
    const result = await uploadToCloudinary(buffer, {
      folder: parsed.folder,
      resourceType: file.type === "application/pdf" ? "raw" : "image",
      publicId: `${Date.now()}-${baseName}`,
    });

    return sendSuccess({ url: result.secure_url, publicId: result.public_id }, undefined, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
