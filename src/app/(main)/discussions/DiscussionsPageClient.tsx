'use client';

import React, { useEffect, useState } from 'react';

import Link from 'next/link';

import { ChevronsDown, PanelLeft } from 'lucide-react';

import DiscussionForum from '@/components/articles/DiscussionForum';
import EmptyState from '@/components/common/EmptyState';
import RenderParsedHTML from '@/components/common/RenderParsedHTML';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

import DiscussionsSidebar from './DiscussionsSidebar';

interface SelectedArticle {
  id: number;
  title: string;
  slug: string;
  abstract: string;
  communityId: number | null;
  communityArticleId: number | null;
  isAdmin: boolean;
  communityName: string;
}

const DiscussionsPageClient: React.FC = () => {
  const [selectedArticle, setSelectedArticle] = useState<SelectedArticle | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if screen is mobile size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint is 768px
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleArticleSelect = (article: SelectedArticle) => {
    setSelectedArticle(article);
    // Close mobile sidebar when article is selected
    if (isMobile) {
      setIsMobileSidebarOpen(false);
    }
  };

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="h-[calc(100vh-4rem)] w-full">
        {/* Mobile Header with Sidebar Toggle */}
        <div className="flex items-center gap-2 border-b border-common-contrast bg-common-background px-4 py-3">
          <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                <PanelLeft className="h-4 w-4" />
                <span className="sr-only">Toggle sidebar</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" isOpen={isMobileSidebarOpen} className="w-80 p-0">
              <SheetTitle className="sr-only">Discussions Sidebar</SheetTitle>
              <DiscussionsSidebar
                onArticleSelect={handleArticleSelect}
                selectedArticle={selectedArticle}
              />
            </SheetContent>
          </Sheet>
          <h1 className="text-lg font-semibold text-text-primary">
            {selectedArticle ? selectedArticle.title : 'Discussions'}
          </h1>
        </div>

        {/* Mobile Content */}
        <div className="flex-1 overflow-auto">
          {selectedArticle ? (
            <div className="p-4">
              <div
                className={cn(
                  'mb-6 max-h-10 overflow-hidden border-b border-common-minimal pb-10 transition-all duration-300 ease-in-out',
                  {
                    'max-h-96 overflow-auto': isExpanded,
                  }
                )}
              >
                {selectedArticle.abstract.trim().length > 0 && (
                  <div className="mb-4">
                    <h2 className="mb-2 text-base font-semibold text-text-secondary">Abstract</h2>
                    <RenderParsedHTML
                      rawContent={selectedArticle.abstract}
                      isShrinked={true}
                      supportMarkdown={true}
                      supportLatex={true}
                      containerClassName="prose prose-sm max-w-none text-sm"
                      gradientClassName="sm:from-common-background to-transparent"
                    />
                  </div>
                )}
              </div>
              <div className="relative">
                <div
                  className="absolute -top-9 left-1/2 flex -translate-x-1/2 cursor-pointer items-center gap-1 rounded-full border border-common-contrast bg-common-cardBackground px-2 py-1 text-xxs text-text-tertiary hover:text-text-secondary"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? 'Collapse' : 'Expand'}
                  <ChevronsDown className={cn('h-3 w-3', isExpanded && 'rotate-180')} />
                </div>
                <DiscussionForum
                  articleId={selectedArticle.id}
                  communityId={selectedArticle.communityId}
                  communityArticleId={selectedArticle.communityArticleId}
                  isAdmin={selectedArticle.isAdmin}
                />
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center p-4">
              <EmptyState
                content="Select an article to view discussions"
                subcontent="Choose an article from the sidebar to see its discussions"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="h-[calc(100vh-4rem)] w-full">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Resizable Sidebar */}
        <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
          <div className="h-full border-r border-common-contrast bg-common-cardBackground">
            <DiscussionsSidebar
              onArticleSelect={handleArticleSelect}
              selectedArticle={selectedArticle}
            />
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Main Content Area */}
        <ResizablePanel defaultSize={75} minSize={60}>
          <div className="h-full overflow-auto">
            {selectedArticle ? (
              <div className="p-6">
                <Breadcrumb className="mb-2">
                  <BreadcrumbList className="text-xs">
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link
                          href={`/community/${selectedArticle.communityName}`}
                          className="max-w-[150px] truncate text-text-tertiary hover:text-text-secondary sm:max-w-[200px]"
                          title={selectedArticle.communityName}
                        >
                          {selectedArticle.communityName}
                        </Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage
                        className="max-w-[200px] truncate text-text-secondary sm:max-w-[400px]"
                        title={selectedArticle.title}
                      >
                        {selectedArticle.title}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
                <div
                  className={cn(
                    'mb-6 max-h-20 overflow-hidden border-b border-common-minimal pb-10 transition-all duration-300 ease-in-out',
                    {
                      'h-fit max-h-96 overflow-auto': isExpanded,
                    }
                  )}
                >
                  <h1
                    className={cn(
                      'line-clamp-2 text-2xl font-bold text-text-primary',
                      isExpanded && 'line-clamp-none'
                    )}
                  >
                    {selectedArticle.title}
                  </h1>
                  {selectedArticle.abstract.trim().length > 0 && (
                    <div className="mt-4 pb-4">
                      <h2 className="mb-2 text-sm font-semibold text-text-secondary">Abstract</h2>
                      <RenderParsedHTML
                        rawContent={selectedArticle.abstract}
                        isShrinked={true}
                        supportMarkdown={true}
                        supportLatex={true}
                        gradientClassName="sm:from-common-background to-transparent"
                        contentClassName="text-sm"
                        containerClassName="mb-0"
                      />
                    </div>
                  )}
                </div>
                <div className="relative">
                  <div
                    className="absolute -top-9 left-1/2 flex -translate-x-1/2 cursor-pointer items-center gap-1 rounded-full border border-common-contrast bg-common-cardBackground px-2 py-1 text-xxs text-text-tertiary hover:text-text-secondary"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    {isExpanded ? 'Collapse' : 'Expand'}
                    <ChevronsDown className={cn('h-3 w-3', isExpanded && 'rotate-180')} />
                  </div>
                  <DiscussionForum
                    articleId={selectedArticle.id}
                    communityId={selectedArticle.communityId}
                    communityArticleId={selectedArticle.communityArticleId}
                    isAdmin={selectedArticle.isAdmin}
                  />
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <EmptyState
                  content="Select an article to view discussions"
                  subcontent="Choose an article from the sidebar to see its discussions"
                />
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default DiscussionsPageClient;
