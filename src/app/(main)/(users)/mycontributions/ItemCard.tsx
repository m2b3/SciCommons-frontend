import React from 'react';

import Link from 'next/link';

import { LucideIcon } from 'lucide-react';
import { Crown, Eye, Shield, UserCircle } from 'lucide-react';

import { BlockSkeleton, Skeleton } from '@/components/common/Skeleton';

export interface ItemCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  iconColor: string;
  type?: string;
  communityName?: string;
  role?: string;
  memberCount?: number;
  slug?: string;
}

const ItemCard: React.FC<ItemCardProps> = ({
  icon: Icon,
  title,
  subtitle,
  iconColor,
  type,
  communityName,
  role,
  memberCount,
  slug,
}) => {
  /* Fixed by Codex on 2026-02-16
     Who: Codex
     What: Normalized bookmark type routing for contribution item links.
     Why: Bookmark API types can be lowercase or namespaced (for example "article" or "articles.article"),
     while strict TitleCase checks routed many items to /posts by default, causing dead links.
     How: Added case-insensitive type parsing and explicit route mapping for article/community/post. */
  const normalizedType = (type || '').toLowerCase();
  const isArticleType = normalizedType.includes('article');
  const isCommunityType = normalizedType.includes('community');
  const isPostType = normalizedType.includes('post');

  const href = isArticleType
    ? `/article/${slug}`
    : isCommunityType
      ? `/community/${encodeURIComponent(slug || '')}`
      : isPostType
        ? `/posts/${slug}`
        : '#';

  return (
    <div className="mb-4 flex items-start gap-3 rounded-r-md border-l-4 border-common-contrast bg-common-cardBackground p-3 sm:gap-4 sm:p-4">
      <div className={`flex-shrink-0 rounded-full p-1.5 sm:p-2 ${iconColor}`}>
        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
      </div>
      <div className="flex-grow">
        <Link href={href}>
          <h4 className="line-clamp-2 text-wrap text-sm font-semibold text-text-primary hover:underline">
            {title}
          </h4>
        </Link>
        <p className="mt-1 text-xs text-text-tertiary">
          {role && memberCount ? `${role} · ${memberCount} members` : subtitle}
        </p>
        {type && (
          <span
            className={`mt-2 inline-block rounded-full px-2 py-1 text-xs font-semibold ${
              isArticleType
                ? 'bg-functional-green/10 text-functional-green'
                : isCommunityType
                  ? 'bg-functional-blue/10 text-functional-blue'
                  : 'bg-functional-yellow/10 text-functional-yellow'
            }`}
          >
            {type}
          </span>
        )}
        {communityName && (
          <span className="ml-2 mt-1 inline-block rounded-full bg-common-minimal px-2 py-1 text-xs font-semibold text-text-secondary">
            {communityName}
          </span>
        )}
      </div>
      {role && (
        <div className="flex-shrink-0" title={role}>
          {role === 'Admin' && <Crown className="h-3 w-3 text-functional-yellow" />}
          {role === 'Moderator' && <Shield className="h-3 w-3 text-functional-green" />}
          {role === 'Reviewer' && <Eye className="h-3 w-3 text-functional-blue" />}
          {role === 'Member' && <UserCircle className="h-3 w-3 text-text-secondary" />}
        </div>
      )}
    </div>
  );
};

export default ItemCard;

export const ItemCardSkeleton: React.FC = () => (
  <Skeleton className="mb-4 flex items-start gap-3 rounded-r-md border-l-4 border-common-contrast bg-common-cardBackground p-3 sm:gap-4 sm:p-4">
    <BlockSkeleton className="h-8 w-8 flex-shrink-0 rounded-full sm:h-9 sm:w-9" />
    <div className="flex flex-grow flex-col gap-2">
      <BlockSkeleton className="h-4 w-3/4" />
      <BlockSkeleton className="h-3 w-1/2" />
      <BlockSkeleton className="h-5 w-16 rounded-full" />
    </div>
  </Skeleton>
);
