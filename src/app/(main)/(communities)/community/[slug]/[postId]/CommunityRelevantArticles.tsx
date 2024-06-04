import { FC } from 'react';

import ArticleHighlightCard from '@/components/articles/ArticleHighlightCard';

interface CommunityRelevantArticle {
  imageUrl: string;
  title: string;
  likes: string;
  reviews: string;
}

interface CommunityRelevantArticlesProps {
  articles: CommunityRelevantArticle[];
}

const CommunityRelevantArticles: FC<CommunityRelevantArticlesProps> = ({ articles }) => {
  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <h3 className="mb-4 text-lg font-bold">Relevant Articles in this Community</h3>
      {articles.map((article, index) => (
        <ArticleHighlightCard
          key={index}
          imageUrl={article.imageUrl}
          title={article.title}
          likes={article.likes}
          reviews={article.reviews}
        />
      ))}
    </div>
  );
};

export default CommunityRelevantArticles;
