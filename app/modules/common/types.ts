/**
 * Common types shared across services
 * Ensures consistency across all service implementations (UserService, TeamService, etc.)
 */

export interface FindOptions {
  match?: Record<string, any>;
  sort?: Record<string, 1 | -1>;
  pagination?: { skip: number; limit: number };
  populate?: string[];
}
