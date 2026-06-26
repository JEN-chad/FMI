import { Listing, ListingStatus, Prisma } from "@prisma/client";
import { BaseRepository } from "./base/base.repository";
import { CreateListingDTO, UpdateListingDTO, ListingQueryDTO } from "@/lib/dto/listing.dto";
import { prisma, PrismaTx } from "@/lib/db/prisma";
import {
  getOffsetParams,
  formatOffsetResult,
  getCursorParams,
  formatCursorResult,
  PaginatedResult,
} from "@/lib/utils/pagination";

export class ListingRepository extends BaseRepository<
  Listing,
  CreateListingDTO & { sellerId: string; slug: string },
  UpdateListingDTO
> {
  constructor() {
    super(prisma, "listing");
  }

  /**
   * Finds a listing by its unique slug
   */
  async findBySlug(slug: string, tx?: PrismaTx): Promise<Listing | null> {
    return this.findFirst({ slug }, tx);
  }

  /**
   * Increments the view count of a listing atomically
   */
  async incrementViewCount(id: string, tx?: PrismaTx): Promise<Listing> {
    return this.getModel(tx).update({
      where: { id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });
  }

  /**
   * Queries the marketplace with advanced filters, sorting, and pagination
   */
  async queryMarketplace(
    queryParams: ListingQueryDTO,
    tx?: PrismaTx
  ): Promise<PaginatedResult<Listing>> {
    const {
      assetType,
      status = ListingStatus.LIVE,
      minPrice,
      maxPrice,
      minRevenue,
      maxRevenue,
      search,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      cursor,
    } = queryParams;

    const where: Prisma.ListingWhereInput = {
      status,
      deletedAt: null,
    };

    if (assetType) {
      where.assetType = assetType;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.askingPrice = {};
      if (minPrice !== undefined) where.askingPrice.gte = minPrice;
      if (maxPrice !== undefined) where.askingPrice.lte = maxPrice;
    }

    if (minRevenue !== undefined || maxRevenue !== undefined) {
      where.monthlyRevenue = {};
      if (minRevenue !== undefined) where.monthlyRevenue.gte = minRevenue;
      if (maxRevenue !== undefined) where.monthlyRevenue.lte = maxRevenue;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { industry: { contains: search, mode: "insensitive" } },
        { tagline: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Eager load seller info to prevent N+1 queries when rendering list views
    const includeSeller = {
      seller: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          kycStatus: true,
        },
      },
    };

    if (cursor) {
      const { take, whereClause, orderBy } = getCursorParams(cursor, limit, sortOrder);

      const mergedWhere = whereClause
        ? { AND: [where, whereClause] }
        : where;

      const items = await this.getModel(tx).findMany({
        where: mergedWhere,
        take,
        orderBy,
        include: includeSeller,
      });

      return formatCursorResult(items, limit);
    } else {
      const { take, skip } = getOffsetParams(page, limit);
      const orderBy = [{ [sortBy]: sortOrder }, { id: sortOrder }];

      const [items, total] = await Promise.all([
        this.getModel(tx).findMany({
          where,
          take,
          skip,
          orderBy,
          include: includeSeller,
        }),
        this.count(where, tx),
      ]);

      return formatOffsetResult(items, total, page, limit);
    }
  }
}

export const listingRepository = new ListingRepository();
