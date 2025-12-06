import React, { useEffect } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import {
  useCommunitiesArticlesApiGetMyArticles,
  useCommunitiesArticlesApiSubmitArticle,
} from '@/api/community-articles/community-articles';
import ArticleCard, { ArticleCardSkeleton } from '@/components/articles/ArticleCard';
import { Button, ButtonIcon, ButtonTitle } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FIFTEEN_MINUTES_IN_MS } from '@/constants/common.constants';
import { showErrorToast } from '@/lib/toastHelpers';
import { useAuthStore } from '@/stores/authStore';

interface ArticleSubmissionProps {
  communityName: string;
}

const ArticleSubmission: React.FC<ArticleSubmissionProps> = ({ communityName }) => {
  const router = useRouter();

  const [open, onOpenChange] = React.useState(false);
  const accessToken = useAuthStore((state) => state.accessToken);

  const axiosConfig = { headers: { Authorization: `Bearer ${accessToken}` } };

  const { data, isPending, error } = useCommunitiesArticlesApiGetMyArticles(
    { status_filter: 'unsubmitted' },
    {
      query: {
        enabled: open && !!accessToken,
        staleTime: FIFTEEN_MINUTES_IN_MS,
      },
      request: axiosConfig,
    }
  );

  const { mutate, isPending: isArticleSubmissionPending } = useCommunitiesArticlesApiSubmitArticle({
    request: axiosConfig,
  });

  const handleSubmitArticle = (articleSlug: string) => {
    mutate(
      { articleSlug: articleSlug || '', communityName: communityName },
      {
        onSuccess: () => {
          toast.success('Article submitted successfully');
        },
        onError: (error) => {
          showErrorToast(error);
        },
      }
    );
  };

  useEffect(() => {
    if (error) {
      toast.error(`${error.response?.data.message}`);
    }
  }, [error]);

  React.useEffect(() => {
    return () => {
      // Always remove pointer-events: none from body when dialog unmounts
      if (typeof document !== 'undefined') {
        if (!open) {
          document.body.style.pointerEvents = 'auto';
        }
      }
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="py-1.5" withTooltip tooltipData="Create or Submit Article">
            <ButtonIcon>
              <Plus className="size-4 text-white" />
            </ButtonIcon>
            <ButtonTitle>Create</ButtonTitle>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            <DialogTrigger>Submit Existing Article</DialogTrigger>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href={`/community/${communityName}/createcommunityarticle`}>
              Create New Article
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DialogContent className="p-0 sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Submit your Article</DialogTitle>
        </DialogHeader>
        <ScrollArea className="relative max-h-[80vh] w-full p-4 pt-0 sm:p-6 sm:pt-0">
          <div className="my-2 flex w-full flex-col space-y-4 text-sm">
            {isPending &&
              Array.from({ length: 5 }).map((_, index) => <ArticleCardSkeleton key={index} />)}

            {data && data.data.items.length === 0 && (
              <div className="flex w-full flex-col items-center justify-center">
                <p className="text-center text-text-secondary">You have no articles to submit</p>
                <Button
                  className="mx-auto mt-4"
                  onClick={() => router.push(`/community/${communityName}/createcommunityarticle`)}
                >
                  <ButtonTitle>Create Article</ButtonTitle>
                </Button>
              </div>
            )}
            {data &&
              data.data.items.map((article) => (
                <div key={article.id} className="relative w-full">
                  <ArticleCard key={article.id} article={article} />
                  <Button
                    className="absolute bottom-4 right-4"
                    onClick={() => handleSubmitArticle(String(article.slug))}
                    type="button"
                    disabled={isArticleSubmissionPending}
                  >
                    <ButtonTitle>Submit</ButtonTitle>
                  </Button>
                </div>
              ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ArticleSubmission;
