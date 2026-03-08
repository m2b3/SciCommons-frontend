import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { MENTION_NOTIFICATION_RETENTION_MS } from '@/constants/notifications.constants';

export type MentionSourceType = 'discussion' | 'comment';

export interface MentionNotificationItem {
  id: string;
  sourceType: MentionSourceType;
  sourceId: number;
  discussionId: number;
  articleId: number;
  communityId: number | null;
  authorUsername: string;
  excerpt: string;
  link: string;
  createdAt: string;
  detectedAt: number;
  isRead: boolean;
  targetUsername: string;
}

export interface MentionNotificationInput {
  sourceType: MentionSourceType;
  sourceId: number;
  discussionId: number;
  articleId: number;
  communityId?: number | null;
  authorUsername: string;
  excerpt: string;
  createdAt?: string;
  targetUsername: string;
}

interface MentionNotificationsState {
  ownerUserId: number | null;
  mentions: MentionNotificationItem[];
  setOwnerIfNeeded: (userId: number) => void;
  addMention: (userId: number, mention: MentionNotificationInput) => void;
  markMentionAsRead: (userId: number, mentionId: string) => void;
  clearReadMentions: (userId: number) => void;
  cleanupExpired: (userId: number) => void;
  reset: () => void;
}

const MAX_STORED_MENTIONS = 500;

const normalizeTargetUsername = (username: string) => username.trim().toLowerCase();

const buildMentionId = (targetUsername: string, sourceType: MentionSourceType, sourceId: number) =>
  `${targetUsername}:${sourceType}:${sourceId}`;

const buildMentionLink = (mention: MentionNotificationInput): string => {
  const basePath = `/discussions?articleId=${mention.articleId}&discussionId=${mention.discussionId}`;
  if (mention.sourceType !== 'comment') {
    return basePath;
  }

  return `${basePath}&commentId=${mention.sourceId}`;
};

const resolveMentionTimestamp = (
  mention: Pick<MentionNotificationItem, 'createdAt' | 'detectedAt'>
) => {
  const parsedCreatedAt = Date.parse(mention.createdAt);
  if (Number.isNaN(parsedCreatedAt)) {
    return mention.detectedAt;
  }

  return parsedCreatedAt;
};

const pruneExpiredMentions = (mentions: MentionNotificationItem[], now: number) =>
  mentions
    .filter((mention) => now - resolveMentionTimestamp(mention) < MENTION_NOTIFICATION_RETENTION_MS)
    .sort((a, b) => b.detectedAt - a.detectedAt)
    .slice(0, MAX_STORED_MENTIONS);

const getScopedMentions = (
  ownerUserId: number | null,
  mentions: MentionNotificationItem[],
  userId: number
) => {
  if (ownerUserId === userId) {
    return mentions;
  }
  return [];
};

/* Fixed by Codex on 2026-02-25
   Who: Codex
   What: Added a persisted discussion-mention notification store with unread/read state.
   Why: Mention alerts should be created once per mention source and remain available in-app without toast spam.
   How: Store mention entries in localStorage, scope them per authenticated user, dedupe by mention source key,
   and prune entries older than 30 days. */
export const useMentionNotificationsStore = create<MentionNotificationsState>()(
  persist(
    (set) => ({
      ownerUserId: null,
      mentions: [],

      setOwnerIfNeeded: (userId) => {
        set((state) => {
          if (state.ownerUserId === userId) {
            const now = Date.now();
            const prunedMentions = pruneExpiredMentions(state.mentions, now);
            if (prunedMentions.length === state.mentions.length) return state;
            return { mentions: prunedMentions };
          }

          return {
            ownerUserId: userId,
            mentions: [],
          };
        });
      },

      addMention: (userId, mention) => {
        set((state) => {
          const now = Date.now();
          const targetUsername = normalizeTargetUsername(mention.targetUsername);
          if (!targetUsername) return state;

          const scopedMentions = getScopedMentions(state.ownerUserId, state.mentions, userId);
          const prunedMentions = pruneExpiredMentions(scopedMentions, now);
          const mentionId = buildMentionId(targetUsername, mention.sourceType, mention.sourceId);
          const parsedSourceCreatedAt = mention.createdAt
            ? Date.parse(mention.createdAt)
            : Number.NaN;

          /* Fixed by Codex on 2026-02-26
             Who: Codex
             What: Suppressed re-adding mentions whose source timestamp is outside the 30-day retention window.
             Why: Opening old discussion/comment threads should not regenerate stale mention notifications after local cleanup.
             How: Parse mention source `createdAt`; if it is older than retention, keep only pruned current state and skip insertion. */
          if (
            !Number.isNaN(parsedSourceCreatedAt) &&
            now - parsedSourceCreatedAt >= MENTION_NOTIFICATION_RETENTION_MS
          ) {
            if (state.ownerUserId === userId && prunedMentions.length === state.mentions.length) {
              return state;
            }

            return {
              ownerUserId: userId,
              mentions: prunedMentions,
            };
          }

          if (prunedMentions.some((storedMention) => storedMention.id === mentionId)) {
            if (state.ownerUserId === userId && prunedMentions.length === state.mentions.length) {
              return state;
            }

            return {
              ownerUserId: userId,
              mentions: prunedMentions,
            };
          }

          const createdAt =
            mention.createdAt && !Number.isNaN(Date.parse(mention.createdAt))
              ? mention.createdAt
              : new Date(now).toISOString();

          const nextMention: MentionNotificationItem = {
            id: mentionId,
            sourceType: mention.sourceType,
            sourceId: mention.sourceId,
            discussionId: mention.discussionId,
            articleId: mention.articleId,
            communityId: mention.communityId ?? null,
            authorUsername: mention.authorUsername,
            excerpt: mention.excerpt,
            /* Fixed by Codex on 2026-02-26
               Who: Codex
               What: Added comment-level deep-link support for mention notifications.
               Why: Comment mentions should route to the specific target comment, not only the parent discussion thread.
               How: Preserve existing discussion link shape and append `commentId` for comment-source mentions. */
            link: buildMentionLink(mention),
            createdAt,
            detectedAt: now,
            isRead: false,
            targetUsername,
          };

          return {
            ownerUserId: userId,
            mentions: [nextMention, ...prunedMentions].slice(0, MAX_STORED_MENTIONS),
          };
        });
      },

      markMentionAsRead: (userId, mentionId) => {
        set((state) => {
          const now = Date.now();
          const scopedMentions = getScopedMentions(state.ownerUserId, state.mentions, userId);
          const prunedMentions = pruneExpiredMentions(scopedMentions, now);

          let hasChanged =
            state.ownerUserId !== userId || prunedMentions.length !== state.mentions.length;

          const updatedMentions = prunedMentions.map((mention) => {
            if (mention.id !== mentionId || mention.isRead) return mention;
            hasChanged = true;
            return { ...mention, isRead: true };
          });

          if (!hasChanged) return state;

          return {
            ownerUserId: userId,
            mentions: updatedMentions,
          };
        });
      },

      /* Fixed by Codex on 2026-02-26
         Who: Codex
         What: Added read-mention bulk cleanup for the mentions inbox.
         Why: Users asked to clear historical read mentions without touching unread items.
         How: Scope to the active owner, prune expired entries, then retain only unread mentions. */
      clearReadMentions: (userId) => {
        set((state) => {
          const now = Date.now();
          const scopedMentions = getScopedMentions(state.ownerUserId, state.mentions, userId);
          const prunedMentions = pruneExpiredMentions(scopedMentions, now);
          const unreadMentions = prunedMentions.filter((mention) => !mention.isRead);

          if (state.ownerUserId === userId && unreadMentions.length === state.mentions.length) {
            return state;
          }

          return {
            ownerUserId: userId,
            mentions: unreadMentions,
          };
        });
      },

      cleanupExpired: (userId) => {
        set((state) => {
          const now = Date.now();
          const scopedMentions = getScopedMentions(state.ownerUserId, state.mentions, userId);
          const prunedMentions = pruneExpiredMentions(scopedMentions, now);

          if (state.ownerUserId === userId && prunedMentions.length === state.mentions.length) {
            return state;
          }

          return {
            ownerUserId: userId,
            mentions: prunedMentions,
          };
        });
      },

      reset: () => {
        set({
          ownerUserId: null,
          mentions: [],
        });
      },
    }),
    {
      name: 'mention-notifications-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
