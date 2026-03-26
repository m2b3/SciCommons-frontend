/* Fixed by Codex on 2026-02-26
   Who: Codex
   What: Centralized mention notification retention configuration.
   Why: Retention duration should be easy to find and adjust without editing store logic.
   How: Expose days + millisecond constants for mention-notification lifecycle rules. */
export const MENTION_NOTIFICATION_RETENTION_DAYS = 30;
export const MENTION_NOTIFICATION_RETENTION_MS =
  MENTION_NOTIFICATION_RETENTION_DAYS * 24 * 60 * 60 * 1000;
