/**
 * Generated by orval v6.31.0 🍺
 * Do not edit manually.
 * MyApp API
 * OpenAPI spec version: 1.0.0
 */
import type { DiscussionOut } from './discussionOut';

export interface PaginatedDiscussionSchema {
  items: DiscussionOut[];
  page: number;
  per_page: number;
  total: number;
}