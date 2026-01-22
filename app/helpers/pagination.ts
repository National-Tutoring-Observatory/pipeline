/**
 * Pagination utilities
 */

const DEFAULT_PAGE_SIZE = 20;

export function getPaginationParams(
  currentPage?: number | string,
  pageSize?: number,
) {
  const page = Number(currentPage) || 1;
  const size = pageSize ?? DEFAULT_PAGE_SIZE;
  const skip = (page - 1) * size;
  return { skip, limit: size };
}

export function getTotalPages(total: number, pageSize?: number): number {
  const size = pageSize ?? DEFAULT_PAGE_SIZE;
  return Math.ceil(total / size);
}
