/**
 * Generated by orval v6.31.0 🍺
 * Do not edit manually.
 * MyApp API
 * OpenAPI spec version: 1.0.0
 */
import type { ArticleFiltersCommunityId } from './articleFiltersCommunityId';
import type { FilterType } from './filterType';

export interface ArticleFilters {
  community_id?: ArticleFiltersCommunityId;
  filter_type: FilterType;
  limit?: number;
  offset?: number;
}
