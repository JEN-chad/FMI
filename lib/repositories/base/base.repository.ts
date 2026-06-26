import { PrismaClient } from "@prisma/client";
import { PrismaTx } from "@/lib/db/prisma";

export abstract class BaseRepository<T, CreateDTO, UpdateDTO> {
  constructor(
    protected readonly prisma: PrismaClient,
    protected readonly modelName: string
  ) {}

  /**
   * Returns the model client, using the transaction client if active
   */
  protected getModel(tx?: PrismaTx) {
    const client = tx || this.prisma;
    return (client as any)[this.modelName];
  }

  /**
   * Retrieves a single record by its ID, ensuring it is not soft-deleted
   */
  async findById(id: string, tx?: PrismaTx): Promise<T | null> {
    return this.getModel(tx).findFirst({
      where: { id, deletedAt: null },
    });
  }

  /**
   * Retrieves the first record matching the filter, ensuring it is not soft-deleted
   */
  async findFirst(where: any, tx?: PrismaTx): Promise<T | null> {
    return this.getModel(tx).findFirst({
      where: { ...where, deletedAt: null },
    });
  }

  /**
   * Retrieves multiple records, automatically applying the soft-delete filter
   */
  async findMany(
    params: {
      where?: any;
      orderBy?: any;
      take?: number;
      skip?: number;
      include?: any;
      select?: any;
    } = {},
    tx?: PrismaTx
  ): Promise<T[]> {
    const where = { ...params.where, deletedAt: null };
    return this.getModel(tx).findMany({
      ...params,
      where,
    });
  }

  /**
   * Creates a new record
   */
  async create(data: CreateDTO, tx?: PrismaTx): Promise<T> {
    return this.getModel(tx).create({
      data,
    });
  }

  /**
   * Updates an existing record by ID
   */
  async update(id: string, data: UpdateDTO, tx?: PrismaTx): Promise<T> {
    return this.getModel(tx).update({
      where: { id },
      data,
    });
  }

  /**
   * Performs a soft delete by updating the deletedAt timestamp
   */
  async delete(id: string, tx?: PrismaTx): Promise<T> {
    return this.getModel(tx).update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Hard deletes a record from the database (use with caution)
   */
  async hardDelete(id: string, tx?: PrismaTx): Promise<T> {
    return this.getModel(tx).delete({
      where: { id },
    });
  }

  /**
   * Counts the number of active records matching the filter
   */
  async count(where: any = {}, tx?: PrismaTx): Promise<number> {
    const finalWhere = { ...where, deletedAt: null };
    return this.getModel(tx).count({
      where: finalWhere,
    });
  }
}
