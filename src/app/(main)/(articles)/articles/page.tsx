'use client';

import { useArticlesApiGetPublicArticles } from '@/api/articles/articles';
import SearchBar from '@/components/SearchBar';
import ArticleCard, { ArticleCardSkeleton } from '@/components/articles/ArticleCard';

const Articles = () => {
  const { data, isPending } = useArticlesApiGetPublicArticles();

  return (
    <div className="container mx-auto space-y-4 p-4">
      <SearchBar />
      <div className="flex min-h-screen flex-col space-y-4">
        {isPending && Array.from({ length: 5 }, (_, index) => <ArticleCardSkeleton key={index} />)}
        {data &&
          data?.data?.items?.map((article) => <ArticleCard key={article.id} article={article} />)}
      </div>
    </div>
  );
};

export default Articles;
