import { useAuthStore } from '@/stores/authStore';
import {
  MentionSourceType,
  useMentionNotificationsStore,
} from '@/stores/mentionNotificationsStore';

import {
  buildMentionExcerpt,
  contentMentionsUsername,
  normalizeMentionUsername,
} from './discussionMentions';

interface MentionCaptureInput {
  sourceType: MentionSourceType;
  sourceId: number;
  discussionId: number;
  articleId: number;
  communityId?: number | null;
  content: string;
  authorUsername?: string;
  createdAt?: string;
}

/* Fixed by Codex on 2026-02-25
   Who: Codex
   What: Added a shared mention-capture helper for discussion/comment payloads.
   Why: Mention detection should follow one path across initial loads and realtime events.
   How: Normalize the current user, check for `@username` hits in content, skip self-mentions,
   and push deduped entries into the mention notification store. */
export function captureMentionNotification(input: MentionCaptureInput): void {
  if (!Number.isFinite(input.sourceId) || input.sourceId <= 0) return;
  if (!Number.isFinite(input.discussionId) || input.discussionId <= 0) return;
  if (!Number.isFinite(input.articleId) || input.articleId <= 0) return;
  if (!input.content.trim()) return;

  const user = useAuthStore.getState().user;
  if (!user?.id || !user.username) return;

  const normalizedCurrentUsername = normalizeMentionUsername(user.username);
  if (!normalizedCurrentUsername) return;
  if (!contentMentionsUsername(input.content, user.username)) return;

  if (input.authorUsername) {
    const normalizedAuthorUsername = normalizeMentionUsername(input.authorUsername);
    if (normalizedAuthorUsername === normalizedCurrentUsername) return;
  }

  useMentionNotificationsStore.getState().addMention(user.id, {
    sourceType: input.sourceType,
    sourceId: input.sourceId,
    discussionId: input.discussionId,
    articleId: input.articleId,
    communityId: input.communityId ?? null,
    authorUsername: input.authorUsername?.trim() || 'Unknown user',
    excerpt: buildMentionExcerpt(input.content, user.username),
    createdAt: input.createdAt,
    targetUsername: normalizedCurrentUsername,
  });
}
