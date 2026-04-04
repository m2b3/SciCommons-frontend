import type { ReviewOut } from '@/api/schemas';
import { FlagType } from '@/api/schemas';

type ReviewWithPinnedState = ReviewOut & {
  pinned?: boolean;
};

/* Fixed by Codex on 2026-03-22
   Who: Codex
   What: Centralized review pinned-state detection behind one helper.
   Why: sureshDev still has older generated review payloads using `flags`, while newer backend/client shapes expose `pinned` directly.
   How: Prefer explicit `pinned` when present and fall back to the legacy `flags` array so review UI works across both payload versions. */
export const isReviewPinned = (review: ReviewOut): boolean => {
  const pinnedReview = review as ReviewWithPinnedState;
  return pinnedReview.pinned ?? review.flags?.includes(FlagType.pinned) ?? false;
};
