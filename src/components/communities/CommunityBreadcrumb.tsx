'use client';

import React from 'react';

import Link from 'next/link';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { cn } from '@/lib/utils';

interface CommunityBreadcrumbProps {
  communityName?: string;
  communitySlug?: string;
  articleTitle?: string;
  isLoading?: boolean;
}

const MAX_COMMUNITY_NAME_LENGTH = 30;
const MAX_ARTICLE_TITLE_LENGTH = 100;

const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

const CommunityBreadcrumb: React.FC<CommunityBreadcrumbProps> = ({
  communityName,
  communitySlug,
  articleTitle,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <div className="h-4 w-24 animate-pulse rounded bg-common-minimal" />
          <div className="h-4 w-2 animate-pulse rounded bg-common-minimal" />
          <div className="h-4 w-32 animate-pulse rounded bg-common-minimal" />
        </div>
      </div>
    );
  }

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/communities" className="text-text-tertiary hover:text-text-secondary">
              Communities
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {communityName && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {articleTitle ? (
                <BreadcrumbLink asChild>
                  <Link
                    href={`/community/${communitySlug}`}
                    className={cn(
                      'text-text-tertiary hover:text-text-secondary',
                      'max-w-[200px] truncate sm:max-w-none'
                    )}
                    title={communityName}
                  >
                    {truncateText(communityName, MAX_COMMUNITY_NAME_LENGTH)}
                  </Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage
                  className={cn('max-w-[200px] truncate text-text-secondary sm:max-w-none')}
                  title={communityName}
                >
                  {truncateText(communityName, MAX_COMMUNITY_NAME_LENGTH)}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </>
        )}

        {articleTitle && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage
                className={cn('max-w-[150px] truncate text-text-secondary sm:max-w-[450px]')}
                title={articleTitle}
              >
                {truncateText(articleTitle, MAX_ARTICLE_TITLE_LENGTH)}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default CommunityBreadcrumb;
