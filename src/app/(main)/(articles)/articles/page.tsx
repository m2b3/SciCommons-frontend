import SearchBar from '@/components/SearchBar';
import ArticleCard from '@/components/articles/ArticleCard';
import { articles } from '@/constants/dummyData';

const Articles = () => {
  return (
    <div className="container mx-auto space-y-4 p-4">
      <SearchBar />
      <div className="flex flex-col space-y-4">
        {articles.map((article, index) => (
          <ArticleCard key={index} {...article} />
        ))}
      </div>
    </div>
  );
};

export default Articles;
