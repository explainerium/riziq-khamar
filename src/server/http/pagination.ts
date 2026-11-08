export interface PaginationInput {
  page: number;
  limit: number;
}

export const toSkipTake = ({ page, limit }: PaginationInput) => ({ skip: (page - 1) * limit, take: limit });

export const toMeta = ({ page, limit }: PaginationInput, total: number) => ({
  page,
  limit,
  total,
  totalPages: Math.max(1, Math.ceil(total / limit)),
});
