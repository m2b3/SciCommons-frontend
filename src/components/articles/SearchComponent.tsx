import React, { useState } from 'react';

import { Search } from 'lucide-react';

import { cn } from '@/lib/utils';
import useFetchExternalArticleStore from '@/stores/useFetchExternalArticleStore';

import { Button, ButtonTitle } from '../ui/button';

interface SearchComponentProps {
  onSearch?: (query: string) => void;
}

const SearchComponent: React.FC<SearchComponentProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const { fetchArticle, loading, error } = useFetchExternalArticleStore();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const handleSearch = async () => {
    if (query.trim()) {
      await fetchArticle(query);
      if (onSearch) {
        onSearch(query);
      }
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="flex w-full flex-col">
      <label
        htmlFor="default-search"
        className="sr-only mb-2 text-sm font-medium text-text-secondary"
      >
        Search
      </label>
      <div
        className={cn(
          'relative flex w-full items-center gap-2 rounded-full border border-common-minimal bg-common-cardBackground p-2 pl-4 md:bg-common-background',
          {
            'animated-border': loading,
          }
        )}
      >
        <Search className="size-4 shrink-0 text-text-secondary" />
        <input
          type="search"
          id="default-search"
          className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-0"
          placeholder="Enter DOI, arXiv ID, or PubMed ID"
          value={query}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
        />
        <Button
          variant={'default'}
          onClick={() => {
            if (!query.trim()) return;
            handleSearch();
          }}
          className="rounded-full px-3 py-2"
          type="button"
        >
          <ButtonTitle className="text-xs">Search</ButtonTitle>
        </Button>
      </div>
      {/* {loading && <span className="text-xs text-text-tertiary">Loading...</span>} */}
      {error && <span className="text-sm text-functional-red">{error}</span>}
    </div>
  );
};

export default SearchComponent;
