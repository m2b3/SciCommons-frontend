'use client';

import React, { useEffect, useMemo, useState } from 'react';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { Check, CheckCheck, MessageSquare, SquareArrowOutUpRight, X } from 'lucide-react';

import {
  communitiesApiJoinGetJoinRequests,
  useCommunitiesApiJoinManageJoinRequest,
} from '@/api/join-community/join-community';
import { useUsersApiGetNotifications, useUsersApiMarkNotificationAsRead } from '@/api/users/users';
import { BlockSkeleton, Skeleton } from '@/components/common/Skeleton';
import { Button, ButtonIcon, ButtonTitle } from '@/components/ui/button';
import TabNavigation from '@/components/ui/tab-navigation';
import { useAuthHeaders } from '@/hooks/useAuthHeaders';
import { getSafeNavigableUrl } from '@/lib/safeUrl';
import { useAuthStore } from '@/stores/authStore';
import {
  MentionNotificationItem,
  useMentionNotificationsStore,
} from '@/stores/mentionNotificationsStore';
import { useNotificationActivityStore } from '@/stores/notificationActivityStore';

type SystemNotification = {
  id: number;
  message: string;
  isRead: boolean;
  notificationType: string;
  createdAt: string;
  content: string | null;
  link: string | null;
};

type JoinRequestAction = 'approve' | 'reject';

interface ManagerJoinRequestNotificationContext {
  communityName: string | null;
  communityLabel: string;
  requesterUsername: string | null;
  communityId: number | null;
  joinRequestId: number | null;
}

interface PreparedSystemNotification extends SystemNotification {
  managerJoinRequestContext: ManagerJoinRequestNotificationContext | null;
  actionDecision: JoinRequestAction | null;
  actionPending: boolean;
  actionError: string | null;
}

const NOTIFICATION_PARSING_BASE = 'https://scicommons.org';
const MANAGER_JOIN_REQUEST_TYPES = new Set(['join_request_received', 'join request received']);
const VISIT_COMMUNITY_TYPES = new Set(['join_request_approved', 'join request approved']);
const NOTIFICATION_TAB_KEYS = {
  system: 'system',
  mentions: 'mentions',
} as const;
type NotificationTabKey = (typeof NOTIFICATION_TAB_KEYS)[keyof typeof NOTIFICATION_TAB_KEYS];

const resolveNotificationTabFromQuery = (rawTab: string | null): NotificationTabKey => {
  return rawTab === NOTIFICATION_TAB_KEYS.mentions
    ? NOTIFICATION_TAB_KEYS.mentions
    : NOTIFICATION_TAB_KEYS.system;
};

const renderTabTitleWithActivityBadge = (
  baseLabel: 'System' | 'Mentions',
  showNewBadge: boolean
): React.ReactNode => {
  if (!showNewBadge) return baseLabel;

  /* Fixed by Codex on 2026-02-26
     Who: Codex
     What: Replaced textual `(New)` tab suffixes with the shared badge-pill visual style.
     Why: Keep notification tab activity indicators consistent with existing "New" badges elsewhere in the app.
     How: Compose tab titles as inline label + badge node when a non-active tab has unseen activity. */
  return (
    <span className="inline-flex items-center gap-2">
      <span>{baseLabel}</span>
      <span className="rounded-full border border-functional-red/50 bg-functional-red/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-functional-red">
        New
      </span>
    </span>
  );
};

const formatMentionTimestamp = (timestamp: string): string => {
  const parsedTimestamp = Date.parse(timestamp);
  if (Number.isNaN(parsedTimestamp)) return 'Unknown time';
  return new Date(parsedTimestamp).toLocaleString();
};

const sortMentionsByDetectedTime = (
  mentions: MentionNotificationItem[]
): MentionNotificationItem[] =>
  [...mentions].sort(
    (firstMention, secondMention) => secondMention.detectedAt - firstMention.detectedAt
  );

const sortSystemNotificationsByCreatedAt = <T extends { createdAt: string }>(
  notifications: T[]
): T[] =>
  [...notifications].sort((firstNotification, secondNotification) => {
    const firstTimestamp = Date.parse(firstNotification.createdAt);
    const secondTimestamp = Date.parse(secondNotification.createdAt);
    const safeFirstTimestamp = Number.isNaN(firstTimestamp) ? 0 : firstTimestamp;
    const safeSecondTimestamp = Number.isNaN(secondTimestamp) ? 0 : secondTimestamp;
    return safeSecondTimestamp - safeFirstTimestamp;
  });

const parsePositiveInteger = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
    return value;
  }

  if (typeof value === 'string') {
    const trimmedValue = value.trim();
    if (!trimmedValue) return null;

    const parsedValue = Number.parseInt(trimmedValue, 10);
    if (Number.isInteger(parsedValue) && parsedValue > 0) {
      return parsedValue;
    }
  }

  return null;
};

const parseStructuredNotificationContent = (
  content: string | null
): Record<string, unknown> | null => {
  if (!content) return null;

  const trimmedContent = content.trim();
  if (!trimmedContent.startsWith('{') || !trimmedContent.endsWith('}')) {
    return null;
  }

  try {
    const parsedContent = JSON.parse(trimmedContent);
    if (typeof parsedContent === 'object' && parsedContent !== null) {
      return parsedContent as Record<string, unknown>;
    }
  } catch {
    return null;
  }

  return null;
};

const getNotificationRecordValue = (
  record: Record<string, unknown> | null,
  keys: string[]
): unknown => {
  if (!record) return null;

  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(record, key)) {
      return record[key];
    }
  }

  return null;
};

const getNotificationRecordString = (
  record: Record<string, unknown> | null,
  keys: string[]
): string | null => {
  const value = getNotificationRecordValue(record, keys);
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }
  return null;
};

const getNotificationRecordInteger = (
  record: Record<string, unknown> | null,
  keys: string[]
): number | null => parsePositiveInteger(getNotificationRecordValue(record, keys));

const decodeCommunitySegment = (rawSegment: string): string => {
  try {
    return decodeURIComponent(rawSegment).replace(/\+/g, ' ');
  } catch {
    return rawSegment;
  }
};

const extractRequesterUsernameFromMessage = (message: string): string | null => {
  const requesterPatterns = [
    /new join request from\s+@?([A-Za-z0-9_.-]+)/i,
    /join request from\s+@?([A-Za-z0-9_.-]+)/i,
    /@?([A-Za-z0-9_.-]+)\s+has requested to join/i,
  ];

  for (const pattern of requesterPatterns) {
    const requesterMatch = message.match(pattern);
    if (requesterMatch?.[1]) {
      return requesterMatch[1];
    }
  }

  return null;
};

const extractCommunityNameFromMessage = (message: string): string | null => {
  const communityNamePatterns = [
    /join your\s+(.+?)\s+community/i,
    /join request to\s+(.+?)\s+has/i,
    /to join\s+(.+?)\s+community/i,
  ];

  for (const pattern of communityNamePatterns) {
    const communityMatch = message.match(pattern);
    if (communityMatch?.[1]) {
      return communityMatch[1].trim();
    }
  }

  return null;
};

const getNotificationLinkLabel = (notificationType: string): string => {
  const normalizedType = notificationType.trim().toLowerCase();
  return VISIT_COMMUNITY_TYPES.has(normalizedType) ? 'Visit Community' : 'View';
};

const extractManagerJoinRequestContext = (
  notification: SystemNotification
): ManagerJoinRequestNotificationContext | null => {
  const normalizedType = notification.notificationType.trim().toLowerCase();
  if (!MANAGER_JOIN_REQUEST_TYPES.has(normalizedType)) {
    return null;
  }

  /* Fixed by Codex on 2026-02-25
     Who: Codex
     What: Added multi-source join-request notification parsing (type/message/link/content).
     Why: Manager notifications do not have one guaranteed payload shape, but UI still needs inline Accept/Reject.
     How: Merge structured content JSON, URL query/path metadata, and message regex fallbacks into one context object. */
  const structuredContent = parseStructuredNotificationContent(notification.content);

  const communityNameFromContent = getNotificationRecordString(structuredContent, [
    'communityName',
    'community_name',
    'community',
    'groupName',
    'group_name',
  ]);
  const communityIdFromContent = getNotificationRecordInteger(structuredContent, [
    'communityId',
    'community_id',
  ]);
  const joinRequestIdFromContent = getNotificationRecordInteger(structuredContent, [
    'joinRequestId',
    'join_request_id',
    'requestId',
  ]);
  const requesterUsernameFromContent = getNotificationRecordString(structuredContent, [
    'requesterUsername',
    'requester_username',
    'requester',
    'username',
    'requesterName',
    'requester_name',
  ]);

  const safeLink = getSafeNavigableUrl(notification.link, NOTIFICATION_PARSING_BASE);
  let communityNameFromLink: string | null = null;
  let communityIdFromLink: number | null = null;
  let joinRequestIdFromLink: number | null = null;

  if (safeLink) {
    const parsedLink = safeLink.isExternal
      ? new URL(safeLink.href)
      : new URL(safeLink.href, NOTIFICATION_PARSING_BASE);

    const communityMatch = parsedLink.pathname.match(/^\/community\/([^/]+)\/requests\/?$/i);
    if (communityMatch?.[1]) {
      communityNameFromLink = decodeCommunitySegment(communityMatch[1]);
    }

    communityIdFromLink = parsePositiveInteger(
      parsedLink.searchParams.get('communityId') ?? parsedLink.searchParams.get('community_id')
    );
    joinRequestIdFromLink = parsePositiveInteger(
      parsedLink.searchParams.get('joinRequestId') ??
        parsedLink.searchParams.get('join_request_id') ??
        parsedLink.searchParams.get('requestId')
    );
  }

  const communityName =
    communityNameFromContent ??
    communityNameFromLink ??
    extractCommunityNameFromMessage(notification.message);
  const communityId = communityIdFromContent ?? communityIdFromLink;
  const joinRequestId = joinRequestIdFromContent ?? joinRequestIdFromLink;
  const requesterUsername =
    requesterUsernameFromContent ?? extractRequesterUsernameFromMessage(notification.message);

  const hasResolvableTarget =
    (communityId !== null && joinRequestId !== null) || Boolean(communityName);
  if (!hasResolvableTarget) {
    return null;
  }

  const communityLabel = communityName ?? `Community #${communityId ?? 'Unknown'}`;

  return {
    communityName,
    communityLabel,
    requesterUsername,
    communityId,
    joinRequestId,
  };
};

const removeNotificationEntry = <T,>(
  currentRecord: Record<number, T>,
  notificationId: number
): Record<number, T> => {
  if (!Object.prototype.hasOwnProperty.call(currentRecord, notificationId)) {
    return currentRecord;
  }

  const nextRecord = { ...currentRecord };
  delete nextRecord[notificationId];
  return nextRecord;
};

interface MentionsTabProps {
  unreadMentions: MentionNotificationItem[];
  readMentions: MentionNotificationItem[];
  onMentionClick: (mentionId: string) => void;
  onClearReadMentions: () => void;
}

const MentionsTab: React.FC<MentionsTabProps> = ({
  unreadMentions,
  readMentions,
  onMentionClick,
  onClearReadMentions,
}) => {
  if (unreadMentions.length === 0 && readMentions.length === 0) {
    return (
      <div className="rounded-xl border border-common-minimal bg-common-background p-6 text-center">
        <p className="text-sm font-medium text-text-secondary">No mentions detected yet.</p>
        <p className="mt-1 text-xs text-text-tertiary">
          When someone uses `@yourname` in discussions, it will appear here.
        </p>
      </div>
    );
  }

  const renderMentionRow = (mention: MentionNotificationItem, isRead: boolean) => {
    const mentionLabel =
      mention.sourceType === 'comment' ? 'Comment mention' : 'Discussion mention';
    const mentionDestination =
      mention.sourceType === 'comment' && !mention.link.includes('commentId=')
        ? `${mention.link}${mention.link.includes('?') ? '&' : '?'}commentId=${mention.sourceId}`
        : mention.link;

    return (
      <li
        key={mention.id}
        className={`rounded-xl border p-4 ${
          isRead
            ? 'border-common-minimal bg-common-background'
            : 'border-common-contrast bg-common-cardBackground'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-text-primary">{mentionLabel}</p>
          <p className="text-xs text-text-tertiary">{formatMentionTimestamp(mention.createdAt)}</p>
        </div>
        <p className="mt-1 text-xs text-text-secondary">
          Mentioned by <span className="font-semibold">@{mention.authorUsername}</span>
        </p>
        <p className="mt-2 text-sm text-text-secondary">{mention.excerpt}</p>
        <div className="mt-3">
          <Link
            /* Fixed by Codex on 2026-02-26
               Who: Codex
               What: Added backward-compatible comment deep-link fallback for older mention entries.
               Why: Existing localStorage mention rows created before `commentId` routing should still open the exact comment target.
               How: Append `commentId` at render time only when the mention is comment-sourced and missing the param. */
            href={mentionDestination}
            onClick={() => onMentionClick(mention.id)}
            className="inline-flex items-center gap-1 text-sm text-functional-green hover:text-functional-greenContrast"
          >
            View discussion
            <SquareArrowOutUpRight size={12} className="inline" />
          </Link>
        </div>
      </li>
    );
  };

  return (
    <div className="space-y-6">
      <section>
        <div className="mb-3 flex items-center gap-2">
          <MessageSquare size={16} className="text-functional-green" />
          <h2 className="text-sm font-semibold text-text-primary">
            Unread Mentions ({unreadMentions.length})
          </h2>
        </div>
        {unreadMentions.length === 0 ? (
          <div className="rounded-xl border border-common-minimal bg-common-background p-4 text-xs text-text-tertiary">
            No unread mentions.
          </div>
        ) : (
          <ul className="space-y-3">
            {unreadMentions.map((mention) => renderMentionRow(mention, false))}
          </ul>
        )}
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-text-secondary">Read Mentions</h2>
          <Button
            type="button"
            variant="outline"
            className="px-3 py-1.5"
            disabled={readMentions.length === 0}
            onClick={onClearReadMentions}
          >
            <ButtonIcon>
              <X size={14} />
            </ButtonIcon>
            <ButtonTitle className="sm:text-xs">Clear Read Mentions</ButtonTitle>
          </Button>
        </div>
        {readMentions.length === 0 ? (
          <div className="rounded-xl border border-common-minimal bg-common-background p-4 text-xs text-text-tertiary">
            No read mentions yet.
          </div>
        ) : (
          <ul className="space-y-3">
            {readMentions.map((mention) => renderMentionRow(mention, true))}
          </ul>
        )}
      </section>
    </div>
  );
};

interface SystemNotificationsTabProps {
  isPending: boolean;
  unreadNotifications: PreparedSystemNotification[];
  readNotifications: PreparedSystemNotification[];
  onMarkAsRead: (id: number) => void;
  onManagerJoinRequestAction: (
    notification: PreparedSystemNotification,
    action: JoinRequestAction
  ) => void;
}

const SystemNotificationsTab: React.FC<SystemNotificationsTabProps> = ({
  isPending,
  unreadNotifications,
  readNotifications,
  onMarkAsRead,
  onManagerJoinRequestAction,
}) => {
  if (isPending) {
    return <NotificationCardSkeletonLoader />;
  }

  if (unreadNotifications.length === 0 && readNotifications.length === 0) {
    return <p className="text-center text-text-tertiary">No notifications to show.</p>;
  }

  const renderNotificationRow = (notification: PreparedSystemNotification, isRead: boolean) => {
    const managerContext = notification.managerJoinRequestContext;
    const isManagerJoinRequest = Boolean(managerContext);
    const safeLink = isManagerJoinRequest ? null : getSafeNavigableUrl(notification.link);
    const linkLabel = getNotificationLinkLabel(notification.notificationType);

    return (
      <li
        key={notification.id}
        className={`w-full rounded-xl border p-4 ${
          isRead
            ? 'border-common-minimal bg-common-background'
            : 'border-common-contrast bg-common-cardBackground'
        }`}
      >
        <p
          className={`text-base font-medium ${isRead ? 'text-text-secondary' : 'text-text-primary'}`}
        >
          {notification.message}
        </p>
        <p className="text-sm text-text-tertiary">
          {notification.notificationType} - {new Date(notification.createdAt).toLocaleDateString()}
        </p>
        {managerContext && (
          <p className="mt-1 text-xs text-text-secondary">
            Group:{' '}
            <span className="font-semibold text-text-primary">{managerContext.communityLabel}</span>
          </p>
        )}
        {notification.content && !managerContext && (
          <p className="mt-2 text-sm text-text-secondary">{notification.content}</p>
        )}
        {notification.actionError && (
          <p className="mt-2 text-xs font-medium text-functional-red">{notification.actionError}</p>
        )}
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          {safeLink &&
            (safeLink.isExternal ? (
              <a
                href={safeLink.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-functional-green hover:text-functional-greenContrast"
              >
                {linkLabel}
                <SquareArrowOutUpRight size={12} className="inline" />
              </a>
            ) : (
              <Link
                href={safeLink.href}
                className="flex items-center gap-1 text-sm text-functional-green hover:text-functional-greenContrast"
              >
                {linkLabel}
                <SquareArrowOutUpRight size={12} className="inline" />
              </Link>
            ))}

          {isManagerJoinRequest ? (
            <div className="ml-auto flex items-center gap-2">
              <Button
                onClick={() => onManagerJoinRequestAction(notification, 'approve')}
                className={`px-3 py-1.5 ${
                  notification.actionDecision === 'approve'
                    ? 'ring-1 ring-functional-greenContrast/40'
                    : ''
                }`}
                variant={notification.actionDecision === 'approve' ? 'default' : 'outline'}
                disabled={notification.actionPending}
                type="button"
              >
                <ButtonIcon>
                  <Check size={14} />
                </ButtonIcon>
                <ButtonTitle className="sm:text-xs">
                  {notification.actionPending && notification.actionDecision === 'approve'
                    ? 'Processing...'
                    : 'Accept'}
                </ButtonTitle>
              </Button>
              <Button
                onClick={() => onManagerJoinRequestAction(notification, 'reject')}
                className={`px-3 py-1.5 ${
                  notification.actionDecision === 'reject'
                    ? 'ring-1 ring-functional-redContrast/40'
                    : ''
                }`}
                variant={notification.actionDecision === 'reject' ? 'danger' : 'outline'}
                disabled={notification.actionPending}
                type="button"
              >
                <ButtonIcon>
                  <X size={14} />
                </ButtonIcon>
                <ButtonTitle className="sm:text-xs">
                  {notification.actionPending && notification.actionDecision === 'reject'
                    ? 'Processing...'
                    : 'Reject'}
                </ButtonTitle>
              </Button>
            </div>
          ) : !notification.isRead ? (
            <Button
              onClick={() => onMarkAsRead(notification.id)}
              className="px-3 py-1.5"
              type="button"
            >
              <ButtonIcon>
                <Check size={14} />
              </ButtonIcon>
              <ButtonTitle className="sm:text-xs">Mark as Read</ButtonTitle>
            </Button>
          ) : (
            <Button
              className="px-3 py-1.5 text-text-tertiary hover:bg-transparent"
              variant={'outline'}
              type="button"
            >
              <ButtonIcon>
                <CheckCheck size={14} />
              </ButtonIcon>
              <ButtonTitle className="sm:text-xs">Read</ButtonTitle>
            </Button>
          )}
        </div>
      </li>
    );
  };

  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-3 text-sm font-semibold text-text-primary">
          Unread System Notifications ({unreadNotifications.length})
        </h2>
        {unreadNotifications.length === 0 ? (
          <div className="rounded-xl border border-common-minimal bg-common-background p-4 text-xs text-text-tertiary">
            No unread system notifications.
          </div>
        ) : (
          <ul className="flex w-full flex-col items-center gap-4">
            {unreadNotifications.map((notification) => renderNotificationRow(notification, false))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-text-secondary">
          Read System Notifications
        </h2>
        {readNotifications.length === 0 ? (
          <div className="rounded-xl border border-common-minimal bg-common-background p-4 text-xs text-text-tertiary">
            No read system notifications.
          </div>
        ) : (
          <ul className="flex w-full flex-col items-center gap-4">
            {readNotifications.map((notification) => renderNotificationRow(notification, true))}
          </ul>
        )}
      </section>
    </div>
  );
};

const resolveManagerJoinRequestTarget = async (
  context: ManagerJoinRequestNotificationContext,
  authHeaders: ReturnType<typeof useAuthHeaders>
): Promise<{ communityId: number; joinRequestId: number } | null> => {
  if (context.communityId !== null && context.joinRequestId !== null) {
    return {
      communityId: context.communityId,
      joinRequestId: context.joinRequestId,
    };
  }

  if (!context.communityName) {
    return null;
  }

  const joinRequestsResponse = await communitiesApiJoinGetJoinRequests(
    context.communityName,
    authHeaders
  );
  const joinRequests = joinRequestsResponse.data ?? [];
  const pendingJoinRequests = joinRequests.filter(
    (joinRequest) => joinRequest.status === 'pending'
  );
  const normalizedRequester = context.requesterUsername?.toLowerCase() ?? null;

  let resolvedJoinRequest =
    normalizedRequester === null
      ? undefined
      : pendingJoinRequests.find(
          (joinRequest) => joinRequest.user.username.toLowerCase() === normalizedRequester
        );

  if (!resolvedJoinRequest && normalizedRequester === null && pendingJoinRequests.length === 1) {
    resolvedJoinRequest = pendingJoinRequests[0];
  }

  if (!resolvedJoinRequest && normalizedRequester !== null) {
    const requesterMatches = pendingJoinRequests.filter(
      (joinRequest) => joinRequest.user.username.toLowerCase() === normalizedRequester
    );
    if (requesterMatches.length === 1) {
      resolvedJoinRequest = requesterMatches[0];
    }
  }

  if (!resolvedJoinRequest) {
    return null;
  }

  return {
    communityId: context.communityId ?? resolvedJoinRequest.community_id,
    joinRequestId: context.joinRequestId ?? resolvedJoinRequest.id,
  };
};

const NotificationPageContent: React.FC = () => {
  const searchParams = useSearchParams();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const authHeaders = useAuthHeaders();
  const requestedTab = resolveNotificationTabFromQuery(searchParams?.get('tab') ?? null);
  const initialActiveTabIndex = requestedTab === NOTIFICATION_TAB_KEYS.mentions ? 1 : 0;
  const [activeTabIndex, setActiveTabIndex] = useState(initialActiveTabIndex);

  const ownerUserId = useMentionNotificationsStore((state) => state.ownerUserId);
  const mentions = useMentionNotificationsStore((state) => state.mentions);
  const setOwnerIfNeeded = useMentionNotificationsStore((state) => state.setOwnerIfNeeded);
  const cleanupExpired = useMentionNotificationsStore((state) => state.cleanupExpired);
  const markMentionAsRead = useMentionNotificationsStore((state) => state.markMentionAsRead);
  const clearReadMentions = useMentionNotificationsStore((state) => state.clearReadMentions);
  const notificationActivityOwnerUserId = useNotificationActivityStore(
    (state) => state.ownerUserId
  );
  const lastSystemTabSeenAt = useNotificationActivityStore((state) => state.lastSystemTabSeenAt);
  const lastMentionsTabSeenAt = useNotificationActivityStore(
    (state) => state.lastMentionsTabSeenAt
  );
  const setNotificationActivityOwnerIfNeeded = useNotificationActivityStore(
    (state) => state.setOwnerIfNeeded
  );
  const markSystemTabSeen = useNotificationActivityStore((state) => state.markSystemTabSeen);
  const markMentionsTabSeen = useNotificationActivityStore((state) => state.markMentionsTabSeen);

  const [optimisticReadByNotificationId, setOptimisticReadByNotificationId] = useState<
    Record<number, true>
  >({});
  const [joinRequestActionByNotificationId, setJoinRequestActionByNotificationId] = useState<
    Record<number, JoinRequestAction>
  >({});
  const [joinRequestActionPendingByNotificationId, setJoinRequestActionPendingByNotificationId] =
    useState<Record<number, boolean>>({});
  const [joinRequestActionErrorByNotificationId, setJoinRequestActionErrorByNotificationId] =
    useState<Record<number, string>>({});
  const [isMarkingAllAsRead, setIsMarkingAllAsRead] = useState(false);
  const [isMarkingAllMentionsAsRead, setIsMarkingAllMentionsAsRead] = useState(false);

  useEffect(() => {
    setActiveTabIndex(initialActiveTabIndex);
  }, [initialActiveTabIndex]);

  const { data, isPending, refetch } = useUsersApiGetNotifications(
    {},
    {
      request: authHeaders,
      query: {
        enabled: isAuthenticated,
      },
    }
  );

  const { mutateAsync: markNotificationAsRead } = useUsersApiMarkNotificationAsRead({
    request: authHeaders,
  });

  const { mutateAsync: manageJoinRequest } = useCommunitiesApiJoinManageJoinRequest({
    request: authHeaders,
  });

  /* Fixed by Codex on 2026-02-26
     Who: Codex
     What: Initialize mention + notification-activity ownership for the active account.
     Why: Mention history and tab/bell "New" state should be scoped per user and reset on account switches.
     How: Align both persisted stores to the current user id and prune expired mentions on page load. */
  useEffect(() => {
    if (!user?.id) return;
    setOwnerIfNeeded(user.id);
    setNotificationActivityOwnerIfNeeded(user.id);
    cleanupExpired(user.id);
  }, [cleanupExpired, setNotificationActivityOwnerIfNeeded, setOwnerIfNeeded, user?.id]);

  const mentionItems = useMemo(() => {
    if (!user?.id) return [];
    if (ownerUserId !== user.id) return [];
    return sortMentionsByDetectedTime(mentions);
  }, [mentions, ownerUserId, user?.id]);

  const unreadMentions = useMemo(
    () => mentionItems.filter((mention) => !mention.isRead),
    [mentionItems]
  );
  const readMentions = useMemo(
    () => mentionItems.filter((mention) => mention.isRead),
    [mentionItems]
  );

  const notifications = useMemo<SystemNotification[]>(() => data?.data ?? [], [data?.data]);

  const latestMentionNotificationActivityAt = useMemo(
    () =>
      mentionItems.reduce(
        (latestTimestamp, mentionItem) => Math.max(latestTimestamp, mentionItem.detectedAt),
        0
      ),
    [mentionItems]
  );
  const latestSystemNotificationActivityAt = useMemo(
    () =>
      notifications.reduce((latestTimestamp, notification) => {
        const parsedTimestamp = Date.parse(notification.createdAt);
        if (Number.isNaN(parsedTimestamp)) {
          return latestTimestamp;
        }
        return Math.max(latestTimestamp, parsedTimestamp);
      }, 0),
    [notifications]
  );
  const effectiveLastSystemTabSeenAt =
    user?.id && notificationActivityOwnerUserId === user.id ? lastSystemTabSeenAt : 0;
  const effectiveLastMentionsTabSeenAt =
    user?.id && notificationActivityOwnerUserId === user.id ? lastMentionsTabSeenAt : 0;
  const hasNewSystemTabActivity = latestSystemNotificationActivityAt > effectiveLastSystemTabSeenAt;
  const hasNewMentionsTabActivity =
    latestMentionNotificationActivityAt > effectiveLastMentionsTabSeenAt;

  useEffect(() => {
    /* Fixed by Codex on 2026-02-26
       Who: Codex
       What: Clear tab-level "New" indicator when a notifications tab is opened.
       Why: Product expectation is that "New" marks unseen tab activity and disappears once that tab is viewed.
       How: Persist the opened tab's seen timestamp whenever active tab index changes. */
    if (!user?.id) return;
    if (activeTabIndex === 0) {
      markSystemTabSeen(user.id);
      return;
    }

    markMentionsTabSeen(user.id);
  }, [activeTabIndex, markMentionsTabSeen, markSystemTabSeen, user?.id]);

  const preparedSystemNotifications = useMemo(() => {
    const enrichedNotifications = notifications.map((notification) => {
      const managerJoinRequestContext = extractManagerJoinRequestContext(notification);
      const actionDecision = joinRequestActionByNotificationId[notification.id] ?? null;
      const actionPending = Boolean(joinRequestActionPendingByNotificationId[notification.id]);
      const actionError = joinRequestActionErrorByNotificationId[notification.id] ?? null;
      const isRead =
        notification.isRead ||
        Boolean(optimisticReadByNotificationId[notification.id]) ||
        actionDecision !== null;

      return {
        ...notification,
        isRead,
        managerJoinRequestContext,
        actionDecision,
        actionPending,
        actionError,
      };
    });

    return sortSystemNotificationsByCreatedAt(enrichedNotifications);
  }, [
    joinRequestActionByNotificationId,
    joinRequestActionErrorByNotificationId,
    joinRequestActionPendingByNotificationId,
    notifications,
    optimisticReadByNotificationId,
  ]);

  const unreadSystemNotifications = useMemo(
    () => preparedSystemNotifications.filter((notification) => !notification.isRead),
    [preparedSystemNotifications]
  );
  const readSystemNotifications = useMemo(
    () => preparedSystemNotifications.filter((notification) => notification.isRead),
    [preparedSystemNotifications]
  );

  const markAsRead = (notificationId: number) => {
    setOptimisticReadByNotificationId((previousRecord) => ({
      ...previousRecord,
      [notificationId]: true,
    }));

    void markNotificationAsRead({ notificationId })
      .then(() => {
        void refetch();
      })
      .catch(() => {
        setOptimisticReadByNotificationId((previousRecord) =>
          removeNotificationEntry(previousRecord, notificationId)
        );
      });
  };

  const markAllSystemNotificationsAsRead = () => {
    if (isMarkingAllAsRead) return;

    const unreadNotificationIds = unreadSystemNotifications.map((notification) => notification.id);
    if (unreadNotificationIds.length === 0) return;

    /* Fixed by Codex on 2026-02-25
       Who: Codex
       What: Added bulk mark-as-read support for system notifications.
       Why: Users asked for a single action to clear the unread system pile.
       How: Apply optimistic local read state for unread ids, execute mark-as-read calls in parallel, rollback failures, then refetch once. */
    setIsMarkingAllAsRead(true);
    setOptimisticReadByNotificationId((previousRecord) => {
      const nextRecord = { ...previousRecord };
      unreadNotificationIds.forEach((notificationId) => {
        nextRecord[notificationId] = true;
      });
      return nextRecord;
    });

    void (async () => {
      const markResults = await Promise.allSettled(
        unreadNotificationIds.map((notificationId) => markNotificationAsRead({ notificationId }))
      );

      const failedNotificationIds = unreadNotificationIds.filter(
        (_, index) => markResults[index].status === 'rejected'
      );

      if (failedNotificationIds.length > 0) {
        setOptimisticReadByNotificationId((previousRecord) => {
          let nextRecord = previousRecord;
          failedNotificationIds.forEach((notificationId) => {
            nextRecord = removeNotificationEntry(nextRecord, notificationId);
          });
          return nextRecord;
        });
      }

      await refetch();
      setIsMarkingAllAsRead(false);
    })();
  };

  const markAllMentionsAsRead = () => {
    /* Fixed by Codex on 2026-02-26
       Who: Codex
       What: Added active-tab aware bulk mark-as-read behavior for Mentions.
       Why: The top "Mark All as Read" button should stay useful when Mentions tab is active.
       How: Mark each unread mention as read in the mention store for the current user. */
    if (isMarkingAllMentionsAsRead || !user?.id) return;
    if (unreadMentions.length === 0) return;

    setIsMarkingAllMentionsAsRead(true);
    unreadMentions.forEach((mention) => {
      markMentionAsRead(user.id, mention.id);
    });
    setIsMarkingAllMentionsAsRead(false);
  };

  const handleManagerJoinRequestAction = (
    notification: PreparedSystemNotification,
    action: JoinRequestAction
  ) => {
    const managerJoinRequestContext = notification.managerJoinRequestContext;
    if (!managerJoinRequestContext) return;

    setJoinRequestActionPendingByNotificationId((previousRecord) => ({
      ...previousRecord,
      [notification.id]: true,
    }));
    setJoinRequestActionErrorByNotificationId((previousRecord) =>
      removeNotificationEntry(previousRecord, notification.id)
    );
    /* Fixed by Codex on 2026-02-26
       Who: Codex
       What: Move manager join-request notifications to the read section only after successful actions.
       Why: Avoid optimistic state changes when the manager action fails.
       How: Persist decision/read state after `manageJoinRequest` succeeds, while still skipping any extra manual mark-read step. */

    /* Fixed by Codex on 2026-02-25
       Who: Codex
       What: Added inline manager-side approve/reject workflow directly in system notifications.
       Why: Community admins should not leave the notifications page just to process join requests.
       How: Resolve join-request target ids from notification context, call manage endpoint, then mark as read and persist decision state. */
    void (async () => {
      try {
        const resolvedTarget = await resolveManagerJoinRequestTarget(
          managerJoinRequestContext,
          authHeaders
        );
        if (!resolvedTarget) {
          throw new Error(
            'Unable to match this notification to a pending join request. Please refresh and try again.'
          );
        }

        await manageJoinRequest({
          communityId: resolvedTarget.communityId,
          joinRequestId: resolvedTarget.joinRequestId,
          action,
        });

        setJoinRequestActionByNotificationId((previousRecord) => ({
          ...previousRecord,
          [notification.id]: action,
        }));
        setOptimisticReadByNotificationId((previousRecord) => ({
          ...previousRecord,
          [notification.id]: true,
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error && error.message.trim()
            ? error.message
            : 'Unable to process this join request right now.';
        setJoinRequestActionErrorByNotificationId((previousRecord) => ({
          ...previousRecord,
          [notification.id]: errorMessage,
        }));
        return;
      }

      try {
        await markNotificationAsRead({ notificationId: notification.id });
      } catch {
        // Keep the action in read state locally; persistence can recover on subsequent fetches/actions.
      } finally {
        void refetch();
        setJoinRequestActionPendingByNotificationId((previousRecord) =>
          removeNotificationEntry(previousRecord, notification.id)
        );
      }
    })();
  };

  const handleMentionClick = (mentionId: string) => {
    if (!user?.id) return;
    markMentionAsRead(user.id, mentionId);
  };

  const handleClearReadMentions = () => {
    /* Fixed by Codex on 2026-02-26
       Who: Codex
       What: Added bulk clear for read mentions.
       Why: Read mentions can accumulate and users requested a one-click cleanup action.
       How: Remove only read mention entries for the active user while preserving unread mentions. */
    if (!user?.id || readMentions.length === 0) return;
    clearReadMentions(user.id);
  };

  const showSystemTabNewIndicator = hasNewSystemTabActivity && activeTabIndex !== 0;
  const showMentionsTabNewIndicator = hasNewMentionsTabActivity && activeTabIndex !== 1;
  const systemTabTitle = renderTabTitleWithActivityBadge('System', showSystemTabNewIndicator);
  const mentionsTabTitle = renderTabTitleWithActivityBadge('Mentions', showMentionsTabNewIndicator);
  const isSystemTabActive = activeTabIndex === 0;
  const activeUnreadCount = isSystemTabActive
    ? unreadSystemNotifications.length
    : unreadMentions.length;
  const isMarkingActiveTabAsRead = isSystemTabActive
    ? isMarkingAllAsRead
    : isMarkingAllMentionsAsRead;
  const handleMarkAllAsReadForActiveTab = () => {
    if (isSystemTabActive) {
      markAllSystemNotificationsAsRead();
      return;
    }

    markAllMentionsAsRead();
  };

  return (
    <div className="mx-auto max-w-4xl p-4">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 sm:my-6">
        <h1 className="text-center text-4xl font-bold text-text-primary">Notifications</h1>
        <Button
          type="button"
          variant="outline"
          className="px-3 py-1.5"
          disabled={isMarkingActiveTabAsRead || activeUnreadCount === 0}
          onClick={handleMarkAllAsReadForActiveTab}
        >
          <ButtonIcon>
            <CheckCheck size={14} />
          </ButtonIcon>
          <ButtonTitle className="sm:text-xs">
            {isMarkingActiveTabAsRead ? 'Marking...' : 'Mark All as Read'}
          </ButtonTitle>
        </Button>
      </div>
      <TabNavigation
        initialActiveTab={initialActiveTabIndex}
        resetKey={`notifications-${requestedTab}`}
        onActiveTabChange={setActiveTabIndex}
        tabs={[
          {
            id: 'system',
            title: systemTabTitle,
            content: () => (
              <SystemNotificationsTab
                isPending={isPending}
                unreadNotifications={unreadSystemNotifications}
                readNotifications={readSystemNotifications}
                onMarkAsRead={markAsRead}
                onManagerJoinRequestAction={handleManagerJoinRequestAction}
              />
            ),
          },
          {
            id: 'mentions',
            title: mentionsTabTitle,
            content: () => (
              <MentionsTab
                unreadMentions={unreadMentions}
                readMentions={readMentions}
                onMentionClick={handleMentionClick}
                onClearReadMentions={handleClearReadMentions}
              />
            ),
          },
        ]}
      />
    </div>
  );
};

export default NotificationPageContent;

const NotificationCardSkeletonLoader: React.FC = () => {
  return (
    <Skeleton className="w-full gap-4">
      <BlockSkeleton className="h-28 rounded-xl" />
      <BlockSkeleton className="h-28 rounded-xl" />
      <BlockSkeleton className="h-28 rounded-xl" />
    </Skeleton>
  );
};
