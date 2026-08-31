'use client';

import { FC, useMemo, useState } from 'react';

import { Send } from 'lucide-react';
import { toast } from 'sonner';

import { useArticlesApiResolveExternalArticle } from '@/api/articles/articles';
import { useCommunitiesArticlesApiSubmitArticle } from '@/api/community-articles/community-articles';
import { useUsersApiGetMyCommunities } from '@/api/users/users';
import CommunityPicker from '@/components/communities/CommunityPicker';
import { Button, ButtonTitle } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FIVE_MINUTES_IN_MS } from '@/constants/common.constants';
import type { FeedArticle } from '@/lib/feed/handoffFeed';
import type { ErrorResponse } from '@/lib/toastHelpers';
import { showErrorToast } from '@/lib/toastHelpers';
import { useAuthStore } from '@/stores/authStore';

interface PostToCommunityProps {
  article: FeedArticle;
}

const PostToCommunity: FC<PostToCommunityProps> = ({ article }) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const requestConfig = useMemo(
    () => ({ headers: { Authorization: `Bearer ${accessToken}` } }),
    [accessToken]
  );

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: communitiesData, isPending: isLoadingCommunities } = useUsersApiGetMyCommunities({
    request: requestConfig,
    query: {
      staleTime: FIVE_MINUTES_IN_MS,
      enabled: open && !!accessToken,
      queryKey: ['my-communities-for-feed-post'],
    },
  });

  const { mutateAsync: resolveArticle } = useArticlesApiResolveExternalArticle({
    request: requestConfig,
  });
  const { mutateAsync: submitArticle } = useCommunitiesArticlesApiSubmitArticle({
    request: requestConfig,
  });
  const [isPosting, setIsPosting] = useState(false);

  const filtered = useMemo(() => {
    const all = communitiesData?.data ?? [];
    const q = searchQuery.trim().toLowerCase();
    return q ? all.filter((c) => c.name.toLowerCase().includes(q)) : all;
  }, [communitiesData?.data, searchQuery]);

  const close = () => {
    setOpen(false);
    setSelected(null);
    setSearchQuery('');
  };

  const handlePost = async () => {
    if (!selected) {
      toast.error('Please select a community');
      return;
    }

    if (article.source !== 'pubmed' || !article.externalId || !article.url) {
      toast.error('Posting currently supports PubMed feed items.');
      return;
    }

    setIsPosting(true);
    try {
      const resolved = await resolveArticle({
        data: {
          source: 'pubmed',
          external_id: article.externalId,
          title: article.title,
          abstract: article.abstract,
          authors: article.authors.map((name) => ({ value: name, label: name })),
          article_link: article.url,
          pdf_link: article.pdfUrl || article.pmcUrl || undefined,
        },
      });

      await submitArticle({
        communityName: selected,
        articleSlug: String(resolved.data.slug),
      });

      toast.success(`Posted to ${selected}`);
      close();
    } catch (error) {
      // Covers the ordinary outcomes too: already submitted to this community, or not a
      // member of a private one. Both are real answers, not failures.
      showErrorToast(error as ErrorResponse, 'Could not post this article. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  // Posting requires an account; signed-out readers just don't see the control.
  if (!accessToken) return null;

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Send className="mr-1.5 size-3.5" />
        <ButtonTitle>Post to community</ButtonTitle>
      </Button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) close();
          else setOpen(true);
        }}
      >
        <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-semibold">Post to a community</DialogTitle>
          </DialogHeader>

          <p className="line-clamp-2 border-b border-common-contrast pb-3 text-sm text-text-secondary">
            {article.title}
          </p>

          <CommunityPicker
            communities={filtered}
            isLoading={isLoadingCommunities}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selected={selected}
            onSelect={setSelected}
          />

          <div className="flex items-center justify-between gap-3 border-t border-common-contrast pt-3">
            <p className="text-xs text-text-tertiary">
              {selected ? (
                <>
                  Posting to <span className="font-medium text-functional-blue">{selected}</span>
                </>
              ) : (
                'Select a community to continue'
              )}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={close} disabled={isPosting}>
                <ButtonTitle>Cancel</ButtonTitle>
              </Button>
              <Button
                onClick={handlePost}
                disabled={!selected || isPosting}
                loading={isPosting}
                showLoadingSpinner
              >
                <ButtonTitle>{isPosting ? 'Posting…' : 'Post'}</ButtonTitle>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PostToCommunity;
