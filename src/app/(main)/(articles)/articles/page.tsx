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
          data.data.map((article) => (
            <ArticleCard
              key={article.id}
              title={article.title}
              abstract={article.abstract}
              authors={article.authors.map((author) => author.label).join(', ')}
              community={'Community'}
              tags={article.keywords.map((keyword) => keyword.label)}
              ratings={0}
              comments={0}
              discussions={0}
              imageUrl={article.article_image_url || 'https://picsum.photos/200/200'}
              slug={article.slug}
            />
          ))}
      </div>
    </div>
  );
};

export default Articles;
