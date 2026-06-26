import { Buffer } from "buffer";

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  cursor?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total?: number; // Only for offset pagination
    page?: number;  // Only for offset pagination
    limit: number;
    hasNextPage: boolean;
    nextCursor?: string; // For cursor pagination
  };
}

/**
 * Base64 encodes an object to serve as a cursor
 */
export function encodeCursor(data: Record<string, unknown>): string {
  return Buffer.from(JSON.stringify(data)).toString("base64");
}

/**
 * Decodes a base64 string cursor back to its object form
 */
export function decodeCursor<T = Record<string, unknown>>(cursor: string): T {
  try {
    const decoded = Buffer.from(cursor, "base64").toString("utf-8");
    return JSON.parse(decoded) as T;
  } catch (error) {
    throw new Error("Invalid pagination cursor");
  }
}

/**
 * Builds offset pagination parameters for Prisma
 */
export function getOffsetParams(page: number = 1, limit: number = 10) {
  const take = Math.max(1, limit);
  const skip = (Math.max(1, page) - 1) * take;
  return { take, skip };
}

/**
 * Helper to structure offset paginated results
 */
export function formatOffsetResult<T>(
  data: T[],
  total: number,
  page: number = 1,
  limit: number = 10
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / limit);
  return {
    data,
    meta: {
      total,
      page,
      limit,
      hasNextPage: page < totalPages,
    },
  };
}

interface CursorPayload {
  createdAt: string;
  id: string;
}

/**
 * Standard cursor pagination resolver for Prisma queries.
 * Fetches limit + 1 items to determine if a next page exists.
 */
export function getCursorParams(
  cursorStr?: string,
  limit: number = 10,
  sortOrder: "asc" | "desc" = "desc"
) {
  const take = Math.max(1, limit) + 1; // Fetch one extra item to check hasNextPage
  let whereClause: any = undefined;

  if (cursorStr) {
    const cursor = decodeCursor<CursorPayload>(cursorStr);
    const cursorDate = new Date(cursor.createdAt);

    if (sortOrder === "desc") {
      // For descending sorting (newest first):
      // Next items have a smaller createdAt, OR the same createdAt but a lexicographically smaller ID
      whereClause = {
        OR: [
          { createdAt: { lt: cursorDate } },
          {
            createdAt: cursorDate,
            id: { lt: cursor.id },
          },
        ],
      };
    } else {
      // For ascending sorting (oldest first):
      // Next items have a larger createdAt, OR the same createdAt but a lexicographically larger ID
      whereClause = {
        OR: [
          { createdAt: { gt: cursorDate } },
          {
            createdAt: cursorDate,
            id: { gt: cursor.id },
          },
        ],
      };
    }
  }

  return {
    take,
    whereClause,
    orderBy: [
      { createdAt: sortOrder },
      { id: sortOrder },
    ],
  };
}

/**
 * Helper to structure cursor-paginated results and generate the next cursor
 */
export function formatCursorResult<T extends { id: string; createdAt: Date }>(
  items: T[],
  limit: number = 10
): PaginatedResult<T> {
  const hasNextPage = items.length > limit;
  const data = hasNextPage ? items.slice(0, limit) : items;

  let nextCursor: string | undefined = undefined;
  if (hasNextPage && data.length > 0) {
    const lastItem = data[data.length - 1];
    nextCursor = encodeCursor({
      createdAt: lastItem.createdAt.toISOString(),
      id: lastItem.id,
    });
  }

  return {
    data,
    meta: {
      limit,
      hasNextPage,
      nextCursor,
    },
  };
}
