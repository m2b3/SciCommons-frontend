'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import Link from 'next/link';

import { Check, Search, Star, Users } from 'lucide-react';
import { toast } from 'sonner';

import { useCommunitiesArticlesApiSubmitArticle } from '@/api/community-articles/community-articles';
import { ArticlesListOut, UserCommunitySchema } from '@/api/schemas';
import { useUsersApiGetMyCommunities } from '@/api/users/users';
import { Button, ButtonTitle } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FIVE_MINUTES_IN_MS } from '@/constants/common.constants';
import { showErrorToast } from '@/lib/toastHelpers';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

import RenderParsedHTML from '../common/RenderParsedHTML';

interface PublishToCommunityModalProps {
  article: ArticlesListOut;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PublishToCommunityModal: React.FC<PublishToCommunityModalProps> = ({
  article,
  open,
  onOpenChange,
}) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const requestConfig = useMemo(
    () => ({ headers: { Authorization: `Bearer ${accessToken}` } }),
    [accessToken]
  );

  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch user's communities
  const {
    data: communitiesData,
    isPending: isCommunitiesLoading,
    error: communitiesError,
  } = useUsersApiGetMyCommunities({
    request: requestConfig,
    query: {
      staleTime: FIVE_MINUTES_IN_MS,
      enabled: open && !!accessToken,
      queryKey: ['my-communities-for-publish'],
    },
  });

  // Submit article mutation
  const { mutate: submitArticle, isPending: isSubmitting } = useCommunitiesArticlesApiSubmitArticle(
    {
      request: requestConfig,
    }
  );

  // Filter communities based on search
  const filteredCommunities = useMemo(() => {
    if (!communitiesData?.data) return [];
    if (!searchQuery.trim()) return communitiesData.data;
    return communitiesData.data.filter((community) =>
      community.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [communitiesData?.data, searchQuery]);

  // Handle submission
  const handleSubmit = useCallback(() => {
    if (!selectedCommunity || !article.slug) {
      toast.error('Please select a community');
      return;
    }

    submitArticle(
      { communityName: selectedCommunity, articleSlug: String(article.slug) },
      {
        onSuccess: () => {
          toast.success(`Article submitted to ${selectedCommunity} successfully!`);
          onOpenChange(false);
          setSelectedCommunity(null);
          setSearchQuery('');
        },
        onError: (error) => {
          showErrorToast(error);
        },
      }
    );
  }, [selectedCommunity, article.slug, submitArticle, onOpenChange]);

  // Show error toast if communities fail to load
  useEffect(() => {
    if (communitiesError) {
      toast.error(communitiesError.response?.data?.message || 'Failed to load communities');
    }
  }, [communitiesError]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedCommunity(null);
      setSearchQuery('');
    }
  }, [open]);

  // Cleanup pointer-events when dialog unmounts
  useEffect(() => {
    return () => {
      if (typeof document !== 'undefined' && !open) {
        document.body.style.pointerEvents = 'auto';
      }
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col p-0 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-semibold">Publish to Community</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col">
          {/* Article Preview Section */}
          <div className="border-b border-common-contrast bg-common-cardBackground/70 p-2 sm:p-6">
            <div className="flex gap-4">
              <div className="min-w-0 flex-1">
                <RenderParsedHTML
                  rawContent={article.title}
                  supportLatex={true}
                  supportMarkdown={false}
                  contentClassName="line-clamp-2 font-semibold text-text-primary text-sm sm:text-base"
                  containerClassName="mb-1"
                />
                <p className="line-clamp-1 text-xs text-text-secondary">
                  Submitted By: {article.authors.map((author) => author.label).join(', ')}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-text-tertiary">
                  <div className="flex items-center gap-1 rounded-md border border-common-minimal px-2 py-0.5">
                    <Star className="h-3 w-3 text-functional-yellow" fill="currentColor" />
                    <span>{article.total_ratings}</span>
                  </div>
                  <span>•</span>
                  <span>Submitted by {article.user.username}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Community Selection Section */}
          <div className="flex flex-col p-2 pb-0 sm:p-2 sm:pb-0">
            {/* Search Input */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
              <Input
                placeholder="Search communities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Communities List */}
            <ScrollArea className="h-[35vh] sm:h-[50vh]">
              <div className="space-y-2 pr-4">
                {isCommunitiesLoading && <CommunitiesListSkeleton />}

                {!isCommunitiesLoading && filteredCommunities.length === 0 && (
                  <EmptyCommunitiesState searchQuery={searchQuery} />
                )}

                {!isCommunitiesLoading &&
                  filteredCommunities.map((community) => (
                    <CommunityItem
                      key={community.name}
                      community={community}
                      isSelected={selectedCommunity === community.name}
                      onSelect={() => setSelectedCommunity(community.name)}
                    />
                  ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Footer with Submit Button */}
        <div className="flex items-center justify-between border-t border-common-contrast px-6 py-4">
          <p className="text-sm text-text-secondary">
            {selectedCommunity ? (
              <span>
                Selected:{' '}
                <span className="font-medium text-functional-blue">{selectedCommunity}</span>
              </span>
            ) : (
              'Select a community to continue'
            )}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              <ButtonTitle>Cancel</ButtonTitle>
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedCommunity || isSubmitting}
              loading={isSubmitting}
              showLoadingSpinner
            >
              <ButtonTitle>{isSubmitting ? 'Submitting...' : 'Submit Article'}</ButtonTitle>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Community Item Component
interface CommunityItemProps {
  community: UserCommunitySchema;
  isSelected: boolean;
  onSelect: () => void;
}

const CommunityItem: React.FC<CommunityItemProps> = ({ community, isSelected, onSelect }) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full items-center justify-between rounded-lg border p-3 text-left transition-all duration-150',
        'hover:border-functional-green/50 hover:bg-functional-green/5',
        isSelected
          ? 'border-functional-green bg-functional-green/10'
          : 'border-common-contrast bg-common-cardBackground'
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full',
            isSelected ? 'bg-functional-green/20' : 'bg-functional-blue/10'
          )}
        >
          <Users
            className={cn('h-5 w-5', isSelected ? 'text-functional-green' : 'text-functional-blue')}
          />
        </div>
        <div>
          <Link
            href={`/community/${community.name}`}
            onClick={(e) => e.stopPropagation()}
            className="font-medium text-text-primary hover:underline"
          >
            {community.name}
          </Link>
          <div className="flex items-center gap-2 text-xs text-text-tertiary">
            <span className="capitalize">{community.role}</span>
            <span>•</span>
            <span>{community.members_count} members</span>
          </div>
        </div>
      </div>
      <div
        className={cn(
          'flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all',
          isSelected
            ? 'border-functional-green bg-functional-green'
            : 'border-common-contrast bg-transparent'
        )}
      >
        {isSelected && <Check className="h-3 w-3 text-white" />}
      </div>
    </button>
  );
};

// Empty State Component
interface EmptyCommunitiesStateProps {
  searchQuery: string;
}

const EmptyCommunitiesState: React.FC<EmptyCommunitiesStateProps> = ({ searchQuery }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-common-minimal">
        <Users className="h-8 w-8 text-text-tertiary" />
      </div>
      {searchQuery ? (
        <>
          <h3 className="mb-1 text-sm font-medium text-text-primary">No communities found</h3>
          <p className="text-xs text-text-secondary">
            Try a different search term or clear the search
          </p>
        </>
      ) : (
        <>
          <h3 className="mb-1 text-sm font-medium text-text-primary">No communities joined</h3>
          <p className="mb-4 text-xs text-text-secondary">
            Join a community first to publish your article
          </p>
          <Link href="/communities">
            <Button variant="outline" className="text-sm">
              <ButtonTitle>Browse Communities</ButtonTitle>
            </Button>
          </Link>
        </>
      )}
    </div>
  );
};

// Loading Skeleton Component
const CommunitiesListSkeleton: React.FC = () => {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="flex animate-pulse items-center justify-between rounded-lg border border-common-contrast bg-common-cardBackground p-3"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-common-minimal" />
            <div className="space-y-2">
              <div className="h-4 w-32 rounded bg-common-minimal" />
              <div className="h-3 w-24 rounded bg-common-minimal" />
            </div>
          </div>
          <div className="h-5 w-5 rounded-full bg-common-minimal" />
        </div>
      ))}
    </div>
  );
};

export default PublishToCommunityModal;
