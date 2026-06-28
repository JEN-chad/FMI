import { NextRequest } from "next/server";
import { z } from "zod";
import { AssetType } from "@prisma/client";
import { listingService } from "@/lib/services/listing.service";
import { handleApiError, sendSuccess } from "@/lib/utils/api-response";
import { requireApiSession } from "@/lib/security/api-auth";

const ListingsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  assetType: z.nativeEnum(AssetType).optional(),
  q: z.string().trim().max(100).optional(),
});

export async function GET(request: NextRequest) {
  try {
    await requireApiSession(request.headers);
    const query = ListingsQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const result = await listingService.queryMarketplace({
      page: query.page,
      limit: query.limit,
      sortBy: "createdAt",
      sortOrder: "desc",
      search: query.q,
      assetType: query.assetType,
    });

    return sendSuccess(result.data, result.meta);
  } catch (error) {
    return handleApiError(error);
  }
}

