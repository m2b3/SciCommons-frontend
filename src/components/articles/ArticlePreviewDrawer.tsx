import React from 'react';

import Link from 'next/link';

import { ArrowRightIcon, Star } from 'lucide-react';

import { ArticlesListOut } from '@/api/schemas';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

import RenderParsedHTML from '../common/RenderParsedHTML';
import TruncateText from '../common/TruncateText';

interface ArticlePreviewDrawerProps {
  article: ArticlesListOut | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ArticlePreviewDrawer: React.FC<ArticlePreviewDrawerProps> = ({
  article,
  open,
  onOpenChange,
}) => {
  if (!article) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle>
            <RenderParsedHTML
              rawContent={article.title}
              supportLatex={true}
              supportMarkdown={false}
              contentClassName="res-text-xl font-bold line-clamp-3"
              containerClassName="mb-0"
            />
          </DrawerTitle>
          <DrawerDescription className="sr-only">Article preview</DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-6">
          <div className="mb-6">
            <h3 className="mb-2 font-semibold text-text-secondary res-text-sm">Abstract</h3>
            <RenderParsedHTML
              rawContent={article.abstract}
              supportLatex={true}
              supportMarkdown={false}
              contentClassName="text-text-primary res-text-sm"
              containerClassName="mb-0"
            />
          </div>
          <div className="mb-4">
            <h3 className="mb-2 font-semibold text-text-secondary res-text-sm">Authors</h3>
            <div className="text-text-primary res-text-sm">
              <TruncateText
                text={article.authors.map((author) => author.label).join(', ')}
                maxLines={3}
              />
            </div>
          </div>
          {article.community_article?.community.name && (
            <div className="mb-4">
              <h3 className="mb-2 font-semibold text-text-secondary res-text-sm">
                Published Community
              </h3>
              <p className="text-text-primary res-text-sm">
                {article.community_article.community.name}
              </p>
            </div>
          )}
          <div className="mb-4 flex w-fit items-center rounded-md border border-common-minimal py-1 pl-0 pr-1.5">
            <Star className="h-3.5 text-functional-yellow" fill="currentColor" />
            <span className="text-xs text-text-secondary">{article.total_ratings} ratings</span>
          </div>
          <Link
            href={`/article/${article.slug}`}
            className="mt-4 flex flex-row items-center gap-1 text-functional-blue hover:underline"
            onClick={() => onOpenChange(false)}
          >
            <span className="text-sm">Go to Article Page</span>
            <ArrowRightIcon className="h-4 w-4 -rotate-45" />
          </Link>
        </div>
        <DrawerClose className="sr-only" />
      </DrawerContent>
    </Drawer>
  );
};

export default ArticlePreviewDrawer;
