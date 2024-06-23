import React, { useEffect } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import toast from 'react-hot-toast';

import { useUsersApiGetMyArticles } from '@/api/users/users';
import ArticleCard, { ArticleCardSkeleton } from '@/components/articles/ArticleCard';
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import { useAuthStore } from '@/stores/authStore';

interface ArticleSubmissionProps {
  communityName: string;
}

const ArticleSubmission: React.FC<ArticleSubmissionProps> = ({ communityName }) => {
  const router = useRouter();

  const [open, onOpenChange] = React.useState(false);
  const accessToken = useAuthStore((state) => state.accessToken);

  const axiosConfig = { headers: { Authorization: `Bearer ${accessToken}` } };

  const { data, isPending, error } = useUsersApiGetMyArticles(
    { status_filter: 'unsubmitted' },
    {
      query: {
        enabled: open,
      },
      axios: axiosConfig,
    }
  );

  const handleSubmitArticle = (articleSlug: string) => {
    router.push(`/article/${articleSlug}/submit?name=${communityName}&tab=Submit`);
  };

  useEffect(() => {
    if (error) {
      toast.error(`${error.response?.data.message}`);
    }
  }, [error]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="rounded-full border-2 border-green-500 px-4 py-2 text-green-500 transition-colors duration-300 hover:bg-green-500 hover:text-white">
            + Create
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            <DialogTrigger>Submit Article</DialogTrigger>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href={`/community/${communityName}/createcommunityarticle`}>Create Article</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DialogContent className="p-0 sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="px-6 py-2 text-2xl text-gray-500">
            Submit your Article
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh] px-6">
          <div className="my-2 flex flex-col space-y-4 text-sm">
            {isPending &&
              Array.from({ length: 5 }).map((_, index) => <ArticleCardSkeleton key={index} />)}

            {data && data.data.length === 0 && (
              <p className="text-center text-gray-500">You have no articles to submit</p>
            )}
            {data &&
              data.data.map((article) => (
                <div key={article.id} className="relative">
                  <ArticleCard
                    key={article.id}
                    slug={article.slug}
                    title={article.title}
                    abstract={article.abstract}
                    authors={article.authors.map((author) => author.label).join(', ')}
                    imageUrl={article.article_image_url || 'https://picsum.photos/200/200'}
                    community={'Community'}
                    tags={article.keywords.map((keyword) => keyword.label)}
                    ratings={0}
                    comments={0}
                    discussions={0}
                  />
                  <button
                    onClick={() => handleSubmitArticle(article.slug)}
                    className="absolute bottom-4 right-4 w-auto rounded-md bg-green-500 px-2 py-1 text-sm text-white hover:bg-green-600"
                  >
                    Submit
                  </button>
                </div>
              ))}
          </div>
        </ScrollArea>
        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ArticleSubmission;
