/**
 * Common types shared across services
 * Ensures consistency across all service implementations (UserService, TeamService, etc.)
 */

export type SortOption = string | Record<string, 1 | -1> | null;

export interface FindOptions {
  match?: Record<string, any>;
  sort?: SortOption;
  pagination?: { skip: number; limit: number };
  populate?: string[];
}

export interface PaginateProps {
  match: Record<string, any>;
  sort?: SortOption;
  page?: string | number;
  pageSize?: number;
}
