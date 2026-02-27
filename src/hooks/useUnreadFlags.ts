import { EntityType, FlagType } from '@/api/schemas';

// Constants for timing
/* Fixed by Codex on 2026-02-15
   Who: Codex
   What: Shorten NEW tag removal to 1s after the 2s visibility dwell completes.
   Why: Users wanted a quicker removal without being fully immediate.
   How: Set the removal delay to 1000ms while keeping the 2s visibility delay in the hook. */
const NEW_TAG_REMOVAL_DELAY_MS = 1000;

/**
 * Helper to check if an entity has the unread flag from API response
 */
export function hasUnreadFlag(flags?: FlagType[]): boolean {
  return flags?.includes(FlagType.unread) ?? false;
}

/**
 * Map entity type string to EntityType enum
 */
export function getEntityType(type: 'discussion' | 'comment' | 'reply'): EntityType {
  if (type === 'discussion') {
    return EntityType.discussion;
  }
  // Both comments and replies use the 'comment' entity type
  return EntityType.comment;
}

// Export constants for use in components
export { NEW_TAG_REMOVAL_DELAY_MS };
