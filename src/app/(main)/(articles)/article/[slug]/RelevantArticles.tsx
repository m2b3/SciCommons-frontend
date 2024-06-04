import { FC } from 'react';

import ArticleHighlightCard from '@/components/articles/ArticleHighlightCard';

interface RelevantArticle {
  imageUrl: string;
  title: string;
  likes: string;
  reviews: string;
}

interface RelevantArticlesProps {
  articles: RelevantArticle[];
}

const RelevantArticles: FC<RelevantArticlesProps> = ({ articles }) => {
  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <h3 className="mb-4 text-lg font-bold">Relevant Articles</h3>
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

export default RelevantArticles;
